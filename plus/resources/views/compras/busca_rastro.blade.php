@extends('layouts.app', ['title' => 'Consulta Rastro'])
@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="col-md-12">

                </div>
                <hr class="mt-3">
                <div class="col-lg-12">
                    {!!Form::open()->fill(request()->all())
                    ->get()
                    !!}
                    <div class="row mt-3">

                        <div class="col-md-2">
                            {!!Form::text('nLote', 'Lote')
                            !!}
                        </div>

                        <div class="col-md-2">
                            {!!Form::date('dFab', 'Data fabricação')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('dVal', 'Validade')
                            !!}
                        </div>
                        
                        <div class="col-md-3 text-left ">
                            <br>
                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('compras.rastro') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                        </div>
                    </div>
                    {!!Form::close()!!}
                </div>
                <div class="col-md-12 mt-3 table-responsive">
                    <div class="table-responsive-sm">
                        <table class="table table-striped table-centered mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Lote</th>
                                    <th>Qtd</th>
                                    <th>Fabricação</th>
                                    <th>Validade</th>
                                    <th>Produto</th>
                                    <th>Compra</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($data as $item)
                                <tr>
                                    <td data-label="Lote">{{ $item->nLote }}</td>
                                    <td data-label="Qtd">{{ $item->qLote }}</td>
                                    <td data-label="Fabricação">{{ __data_pt($item->dFab, 0) }}</td>
                                    <td data-label="Validade">{{ __data_pt($item->dVal, 0) }}</td>

                                    <td data-label="Produto">{{ $item->item->produto->nome ?? '--' }}</td>

                                    <td data-label="Compra">
                                        <a href="{{ route('compras.show', $item->item->nfe_id) }}" class="btn btn-sm btn-primary">
                                            Ver compra
                                        </a>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="10" class="text-center">Nada encontrado</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>

                        <br>
                    </div>
                </div>
                {!! $data->appends(request()->all())->links() !!}
            </div>
        </div>
    </div>
</div>
@endsection


