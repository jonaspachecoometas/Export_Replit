<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\ContaReceber;
use App\Models\CashBackConfig;
use App\Models\ConfigGeral;
use App\Models\ItemNfe;
use App\Models\ItemNfce;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function find($id)
    {
        $item = Cliente::with(['cidade', 'listaPreco', 'tributacao', 'fatura'])->findOrFail($id);
        $config = ConfigGeral::where('empresa_id', $item->empresa_id)->first();

        if($config == null || $config->limitar_cliente_inadimplente == 0){
            $item->inadimplente = false;
        }else{
            $item->inadimplente = ContaReceber::where('cliente_id', $id)
            ->where('status', 0)
            ->whereDate('data_vencimento', '<', now()->toDateString())
            ->exists();
        }

        return response()->json($item, 200);
    }

    public function produtosHistorico(Request $request){
        $cliente_id = $request->cliente_id;
        $pesquisa = $request->pesquisa;

        $itensNfe = ItemNfe::select('item_nves.*')
        ->join('nves', 'nves.id', '=', 'item_nves.nfe_id')
        ->where('cliente_id', $cliente_id)
        ->join('produtos', 'produtos.id', '=', 'item_nves.produto_id')
        ->where('nves.tpNF', 1)
        ->where('produtos.nome', 'LIKE', "%$pesquisa%")
        ->get();

        $itensNfce = ItemNfce::select('item_nfces.*')
        ->join('nfces', 'nfces.id', '=', 'item_nfces.nfce_id')
        ->where('cliente_id', $cliente_id)
        ->join('produtos', 'produtos.id', '=', 'item_nfces.produto_id')
        ->where('produtos.nome', 'LIKE', "%$pesquisa%")
        ->get();

        $itens = $itensNfe
        ->merge($itensNfce)
        ->sortByDesc('created_at')
        ->values();

        return view('clientes.partials.tabela_historico', compact('itens'))->render();

    }

    public function cashback($id)
    {
        $item = Cliente::with('cidade')->findOrFail($id);
        $config = CashBackConfig::where('empresa_id', $item->empresa_id)->first();
        if($config == null){
            return response()->json(null, 404);
        }
        $config->valor_cashback = $item->valor_cashback;
        return response()->json($config, 200);
    }

    public function pesquisa(Request $request)
    {
        $pesquisa = $request->pesquisa;
        $pesquisaOriginal = trim($pesquisa);
        $pesquisaNumerica = preg_replace('/\D/', '', $pesquisaOriginal);

        $data = Cliente::orderBy('razao_social', 'desc')
        ->where('empresa_id', $request->empresa_id)
        ->where('status', 1)
        // ->where('razao_social', 'like', "%$request->pesquisa%")
        // ->where(function($q) use ($pesquisa){
        //     $q->where('razao_social', 'like', "%$pesquisa%")->orWhere('nome_fantasia', 'like', "%$pesquisa%")
        //     ->orWhere('numero_sequencial', 'LIKE', "%$pesquisa%");
        // })

        ->when($pesquisaNumerica !== '', function ($query) use ($pesquisaNumerica) {
            $clean = "%{$pesquisaNumerica}%";

            $query->where(function ($q) use ($clean) {
                $q->whereRaw("
                    REPLACE(REPLACE(REPLACE(REPLACE(cpf_cnpj, '.', ''), '-', ''), '/', ''), ' ', '') LIKE ?
                    ", [$clean])
                ->orWhereRaw("
                    REPLACE(REPLACE(REPLACE(REPLACE(numero_sequencial, '.', ''), '-', ''), '/', ''), ' ', '') LIKE ?
                    ", [$clean]);
            });
        })
        ->when($pesquisaNumerica === '', function ($query) use ($pesquisaOriginal) {
            $like = "%{$pesquisaOriginal}%";
            $query->where(function($q) use ($like){
                $q->where('razao_social', 'like', $like)
                ->orWhere('nome_fantasia', 'like', $like);
            });
        })
        ->get();

        return response()->json($data, 200);
    }

    public function pesquisaDelivery(Request $request)
    {
        $data = Cliente::orderBy('razao_social', 'desc')
        ->where('empresa_id', $request->empresa_id)
        ->where('status', 1)
        ->where('uid', '!=', '')
        ->when(!is_numeric($request->pesquisa), function ($q) use ($request) {
            return $q->where('razao_social', 'LIKE', "%$request->pesquisa%");
        })
        ->when(is_numeric($request->pesquisa), function ($q) use ($request) {
            return $q->where('telefone', 'LIKE', "%$request->pesquisa%");
        })
        ->get();
        return response()->json($data, 200);
    }

    public function store(Request $request){
        $cliente = Cliente::where('empresa_id', $request->empresa_id)
        ->where('cpf_cnpj', $request->cpf_cnpj)
        ->first();
        if($cliente != null){
            return response()->json("Cliente já cadastrado", 401);
        }
        $cliente = Cliente::create($request->all());
        return response()->json($cliente, 200);
    }

    public function consultaDebitos(Request $request){
        $totalVenda = $request->total;
        $somaContas = ContaReceber::where('cliente_id', $request->cliente_id)
        ->where('status', 0)
        ->sum('valor_integral');

        $cliente = Cliente::findOrFail($request->cliente_id);
        if($somaContas+$totalVenda > $cliente->valor_credito){
            return response()->json("Valor ultrapassa o limite definido no cadastro do cliente", 403);
        }
        return response()->json($cliente->valor_credito, 200);

    }
}
