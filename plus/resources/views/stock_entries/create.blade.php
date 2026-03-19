@extends('layouts.app', ['title' => 'Entrada de Estoque (IMEI/Serial)'])

@section('content')
    <div class="card mt-1">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <h4 class="mb-0">Entrada de Estoque com IMEI/Serial</h4>
                <small class="text-muted">Registre entradas para produtos rastreados por IMEI ou número de série.</small>
            </div>
            <div>
                <a href="{{ route('estoque.index') }}" class="btn btn-danger btn-sm px-3">
                    <i class="ri-arrow-left-double-fill"></i> Voltar
                </a>
            </div>
        </div>
        <div class="card-body">
            <form id="form-stock-entry">
                @csrf
                <input type="hidden" id="company_fallback_id" value="{{ $companyId }}">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Empresa</label>
                        <input type="text" class="form-control" value="{{ $company?->nome ?? '---' }}" disabled>
                    </div>
                    <div class="col-md-4">
                        <label for="branch_id" class="form-label">Filial / Local</label>
                        <select id="branch_id" class="form-select select2" data-placeholder="Selecione o local">
                            <option value="">Selecione</option>
                            @foreach ($branches as $branch)
                                <option value="{{ $branch->id }}">{{ $branch->descricao }}</option>
                            @endforeach
                        </select>
                    </div>
                </div>

                <hr class="my-4">

                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h5 class="mb-0">Itens da Entrada</h5>
                    <button type="button" class="btn btn-outline-primary btn-sm" id="btn-add-item">
                        <i class="ri-add-line"></i> Adicionar Item
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="table table-bordered align-middle" id="items-table">
                        <thead class="table-light">
                            <tr>
                                <th width="55%">Produto</th>
                                <th width="15%">Quantidade</th>
                                <th class="text-center" width="30%">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>

                <div class="alert alert-info mt-3" role="alert">
                    Produtos com rastreamento por <strong>IMEI</strong> ou <strong>Nº de Série</strong> exigem o
                    preenchimento da lista
                    individual através do botão “Gerenciar IMEIs/Seriais”.
                </div>

                <div class="text-end mt-4">
                    <button type="button" class="btn btn-success px-4" id="btn-submit-entry">
                        <i class="ri-save-3-line me-1"></i> Salvar Entrada
                    </button>
                </div>
            </form>
        </div>
    </div>

    @include('stock_entries.partials.modal-imei')
@endsection

@section('js')
    <script>
        window.stockEntryConfig = {
            trackingLabels: @json(\App\Models\Produto::trackingOptions()),
        };
    </script>
    <script src="js/entrada_estoque_imei.js"></script>
@endsection
