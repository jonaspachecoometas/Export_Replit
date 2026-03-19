@forelse($itens as $item)
<tr>
	<td>
		{{ $item->nfe ? $item->nfe->numero_sequencial : $item->nfce->numero_sequencial }}
		@if($item->nfe)
		<span class="badge bg-success">Pedido</span>
		@else
		<span class="badge bg-primary">PDV</span>
		@endif
	</td>
	<td>
		{{ __data_pt($item->nfe ? $item->nfe->created_at : $item->nfce->created_at) }}
	</td>
	<td>
		{{ $item->produto->nome }}
	</td>
	<td>
		{{ $item->produto->codigo_barras ?? '--' }}
	</td>
	<td>
		{{ $item->produto->referencia ?? '--' }}
	</td>
	<td>
		@if(!$item->produto->unidadeDecimal())
		{{ number_format($item->quantidade, 0, '.', '') }}
		@else
		{{ number_format($item->quantidade, 3, '.', '') }}
		@endif
	</td>
	<td>
		{{ __moeda($item->valor_unitario) }}
	</td>
	<td>
		<div>
			@if($item->nfe)
			<a target="_blank" href="{{ route('nfe.imprimirVenda', [$item->nfe->id]) }}" class="btn btn-success">
				<i class="ri-printer-line"></i>
			</a>
			@else
			<a target="_blank" href="{{ route('frontbox.imprimir-nao-fiscal', [$item->nfce->id]) }}" class="btn btn-primary">
				<i class="ri-printer-line"></i>
			</a>
			@endif
		</div>
	</td>
	
</tr>
@empty
<tr>
	<td colspan="10" class="text-center text-muted py-4">
		Nenhum histórico encontrado.
	</td>
</tr>
@endforelse