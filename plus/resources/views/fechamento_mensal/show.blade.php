@extends('layouts.app', ['title' => 'Fechamento ' . \Carbon\Carbon::createFromFormat('Y-m', $fechamento->mes)->format('m/Y')])

@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="container-fluid">

                    <div class="d-flex justify-content-between mb-3">
                        <div>
                            <h4>Fechamento <strong class="text-primary">{{ \Carbon\Carbon::createFromFormat('Y-m', $fechamento->mes)->format('m/Y') }}</strong></h4>
                            <p class="text-muted mb-0">
                                Fechado em <strong>{{ $fechamento->fechado_em->format('d/m/Y H:i') }}</strong>
                                por <strong>{{ optional($fechamento->user)->name }}</strong>
                            </p>
                        </div>

                    </div>

                    <div class="row g-3">

                        <div class="col-md-3">
                            <div class="card border-success h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Total de Vendas</h6>
                                        <i class="ri-shopping-cart-2-line text-success fs-4"></i>
                                    </div>

                                    <h4 class="fw-bold mb-1" id="totalVendas">R$ {{ __moeda($dados['total_vendas']) }}</h4>

                                    <div class="small text-muted">
                                        NFe: <strong>R$ {{ __moeda($dados['fiscal']['nfe']['total']) }} - 
                                        registros {{ $dados['fiscal']['nfe']['quantidade'] }}</strong><br>
                                        NFCe: <strong>R$ {{ __moeda($dados['fiscal']['nfce']['total']) }} - 
                                        registros {{ $dados['fiscal']['nfce']['quantidade'] }}</strong>
                                    </div>

                                    <a class="small text-success text-decoration-none d-inline-block mt-2" href="javascript:void(0)">
                                        Ver vendas →
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-danger h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Total de Despesas</h6>
                                        <i class="ri-arrow-down-circle-line text-danger fs-4"></i>
                                    </div>

                                    <h4 class="fw-bold mb-1">R$ {{ __moeda($dados['total_despesas']) }}</h4>

                                    <div class="small text-muted">
                                        Gastos operacionais do mês
                                    </div>

                                    <a id="buscar-despesas" class="small text-danger text-decoration-none d-inline-block mt-2" href="javascript:void(0)">
                                        Ver despesas →
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-info h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Lucro Estimado</h6>
                                        <i class="ri-line-chart-line text-info fs-4"></i>
                                    </div>

                                    <h4 class="fw-bold mb-1">R$ {{ __moeda($dados['lucro_estimado']) }}</h4>
                                    <div class="small text-muted">
                                        Vendas − Despesas
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-primary h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Ticket Médio</h6>
                                        <i class="ri-money-dollar-circle-line text-primary fs-4"></i>
                                    </div>

                                    <h4 class="fw-bold mb-1">R$ {{ __moeda($dados['ticket_medio']) }}</h4>
                                    <div class="small text-muted">
                                        Média por venda
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-warning h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Estoque Atual</h6>
                                        <i class="ri-archive-line text-secondary fs-4"></i>
                                    </div>

                                    <h5 class="fw-bold mb-1">Compra: <strong class="text-danger" id="">R$ {{ __moeda($dados['estoque']['total_compra']) }}</strong></h5>
                                    <h5 class="fw-bold mb-1">Venda: <strong class="text-success" id="">R$ {{ __moeda($dados['estoque']['total_venda']) }}</strong></h5>

                                    <div class="small text-muted">
                                        Total de produtos cadastrados: <strong class="text-muted" id="">{{ $dados['estoque']['total_produtos'] }}</strong>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-warning h-100">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h6 class="text-muted mb-0">Atenções do Sistema</h6>
                                        <i class="ri-alert-line text-warning fs-4"></i>
                                    </div>

                                    <ul class="list-unstyled small mb-3">

                                        @if($dados['alertas']['produtos_sem_custo'] > 0)
                                        <li id="alertaSemCusto" class="mb-1 fw-bold">
                                            Produtos sem custo:
                                            <strong class="text-danger">
                                                <span>{{ $dados['alertas']['produtos_sem_custo'] }}</span>
                                            </strong>
                                        </li>
                                        @endif

                                        @if($dados['alertas']['produtos_parados_90'] > 0)
                                        <li id="alertaParados" class="mb-1 fw-bold">
                                            Produtos parados +90 dias:
                                            <strong class="text-warning">
                                                <span>{{ $dados['alertas']['produtos_parados_90'] }}</span>
                                            </strong>
                                        </li>
                                        @endif

                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-secondary h-100">
                                <div class="card-body">

                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Recebimentos</h6>
                                        <i class="ri-wallet-3-line text-secondary fs-4"></i>
                                    </div>

                                    <h5 class="fw-bold mb-1">
                                        Recebido:
                                        <strong class="text-success">R$ {{ __moeda($dados['financeiro']['recebido']) }}</strong>
                                    </h5>

                                    <h6 class="fw-bold mb-1">
                                        Em aberto:
                                        <strong class="text-danger">R$ {{ __moeda($dados['financeiro']['em_aberto']) }}</strong>
                                    </h6>

                                    <div class="small text-muted">
                                        Valores financeiros do mês
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="card border-dark h-100">
                                <div class="card-body">

                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <h6 class="text-muted mb-0">Comparativo Mensal</h6>
                                        <i class="ri-bar-chart-2-line text-dark fs-4"></i>
                                    </div>

                                    <h6 class="fw-bold mb-1">
                                        Vendas:
                                        <span id="compVendas" class="ms-1 fw-bold {{ $dados['comparativo']['vendas'] > 0 ? 'text-success' : 'text-danger' }}">
                                            {{ $dados['comparativo']['vendas'] > 0 ? '↑ ' : '↓ ' }}
                                            @if($dados['comparativo']['vendas'] > 0)
                                            {{ number_format($dados['comparativo']['vendas'], 1, '.', '') }}
                                            @else
                                            {{ number_format($dados['comparativo']['vendas']*-1, 1, '.', '') }}
                                            @endif
                                            %
                                        </span>
                                    </h6>

                                    <h6 class="fw-bold mb-1">
                                        Lucro:
                                        <span id="compLucro" class="ms-1 fw-bold {{ $dados['comparativo']['lucro'] > 0 ? 'text-success' : 'text-danger' }}">
                                            {{ $dados['comparativo']['lucro'] > 0 ? '↑ ' : '↓ ' }}
                                            @if($dados['comparativo']['lucro'] > 0)
                                            {{ number_format($dados['comparativo']['lucro'], 1, '.', '') }}
                                            @else
                                            {{ number_format($dados['comparativo']['lucro']*-1, 1, '.', '') }}
                                            @endif
                                            %
                                        </span>
                                    </h6>

                                    <div class="small text-muted">
                                        Em relação ao mês anterior
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div class="col-md-12">
                            <div class="card border-primary h-100">
                                <div class="card-body">

                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <div>
                                            <h6 class="text-muted mb-0">Top Clientes do Mês</h6>
                                            <div class="small text-muted">Ranking por faturamento</div>
                                        </div>
                                        <i class="ri-trophy-line text-primary fs-4"></i>
                                    </div>

                                    <div id="loadingTopClientes" class="text-center py-4">
                                        <div class="spinner-border text-primary spinner-border-sm"></div>
                                    </div>

                                    <div>
                                        <div class="table-responsive">
                                            <table class="table table-sm align-middle mb-0">
                                                <thead class="text-muted">
                                                    <tr>
                                                        <th style="width:40px;">#</th>
                                                        <th>Cliente</th>
                                                        <th class="text-center">Vendas</th>
                                                        <th class="text-end">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    @foreach($dados['top_clientes'] as $key => $l)
                                                    <tr class="hover-pointer">
                                                        <td class="fw-bold">
                                                            @if($key == 0)
                                                            🥇
                                                            @elseif($key == 1)
                                                            🥈
                                                            @elseif($key == 2)
                                                            🥉
                                                            @else
                                                            {{ $key+1 }}
                                                            @endif
                                                        </td>

                                                        <td>
                                                            <div class="fw-semibold text-truncate" style="max-width:230px">
                                                                {{ $l['nome'] }}
                                                            </div>
                                                        </td>

                                                        <td class="text-center">
                                                            <span class="badge bg-light text-dark border">
                                                                {{ $l['total_vendas'] }}
                                                            </span>
                                                        </td>

                                                        <td class="text-end fw-bold text-primary">
                                                            R$ {{ __moeda($l['total_comprado']) }}
                                                        </td>
                                                    </tr>
                                                    @endforeach
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    </div>
</div>
@endsection
