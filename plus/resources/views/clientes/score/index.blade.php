@extends('layouts.app', ['title' => 'Score de Clientes'])

@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">

                <div class="row">
                    <div class="col-md-3">
                        <h4 class="mb-4">Score de Clientes</h4>
                    </div>
                    <div class="col-md-9 text-end">
                        <a class="btn btn-primary" href="{{ route('clientes-score.config') }}">
                            <i class="ri-settings-fill"></i> Configuração
                        </a>
                    </div>
                </div>

                <div class="col-lg-12">
                    {!!Form::open()->fill(request()->all())
                    ->get()
                    !!}
                    <div class="row mt-3 g-1">
                        <div class="col-md-3">
                            {!!Form::text('razao_social', 'Pesquisar por nome')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('start_date', 'Data inicial cadastro')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('end_date', 'Data final cadastro')
                            !!}
                        </div>

                        <div class="col-md-2">
                            {!!Form::select('categoria', 'Categoria', ['' => 'Todos'] + \App\Models\ClienteScore::categorias())
                            ->attrs(['class' => 'form-select'])
                            !!}
                        </div>
                        <div class="col-md-3 text-left ">
                            <br>

                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('clientes-score.index') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                        </div>
                    </div>
                    {!!Form::close()!!}
                </div>
                <div class="table-responsive mt-2">
                    <table class="table">
                        <thead class="table-dark">
                            <tr>
                                <th>Cliente</th>
                                <th>Score</th>
                                <th>Categoria</th>
                                <th>Limite crédito sugerido</th>
                                <th>Último cálculo</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($clientes as $cliente)
                            @php
                            $score = $cliente->score;
                            @endphp
                            <tr>
                                <td>{{ $cliente->info }}</td>

                                <td>
                                    <strong>{{ $score->score_total ?? '-' }}</strong>
                                </td>

                                <td>
                                    <i class="ri-medal-fill" style="color: {{ $cliente->colorScore() }}; font-size: 20px;"></i>
                                </td>

                                <td>
                                    R$ {{ number_format($score->limite_credito ?? 0, 2, ',', '.') }}
                                </td>

                                <td>
                                    {{ __data_pt($score->created_at) }}
                                </td>

                                <td>
                                    <a href="{{ route('clientes-score.show', $cliente->id) }}" class="btn btn-sm btn-outline-primary">Ver detalhes
                                    </a>
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
