@extends('layouts.app', ['title' => 'Ordem de Separação'])
@section('css')
<style type="text/css">
	.swal-button--confirm {
		background-color: #28a745 !important;
	}

	.swal-button--confirm:hover {
		background-color: #218838 !important;
	}

	.item-encontrado {
		background-color: #d1e7dd !important;
		transition: background-color 0.4s;
	}

</style>
@endsection
@section('content')

<div class="card mt-1">
	<div class="card-body">
		<div class="pl-lg-4">
			<div style="text-align: right; margin-top: 5px;">
				<a href="{{ route('ordem-separacao.index') }}" class="btn btn-danger btn-sm px-3">
					<i class="ri-arrow-left-double-fill"></i>Voltar
				</a>
			</div>
			<div class="col-12">
				<div class="ca">

					<div class="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap">

						<div>
							<h5 class="mb-1 fw-semibold">
								Ordem de Separação <strong class="text-primary">#{{ $item->numero_sequencial }}</strong>
							</h5>
							<small class="text-primary">
								{{ $item->cliente->info }}
							</small>
						</div>

						{{-- STATUS --}}
						@php
						$statusMap = [
						'em_separacao' => ['label' => 'Em Separação', 'class' => 'warning'],
						'finalizado'   => ['label' => 'Finalizado',   'class' => 'success'],
						'cancelado'    => ['label' => 'Cancelado',    'class' => 'danger'],
						];

						$status = $statusMap[$item->status] ?? ['label'=>'Indefinido','class'=>'secondary'];
						@endphp

						<span class="badge bg-{{ $status['class'] }} p-1">
							{{ $status['label'] }}
						</span>
					</div>

					<div class="card-body">

						<div class="row g-3">

							<div class="col-md-3">
								<label class="text-muted small">Código do orçamento</label>
								<div class="fw-semibold">
									#{{ $item->orcamento->numero_sequencial }}
								</div>
							</div>

							<div class="col-md-3">
								<label class="text-muted small">Funcionário</label>
								<div class="fw-semibold">
									{{ $item->funcionario->nome ?? 'Não informado' }}
								</div>
							</div>

							<div class="col-md-3">
								<label class="text-muted small">Data de criação</label>
								<div class="fw-semibold">
									{{ __data_pt($item->created_at) }}
								</div>
							</div>

							<div class="col-md-3">
								<label class="text-muted small">Prioridade</label>
								<div class="fw-semibold">
									@if($item->prioridade == 'normal')
									<span class="badge bg-primary p-1">Normal</span>
									@else
									<span class="badge bg-danger p-1">Urgente</span>
									@endif
								</div>
							</div>

							<div class="col-md-3">
								<label class="text-muted small">Usuário de criação</label>
								<div class="fw-semibold">
									{{ $item->usuarioInicia->name }}
								</div>
							</div>

							<div class="col-md-3">
								<label class="text-muted small">Usuário de finalização</label>
								<div class="fw-semibold">
									{{ $item->usuarioFinaliza ? $item->usuarioFinaliza->name : '--' }}
								</div>
							</div>

							<div class="col-12">
								<label class="text-muted small">Observação</label>
								<div class="border rounded p-2 bg-light">
									{{ $item->observacao ?? '—' }}
								</div>
							</div>

							@if($item->status === 'cancelado' && $item->motivo_cancelado)
							<div class="col-12">
								<label class="text-muted small text-danger">Motivo do Cancelamento</label>
								<div class="border border-danger rounded p-2 bg-danger-subtle">
									{{ $item->motivo_cancelado }}
								</div>
							</div>
							@endif

						</div>

						<div class="col-md-4 mt-3">
							<label class="text-muted small">Buscar por código de barras</label>
							<input type="text"
							id="buscarCodigo"
							class="form-control"
							placeholder="Escaneie o código de barras"
							autofocus>
						</div>
						<div class="row mt-3">
							<div class="table-responsive">
								<table class="table">
									<thead class="table-dark">
										<tr>
											<th>Produto</th>
											<th>Código de barras</th>
											<th>Quantidade</th>
											<th>Status</th>
											<th>Observação</th>
											<th>Ações</th>
										</tr>
									</thead>
									<tbody>

										@foreach($item->itens as $p)
										<tr class="@if($p->status == 'separado') item-encontrado @endif">
											<td>{{ $p->produto->nome }}</td>
											<td class="codigo-barras" data-codigo="{{ $p->produto->codigo_barras }}">
												{{ $p->produto->codigo_barras }}
											</td>
											<td>
												@if(!$p->produto->unidadeDecimal())
												{{ number_format($p->quantidade, 0, '.', '') }}
												@else
												{{ number_format($p->quantidade, 3, '.', '') }}
												@endif
											</td>
											<td>{!! $p->estadoItem() !!}</td>

											<td>{{ $p->observacao_item ?? '--' }}</td>
											<td>
												@if($p->status != 'separado')
												<form action="{{ route('ordem-separacao.update-item', [$p->id]) }}" method="post" id="form-{{$p->id}}">
													@method('put')
													@csrf
													<input type="hidden" name="status" value="separado">
													<button type="button" class="btn btn-success btn-sm btn-confirma">
														Separado
													</button>
												</form>
												@endif
											</td>
										</tr>
										@endforeach
									</tbody>
								</table>

							</div>
						</div>
					</div>

					<div class="card-footer bg-light border-top d-flex justify-content-end gap-2 flex-wrap">
						<a class="btn btn-secondary" target="_blank" href="{{ route('ordem-separacao.imprimir', $item->id) }}">
							<i class="ri-printer-line"></i> Imprimir
						</a>

						@can('ordem_separacao_edit')
						@if($item->status !== 'cancelado')
						<button type="button" class="btn btn-warning" onclick="alterarStatus()">
							<i class="ri-refresh-line"></i> Alterar Status
						</button>
						@endif
						@endcan

						@can('nfe_create')
						@if($item->status === 'finalizado' && $item->orcamento->orcamento == 1)
						<a href="{{ route('orcamentos.gerar-venda', $item->orcamento->id) }}"
							title="Gerar venda"
							class="btn btn-success btn-gerar-venda">
							<i class="ri-shopping-cart-line"></i> Gerar Venda
						</a>
						@endif
						@endcan

					</div>
				</div>
			</div>

		</div>
	</div>
</div>

<div class="modal fade" id="modal-alterar-estado" tabindex="-1">
	<div class="modal-dialog">
		<form method="post" action="{{ route('ordem-separacao.update', [$item->id]) }}">
			@csrf
			@method('put')
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="staticBackdropLabel">Alterar estado</h5>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>
				<div class="modal-body mt-1">
					<div class="row">
						<div class="col-md-12">
							<label>Status</label>
							<select name="status" class="form-select">
								<option @if($item->status == 'em_separacao') selected @endif value="em_separacao">Em separação</option>
								<option @if($item->status == 'finalizado') selected @endif value="finalizado">Finalizado</option>
								<option @if($item->status == 'cancelado') selected @endif value="cancelado">Cancelado</option>
							</select>
						</div>
					</div>
				</div>
				<div class="modal-footer">
					<div class="text-end">
						<button type="button" class="btn btn-light me-1" data-bs-dismiss="modal">Sair</button>
						<button type="submit" class="btn btn-success">Salvar</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
@section('js')
<script type="text/javascript">

	$(document).on("click", ".btn-gerar-venda", function (e) {
		e.preventDefault();

		let url = $(this).attr("href");

		swal({
			title: "Confirmar ação",
			text: "Deseja realmente gerar a venda a partir deste orçamento?",
			icon: "warning",
			buttons: ["Cancelar", "Confirmar"],
			dangerMode: false,
		}).then((confirm) => {
			if (confirm) {
				window.location.href = url;
			} else {
				swal("Cancelado", "A venda não foi gerada.", "info");
			}
		});
	});

	function alterarStatus(){
		$('#modal-alterar-estado').modal('show')
	}

	$(".btn-confirma").on("click", function (e) {
		e.preventDefault();
		var form = $(this).parents("form").attr("id");

		swal({
			title: "Você está certo?",
			text: "Deseja confirmar separação do item?",
			icon: "success",
			buttons: true,
			buttons: ["Cancelar", "Confirmar"],
			dangerMode: true,
		}).then((isConfirm) => {
			if (isConfirm) {
				document.getElementById(form).submit();
			} else {
				swal("", "Este item não foi confirmado!", "info");
			}
		});
	});

	$('#buscarCodigo').on('keyup', function (e) {
		if (e.key !== 'Enter') return;

		let codigo = $(this).val().trim();
		let encontrado = false;

		$('tr').removeClass('item-encontrado');

		$('.codigo-barras').each(function () {
			if ($(this).data('codigo') == codigo) {
				let linha = $(this).closest('tr');

				// linha.addClass('item-encontrado');

                // scroll até o item
                $('html, body').animate({
                	scrollTop: linha.offset().top - 150
                }, 400);
                linha.find('.btn-confirma').click();
                encontrado = true;
            }
        });

		if (!encontrado) {
			swal("Não encontrado", "Produto não localizado nesta ordem", "warning");
		}

		$(this).val('').focus();
	});
</script>
@endsection
@endsection