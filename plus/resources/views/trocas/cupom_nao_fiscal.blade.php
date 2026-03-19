<!DOCTYPE html>
<html>
<head>

	@php
	$margem = $configGeral && $configGeral->margem_lateral_impressao > 0 ? $configGeral->margem_lateral_impressao : 5;
	@endphp
	<style type="text/css">
		body {
			font-family: Arial, sans-serif;
		}
		
		body{
			width: 330px;
			/*background: #000;*/
			margin-left: -45px;
			margin-top: -30px;
		}
		.mt-20{
			margin-top: -20px;
		}
		.mt-10{
			margin-top: -10px;
		}
		.mt-5{
			margin-top: -5px;
		}
		.mt-45{
			margin-top: -50px;
		}
		.mt-25{
			margin-top: -25px;
		}
		table th{
			font-size: 10px;
			text-align: left;
		}

		table td{
			font-size: 11px;
			font-weight: bold;
			line-height: 0.8;
		}

		th.total{
			width: 157px;
			font-size: 13px;
			line-height: 0.7;		
		}

		.area-itens {
			padding-left: {{ $margem }}px;
			padding-right: {{ $margem+3 }}px;
		}

		.area-itens table {
			width: 100%;
			border-collapse: collapse;
		}

		.area-itens th {
			font-size: 10px;
			text-align: left;
			font-weight: bold;
		}

		.area-itens td {
			font-size: 11px;
			font-weight: bold;
			line-height: 0.9;
		}

		.linha-full {
			position: relative;
			left: -{{ $margem-5 }}px;
			text-align: left;
		}
		

	</style>
</head>

<body>

	@if($config->logo != null)
	<table>
		<thead>
			<tr>
				<th style="width: 80px">
					<img 
					src="{{ file_exists(public_path('uploads/logos/' . $config->logo)) ? 'data:image/png;base64,' . base64_encode(file_get_contents(public_path('uploads/logos/' . $config->logo))) : '' }}" 
					alt="Logo" 
					style="height: 100px; margin-top: -20px;"
					>
				</th>
				<th style="text-align: center;">
					<h4 style="text-align:center; " style="margin-top:-10px">{{ $config->nome }}</h4>
					<h4 style="text-align:center; " style="margin-top:-15px">{{ $config->nome_fantasia }}</h4>
					<h4 style="text-align:center; " style="margin-top:-15px">CNPJ: {{ __setMask($config->cpf_cnpj, "###.###.###/####-##") }}</h4>
					<h4 style="text-align:center; " style="margin-top:-15px">Inscrição Estadual: {{ $config->ie }}</h4>


					<h5 style="text-align:center; font-size: 10px; margin-top: -10px;">
						{{ $config->rua }}, {{ $config->numero }}
					</h5>
					<h5 style="text-align:center; font-size: 10px; margin-top: -20px;">
						{{ $config->bairro }} {{ $config->cidade->nome }} ({{ $config->cidade->uf }})
					</h5>
					<h5 style="text-align:center; font-size: 10px; margin-top: -15px;">
						{{ $config->celular }}
					</h5>
				</th>
			</tr>
		</thead>
	</table>

	
	@else
	<h4 style="text-align:center; font-size: 14px" class="mt-10">{{ $config->nome }}</h4>
	<h4 style="text-align:center; font-size: 14px" class="mt-20">{{ $config->nome_fantasia }}</h4>
	<h4 style="text-align:center; font-size: 14px" class="mt-20">CNPJ: {{ __setMask($config->cpf_cnpj, "###.###.###/####-##") }}</h4>
	<h4 style="text-align:center; font-size: 14px" class="mt-20">Inscrição Estadual: {{ $config->ie }}</h4>


	<h5 class="mt-20" style="text-align:center; font-size: 10px;">
		{{ $config->rua }}, {{ $config->numero }}
	</h5>
	<h5 class="mt-20" style="text-align:center; font-size: 10px;">
		{{ $config->bairro }} {{ $config->cidade->nome }} ({{ $config->cidade->uf }})
	</h5>
	<h5 class="mt-10" style="text-align:center; font-size: 10px;">
		{{ $config->celular }}
	</h5>
	@endif

	<div style="margin-left: 10px;">---------------------------------------------------------</div>
	<h4 class="mt-5" style="text-align:center; font-size: 8px;">
		COMPROVANTE DE TROCA
	</h4>
	<div class="mt-10" style="margin-left: 10px;">---------------------------------------------------------</div>
	<div class="area-itens">

		<label class="mt-5" style="font-size: 9px;">ITENS DA VENDA</label>

		<table>
			<thead>
				<tr>
					<th style="width: 10%;">Código</th>
					<th style="width: 50%;">Descrição</th>
					<th style="width: 10%;">Qtde</th>
					<th style="width: 15%;">Vl Unit</th>
					<th style="width: 15%;">Vl Total</th>
				</tr>
			</thead>
			<tbody>
				@php $qtdVenda = 0; $qtdTroca = 0; @endphp
				@foreach(($item->nfe ? $item->nfe->itens : $item->nfce->itens) as $i)
				<tr>
					<td>{{ $i->produto->numero_sequencial }}</td>
					<td>{{ $i->descricao() }}</td>
					<td>
						@if(!$i->produto->unidadeDecimal())
						{{ number_format($i->quantidade, 0, '.', '') }}
						@else
						{{ number_format($i->quantidade, 3, '.', '') }}
						@endif
					</td>
					<td>{{ __moeda($i->valor_unitario) }}</td>
					<td>{{ __moeda($i->sub_total) }}</td>
				</tr>

				@php $qtdVenda += $i->quantidade; @endphp

				@endforeach
			</tbody>
		</table>

		<div class="linha-full">-----------------------------------------------------------</div>

		<label class="mt-5" style="font-size: 9px;">ITENS ALTERADOS</label>

		<table>
			<thead>
				<tr>
					<th style="width: 10%;">Código</th>
					<th style="width: 50%;">Descrição</th>
					<th style="width: 10%;">Qtde</th>
					<th style="width: 15%;">Vl Unit</th>
					<th style="width: 15%;">Vl Total</th>
				</tr>
			</thead>
			<tbody>
				@foreach($item->itens as $i)
				<tr>
					<td>{{ $i->produto->numero_sequencial }}</td>
					<td>{{ $i->descricao() }}</td>
					<td>
						@if(!$i->produto->unidadeDecimal())
						{{ number_format($i->quantidade, 0, '.', '') }}
						@else
						{{ number_format($i->quantidade, 3, '.', '') }}
						@endif
					</td>
					<td>{{ __moeda($i->valor_unitario) }}</td>
					<td>{{ __moeda($i->sub_total) }}</td>
				</tr>
				@php $qtdTroca += $i->quantidade; @endphp
				@endforeach
			</tbody>
		</table>

		<div class="linha-full">-----------------------------------------------------------</div>

		<label class="mt-5" style="font-size: 9px;">ITENS REMOVIDOS</label>

		<table>
			<thead>
				<tr>
					<th style="width: 10%;">Código</th>
					<th style="width: 50%;">Descrição</th>
					<th style="width: 10%;">Qtde</th>
					<th style="width: 15%;">Vl Unit</th>
					<th style="width: 15%;">Vl Total</th>
				</tr>
			</thead>
			<tbody>
				@foreach($item->itensRemovidos as $i)
				<tr>
					<td>{{ $i->produto->numero_sequencial }}</td>
					<td>{{ $i->descricao() }}</td>
					<td>
						@if(!$i->produto->unidadeDecimal())
						{{ number_format($i->quantidade, 0, '.', '') }}
						@else
						{{ number_format($i->quantidade, 3, '.', '') }}
						@endif
					</td>
					<td>{{ __moeda($i->produto->valor_unitario) }}</td>
					<td>{{ __moeda($i->produto->valor_unitario * $i->quantidade) }}</td>
				</tr>
				@php $qtdTroca += $i->quantidade; @endphp
				@endforeach
			</tbody>
		</table>

		<div class="linha-full">-----------------------------------------------------------</div>

		<table style="padding-right: 2px;">
			
			<tr>
				<td>Qtde total de itens Venda:</td>
				<td style="text-align:right;">{{ number_format($qtdVenda, 0, '', '.') }}</td>
			</tr>

			<tr>
				<td>Qtde total de itens Troca:</td>
				<td style="text-align:right;">{{ number_format($qtdTroca, 0, '', '.') }}</td>
			</tr>

			<tr>
				<td>Valor Total:</td>
				<td style="text-align:right;">
					R$ {{ __moeda($item->valor_troca) }}
				</td>
			</tr>


			@if($item->valor_entrega > 0)
			<tr>
				<td>Frete:</td>
				<td style="text-align:right;">R$ {{ __moeda($item->valor_entrega) }}</td>
			</tr>
			@endif
		</table>

		<div class="linha-full">-----------------------------------------------------------</div>

		<table style="padding-right: 2px;">
			<tr>
				<th style="width: 60%;">FORMA PAGAMENTO</th>
				<th style="width: 40%; text-align:right;">VALOR PAGO</th>
			</tr>

			<tr>
				<td>{{ \App\Models\Nfce::getTipoPagamento($item->tipo_pagamento) }}</td>
				<td style="text-align:right;">R${{ __moeda($item->valor_troca) }}</td>
			</tr>

			<tr>
				<td>Data da venda</td>
				<td style="text-align:right;">
					{{ __data_pt($item->nfce ? $item->nfce->created_at : $item->nfe->created_at ) }}
				</td>
			</tr>

			<tr>
				<td>Data da troca</td>
				<td style="text-align:right;">{{ __data_pt($item->created_at) }}</td>
			</tr>

			<tr>
				<td>Cód. venda</td>
				<td style="text-align:right;">
					{{ $item->nfce ? $item->nfce->numero_sequencial : $item->nfe->numero_sequencial }}
				</td>
			</tr>

			<tr>
				<td>Cód. troca</td>
				<td style="text-align:right;">{{ $item->numero_sequencial }}</td>
			</tr>

			@if(isset($item->nfe->cliente))
			<tr>
				<td colspan="2">{{ $item->nfe->cliente->info }}</td>
			</tr>
			@endif

			@if(isset($item->nfce->cliente))
			<tr>
				<td colspan="2">{{ $item->nfce->cliente->info }}</td>
			</tr>
			@endif

			@if($item->observacao)
			<tr>
				<td>Observação</td>
				<td style="text-align:right;">{{ $item->observacao }}</td>
			</tr>
			@endif

			@if($configGeral && $configGeral->mensagem_padrao_impressao_venda != "")
			<tr>
				<td colspan="2">{!! $configGeral->mensagem_padrao_impressao_venda !!}</td>
			</tr>
			@endif
		</table>

	</div>

</body>
