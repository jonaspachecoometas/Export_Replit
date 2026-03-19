@extends('relatorios.default')
@section('content')
<style type="text/css">
	.b-top{
		border-top: 1px solid #000; 
	}
	.b-bottom{
		border-bottom: 1px solid #000; 
	}
</style>
@if($start_date && $end_date)
<p>Periodo: <strong>{{ __data_pt($start_date, 0) }} - {{ __data_pt($end_date, 0) }}</strong></p>
@endif

@if($cfop)
<label>CFOP: <strong>{{ $cfop }}</strong></label>
@endif

@if($ncm)
<label>NCM: <strong>{{ $ncm }}</strong></label>
@endif

@if($cst_csosn)
<label>CST/CSOSN: <strong>{{ $cst_csosn }}</strong></label>
@endif

@if($cst_pis)
<label>CST PIS: <strong>{{ $cst_pis }}</strong></label>
@endif

@if($cst_cofins)
<label>CST COFINS: <strong>{{ $cst_cofins }}</strong></label>
@endif
<br>
<br>
@php
$somaLucro = 0;
$somaVenda = 0;
$somaCompra = 0;
$somaQuantidade = 0;
$somaGeral = 0;
@endphp

<table>
@foreach($data as $i)
@if(sizeof($i['itens']) > 0)
@php
$totalQuantidadeDia = 0;
$totalVendaDia = 0;
@endphp
<tr>
	<td colspan="10"></td>
</tr>
<tr>
	<td colspan="10"></td>
</tr>
<tr>
	<td>
		Data: <strong style="color: #0BB7AF">{{ __data_pt($i['data'], 0) }}</strong>
	</td>
</tr>
<tr>
	<td class="" style="width: 515px;">
		Produto
	</td>
	<td class="" style="width: 110px;">
		Quantidade
	</td>
	<td class="" style="width: 110px;">
		Valor venda
	</td>
	<td class="" style="width: 110px;">
		Valor venda média
	</td>
	<td class="" style="width: 110px;">
		Sub total
	</td>
</tr>
@foreach($i['itens'] as $d)
@php
$totalQuantidadeDia += $d['quantidade'];
$totalVendaDia += $d['subtotal'];
$somaGeral += $d['subtotal'];
@endphp
<tr>
	<th class="b-top">{{ $d['produto']->nome}} {{$d['produto']->referencia }}</th>
	<th class="b-top">{{ __moeda($d['quantidade']) }}</th>
	<th class="b-top">
		R$ {{ __moeda($d['valor'])}}
	</th>
	<th class="b-top">R$ {{ __moeda($d['media']) }}</th>
	<th class="b-top">R$ {{ __moeda($d['subtotal']) }}</th>
	
</tr>

@endforeach
<tr>
	<td colspan="5"></td>
</tr>
<tr class="b-top b-bottom">
	<td style="text-align: right; font-weight: bold;">
		TOTAL DO DIA
	</td>
	<td style="font-weight: bold;">
		{{ __moeda($totalQuantidadeDia) }}
	</td>
	<td></td>
	<td></td>
	<td style="font-weight: bold;">
		R$ {{ __moeda($totalVendaDia) }}
	</td>
</tr>
@endif
@endforeach

</table>

<h3>Soma geral: <strong style="color: #0BB7AF">R$ {{ __moeda($somaGeral) }}</strong></h3>

@endsection
