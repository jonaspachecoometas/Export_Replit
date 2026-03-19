@extends('layouts.app', ['title' => 'Rastreamento de IMEI/Serial'])
@section('content')
<div class="card mt-1">
    <div class="card-header d-flex justify-content-between align-items-center">
        <h4 class="mb-0">Rastreamento de IMEI / Nº de Série</h4>
        <a href="{{ url()->previous() }}" class="btn btn-danger btn-sm px-3">
            <i class="ri-arrow-left-double-fill"></i> Voltar
        </a>
    </div>
    <div class="card-body">
        <form class="row g-2" method="GET" action="{{ route('imei-tracking.index') }}">
            <div class="col-md-4">
                <label for="imei" class="form-label">Informe o IMEI / Nº de Série</label>
                <input type="text" name="imei" id="imei" class="form-control" value="{{ $query }}" required>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="submit" class="btn btn-primary w-100">
                    <i class="ri-search-line me-1"></i> Pesquisar
                </button>
            </div>
        </form>

        @if($query !== '')
            <hr>
            @if(!$imeiUnit)
                <div class="alert alert-warning">Nenhuma unidade encontrada com o IMEI/Serial informado.</div>
            @else
                <div class="row g-3">
                    <div class="col-md-4">
                        <div class="border rounded p-3 h-100">
                            <h5 class="text-muted">Dados do Produto</h5>
                            <p class="mb-1"><strong>Produto:</strong> {{ $imeiUnit->product->nome ?? '-' }}</p>
                            <p class="mb-1"><strong>Variação:</strong> {{ $imeiUnit->productVariant->descricao ?? '-' }}</p>
                            <p class="mb-1"><strong>IMEI/Serial:</strong> {{ $imeiUnit->imei_or_serial }}</p>
                            <p class="mb-0"><strong>Status:</strong> {{ ucfirst($imeiUnit->status) }}</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="border rounded p-3 h-100">
                            <h5 class="text-muted">Entrada</h5>
                            @if($entryMove)
                                <p class="mb-1"><strong>Data:</strong> {{ __data_pt($entryMove->created_at) }}</p>
                                <p class="mb-1"><strong>Filial:</strong> {{ $entryMove->branch->descricao ?? '-' }}</p>
                                <p class="mb-0"><strong>Movimento:</strong> {{ strtoupper($entryMove->type) }} #{{ $entryMove->id }}</p>
                            @else
                                <p class="text-muted">Sem registro de entrada.</p>
                            @endif
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="border rounded p-3 h-100">
                            <h5 class="text-muted">Venda</h5>
                            @if($saleMove)
                                <p class="mb-1"><strong>Data:</strong> {{ __data_pt($saleMove->created_at) }}</p>
                                <p class="mb-1"><strong>Filial:</strong> {{ $saleMove->branch->descricao ?? '-' }}</p>
                                <p class="mb-1"><strong>Movimento:</strong> {{ strtoupper($saleMove->type) }} #{{ $saleMove->id }}</p>
                                @if($saleDocument)
                                    <p class="mb-0"><strong>NFe:</strong> #{{ $saleDocument->id }}</p>
                                @endif
                            @else
                                <p class="text-muted">Ainda não vendido.</p>
                            @endif
                        </div>
                    </div>
                </div>
            @endif
        @endif
    </div>
</div>
@endsection
