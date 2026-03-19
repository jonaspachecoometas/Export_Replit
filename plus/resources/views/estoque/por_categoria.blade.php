@extends('layouts.app', ['title' => 'Estoque por categoria'])

@section('content')
<div class="card">
    <div class="card-header">
        <h4 class="mb-0">Estoque por Categoria</h4>
        <div style="text-align: right; margin-top: -35px;">
            <a href="{{ route('estoque.index') }}" class="btn btn-danger btn-sm px-3">
                <i class="ri-arrow-left-double-fill"></i>Voltar
            </a>
        </div>
    </div>

    <div class="card-body">
        <table class="table table-hover table-striped align-middle">
            <thead>
                <tr>
                    <th>Categoria</th>
                    <th class="text-end">Qtd. em estoque</th>
                    <th class="text-end">Total de compra</th>
                    <th class="text-end">Total de venda</th>
                    <th class="text-end">Lucro estimado</th>
                </tr>
            </thead>
            <tbody>
                @foreach($estoquePorCategoria as $c)
                @php
                $lucro = $c->valor_venda - $c->valor_compra;
                @endphp
                <tr>
                    <td>{{ $c->nome }}</td>

                    <td class="text-end">
                        {{ number_format($c->quantidade_total, 2, ',', '.') }}
                    </td>

                    <td class="text-end text-danger">
                        R$ {{ __moeda($c->valor_compra) }}
                    </td>

                    <td class="text-end text-success">
                        R$ {{ __moeda($c->valor_venda) }}
                    </td>

                    <td class="text-end fw-bold {{ $lucro >= 0 ? 'text-success' : 'text-danger' }}">
                        R$ {{ __moeda($lucro) }}
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection
