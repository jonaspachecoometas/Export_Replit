
<div class="card shadow-sm border-0">
	<!-- Header -->
	<div class="card-header d-flex align-items-center justify-content-between bg-white border-0 pb-0">
		<div class="d-flex align-items-center gap-2">
			<div class="avatar-sm rounded-circle bg-primary-subtle d-flex align-items-center justify-content-center">
				<i class="ri-user-3-line text-primary fs-4"></i>
			</div>
			<div>
				<h5 class="mb-0 fw-bold">Cliente</h5>
				<small class="text-muted">Detalhes cadastrais e financeiro</small>
			</div>
		</div>

		<div class="d-flex align-items-center gap-2">
			@if($cliente->status)
			<span class="badge bg-success-subtle text-success border border-success-subtle">
				<i class="ri-shield-check-line me-1"></i> Ativo
			</span>
			@else
			<span class="badge bg-warning-subtle text-warning border border-warning-subtle">
				<i class="ri-shield-line me-1"></i> Pendente
			</span>
			@endif

			<a target="_blank" href="{{ route('clientes.edit', [$cliente->id]) }}" class="btn btn-outline-primary btn-sm">
				<i class="ri-edit-line me-1"></i> Editar
			</a>
		</div>
	</div>

	<div class="card-body pt-3">
		<!-- Cliente info grid -->
		<div class="row g-3">
			<div class="col-12 col-lg-6">
				<div class="p-3 rounded-4 border bg-light-subtle h-100">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<span class="text-muted fw-semibold text-uppercase" style="font-size:12px;">Razão Social</span>
						<i class="ri-building-2-line text-muted"></i>
					</div>

					<div class="fw-bold fs-5 text-dark text-truncate">
						{{ $cliente->razao_social ?? '--' }}
					</div>

					<div class="mt-2 d-flex flex-wrap gap-2">
						<span class="badge bg-primary-subtle text-primary border border-primary-subtle">
							<i class="ri-id-card-line me-1"></i> {{ $cliente->cpf_cnpj ?? '--' }}
						</span>

						<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
							<i class="ri-store-2-line me-1"></i> {{ $cliente->nome_fantasia ?? 'Sem fantasia' }}
						</span>
					</div>
				</div>
			</div>

			<div class="col-12 col-lg-6">
				<div class="p-3 rounded-4 border bg-light-subtle h-100">
					<div class="d-flex align-items-center justify-content-between mb-2">
						<span class="text-muted fw-semibold text-uppercase" style="font-size:12px;">Endereço</span>
						<i class="ri-map-pin-2-line text-muted"></i>
					</div>

					<div class="fw-semibold text-dark">
						{{ $cliente->rua ?? '--' }}, {{ $cliente->numero ?? 's/n' }}
						@if(!empty($cliente->complemento))
						<span class="text-muted">• {{ $cliente->complemento }}</span>
						@endif
					</div>

					<div class="text-muted mt-1">
						{{ $cliente->bairro ?? '--' }} • {{ $cliente->cidade->info }}
					</div>

					<div class="text-muted mt-1">
						<i class="ri-mail-line me-1"></i> {{ $cliente->email ?? '--' }}
						<span class="mx-2">•</span>
						<i class="ri-phone-line me-1"></i> {{ $cliente->telefone ?? '--' }}
					</div>
				</div>
			</div>
		</div>

		<!-- Divider -->
		<hr class="my-4">

		<!-- Contas a receber header -->
		<div class="d-flex align-items-center justify-content-between mb-3">
			<div>
				<h5 class="mb-0 fw-bold">Contas a Receber</h5>
				<small class="text-muted">Parcelas e títulos em aberto</small>
			</div>
		</div>

		<!-- Table -->
		<div class="table-responsive">
			<table class="table align-middle table-hover mb-0">
				<thead class="table-light">
					<tr>
						<th style="width: 40px;"></th>
						<th style="width: 120px;">Vencimento</th>
						<th>Descrição</th>
						<th style="width: 130px;">Documento</th>
						<th style="width: 120px;">Valor</th>
						<th style="width: 140px;">Status</th>
					</tr>
				</thead>
				<tbody>
					@forelse($data as $c)
					@php

					$hoje = date('Y-m-d');

					if(strtotime($c->data_vencimento) < strtotime(date('Y-m-d'))){
						$label = 'Em atraso';
						$badge = 'bg-danger-subtle text-danger border border-danger-subtle';
						$icon  = 'ri-alarm-warning-line';
					} else {
						// PENDENTE
						$label = 'Pendente';
						$badge = 'bg-warning-subtle text-warning border border-warning-subtle';
						$icon  = 'ri-time-line';
					}

					$diasAtraso = $c->diasAtraso();
					@endphp

					<tr>
						<td>
							<input type="checkbox" class="check-conta" value="{{ $c->id }}">
						</td>
						<td class="fw-semibold">
							{{ __data_pt($c->data_vencimento, 0) }}
							@if(!empty($c->dias_atraso) && $c->dias_atraso > 0)
							<div class="small text-danger">+{{ $c->dias_atraso }} dia(s)</div>
							@endif
						</td>

						<td>
							<div class="fw-semibold text-dark">
								{{ $c->descricao ?? 'Título' }}
							</div>
							<div class="text-muted small">
								Venda: <span class="fw-semibold">{{ $c->venda_id ?? '--' }}</span>
								<span class="mx-2">•</span>
								Forma: <span class="fw-semibold">{{ $c->forma_pagamento ?? '--' }}</span>
							</div>
						</td>

						<td>
							<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
								{{ $c->documento ?? ('#'.$c->id) }}
							</span>
						</td>

						<td class="fw-bold">
							R$ {{ __moeda($c->valor_integral) }}
						</td>

						<td>
							<span class="badge {{ $badge }} px-3 py-2 rounded-pill">
								<i class="{{ $icon }} me-1"></i>
								{{ $label }}
							</span>
						</td>

					</tr>
					@empty
					<tr>
						<td colspan="6">
							<div class="text-center p-4">
								<div class="mb-2">
									<i class="ri-inbox-2-line fs-1 text-muted"></i>
								</div>
								<div class="fw-semibold">Nenhuma conta encontrada</div>
								<div class="text-muted small">Este cliente não possui contas a receber no momento.</div>
							</div>
						</td>
					</tr>
					@endforelse
				</tbody>
			</table>
		</div>

		<div class="d-flex flex-wrap align-items-center justify-content-between mt-3 p-3 rounded-4 border bg-white">
			<div class="d-flex flex-wrap gap-3">
				<div>
					<div class="text-muted small">Total em aberto</div>
					<div class="fw-bold text-dark">R$ {{ __moeda($totalPendente + $totalAtrasado) }}</div>
				</div>
				<div>
					<div class="text-muted small">Total pendente</div>
					<div class="fw-bold text-warning">R$ {{ __moeda($totalPendente) }}</div>
				</div>

				<div>
					<div class="text-muted small">Total em atraso</div>
					<div class="fw-bold text-danger">R$ {{ __moeda($totalAtrasado) }}</div>
				</div>

			</div>

		</div>
	</div>

	<div class="card-footer">
		<button id="btnReceberContas" type="button" class="btn btn-success btn-sm" disabled>
			<i class="ri-cash-line me-1"></i>
			Receber contas
		</button>
	</div>
</div>

