@extends('layouts.app', ['title' => 'Dados incompletos'])
@section('content')
<div class="mt-1">
	<div class="row">
		<div class="card">
			<div class="card-body">
				<div class="row g-3 mb-3" id="cardsIncompletos">
					@php
					$cards = [
					['k'=>'cpf_cnpj', 't'=>'Sem CPF/CNPJ'],
					['k'=>'email', 't'=>'Sem e-mail'],
					['k'=>'telefone', 't'=>'Sem telefone'],
					['k'=>'cidade_id', 't'=>'Sem cidade'],
					['k'=>'rua', 't'=>'Sem rua'],
					['k'=>'numero', 't'=>'Sem número'],
					['k'=>'bairro', 't'=>'Sem bairro'],
					['k'=>'cep', 't'=>'Sem CEP'],
					['k'=>'razao_social', 't'=>'Sem razão social'],
					['k'=>'nome_fantasia', 't'=>'Sem nome fantasia'],
					];
					@endphp

					@foreach($cards as $c)
					@php
					$qtd = (int)($totais->{$c['k']} ?? 0);
					$active = ($filtro === $c['k']) ? 'border-primary' : 'border-light';
					@endphp

					<div class="col-6 col-md-4 col-lg-3">
						<div class="card shadow-sm card-filtro {{ $active }}"
						data-missing="{{ $c['k'] }}"
						style="cursor:pointer;">
						<div class="card-body py-3">
							<div class="d-flex align-items-center justify-content-between">
								<div>
									<div class="fw-bold">{{ $qtd }}</div>
									<div class="text-muted small">{{ $c['t'] }}</div>
								</div>
								<span class="badge bg-light text-dark">Filtrar</span>
							</div>
						</div>
					</div>
				</div>
				@endforeach

				<div class="col-12">
					<button id="btnLimparFiltro" class="btn btn-sm btn-outline-secondary">
						Limpar filtro
					</button>
				</div>
			</div>

			<div id="boxTabela">


				@include('clientes.partials.tabela_incompletos')


			</div>
		</div>
	</div>
</div>


@section('js')
<script type="text/javascript">
	$(function () {

		function carregarLista(missing) {
			const url = new URL(window.location.href);
			if (missing) url.searchParams.set('missing', missing);
			else url.searchParams.delete('missing');

			window.history.pushState({}, '', url.toString());

			$('#boxTabela').css('opacity', .6);

			$.get(url.toString(), function (html) {
				$('#boxTabela').html(html).css('opacity', 1);
			}).fail(function () {
				$('#boxTabela').css('opacity', 1);
				toastr.error('Não foi possível carregar a lista');
			});
		}

		$(document).on('click', '.card-filtro', function () {
			const missing = $(this).data('missing');

			$('.card-filtro').removeClass('border-primary').addClass('border-light');
			$(this).removeClass('border-light').addClass('border-primary');

			carregarLista(missing);
		});

		$('#btnLimparFiltro').on('click', function () {
			$('.card-filtro').removeClass('border-primary').addClass('border-light');
			carregarLista(null);
		});

		$(document).on('click', '#boxTabela .pagination a', function (e) {
			e.preventDefault();
			$('#boxTabela').css('opacity', .6);

			$.get($(this).attr('href'), function (html) {
				$('#boxTabela').html(html).css('opacity', 1);
				window.history.pushState({}, '', $(e.currentTarget).attr('href'));
			}).fail(function () {
				$('#boxTabela').css('opacity', 1);
				toastr.error('Erro ao paginar');
			});
		});

	});

</script>
@endsection
@endsection
