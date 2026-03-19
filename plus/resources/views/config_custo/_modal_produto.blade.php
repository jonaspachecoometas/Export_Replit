<div class="modal fade" id="modalProdutoCusto" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <form method="POST" action="{{ route('custo-configuracao-produto.store') }}">
                @csrf

                <input type="hidden" name="produto_id" id="modal_produto_id">

                <div class="modal-header">
                    <h5 class="modal-title">
                        Configuração de Custo – <span id="modal_produto_nome"></span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    
                    <div id="campos-personalizados">
                        <div class="row g-2">
                            <div class="col-md-4">
                                {!!Form::select('produto_id', 'Produto')
                                ->attrs(['class'=>''])!!}
                            </div>
                            <div class="col-md-2">
                                {!!Form::tel('imposto_percentual', 'Imposto')->attrs(['class'=>'percentual'])!!}
                            </div>
                            <div class="col-md-2">
                                {!!Form::tel('taxa_cartao_percentual', 'Taxa cartão')->attrs(['class'=>'percentual'])!!}
                            </div>
                            <div class="col-md-2">
                                {!!Form::tel('despesas_percentual', 'Outras despesas')->attrs(['class'=>'percentual'])!!}
                            </div>
                            <div class="col-md-2">
                                {!!Form::tel('margem_minima_percentual', 'Margem mínima')->attrs(['class'=>'percentual'])->required()!!}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">
                        Cancelar
                    </button>
                    <button type="submit" class="btn btn-success">
                        Salvar
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
