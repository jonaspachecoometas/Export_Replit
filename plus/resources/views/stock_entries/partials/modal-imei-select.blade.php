<div class="modal fade" id="modal-imei-sale" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Selecionar IMEIs / Nº de Série</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info">
                    Escolha exatamente a quantidade de unidades vendidas para o produto selecionado.
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered align-middle" id="imei-sale-table">
                        <thead class="table-light">
                            <tr>
                                <th width="60">Selecionar</th>
                                <th>IMEI / Nº de Série</th>
                                <th width="180">Filial</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div class="text-muted mt-2" id="imei-sale-feedback"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-save-imei-sale">
                    <i class="ri-save-3-line me-1"></i> Salvar seleção
                </button>
            </div>
        </div>
    </div>
</div>
