<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CustoConfiguracao;
use App\Models\CustoProdutoConfiguracao;
use App\Models\Produto;
use Illuminate\Pagination\LengthAwarePaginator;

class CustoConfiguracaoController extends Controller
{

    public function __construct()
    {
        $this->middleware('permission:config_custo_create', ['only' => ['create', 'store']]);
        $this->middleware('permission:config_custo_edit', ['only' => ['edit', 'update']]);
        $this->middleware('permission:config_custo_view', ['only' => ['show', 'index']]);
        $this->middleware('permission:config_custo_delete', ['only' => ['destroy']]);
    }

    public function index(Request $request)
    {
        $item = CustoConfiguracao::where('empresa_id', $request->empresa_id)
        ->first();

        $pesquisa = $request->pesquisa;

        $produtos = CustoProdutoConfiguracao::where('produtos.empresa_id', $request->empresa_id)
        ->select('custo_produto_configuracaos.*')
        ->join('produtos', 'produtos.id', '=', 'custo_produto_configuracaos.produto_id')
        ->orderBy('produtos.nome')
        ->when(!empty($pesquisa), function ($q) use ($pesquisa) {
            return $q->where(function ($w) use ($pesquisa) {
                $w->where('produtos.nome', 'like', "%{$pesquisa}%")
                ->orWhere('produtos.codigo_barras', 'like', "%{$pesquisa}%");
            });
        })
        ->paginate(__itensPagina());

        return view('config_custo.index', compact('item', 'produtos'));
    }

    public function store(Request $request){
        $item = CustoConfiguracao::where('empresa_id', $request->empresa_id)
        ->first();

        $request->merge([
            'imposto_percentual' => $request->imposto_percentual ?? 0,
            'taxa_cartao_percentual' => $request->taxa_cartao_percentual ?? 0,
            'despesas_percentual' => $request->despesas_percentual ?? 0,
        ]);

        if ($item != null) {

            $item->fill($request->all())->save();
            session()->flash("flash_success", "Configuração atualizada!");
        } else {

            CustoConfiguracao::create($request->all());
            session()->flash("flash_success", "Configuração cadastrada!");
        }
        return redirect()->back();
    }

    public function produtoStore(Request $request){
        $item = CustoProdutoConfiguracao::where('produto_id', $request->produto_id)
        ->first();

        $request->merge([
            'imposto_percentual' => $request->imposto_percentual ?? 0,
            'taxa_cartao_percentual' => $request->taxa_cartao_percentual ?? 0,
            'despesas_percentual' => $request->despesas_percentual ?? 0,
        ]);

        if ($item != null) {

            $item->fill($request->all())->save();
            session()->flash("flash_success", "Configuração atualizada!");
        } else {
            CustoProdutoConfiguracao::create($request->all());
            session()->flash("flash_success", "Configuração cadastrada!");
        }
        return redirect()->back();
    }

    public function destroy($id){
        $item = CustoProdutoConfiguracao::findOrFail($id);

        $item->delete();
        session()->flash("flash_success", "Configuração removida!");
        return redirect()->back();
    }

    public function analise(Request $request)
    {
        $query = Produto::where('empresa_id', $request->empresa_id)
        ->orderBy('nome');

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($w) use ($q) {
                $w->where('nome', 'like', "%{$q}%")
                ->orWhere('codigo_barras', 'like', "%{$q}%");
            });
        }

        $produtos = $query->get();

        $configGeral = CustoConfiguracao::where('empresa_id', $request->empresa_id)->first();

        $excecoes = CustoProdutoConfiguracao::where('produtos.empresa_id', $request->empresa_id)
        ->select('custo_produto_configuracaos.*')
        ->join('produtos', 'produtos.id', '=', 'custo_produto_configuracaos.produto_id')
        ->get()
        ->keyBy('produto_id');

        $analise = $produtos->map(function ($produto) use ($configGeral, $excecoes) {

            $override = $excecoes->get($produto->id);

            $imposto = $override->imposto_percentual ?? $configGeral->imposto_percentual;
            $cartao = $override->taxa_cartao_percentual ?? $configGeral->taxa_cartao_percentual;
            $despesa = $override->despesas_percentual ?? $configGeral->despesas_percentual;
            $margemMin = $override->margem_minima_percentual ?? $configGeral->margem_minima_percentual;

            $percentual = $imposto + $cartao + $despesa;

            $custoReal = $produto->valor_compra * (1 + ($percentual / 100));
            $margemValor = $produto->valor_unitario - $custoReal;

            $margemPerc = $custoReal > 0
            ? ($margemValor / $custoReal) * 100
            : 0;

            if ($margemValor < 0) {
                $status = 'prejuizo';
            } elseif ($margemPerc < $margemMin) {
                $status = 'baixa';
            } else {
                $status = 'ok';
            }

            return [
                'imposto_percentual' => $imposto,
                'cartao_percentual' => $cartao,
                'despesas_percentual' => $despesa,
                'produto' => $produto,
                'custo_real' => round($custoReal, 2),
                'margem_valor' => round($margemValor, 2),
                'margem_percentual' => round($margemPerc, 2),
                'margem_minima' => $margemMin,
                'status' => $status,
            ];
        });

        if ($request->filled('status')) {
            $analise = $analise->where('status', $request->status);
        }
        $page = LengthAwarePaginator::resolveCurrentPage();
        $perPage = __itensPagina();

        $produtosPaginados = new \Illuminate\Pagination\LengthAwarePaginator(
            $analise->forPage($page, $perPage)->values(),
            $analise->count(),
            $perPage,
            $page,
            [
                'path' => request()->url(),
                'query' => $request->query(),
            ]
        );

        $totais = [
            'prejuizo' => $analise->where('status', 'prejuizo')->count(),
            'baixa' => $analise->where('status', 'baixa')->count(),
            'ok' => $analise->where('status', 'ok')->count(),
            'total' => $analise->count(),
        ];

        return view('config_custo.analise', [
            'produtos' => $produtosPaginados,
            'totais' => $totais
        ]);
    }

    public function ajustar(Request $request){
        $produto = Produto::findOrFail($request->produto_id);
        $valor = __convert_value_bd($request->valor_venda);

        $percentualLucro = 0;
        if($valor > 0 && $produto->valor_compra > 0){
            $percentualLucro = ($valor/$produto->valor_compra)*100;
        }

        if($produto){
            $produto->valor_unitario = $valor;
            $produto->percentual_lucro = $percentualLucro;
            $produto->save();
            session()->flash("flash_success", "Produto ajustado!");
        }

        return redirect()->back();
    }

}
