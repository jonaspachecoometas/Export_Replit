@extends('layouts.app', ['title' => 'Ajustar Contas'])

@section('content')
<div class="card mt-1">
	<div class="card-header">
		<h4 class="mb-0">Ajustar Contas</h4>
	</div>

	<div class="card-body">
		
		<div class="row mt-2 m-3">
			<div class="col-12">
				<div class="alert alert-info p-1 mb-0">
					<small><i class="ri-information-line"></i> 
						Contas com valor vazio ou zero serão removidas ao salvar
					</small>
				</div>
			</div>
		</div>

		{!! Form::open()->post()->route('conta-receber.ajustar-save') !!}

		<div class="pl-lg-4">
			<div class="contas">
				@foreach($contas as $c)
				<div class="conta">
					<input type="hidden" name="conta_id[]" value="{{ $c->id }}">
					<div class="row mb-2">
						<div class="col-12">
							<div class="card">
								<div class="card-body py-3">
									<div class="row g-2">
										<div class="col-md-2">
											<label>Valor</label>
											<input class="form-control moeda valor-item"
											type="tel"
											name="valor[]"
											value="{{ __moeda($c->valor_integral) }}">
										</div>

										<div class="col-md-2">
											<label>Data de vencimento</label>
											<input class="form-control"
											type="date"
											name="data_vencimento[]"
											required 
											value="{{ $c->data_vencimento }}">
										</div>

										<div class="col-md-2">
											<label>Tipo de pagamento</label>
											<select required class="form-select" name="tipo_pagamento[]">
												@foreach(App\Models\ContaReceber::tiposPagamento() as $key => $t)
												<option value="{{ $key }}" @if($key == $c->tipo_pagamento) selected @endif>
													{{ $t }}
												</option>
												@endforeach
											</select>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				@endforeach
			</div>
			<div class="row mb-3">
				<div class="col-12">
					<button type="button" id="btn-add-conta" class="btn btn-outline-primary btn-sm">
						<i class="ri-add-line"></i> Adicionar conta
					</button>
				</div>
			</div>

			<div class="row align-items-center mt-3">
				<div class="col-md-3">
					<h4 class="mb-0">
						Soma contas: <strong class="valor-total text-muted">R$ 0,00</strong>
					</h4>
				</div>
				<div class="col-md-3">
					<h4 class="mb-0">
						Valor da troca: <strong class="text-primary">R$ {{ __moeda($troca->valor_troca) }}</strong>
					</h4>
				</div>

				<div class="col-md-3">
					<h4 class="mb-0">
						<span class="label-faltante">Valor faltante:</span>
						<strong class="valor-faltante"></strong>
					</h4>
				</div>

				<div class="col-md-3 text-end">
					<button type="submit" class="btn btn-success">
						<i class="ri-checkbox-circle-fill"></i> Salvar contas
					</button>
				</div>
			</div>

		</div>

		{!! Form::close() !!}
	</div>
</div>
@endsection

@section('js')
<script>
	const valorTroca = {{ (float) $troca->valor_troca }};
	function moedaParaFloat(v) {
		if (!v) return 0;
        v = String(v).replace(/[^\d,.-]/g, ''); // remove R$, espaços etc
        // padrão BR: 1.234,56
        v = v.replace(/\./g, '').replace(',', '.');
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
    }

    function floatParaMoedaBR(n) {
    	return (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function recalcularTotal() {
    	let total = 0;
    	document.querySelectorAll('.valor-item').forEach((el) => {
    		total += convertMoedaToFloat(el.value);
    	});
    	const target = document.querySelector('.valor-total');
    	if (target) target.textContent = "R$ " + convertFloatToMoeda(total);

    	const faltante = +(valorTroca - total).toFixed(2);
    	const faltanteEl = document.querySelector('.valor-faltante');
    	const btnSalvar = document.querySelector('button[type="submit"]');
    	const labelEl = document.querySelector('.label-faltante');

    	faltanteEl.classList.remove('text-danger', 'text-success');

    	if (faltante > 0) {
    		labelEl.textContent = 'Valor faltante:';
    		faltanteEl.textContent = "R$ " + convertFloatToMoeda(faltante);
    		faltanteEl.classList.add('text-danger');
    		btnSalvar.disabled = true;

    	} else if (faltante === 0) {
    		labelEl.textContent = 'Valor ajustado:';
    		faltanteEl.textContent = "R$ " + convertFloatToMoeda(0);
    		faltanteEl.classList.add('text-success');
    		btnSalvar.disabled = false;

    	} else {
    		labelEl.textContent = 'Valor excedente:';
    		faltanteEl.textContent = "R$ " + convertFloatToMoeda(Math.abs(faltante));
    		faltanteEl.classList.add('text-success');
    		btnSalvar.disabled = true;
    	}
    }

    document.addEventListener('input', function(e) {
    	if (e.target.classList.contains('valor-item')) {
    		recalcularTotal();
    	}
    });

    document.addEventListener('DOMContentLoaded', recalcularTotal);

    $(document).on("click", "#btn-add-conta", function () {
    	let $novaConta = $('.contas .conta:last').clone();
    	$novaConta.find('input[name="data_vencimento[]"]').val('');
    	$novaConta.find('input[name="conta_id[]"]').val('0');
    	let faltante = convertMoedaToFloat($('.valor-faltante').text())

    	$novaConta.find('input[name="valor[]"]').val(convertFloatToMoeda(faltante));
    	$('.contas').append($novaConta);

    	recalcularTotal()
    });

</script>
@endsection
