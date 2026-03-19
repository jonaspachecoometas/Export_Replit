@extends('layouts.app', ['title' => 'Fechamento Mensal'])

@section('content')
<div class="mt-1">
	<div class="row">
		<div class="card">
			<div class="card-body">
				<div class="container-fluid">

					<div class="row mb-3">
						<div class="col-md-8">
							<h4>Fechamento Mensal</h4>
							<p class="text-muted mb-0">
								Confira os dados e finalize o mês com segurança
							</p>
						</div>

						<div class="col-md-2">
							<label>Mês</label>
							<input type="month" id="mes" class="form-control" data-mask="00/0000" value="{{ request('mes', now()->format('m/Y')) }}">
						</div>

						<div class="col-md-2 d-flex align-items-end">
							<button class="btn btn-primary w-100" id="btnCarregar">
								Carregar dados
							</button>
						</div>
					</div>

					{{-- PROGRESSO --}}
					<div class="progress mb-3" style="height: 22px;">
						<div id="progressFechamento" class="progress-bar bg-success" style="width: 2%">
							0%
						</div>
					</div>

					<div class="row g-3">

						<!-- Total de Vendas -->
						<div class="col-md-3">
							<div class="card border-success h-100">
								<div class="card-body">
									<div class="d-flex justify-content-between align-items-start mb-1">
										<h6 class="text-muted mb-0">Total de Vendas</h6>
										<i class="ri-shopping-cart-2-line text-success fs-4"></i>
									</div>

									<h4 class="fw-bold mb-1" id="totalVendas">R$ 0,00</h4>

									<div class="small text-muted">
										NFe: <strong id="totalNfe">R$ 0,00</strong><br>
										NFCe: <strong id="totalNfce">R$ 0,00</strong>
									</div>

									<a id="buscar-vendas" class="small text-success text-decoration-none d-inline-block mt-2 d-none" href="javascript:void(0)">
										Ver vendas →
									</a>
								</div>
							</div>
						</div>

						<!-- Total de Despesas -->
						<div class="col-md-3">
							<div class="card border-danger h-100">
								<div class="card-body">
									<div class="d-flex justify-content-between align-items-start mb-1">
										<h6 class="text-muted mb-0">Total de Despesas</h6>
										<i class="ri-arrow-down-circle-line text-danger fs-4"></i>
									</div>

									<h4 class="fw-bold mb-1" id="totalDespesas">R$ 0,00</h4>

									<div class="small text-muted">
										Gastos operacionais do mês
									</div>

									<a id="buscar-despesas" class="small text-danger text-decoration-none d-inline-block mt-2 d-none" href="javascript:void(0)">
										Ver despesas →
									</a>
								</div>
							</div>
						</div>

						<!-- Lucro Estimado -->
						<div class="col-md-3">
							<div class="card border-info h-100">
								<div class="card-body">
									<div class="d-flex justify-content-between align-items-start mb-1">
										<h6 class="text-muted mb-0">Lucro Estimado</h6>
										<i class="ri-line-chart-line text-info fs-4"></i>
									</div>

									<h4 class="fw-bold mb-1" id="lucroEstimado">R$ 0,00</h4>

									<div class="small text-muted">
										Vendas − Despesas
									</div>

								</div>
							</div>
						</div>

						<!-- Ticket Médio -->
						<div class="col-md-3">
							<div class="card border-primary h-100">
								<div class="card-body">
									<div class="d-flex justify-content-between align-items-start mb-1">
										<h6 class="text-muted mb-0">Ticket Médio</h6>
										<i class="ri-money-dollar-circle-line text-primary fs-4"></i>
									</div>

									<h4 class="fw-bold mb-1" id="ticketMedio">R$ 0,00</h4>

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

									<h5 class="fw-bold mb-1">Compra: <strong class="text-danger" id="estoqueCompra">R$ 0,00</strong></h5>
									<h5 class="fw-bold mb-1">Venda: <strong class="text-success" id="estoqueVenda">R$ 0,00</strong></h5>

									<div class="small text-muted">
										Total de produtos cadastrados: <strong class="text-muted" id="totalProdutos">0</strong>
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

										<!-- Produtos sem custo -->
										<a target="_blank" href="{{ route('produtos.index', ['sem_custo' => 1]) }}"
											class="d-flex justify-content-between align-items-center alert-item">
											<li id="alertaSemCusto" class="mb-1 d-none fw-bold">
												Produtos sem custo:
												<strong class="text-danger">
													<span id="qtdSemCusto">0</span>
												</strong>
											</li>
										</a>

										<a target="_blank" href="{{ route('produtos.index', ['parados_90' => 1]) }}"
											class="d-flex justify-content-between align-items-center alert-item">
											<li id="alertaParados" class="mb-1 d-none fw-bold">
												Produtos parados +90 dias:
												<strong class="text-warning">
													<span id="qtdParados">0</span>
												</strong>
											</li>
										</a>

										<!-- Caixa aberto -->
										<li id="alertaCaixa" class="mb-1 d-none fw-bold">
											Caixas abertos
											<strong class="text-danger">
												<span id="qtdCaixas">0</span>
											</strong>
										</li>

										<li id="alertaOk" class="text-success d-none">
											<i class="ri-checkbox-circle-fill"></i> Nenhuma pendência encontrada
										</li>

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
										<strong class="text-success" id="totalRecebido">R$ 0,00</strong>
									</h5>

									<h6 class="fw-bold mb-1">
										Em aberto:
										<strong class="text-danger" id="totalAberto">R$ 0,00</strong>
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
										<span id="compVendas" class="ms-1">—</span>
									</h6>

									<h6 class="fw-bold mb-1">
										Lucro:
										<span id="compLucro" class="ms-1">—</span>
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

									<!-- Loading -->
									<div id="loadingTopClientes" class="text-center py-4">
										<div class="spinner-border text-primary spinner-border-sm"></div>
									</div>

									<div id="boxTopClientes" class="d-none">
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
												<tbody id="tbodyTopClientes">

												</tbody>
											</table>
										</div>
									</div>

									<!-- Vazio -->
									<div id="topClientesVazio" class="alert alert-light border d-none mb-0">
										Nenhuma venda encontrada no período.
									</div>

								</div>
							</div>
						</div>


					</div>


					<div class="row mt-4">
						<div class="col-md-12">
							<div class="card">
								<div class="card-header">
									✔️ Checklist de Conferência
								</div>
								<div class="card-body">

									<div class="form-check">
										<input class="form-check-input checklist" type="checkbox">
										<label class="form-check-label">
											Conferi as vendas do mês
										</label>
									</div>

									<div class="form-check">
										<input class="form-check-input checklist" type="checkbox">
										<label class="form-check-label">
											Conferi as despesas
										</label>
									</div>

									<div class="form-check">
										<input class="form-check-input checklist" type="checkbox">
										<label class="form-check-label">
											Conferi o caixa
										</label>
									</div>

									<div class="form-check">
										<input class="form-check-input checklist" type="checkbox">
										<label class="form-check-label">
											Conferi o estoque
										</label>
									</div>

								</div>
							</div>
						</div>
					</div>

					{{-- AÇÕES --}}
					<div class="row mt-4">
						<div class="col-md-12 text-end">
							<button class="btn btn-success px-5" id="btnFechar" disabled>
								<i class="ri-checkbox-circle-fill"></i> Confirmar Fechamento
							</button>
						</div>
					</div>

				</div>
			</div>
		</div>
	</div>
</div>
@include('fechamento_mensal.partials.modal_vendas')
@include('fechamento_mensal.partials.modal_despesas')
@section('js')
<script type="text/javascript" src="js/fechamento_mensal.js"></script>
@endsection
@endsection
