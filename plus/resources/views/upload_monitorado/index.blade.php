@extends('layouts.app', ['title' => 'Upload monitorado'])
@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">

                <hr class="mt-3">
                <div class="col-lg-12">
                    {!!Form::open()->fill(request()->all())
                    ->get()
                    !!}
                    <div class="row mt-3">
                        <div class="col-md-2">
                            {!!Form::date('start_date', 'Data inicial')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('end_date', 'Data final')
                            !!}
                        </div>
                        <div class="col-md-3 text-left ">
                            <br>
                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('upload-monitorado') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                        </div>
                    </div>
                    {!!Form::close()!!}
                </div>

                <div class="col-md-12 mt-3">
                    <div class="table-responsive-sm">
                        <table class="table table-striped table-centered mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Data</th>
                                    <th>IP</th>
                                    <th>Usuário</th>
                                    <th>Rota</th>
                                    <th>Arquivo</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($data as $l)
                                <tr>
                                    <td>{{ $l->created_at->format('d/m/Y H:i') }}</td>
                                    <td>{{ $l->ip }}</td>
                                    <td>{{ $l->usuario->name }}</td>
                                    <td>{{ $l->rota }}</td>
                                    <td>{{ $l->arquivo }}</td>
                                    <td><span class="badge bg-danger text-white">Upload Bloqueado</span></td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="2" class="text-center">Nada encontrado</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
                {!! $data->appends(request()->all())->links() !!}

            </div>
        </div>
    </div>
</div>
@endsection