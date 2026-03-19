@extends('layouts.app', ['title' => 'LOGS'])
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
                        <div class="col-md-4">
                            {!!Form::select('empresa', 'Empresa')
                            ->options($empresa ? [$empresa->id => $empresa->info] : [])
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('start_date', 'Data inicial')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::date('end_date', 'Data final')
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::select('acao', 'Ação', \App\Models\AcaoLog::acoes())
                            ->attrs(['class' => 'form-select'])
                            !!}
                        </div>
                        <div class="col-md-2">
                            {!!Form::select('local', 'Local', \App\Models\AcaoLog::locais())
                            ->attrs(['class' => 'select2'])
                            !!}
                        </div>
                        <div class="col-md-3 text-left ">
                            <br>
                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('logs.index') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                        </div>
                    </div>
                    {!!Form::close()!!}
                </div>
                <div class="col-md-12 mt-3">
                    <div class="table-responsive">
                        <div class="tabela-scroll" style="overflow-x:auto;">
                            <table class="table">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Empresa</th>
                                        <th>Local</th>
                                        <th>Ação</th>
                                        <th>Descrição</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($data as $item)
                                    <tr>
                                        <td><label style="width: 200px;">{{ $item->empresa->info }}</label></td>
                                        <td><label style="width: 100px;">{{ $item->local }}</label></td>
                                        <td><label style="width: 100px;">{{ $item->acao }}</label></td>
                                        <td>
                                            <div style="
                                            max-width: 600px;
                                            white-space: pre-wrap;
                                            font-family: monospace;
                                            font-size: 13px;
                                            background: #f8f9fa;
                                            padding: 8px;
                                            border-radius: 6px;
                                            ">
                                            {{ $item->descricao }}
                                        </div>
                                    </td>
                                    <td><label style="width: 200px;">{{ __data_pt($item->created_at) }}</label></td>

                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
                <button type="button" id="scrollToggle2" class="scroll-btn-jidox hidden">
                    <i class="ri-arrow-right-circle-line"></i>
                </button>
            </div>
            <br>
            {!! $data->appends(request()->all())->links() !!}

        </div>
    </div>
</div>
</div>
@endsection