<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Troca;
use App\Models\ItemTroca;
use App\Models\Nfce;
use App\Models\Nfe;
use App\Models\Funcionario;
use App\Models\CategoriaProduto;
use App\Models\ComissaoVenda;
use App\Models\MargemComissao;
use App\Models\Caixa;
use App\Models\Empresa;
use App\Models\ConfigGeral;
use App\Models\UsuarioEmpresa;
use App\Utils\EstoqueUtil;
use NFePHP\DA\NFe\CupomNaoFiscal;
use Dompdf\Dompdf;

class TrocaController extends Controller
{
    protected $util;

    public function __construct(EstoqueUtil $util)
    {
        $this->util = $util;

        $this->middleware('permission:troca_create', ['only' => ['create', 'store']]);
        $this->middleware('permission:troca_view', ['only' => ['show', 'index']]);
        $this->middleware('permission:troca_delete', ['only' => ['destroy']]);
    }

    public function index(Request $request){
        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');
        $cliente_id = $request->get('cliente_id');

        $data = Troca::where('trocas.empresa_id', $request->empresa_id)
        ->select('trocas.*')
        ->leftJoin('nfces', 'nfces.id', '=', 'trocas.nfce_id')
        ->leftJoin('nves', 'nves.id', '=', 'trocas.nfe_id')
        ->when($start_date, fn($q) => $q->whereDate('trocas.created_at', '>=', $start_date))
        ->when($end_date, fn($q) => $q->whereDate('trocas.created_at', '<=', $end_date))
        ->when($cliente_id, function ($q) use ($cliente_id) {
            return $q->where(function ($q) use ($cliente_id) {
                $q->where('nfces.cliente_id', $cliente_id)
                ->orWhere('nves.cliente_id', $cliente_id);
            });
        })
        ->orderBy('trocas.created_at', 'desc')
        ->paginate(__itensPagina());

        return view('trocas.index', compact('data'));
    }

    public function create(Request $request){
        $tipo = $request->tipo;
        $id = $request->id;

        if($tipo == 'nfce'){
            $item = Nfce::findOrFail($id);
        }else{
            $item = Nfe::findOrFail($id);
        }

        if($item == null){
            session()->flash("flash_error", "Nenhuma venda encontrada!");
            return redirect()->back();
        }

        if (!__isCaixaAberto()) {
            session()->flash("flash_warning", "Abrir caixa antes de continuar!");
            return redirect()->route('caixa.create');
        }
        __validaObjetoEmpresa($item);

        $funcionarios = Funcionario::where('empresa_id', request()->empresa_id)->get();
        $cliente = $item->cliente;
        $funcionario = $item->funcionario;
        $caixa = __isCaixaAberto();
        $abertura = Caixa::where('usuario_id', get_id_user())
        ->where('status', 1)
        ->first();

        $isVendaSuspensa = 0;
        $categorias = CategoriaProduto::where('empresa_id', request()->empresa_id)->where('status', 1)
        ->where('categoria_id', null)
        ->get();
        $config = ConfigGeral::where('empresa_id', request()->empresa_id)->first();

        $tiposPagamento = Nfce::tiposPagamento();

        // dd($tiposPagamento);
        if($config != null){
            $config->tipos_pagamento_pdv = $config != null && $config->tipos_pagamento_pdv ? json_decode($config->tipos_pagamento_pdv) : [];
            $temp = [];
            if(sizeof($config->tipos_pagamento_pdv) > 0){
                foreach($tiposPagamento as $key => $t){
                    if(in_array($t, $config->tipos_pagamento_pdv)){
                        $temp[$key] = $t;
                    }
                }
                $tiposPagamento = $temp;
            }
        }
        $tiposPagamento['00'] = 'Vale Crédito';

        $msgTroca = "";
        if(sizeof($item->troca) > 0){
            $msgTroca = "Essa venda já possui troca!";
            session()->flash("flash_warning", $msgTroca);
            return redirect()->back();

        }

        return view('trocas.create', compact('item', 'funcionarios', 'cliente', 'funcionario', 'caixa', 'abertura', 
            'isVendaSuspensa', 'categorias', 'tiposPagamento', 'msgTroca', 'config'));
    }

    public function show($id)
    {
        $item = Troca::findOrFail($id);
        return view('trocas.show', compact('item'));
    }

    public function destroy($id)
    {
        $item = Troca::findOrFail($id);
        try {
            $descricaoLog = "#$item->numero_sequencial - R$ " . __moeda($item->valor_troca);

            //retornar o valor original da venda
            $venda = $item->nfe ? $item->nfe : $item->nfce;
            $this->retomarValores($venda);

            foreach($item->itens as $i){
                if ($i->produto->gerenciar_estoque) {
                    $local_id = $item->nfce ? $item->nfce->local_id : $item->nfe->local_id;
                    $this->util->incrementaEstoque($i->produto->id, $i->quantidade, null, $local_id);
                }
            }
            $item->itens()->delete();
            $item->itensRemovidos()->delete();
            $item->delete();

            __createLog(request()->empresa_id, 'PDV Troca', 'excluir', $descricaoLog);

            session()->flash("flash_success", "Removido com sucesso!");
        } catch (\Exception $e) {
            __createLog(request()->empresa_id, 'PDV Troca', 'erro', $e->getMessage());
            session()->flash("flash_error", "Algo deu errado: " . $e->getMessage());
        }
        return redirect()->back();
    }

    private function retomarValores($venda){
        $total = $venda->itens->sum('sub_total');
        $venda->total = $total - $venda->desconto + $venda->valor_frete + $venda->acrescimo;
        $venda->save();
        // dd($venda);
        // comissao
        if($venda->funcionario_id){
            $comissao = null;
            if(get_class($venda) == 'App\Models\Nfce'){
                $comissao = ComissaoVenda::where('nfce_id', $venda->id)->first();
            }else{
                $comissao = ComissaoVenda::where('nfe_id', $venda->id)->first();
            }

            if($comissao != null && $comissao->status == 0){
                $comissao->delete();
                $funcionario = Funcionario::findOrFail($venda->funcionario_id);
                $comissao = $funcionario->comissao;
                $valorRetorno = $this->calcularComissaoVenda($venda, $comissao, $venda->empresa_id);

                if($valorRetorno > 0){
                    ComissaoVenda::create([
                        'funcionario_id' => $venda->funcionario_id,
                        'nfce_id' => get_class($venda) == 'App\Models\Nfce' ? $venda->id : null,
                        'nfe_id' => get_class($venda) == 'App\Models\Nfe' ? $venda->id : null,
                        'tabela' => get_class($venda) == 'App\Models\Nfce' ? 'nfce' : 'nfe',
                        'valor' => $valorRetorno,
                        'valor_venda' => $total,
                        'status' => 0,
                        'empresa_id' => $venda->empresa_id
                    ]);
                }
            }
        }
    }

    private function calcularComissaoVenda($venda, $comissao, $empresa_id)
    {
        $valorRetorno = 0;
        $config = ConfigGeral::where('empresa_id', $empresa_id)->first();

        $tipoComissao = 'percentual_vendedor';
        if($config != null && $config->tipo_comissao == 'percentual_margem'){
            $tipoComissao = 'percentual_margem';
        }
        if($tipoComissao == 'percentual_vendedor'){
            $valorRetorno = ((float)$venda->total * (float)$comissao) / 100;
        }else{
            foreach ($venda->itens as $i) {

                $percentualLucro = ((($i->produto->valor_compra-$i->valor_unitario)/$i->produto->valor_compra)*100)*-1;
                $margens = MargemComissao::where('empresa_id', $empresa_id)->get();
                $margemComissao = null;
                $dif = 0;
                $difAnterior = 100;
                foreach($margens as $m){
                    $margem = $m->margem;
                    if($percentualLucro >= $margem){
                        $dif = $percentualLucro - $margem;
                        if($dif < $difAnterior){
                            $margemComissao = $m;
                            $difAnterior = $dif;
                        }
                    }
                }
                if($margemComissao){
                    $valorRetorno += ($i->sub_total * $margemComissao->percentual) / 100;
                }
            }
        }
        return $valorRetorno;
    }

    public function imprimir($id)
    {

        $item = Troca::findOrFail($id);
        __validaObjetoEmpresa($item);

        $config = Empresa::where('id', $item->empresa_id)
        ->first();

        $config = __objetoParaEmissao($config, $item->local_id);

        $usuario = UsuarioEmpresa::find(get_id_user());

        $logo = null;
        if($config->logo && file_exists(public_path('/uploads/logos/') . $config->logo)){
            $logo = public_path('/uploads/logos/') . $config->logo;
        }

        $configGeral = ConfigGeral::where('empresa_id', $item->empresa_id)->first();

        $p = view('trocas.cupom_nao_fiscal', compact('config', 'item', 'configGeral'));

        $domPdf = new Dompdf(["enable_remote" => true]);
        $domPdf->loadHtml($p);
        $pdf = ob_get_clean();
        $height = 450;

        $height += sizeof($item->itens)*11;
        foreach($item->itens as $it){
            if(strlen($it->descricao()) > 10){
                $height += 10;
            }
        }

        $height += sizeof($item->itensRemovidos)*11;
        foreach($item->itensRemovidos as $it){
            if(strlen($it->descricao()) > 10){
                $height += 10;
            }
        }

        foreach($item->itensRemovidos as $it){
            $height += 10;
        }

        foreach(($item->nfe ? $item->nfe->itens : $item->nfce->itens) as $it){
            if(strlen($it->descricao()) > 10){
                $height += 10;
            }
        }

        if($item->observacao != ''){
            $height += 30;
        }


        $domPdf->setPaper([0,0,244,$height]);
        $pdf = $domPdf->render();

        $domPdf->stream("Doc. Troca $item->numero_sequencial.pdf", array("Attachment" => false));
    }

}
