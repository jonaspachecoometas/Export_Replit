<div class="modal fade" id="modalDespesas" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Despesas do mês</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Fornecedor</th>
                                <th>Data</th>
                                <th class="text-end">Valor</th>
                                <th>Categoria</th>
                            </tr>
                        </thead>
                        <tbody id="listaDespesas">
                            <tr>
                                <td colspan="5" class="text-center text-muted">
                                    Clique em "Ver despesas"
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">
                    Fechar
                </button>
            </div>

        </div>
    </div>
</div>
