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

	<div style="margin-left: 5px;">-----------------------------------------------------------</div>

	<div class="area-itens">

		<h4 class="mt-5" style="text-align:center; font-size: 10px;">
			TICKET DE TROCA
		</h4>
		<div class="linha-full">-----------------------------------------------------------</div>

		<table>
			<thead>
				<tr>
					<th style="width: 10%;">Código</th>
					<th style="width: 50%;">Descrição</th>
					<th style="width: 10%;">Qtde</th>
					<!-- <th style="width: 15%;">Vl Unit</th> -->
					<!-- <th style="width: 15%;">Vl Total</th> -->
				</tr>
			</thead>

			<tbody>
				@foreach($item->itensServico as $i)
				<tr>
					<td>{{ $i->servico->numero_sequencial }}</td>
					<td>{{ $i->servico->nome }}</td>

					<td>
						{{ number_format($i->quantidade, 0) }}
					</td>

					
					<!-- <td>{{ __moeda($i->valor_unitario) }}</td> -->
					<!-- <td>{{ __moeda($i->sub_total) }}</td> -->

				</tr>
				@endforeach
				@foreach($item->itens as $i)
				<tr>
					<td>{{ $i->produto->numero_sequencial }}</td>
					<td>{{ $i->descricao() }}</td>

					<td>
						{{ (($i->produto->unidade == 'UN' || $i->produto->unidade == 'UNID')
						? number_format($i->quantidade, 0)
						: number_format($i->quantidade, 3)) }}
					</td>

					<!-- @isset($preVenda)
					<td>{{ __moeda($i->valor) }}</td>
					<td>{{ __moeda($i->valor * $i->quantidade) }}</td>
					@else
					<td>{{ __moeda($i->valor_unitario) }}</td>
					<td>{{ __moeda($i->sub_total) }}</td>
					@endif -->
				</tr>
				@endforeach
			</tbody>
		</table>

		<div class="linha-full">-----------------------------------------------------------</div>
		<table style="padding-right: 2px;">
			
			<tr>
				<td>Data</td>
				<td style="text-align:right;">{{ __data_pt($item->created_at) }}</td>
			</tr>

			<br>
			<tr>
				<td colspan="2" style="text-align:center;">NÃO É DOCUMENTO FISCAL</td>
			</tr>
			<tr>
				<td colspan="2" style="text-align:center;">
					{{ $configGeral->mensagem_ticket_troca }}
				</td>
			</tr>

			
		</table>

	</div> <!-- fecha .area-itens -->


</body>
