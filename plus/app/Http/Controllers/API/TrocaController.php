<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Nfce;
use App\Models\Nfe;
use App\Models\Troca;
use App\Models\Produto;
use App\Models\CashBackCliente;
use App\Models\Caixa;
use App\Models\MargemComissao;
use App\Models\ComissaoVenda;
use App\Models\Funcionario;
use App\Models\ItemTroca;
use App\Models\ItemTrocaRemovido;
use App\Models\ConfigGeral;
use App\Models\Cliente;
use App\Models\CreditoCliente;
use Illuminate\Support\Str;
use App\Utils\EstoqueUtil;

class TrocaController extends Controller
{

    protected $util;

    public function __construct(EstoqueUtil $util)
    {
        $this->util = $util;
    }

    private function getLastNumero($empresa_id){
        $last = Troca::where('empresa_id', $empresa_id)
        ->orderBy('numero_sequencial', 'desc')
        ->where('numero_sequencial', '>', 0)->first();
        $numero = $last != null ? $last->numero_sequencial : 0;
        $numero++;
        return $numero;
    }

    private function calcularComissaoVenda($venda, $comissao, $empresa_id, $troca)
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
            foreach ($troca->itens as $i) {

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

    public function store(Request $request){
        $comissao = null;
        if($request->tipo == 'nfce'){
            $item = Nfce::findOrFail($request->venda_id);
            $cashBackCliente = CashBackCliente::where('empresa_id', $request->empresa_id)
            ->where('tipo', 'pdv')->where('venda_id', $item->id)->first();
            if($cashBackCliente){
                $cashBackCliente->delete();
            }
            $comissao = ComissaoVenda::where('nfce_id', $item->id)->first();
        }else{
            $item = Nfe::findOrFail($request->venda_id);
            $cashBackCliente = CashBackCliente::where('empresa_id', $request->empresa_id)
            ->where('tipo', 'venda')->where('venda_id', $item->id)->first();
            if($cashBackCliente){
                $cashBackCliente->delete();
            }
            $comissao = ComissaoVenda::where('nfe_id', $item->id)->first();
        }

        try{

            if($request->cliente_id){
                $item->cliente_id = $request->cliente_id;
            }

            $caixa = Caixa::where('usuario_id', $request->usuario_id)
            ->where('status', 1)
            ->first();

            $troca = Troca::create([
                'empresa_id' => $request->empresa_id,
                'nfce_id' => $request->tipo == 'nfce' ? $item->id : null,
                'nfe_id' => $request->tipo == 'nfe' ? $item->id : null,
                'caixa_id' => $caixa->id,
                'observacao' => '',
                'numero_sequencial' => $this->getLastNumero($request->empresa_id),
                'codigo' => Str::random(8),
                'valor_troca' => __convert_value_bd($request->valor_total),
                'valor_original' => $item->total,
                'tipo_pagamento' => $request->tipo_pagamento ? $request->tipo_pagamento : $item->tipo_pagamento
            ]);

            $item->total = __convert_value_bd($request->valor_total);
            $item->save();


            // foreach($item->itens as $i){
            //     if ($i->produto->gerenciar_estoque) {
            //         $this->util->incrementaEstoque($i->produto_id, $i->quantidade, null, $item->local_id);
            //     }
            // }

            if($request->produto_id){
                for ($i = 0; $i < sizeof($request->produto_id); $i++) {
                    $produto_id = $request->produto_id[$i];
                    $quantidade = __convert_value_bd($request->quantidade[$i]);
                    $add = 1;
                    $qtd = 0;

                    $product = Produto::findOrFail($produto_id);

                    foreach($item->itens as $itemNfce){
                        if($itemNfce->produto_id == $produto_id && $itemNfce->quantidade == $quantidade){
                            $add = 0;
                        }else{
                            if($itemNfce->produto_id == $produto_id && $itemNfce->quantidade != $quantidade){
                                $quantidade = $itemNfce->quantidade - $quantidade;
                            }
                        }
                    }

                    if($add == 1){
                        ItemTroca::create([
                            'produto_id' => $produto_id,
                            'quantidade' => $quantidade,
                            'troca_id' => $troca->id,
                            'valor_unitario' => __convert_value_bd($request->valor_unitario[$i]),
                            'sub_total' => __convert_value_bd($request->subtotal_item[$i]),
                        ]);
                    }
                    if ($product->gerenciar_estoque) {
                        $this->util->reduzEstoque($product->id, $quantidade, null, $item->local_id);
                    }
                }
            }

            if($item->funcionario_id){
                //criar comissao
                if($comissao && $comissao->status == 0){
                    $comissao->delete();

                    $troca = Troca::findOrFail($troca->id);
                    $funcionario = Funcionario::findOrFail($item->funcionario_id);
                    $comissao = $funcionario->comissao;
                    $valorRetorno = $this->calcularComissaoVenda($item, $comissao, $item->empresa_id, $troca);

                    if($valorRetorno > 0){
                        ComissaoVenda::create([
                            'funcionario_id' => $item->funcionario_id,
                            'nfce_id' => get_class($item) == 'App\Models\Nfce' ? $item->id : null,
                            'nfe_id' => get_class($item) == 'App\Models\Nfe' ? $item->id : null,
                            'tabela' => get_class($item) == 'App\Models\Nfce' ? 'nfce' : 'nfe',
                            'valor' => $valorRetorno,
                            'valor_venda' => $item->total,
                            'status' => 0,
                            'empresa_id' => $item->empresa_id
                        ]);
                    }
                }
            }

            $itensRemovidos = $request->itensRemovidos ? json_decode($request->itensRemovidos) : [];

            foreach ($itensRemovidos as $r) {

                ItemTrocaRemovido::create([
                    'produto_id' => $r->produto_id, 
                    'quantidade' => $r->quantidade, 
                    'troca_id' => $troca->id
                ]);

                $product = Produto::findOrFail($r->produto_id);
                if ($product->gerenciar_estoque) {
                    $this->util->incrementaEstoque($product->id, (float)$r->quantidade, null, $item->local_id);
                }

            }

            $tp = $request->tipo_pagamento ? $request->tipo_pagamento : $item->tipo_pagamento;

            __createLog($request->empresa_id, 'Troca', 'cadastrar', "#$troca->numero_sequencial - R$ " . __moeda($troca->valor_troca));
            
            if($item->contaReceber()->exists()){
                return response()->json([
                    'status' => 'conta_receber',
                    'message' => 'Venda possui contas a receber. Ajuste as parcelas.',
                    'troca_id' => $troca->id,
                    'venda_id' => $item->id,
                    'tipo' => $request->tipo
                ], 200);
            }else{
                if($request->valor_credito > 0 && $request->cliente_id && $tp == '00'){
                    $cliente = Cliente::findOrFail($request->cliente_id);
                    CreditoCliente::create([
                        'valor' => $request->valor_credito,
                        'cliente_id' => $cliente->id,
                        'troca_id' => $troca->id,
                        'status' => 1
                    ]);

                    $cliente->valor_credito += __convert_value_bd($request->valor_credito);
                    $cliente->save();
                }
            }

            return response()->json($troca, 200);
        } catch (\Exception $e) {
            __createLog($request->empresa_id, 'Troca', 'erro', $e->getMessage());
            return response()->json($e->getMessage() . ", line: " . $e->getLine() . ", file: " . $e->getFile(), 401);
        }
    }

}
