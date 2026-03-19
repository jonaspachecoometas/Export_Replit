@extends('layouts.app', ['title' => 'Nova Ordem de Separação'])
@section('content')

<div class="card mt-1">
    <div class="card-header">
        <h4>Nova Ordem de Separação</h4>
        <div style="text-align: right; margin-top: -35px;">
            <a href="{{ url()->previous() }}" class="btn btn-danger btn-sm px-3">
                <i class="ri-arrow-left-double-fill"></i>Voltar
            </a>
        </div>
    </div>
    <div class="card-body">
        {!!Form::open()
        ->post()
        ->route('ordem-separacao.store')
        !!}
        <div class="pl-lg-4">
            @include('ordem_separacao._forms')
        </div>
        {!!Form::close()!!}
    </div>
</div>
@section('js')

@endsection
@endsection
