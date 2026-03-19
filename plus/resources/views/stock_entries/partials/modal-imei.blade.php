<div class="modal fade" id="modal-imei" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Gerenciar IMEIs / Nº de Série</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-2 text-muted">
                    Informe um código por linha. A quantidade precisa ser igual ao total de itens informados para o produto.
                </div>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered align-middle" id="imei-table">
                        <thead class="table-light">
                            <tr>
                                <th>IMEI / Nº de Série</th>
                                <th class="text-center" width="120">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="modal-imei-add-row">
                    <i class="ri-add-line"></i> Adicionar linha
                </button>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-save-imei">
                    <i class="ri-save-3-line me-1"></i> Salvar IMEIs
                </button>
            </div>
        </div>
    </div>
</div>
