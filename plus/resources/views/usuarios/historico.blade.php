@extends('layouts.app', ['title' => 'Histórico'])
@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="col-lg-12">
                    {!!Form::open()->fill(request()->all())
                    ->get()
                    !!}
                    <div class="row mt-3 g-1">

                        <div class="col-md-2">
                            {!!Form::date('start_date', 'Data inicial cadastro')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('end_date', 'Data final cadastro')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::select('usuario_id', 'Usuário')
                            ->options($usuario != null ? [$usuario->id => $usuario->name] : [])
                            !!}
                        </div>
                        
                        <div class="col-md-3 text-left ">
                            <br>
                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('usuarios.historico-acesso') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                        </div>
                    </div>
                    {!!Form::close()!!}
                </div>

                <div class="col-md-12 mt-3 table-responsive">
                    <h5>Total de registros: <strong>{{ $data->total() }}</strong></h5>
                    <table class="table table-striped table-centered mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th>Usuário</th>
                                <th>IP</th>
                                <th>Data</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($data as $item)
                            <tr>
                                <td>{{ $item->usuario->name }}</td>
                                <td>{{ $item->ip }}</td>
                                <td>{{ __data_pt($item->created_at) }}</td>
                                <td>
                                    @if(!$item->acesso_bloqueado)
                                    <i class="ri-checkbox-circle-fill text-success"></i>
                                    @else
                                    <i class="ri-close-circle-fill text-danger"></i>
                                    @endif
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