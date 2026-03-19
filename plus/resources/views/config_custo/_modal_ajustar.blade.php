<div class="modal fade" id="modalAjusteCusto" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form method="POST" action="{{ route('custo-configuracao.ajustar') }}">
                @csrf

                <input type="hidden" name="produto_id" id="aj_produto_id">

                <div class="modal-header">
                    <h5 class="modal-title">
                        Ajustar custos – <span id="aj_produto_nome"></span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">

                    <div class="row g-2 mb-3">
                        <div class="col-md-4">
                            <label class="form-label">Valor de compra</label>
                            <input type="text" class="form-control moeda" id="aj_valor_compra" readonly>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Custo real atual</label>
                            <input type="text" class="form-control moeda" id="aj_custo_real" readonly>
                        </div>

                        <div class="col-md-4">
                            <label class="form-label">Valor de venda</label>
                            <input type="text" class="form-control moeda" id="aj_valor_venda" name="valor_venda">
                        </div>
                    </div>
                    <hr>

                    <h6>Detalhamento do custo</h6>

                    <div class="table-responsive mt-2">
                        <table class="table table-sm">
                            <tbody id="detalhe-custo-body">
                                <!-- preenchido via JS -->
                            </tbody>
                            <tfoot>
                                <tr class="table-light">
                                    <th colspan="2">Custo real final</th>
                                    <th class="text-end" id="detalhe-custo-final"></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="alert mt-3" id="box-margem" style="display:none">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Margem (R$):</strong>
                                <span id="margem-valor"></span>
                            </div>
                            <div class="col-md-6">
                                <strong>Margem (%):</strong>
                                <span id="margem-percentual"></span>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                        Cancelar
                    </button>

                    <button type="submit" class="btn btn-success">
                        Salvar ajuste
                    </button>
                </div>

            </form>
        </div>
    </div>
</div>
