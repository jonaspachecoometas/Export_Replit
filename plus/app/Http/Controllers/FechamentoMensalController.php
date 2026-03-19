<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FechamentoMensal;
use App\Models\ContaPagar;
use App\Models\ContaReceber;
use App\Models\Caixa;
use App\Models\Nfe;
use App\Models\Cliente;
use App\Models\Nfce;
use App\Models\Produto;
use App\Models\FechamentoMensalVenda;
use App\Models\FechamentoMensalDespesa;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class FechamentoMensalController extends Controller
{
    public function index(Request $request){
        $data = [];
        return view('fechamento_mensal.index', compact('data'));
    }

    public function resumo(Request $request)
    {
        $empresaId = $request->empresa_id;
        $mes = $request->mes ?? now()->subMonth()->format('Y-m');
        [$mes, $ano] = explode('/', $mes);
        $mes = $ano . '-' . $mes;

        $jaFechado = FechamentoMensal::where('empresa_id', $empresaId)
        ->where('mes', $mes)
        ->exists();

        if ($jaFechado) {
            return response()->json([
                'fechado' => true,
                'mensagem' => 'Este mês já foi fechado e não pode ser alterado.'
            ], 200);
        }

        $dt = Carbon::createFromFormat('Y-m', $mes)->startOfMonth();

        $inicio = $dt->copy()->startOfMonth()->startOfDay();
        $fim = $dt->copy()->endOfMonth()->endOfDay();

        $totalNfe = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('tpNF', 1)
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalNfce = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalVendas = $totalNfe + $totalNfce;

        $qtdNfe = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('tpNF', 1)
        ->where('estado', '!=', 'cancelado')
        ->count();

        $qtdNfce = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('estado', '!=', 'cancelado')
        ->count();

        $qtdVendas = $qtdNfe + $qtdNfce;

        $totalDespesas = ContaPagar::where('empresa_id', $empresaId)
        ->whereBetween('data_vencimento', [$inicio, $fim])
        ->sum('valor_integral');

        $ticketMedio = $qtdVendas > 0 ? $totalVendas / $qtdVendas : 0;
        $lucroEstimado = $totalVendas - $totalDespesas;

        $nfeEmitidas = Nfe::where('empresa_id', $empresaId)
        ->where('estado', 'aprovado')
        ->whereBetween('data_emissao', [$inicio, $fim])
        ->get();

        $totalNfe = $nfeEmitidas->sum('total');
        $qtdNfe = $nfeEmitidas->count();

        $nfceEmitidas = Nfce::where('empresa_id', $empresaId)
        ->where('estado', 'aprovado')
        ->whereBetween('data_emissao', [$inicio, $fim])
        ->get();

        $totalNfce = $nfceEmitidas->sum('total');
        $qtdNfce = $nfceEmitidas->count();

        $totalVenda = DB::table('estoques')
        ->join('produtos', 'produtos.id', '=', 'estoques.produto_id')
        ->where('produtos.empresa_id', $empresaId)
        ->select(DB::raw('SUM(estoques.quantidade * produtos.valor_unitario) as total'))
        ->value('total') ?? 0;

        $totalCompra = DB::table('estoques')
        ->join('produtos', 'produtos.id', '=', 'estoques.produto_id')
        ->where('produtos.empresa_id', $empresaId)
        ->select(DB::raw('SUM(estoques.quantidade * produtos.valor_compra) as total'))
        ->value('total') ?? 0;

        $totalProdutos = Produto::where('empresa_id', $request->empresa_id)->count();

        $produtosSemCusto = Produto::where('empresa_id', $empresaId)
        ->where('status', 1)
        ->where('gerenciar_estoque', 1)
        ->where(function ($q) {
            $q->whereNull('valor_compra')
            ->orWhere('valor_compra', '<=', 0);
        })
        ->count();

        $qtdCaixaAberto = Caixa::where('empresa_id', $empresaId)
        ->where('status', 1)
        ->count();

        $dataLimite = now()->subDays(90);

        $produtosParados = DB::table('produtos')
        ->leftJoin('estoques', 'estoques.produto_id', '=', 'produtos.id')

        ->leftJoin(DB::raw("
            (
            SELECT produto_id, MAX(created_at) AS ultima_venda
            FROM (
            SELECT produto_id, created_at FROM item_nves
            UNION ALL
            SELECT produto_id, created_at FROM item_nfces
            ) vendas
            GROUP BY produto_id
            ) ultimas_vendas
            "), 'ultimas_vendas.produto_id', '=', 'produtos.id')

        ->where('produtos.empresa_id', $empresaId)
        ->where('produtos.status', 1)
        ->where('produtos.gerenciar_estoque', 1)
        ->where('estoques.quantidade', '>', 0)

        ->where(function ($q) use ($dataLimite) {
            $q->whereNull('ultimas_vendas.ultima_venda')
            ->orWhere('ultimas_vendas.ultima_venda', '<', $dataLimite);
        })
        ->count();

        $topClientes = DB::query()
        ->fromSub(function ($q) use ($empresaId, $inicio, $fim) {
            $q->select(
                'cliente_id',
                DB::raw('COUNT(*) as total_vendas'),
                DB::raw('SUM(total) as total_comprado')
            )
            ->from('nfces')
            ->where('empresa_id', $empresaId)
            ->whereBetween('created_at', [$inicio, $fim])
            ->groupBy('cliente_id')

            ->unionAll(

                DB::table('nves')
                ->select(
                    'cliente_id',
                    DB::raw('COUNT(*) as total_vendas'),
                    DB::raw('SUM(total) as total_comprado')
                )
                ->where('empresa_id', $empresaId)
                ->whereBetween('created_at', [$inicio, $fim])
                ->groupBy('cliente_id')
            );

        }, 'vendas_consolidadas')
        ->join('clientes', 'clientes.id', '=', 'vendas_consolidadas.cliente_id')
        ->select(
            'vendas_consolidadas.cliente_id',
            DB::raw('SUM(vendas_consolidadas.total_vendas) as total_vendas'),
            DB::raw('SUM(vendas_consolidadas.total_comprado) as total_comprado'),
            DB::raw("clientes.razao_social as nome_cliente")
        )
        ->groupBy(
            'vendas_consolidadas.cliente_id',
            'clientes.razao_social'
        )
        ->orderByDesc('total_comprado')
        ->limit(5)
        ->get();

        $totalRecebido = ContaReceber::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('status', 1)
        ->sum('valor_recebido');

        $totalAberto = ContaReceber::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('status', 0)
        ->sum('valor_integral');

        $inicioAnterior = now()->createFromFormat('Y-m', $mes)->subMonth()->startOfMonth();
        $fimAnterior = now()->createFromFormat('Y-m', $mes)->subMonth()->endOfMonth();

        $totalNfeAnterior = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicioAnterior, $fimAnterior])
        ->where('tpNF', 1)
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalNfceAnterior = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicioAnterior, $fimAnterior])
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalVendasAnterior = $totalNfeAnterior + $totalNfceAnterior;

        $lucroAnterior = $totalVendasAnterior - (
            ContaPagar::where('empresa_id', $empresaId)
            ->whereBetween('data_vencimento', [$inicioAnterior, $fimAnterior])
            ->sum('valor_integral')
        );

        $comparativo = [
            'toggle' => $totalVendasAnterior > 0,
            'vendas' => $totalVendasAnterior > 0
            ? (($totalVendas - $totalVendasAnterior) / $totalVendasAnterior) * 100
            : 0,
            'lucro' => $lucroAnterior > 0
            ? (($lucroEstimado - $lucroAnterior) / $lucroAnterior) * 100
            : 0
        ];

        return response()->json([
            'mes' => $mes,
            'total_vendas' => $totalVendas,
            'total_despesas' => $totalDespesas,
            'lucro_estimado' => $lucroEstimado,
            'ticket_medio' => $ticketMedio,
            'qtd_vendas' => $qtdVendas,
            'fiscal' => [
                'nfe' => [
                    'quantidade' => $qtdNfe,
                    'total'      => $totalNfe,
                ],
                'nfce' => [
                    'quantidade' => $qtdNfce,
                    'total'      => $totalNfce,
                ],
                'total_documentos' => $qtdNfe + $qtdNfce,
            ],
            'estoque' => [
                'total_compra' => (float) $totalCompra,
                'total_venda'  => (float) $totalVenda,
                'total_produtos'  => $totalProdutos,
            ],
            'alertas' => [
                'produtos_sem_custo' => $produtosSemCusto,
                'produtos_parados_90' => $produtosParados,
                'qtd_caixas_aberto' => $qtdCaixaAberto,
            ],
            'top_clientes' => $topClientes->map(fn ($c) => [
                'cliente_id'     => $c->cliente_id,
                'nome'           => $c->nome_cliente,
                'total_vendas'   => (int) $c->total_vendas,
                'total_comprado' => (float) $c->total_comprado,
            ]),
            'financeiro' => [
                'recebido'  => (float) $totalRecebido,
                'em_aberto' => (float) $totalAberto,
            ],
            'comparativo' => $comparativo,

        ]);
    }

    public function fechar(Request $request)
    {

        $fechamento = DB::transaction(function () use ($request) {
            $empresaId = $request->empresa_id;
            $userId = auth()->id();
            $mes = $request->mes;
            [$mes, $ano] = explode('/', $mes);
            $mes = $ano . '-' . $mes;

            if (Caixa::where('empresa_id', $empresaId)->where('status', 1)->exists()) {
                return [
                    'error' => 'Existem caixas abertos. Feche todos antes de continuar.'
                ];
            }

            if (FechamentoMensal::where('empresa_id', $empresaId)->where('mes', $mes)->exists()) {
                return [
                    'error' => 'Este mês já foi fechado.'
                ];
            }

            try{
                $dados = $this->gerarSnapshot($empresaId, $mes);
                $fechamento = FechamentoMensal::create([
                    'empresa_id' => $empresaId,
                    'mes' => $mes,
                    'total_vendas' => $dados['total_vendas'],
                    'total_despesas' => $dados['total_despesas'],
                    'lucro_estimado' => $dados['lucro_estimado'],
                    'ticket_medio' => $dados['ticket_medio'],
                    'dados' => $dados,
                    'fechado_em' => now(),
                    'fechado_por' => $userId,
                ]);

        // FechamentoMensalVenda
                $vendas = $this->getVendas($empresaId, $mes);
                foreach($vendas as $v){
                    $v = (object) $v;
                    FechamentoMensalVenda::create([
                        'fechamento_id' => $fechamento->id, 
                        'tipo' => $v->tipo,
                        'codigo' => $v->codigo,
                        'cliente' => $v->cliente,
                        'data' => $v->data,
                        'valor' => $v->valor
                    ]);
                }

                $despesas = $this->getDespesas($empresaId, $mes);
                foreach($despesas as $d){
                    $d = (object) $d;
                    FechamentoMensalDespesa::create([
                        'fechamento_id' => $fechamento->id, 
                        'fornecedor' => $d->fornecedor,
                        'data' => $d->data,
                        'categoria' => $d->categoria,
                        'valor' => $d->valor
                    ]);
                }
                return $fechamento;
            }catch(\Exception $e){
                return null;
            }
        });

        if(isset($fechamento['error'])){
            return response()->json($fechamento['error'], 422);
        }
        return response()->json(['success' => $fechamento]);
    }

    private function gerarSnapshot($empresaId, $mes)
    {
        $dt = Carbon::createFromFormat('Y-m', $mes)->startOfMonth();

        $inicio = $dt->copy()->startOfMonth()->startOfDay();
        $fim = $dt->copy()->endOfMonth()->endOfDay();

        $totalNfe = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('tpNF', 1)
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalNfce = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalVendas = $totalNfe + $totalNfce;

        $qtdNfe = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('tpNF', 1)
        ->where('estado', '!=', 'cancelado')
        ->count();

        $qtdNfce = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('estado', '!=', 'cancelado')
        ->count();

        $qtdVendas = $qtdNfe + $qtdNfce;

        $totalDespesas = ContaPagar::where('empresa_id', $empresaId)
        ->whereBetween('data_vencimento', [$inicio, $fim])
        ->sum('valor_integral');

        $ticketMedio = $qtdVendas > 0 ? $totalVendas / $qtdVendas : 0;
        $lucroEstimado = $totalVendas - $totalDespesas;

        $nfeEmitidas = Nfe::where('empresa_id', $empresaId)
        ->where('estado', 'aprovado')
        ->whereBetween('data_emissao', [$inicio, $fim])
        ->get();

        $totalNfe = $nfeEmitidas->sum('total');
        $qtdNfe = $nfeEmitidas->count();

        $nfceEmitidas = Nfce::where('empresa_id', $empresaId)
        ->where('estado', 'aprovado')
        ->whereBetween('data_emissao', [$inicio, $fim])
        ->get();

        $totalNfce = $nfceEmitidas->sum('total');
        $qtdNfce = $nfceEmitidas->count();

        $totalVenda = DB::table('estoques')
        ->join('produtos', 'produtos.id', '=', 'estoques.produto_id')
        ->where('produtos.empresa_id', $empresaId)
        ->select(DB::raw('SUM(estoques.quantidade * produtos.valor_unitario) as total'))
        ->value('total') ?? 0;

        $totalCompra = DB::table('estoques')
        ->join('produtos', 'produtos.id', '=', 'estoques.produto_id')
        ->where('produtos.empresa_id', $empresaId)
        ->select(DB::raw('SUM(estoques.quantidade * produtos.valor_compra) as total'))
        ->value('total') ?? 0;

        $totalProdutos = Produto::where('empresa_id', $empresaId)->count();

        $produtosSemCusto = Produto::where('empresa_id', $empresaId)
        ->where('status', 1)
        ->where('gerenciar_estoque', 1)
        ->where(function ($q) {
            $q->whereNull('valor_compra')
            ->orWhere('valor_compra', '<=', 0);
        })
        ->count();

        $qtdCaixaAberto = Caixa::where('empresa_id', $empresaId)
        ->where('status', 1)
        ->count();

        $dataLimite = now()->subDays(90);

        $produtosParados = DB::table('produtos')
        ->leftJoin('estoques', 'estoques.produto_id', '=', 'produtos.id')

        ->leftJoin(DB::raw("
            (
            SELECT produto_id, MAX(created_at) AS ultima_venda
            FROM (
            SELECT produto_id, created_at FROM item_nves
            UNION ALL
            SELECT produto_id, created_at FROM item_nfces
            ) vendas
            GROUP BY produto_id
            ) ultimas_vendas
            "), 'ultimas_vendas.produto_id', '=', 'produtos.id')

        ->where('produtos.empresa_id', $empresaId)
        ->where('produtos.status', 1)
        ->where('produtos.gerenciar_estoque', 1)
        ->where('estoques.quantidade', '>', 0)

        ->where(function ($q) use ($dataLimite) {
            $q->whereNull('ultimas_vendas.ultima_venda')
            ->orWhere('ultimas_vendas.ultima_venda', '<', $dataLimite);
        })
        ->count();

        $topClientes = DB::query()
        ->fromSub(function ($q) use ($empresaId, $inicio, $fim) {
            $q->select(
                'cliente_id',
                DB::raw('COUNT(*) as total_vendas'),
                DB::raw('SUM(total) as total_comprado')
            )
            ->from('nfces')
            ->where('empresa_id', $empresaId)
            ->whereBetween('created_at', [$inicio, $fim])
            ->groupBy('cliente_id')

            ->unionAll(

                DB::table('nves')
                ->select(
                    'cliente_id',
                    DB::raw('COUNT(*) as total_vendas'),
                    DB::raw('SUM(total) as total_comprado')
                )
                ->where('empresa_id', $empresaId)
                ->whereBetween('created_at', [$inicio, $fim])
                ->groupBy('cliente_id')
            );

        }, 'vendas_consolidadas')
        ->join('clientes', 'clientes.id', '=', 'vendas_consolidadas.cliente_id')
        ->select(
            'vendas_consolidadas.cliente_id',
            DB::raw('SUM(vendas_consolidadas.total_vendas) as total_vendas'),
            DB::raw('SUM(vendas_consolidadas.total_comprado) as total_comprado'),
            DB::raw("clientes.razao_social as nome_cliente")
        )
        ->groupBy(
            'vendas_consolidadas.cliente_id',
            'clientes.razao_social'
        )
        ->orderByDesc('total_comprado')
        ->limit(5)
        ->get();

        $totalRecebido = ContaReceber::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('status', 1)
        ->sum('valor_recebido');

        $totalAberto = ContaReceber::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('status', 0)
        ->sum('valor_integral');

        $inicioAnterior = now()->createFromFormat('Y-m', $mes)->subMonth()->startOfMonth();
        $fimAnterior = now()->createFromFormat('Y-m', $mes)->subMonth()->endOfMonth();

        $totalNfeAnterior = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicioAnterior, $fimAnterior])
        ->where('tpNF', 1)
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalNfceAnterior = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicioAnterior, $fimAnterior])
        ->where('estado', '!=', 'cancelado')
        ->sum('total');

        $totalVendasAnterior = $totalNfeAnterior + $totalNfceAnterior;

        $lucroAnterior = $totalVendasAnterior - (
            ContaPagar::where('empresa_id', $empresaId)
            ->whereBetween('data_vencimento', [$inicioAnterior, $fimAnterior])
            ->sum('valor_integral')
        );

        $comparativo = [
            'toggle' => $totalVendasAnterior > 0,
            'vendas' => $totalVendasAnterior > 0
            ? (($totalVendas - $totalVendasAnterior) / $totalVendasAnterior) * 100
            : 0,
            'lucro' => $lucroAnterior > 0
            ? (($lucroEstimado - $lucroAnterior) / $lucroAnterior) * 100
            : 0
        ];

        return [
            'total_vendas' => $totalVendas,
            'total_despesas' => $totalDespesas,
            'lucro_estimado' => $totalVendas - $totalDespesas,
            'ticket_medio' => $qtdVendas > 0 ? $totalVendas / $qtdVendas : 0,
            'qtd_vendas' => $qtdVendas,
            'gerado_em' => now(),

            'fiscal' => [
                'nfe' => [
                    'quantidade' => $qtdNfe,
                    'total' => $totalNfe,
                ],
                'nfce' => [
                    'quantidade' => $qtdNfce,
                    'total' => $totalNfce,
                ],
                'total_documentos' => $qtdNfe + $qtdNfce,
            ],
            'estoque' => [
                'total_compra' => (float) $totalCompra,
                'total_venda'  => (float) $totalVenda,
                'total_produtos' => $totalProdutos,
            ],
            'alertas' => [
                'produtos_sem_custo' => $produtosSemCusto,
                'produtos_parados_90' => $produtosParados,
                'qtd_caixas_aberto' => $qtdCaixaAberto,
            ],
            'top_clientes' => $topClientes->map(fn ($c) => [
                'cliente_id' => $c->cliente_id,
                'nome' => $c->nome_cliente,
                'total_vendas'   => (int) $c->total_vendas,
                'total_comprado' => (float) $c->total_comprado,
            ]),
            'financeiro' => [
                'recebido'  => (float) $totalRecebido,
                'em_aberto' => (float) $totalAberto,
            ],
            'comparativo' => $comparativo,
        ];
    }

    public function historic(Request $request)
    {
        $fechamentos = FechamentoMensal::where('empresa_id', $request->empresa_id)
        ->orderByDesc('mes')
        ->get();

        return view('fechamento_mensal.historic', compact('fechamentos'));
    }

    public function show($id)
    {
        $fechamento = FechamentoMensal::findOrFail($id);
        // dd($fechamento->dados);
        return view('fechamento_mensal.show', [
            'fechamento' => $fechamento,
            'dados' => $fechamento->dados,
        ]);
    }

    public function vendas(Request $request){
        $empresaId = $request->empresa_id;
        $mes = $request->mes;

        [$mesNum, $ano] = explode('/', $mes);
        $mes = $ano.'-'.$mesNum;

        $vendas = $this->getVendas($empresaId, $mes);

        return response()->json([
            'vendas' => $vendas
        ]);
    }

    private function getVendas($empresaId, $mes){
        $dt = Carbon::createFromFormat('Y-m', $mes);
        $inicio = $dt->copy()->startOfMonth()->startOfDay();
        $fim = $dt->copy()->endOfMonth()->endOfDay();

        $vendasNfe = Nfe::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('estado', '!=', 'cancelado')
        ->get()
        ->map(fn ($nfe) => [
            'codigo' => $nfe->numero_sequencial,
            'cliente' => $nfe->cliente ? $nfe->cliente->info : 'Consumidor Final',
            'data' => __data_pt($nfe->created_at),
            'valor' => __moeda($nfe->total),
            'tipo' => 'NFe',
        ]);

        $vendasNfce = Nfce::where('empresa_id', $empresaId)
        ->whereBetween('created_at', [$inicio, $fim])
        ->where('estado', '!=', 'cancelado')
        ->get()
        ->map(fn ($nfce) => [
            'codigo' => $nfce->numero_sequencial,
            'cliente' => $nfce->cliente ? $nfce->cliente->info : 'Consumidor Final',
            'data' => __data_pt($nfce->created_at),
            'valor' => __moeda($nfce->total),
            'tipo' => 'NFCe',
        ]);

        return $vendasNfe
        ->merge($vendasNfce)
        ->sortByDesc('data')
        ->values();
    }

    public function despesas(Request $request){
        $empresaId = $request->empresa_id;
        $mes = $request->mes;

        [$mesNum, $ano] = explode('/', $mes);
        $mes = $ano.'-'.$mesNum;

        $despesas = $this->getDespesas($empresaId, $mes);

        return response()->json([
            'despesas' => $despesas
        ]);
    }

    private function getDespesas($empresaId, $mes){
        $dt = Carbon::createFromFormat('Y-m', $mes);
        $inicio = $dt->copy()->startOfMonth()->startOfDay();
        $fim = $dt->copy()->endOfMonth()->endOfDay();

        return ContaPagar::where('empresa_id', $empresaId)
        ->whereBetween('data_vencimento', [$inicio, $fim])
        ->orderBy('data_vencimento')
        ->get()
        ->map(fn ($d) => [
            'fornecedor' => $d->fornecedor ? $d->fornecedor->info : '—',
            'data' => __data_pt($d->data_vencimento, 0),
            'valor' => __moeda($d->valor_integral),
            'categoria' => $d->categoria ? $d->categoria->nome : '-',
        ]);
    }
}
