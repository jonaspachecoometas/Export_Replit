@forelse($data as $item)
<div class="card-suspensa">

	<div class="cs-info">
		<div class="cs-cliente"><i class="ri-user-line"></i> {{ $item->cliente->razao_social }}</div>
		<div class="cs-data"><i class="ri-calendar-line"></i> {{ __data_pt($item->created_at) }}</div>
	</div>

	<div class="cs-total">
		<span>Total:</span>
		<strong>R$ {{ __moeda($item->total) }}</strong>
	</div>

	<div class="cs-acoes">
		<a class="btn btn-dark btn-sm cs-btn-finalizar" onclick="abrirPopupImpressao('{{ route('nfe.imprimirVenda', $item->id) }}')">
			<i class="ri-printer-line"></i> Imprimir pedido
		</a>
		
		@if($item->estado == 'aprovado')
		<a class="btn btn-success btn-sm cs-btn-finalizar" onclick="abrirPopupImpressao('{{ route('nfe.imprimir', $item->id) }}')">
			<i class="ri-printer-line"></i> Imprimir NFe
		</a>

		@endif

	</div>

</div>
@empty

<label class="text-center w-100 m-2">Nenhuma venda</label>

@endforelse

