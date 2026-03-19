<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Nfe;
use App\Models\Funcionario;
use App\Models\OrdemSeparacao;
use App\Models\Empresa;
use App\Models\ItemOrdemSeparacao;
use Dompdf\Dompdf;

class OrderSeparacaoController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:ordem_separacao_create', ['only' => ['create', 'store']]);
        $this->middleware('permission:ordem_separacao_edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:ordem_separacao_view', ['only' => ['show', 'index']]);
        $this->middleware('permission:ordem_separacao_delete', ['only' => ['destroy']]);
    }

    public function index(Request $request){

        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');
        $cliente_id = $request->get('cliente_id');

        $data = OrdemSeparacao::where('empresa_id', $request->empresa_id)
        ->when(!empty($start_date), function ($query) use ($start_date) {
            return $query->whereDate('created_at', '>=', $start_date);
        })
        ->when(!empty($end_date), function ($query) use ($end_date,) {
            return $query->whereDate('created_at', '<=', $end_date);
        })
        ->when(!empty($cliente_id), function ($query) use ($cliente_id) {
            return $query->where('cliente_id', $cliente_id);
        })
        ->orderBy('created_at', 'desc')
        ->paginate(__itensPagina());

        return view('ordem_separacao.index', compact('data'));
    }

    public function create(Request $request){
        $orcamento = Nfe::findOrFail($request->orcamento_id);
        __validaObjetoEmpresa($orcamento);

        if($orcamento->ordemSeparacao){
            return redirect()->route('ordem-separacao.show', [$orcamento->ordemSeparacao->id]);
        }

        $funcionarios = Funcionario::where('empresa_id', request()->empresa_id)
        ->where('status', 1)->get();
        return view('ordem_separacao.create', compact('orcamento', 'funcionarios'));
    }

    private function getLastNumeroNfe($empresa_id){
        $last = OrdemSeparacao::where('empresa_id', $empresa_id)
        ->orderBy('numero_sequencial', 'desc')
        ->where('numero_sequencial', '>', 0)->first();
        $numero = $last != null ? $last->numero_sequencial : 0;
        $numero++;
        return $numero;
    }

    public function updateItem(Request $request, $id){
        $item = ItemOrdemSeparacao::findOrFail($id);
        $item->status = $request->status;
        $item->save();

        session()->flash("flash_success", 'Item alterado!');
        return redirect()->back();
    }

    public function store(Request $request){
        try{
            $orcamento = Nfe::findOrFail($request->orcamento_id);

            $item = OrdemSeparacao::create([
                'nfe_id' => $orcamento->id,
                'cliente_id' => $orcamento->cliente_id,
                'numero_sequencial' => $this->getLastNumeroNfe($request->empresa_id),
                'status' => 'em_separacao',
                'funcionario_id' => $request->funcionario_id,
                'empresa_id' => $request->empresa_id,
                'observacao' => $request->observacao ?? '',
                'prioridade' => $request->prioridade,
                'usuario_id_inicia' => \Auth::user()->id
            ]);

            foreach($orcamento->itens as $key => $i){
                ItemOrdemSeparacao::create([
                    'ordem_id' => $item->id,
                    'produto_id' => $i->produto_id,
                    'quantidade' => $i->quantidade,
                    'status' => 'pendente',
                    'observacao_item' => $request->observacao_item[$key] ?? ''
                ]);
            }

            session()->flash("flash_success", 'Ordem de separação gerada com sucesso!');

            return redirect()->route('ordem-separacao.show', [$item->id]);
        }catch(\Exception $e){
            session()->flash("flash_error", 'Algo deu errado: '. $e->getMessage() . " - " . $e->getLine());
            return redirect()->back();
        }
    }

    public function update(Request $request, $id){
        $item = OrdemSeparacao::findOrFail($id);
        $item->status = $request->status;

        if($request->status == 'finalizado'){
            $item->usuario_id_finaliza = \Auth::user()->id;
        }
        $item->save();

        session()->flash("flash_success", 'Status alterado!');
        return redirect()->back();
    }

    public function show($id){
        $item = OrdemSeparacao::findOrFail($id);
        return view('ordem_separacao.show', compact('item'));
    }

    public function destroy($id){
        $item = OrdemSeparacao::findOrFail($id);

        $item->itens()->delete();
        $item->delete();

        session()->flash("flash_success", 'Ordem de separação removida!');
        return redirect()->back();
    }

    public function imprimir($id){
        $item = OrdemSeparacao::findOrFail($id);
        __validaObjetoEmpresa($item);
        $config = Empresa::where('id', $item->empresa_id)->first();
        $config = __objetoParaEmissao($config, $item->local_id);

        $p = view('ordem_separacao.imprimir', compact('config', 'item'));

         $domPdf = new Dompdf(["enable_remote" => true]);
        $domPdf->loadHtml($p);
        $pdf = ob_get_clean();
        $domPdf->setPaper("A4");
        $domPdf->render();
        $domPdf->stream("Ordem de Separação $item->numero_sequencial.pdf", array("Attachment" => false));
    }
}
