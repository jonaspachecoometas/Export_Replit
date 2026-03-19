<div class="modal fade" id="modalVendas" tabindex="-1">
    <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title">Vendas do mês</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th class="text-end">Valor</th>
                                <th>Tipo</th>
                            </tr>
                        </thead>
                        <tbody id="listaVendas">
                            <tr>
                                <td colspan="5" class="text-center text-muted">
                                    Clique em "Ver vendas"
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
