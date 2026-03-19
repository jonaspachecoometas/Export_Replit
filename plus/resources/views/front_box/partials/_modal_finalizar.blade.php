<div class="card finalizar-content d-none">
    <div class="card-body m-4">
        <div class="pagamento-tab-content">
            <!-- Valor Total da Venda (versão compacta) -->
            <div class="row mb-2">
                <div class="col-12">
                    <div class="card ">
                        <div class="card-body py-2">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <div class="text-xs font-weight-bold text-success text-uppercase mb-0">
                                        <i class="ri-money-dollar-circle-line me-1"></i> Valor Total da Venda
                                    </div>
                                    <div class="h1 mb-0 font-weight-bold text-success" id="painel-total-venda"></div>
                                </div>
                                <div class="col-md-4 text-center">
                                    <div class="text-xs font-weight-bold text-primary text-uppercase mb-0">
                                        Valor Recebido
                                    </div>
                                    <div class="h1 mb-0 font-weight-bold text-primary" id="valor-recebido-total">R$ 0,00</div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <div class="text-xs font-weight-bold text-muted text-uppercase mb-0">
                                        Troco
                                    </div>
                                    <div class="h1 mb-0 font-weight-bold text-muted" id="valor-troco">R$ 0,00</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-11">
                <!-- Cliente e Vendedor (versão compacta) -->
                <div class="col-md-6 mb-1">
                    <div class="card shadow-sm">
                        <div class="card-body py-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="flex-grow-1 overflow-hidden">
                                    <h6 class="text-muted text-uppercase m-0">Cliente</h6>
                                    <i class="ri-user-add-line text-primary"></i>
                                    
                                    @isset($cliente)
                                    <label class="cliente_selecionado" data-bs-toggle="modal" data-bs-target="#cliente">
                                        {{ $cliente->razao_social }}
                                    </label>
                                    @else
                                    <label class="cliente_selecionado" data-bs-toggle="modal" data-bs-target="#cliente">
                                        selecionar cliente
                                    </label>
                                    @endif
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 mb-1">
                    <div class="card shadow-sm">
                        <div class="card-body py-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="flex-grow-1 overflow-hidden">
                                    <h6 class="text-muted text-uppercase m-0">Vendedor</h6>
                                    <i class="ri-user-2-fill text-success"></i>
                                    

                                    @if(isset($item) && $item->funcionario)
                                    <label class="funcionario_selecionado" data-bs-toggle="modal" data-bs-target="#funcionario">
                                        {{ $item->funcionario->nome }}
                                    </label>
                                    @else
                                    <label class="funcionario_selecionado" data-bs-toggle="modal" data-bs-target="#funcionario">
                                        selecionar vendedor
                                    </label>
                                    @endif
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Painel de Pagamentos (versão compacta) -->
            <div class="row g-2 align-items-stretch">
                <!-- Painel: Adicionar Forma de Pagamento -->
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-header py-2">
                            <h6 class="m-0 font-weight-bold text-primary">
                                Adicionar Forma de Pagamento
                            </h6>

                            <button type="button" class="btn btn-dark btn-sm btn-gerar-fatura mb-2 float-end">
                                <i class="ri-list-indefinite"></i>
                                Gerar Fatura
                            </button>
                        </div>
                        <div class="card-body py-2">
                            <!-- Tipo de Pagamento -->
                            <div class="row mb-2">
                                <div class="col-md-6">
                                    <label class="form-label small mb-0">Tipo de Pagamento</label>
                                    <select name="tipo_pagamento_atual" id="tipo_pagamento_atual" class="form-select form-select">
                                        <option value="">Selecione</option>
                                        @foreach($tiposPagamento as $key => $t)
                                        <option value="{{ $key }}">{{ $t }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small mb-0">Valor</label>
                                    <input type="text" id="valor_pagamento_atual" class="form-control form-control moeda" placeholder="0,00" maxlength="11">
                                </div>
                            </div>

                            <!-- Campos específicos para cada tipo de pagamento (compactados) -->
                            <!-- Cartão -->
                            <div class="row mb-2 campos-especificos campos-cartao d-none">
                                <div class="col-md-6">
                                    <label class="form-label small mb-0">Bandeira</label>
                                    <select id="bandeira_cartao" class="form-select form-select-sm">
                                        <option value="">Selecione</option>
                                        @foreach(App\Models\Nfce::bandeiras() as $b)
                                        <option value="{{ $b }}">{{ $b }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small mb-0">Código de Autorização</label>
                                    <input type="text" id="cod_autorizacao" class="form-control form-control-sm" placeholder="Opcional">
                                </div>
                            </div>

                            <!-- Pagamento a Prazo -->
                            <div class="row mb-2 campos-especificos campos-prazo d-none">
                                <!-- <div class="col-md-4">
                                    <div class="form-check mt-2">
                                        <input class="form-check-input" type="checkbox" id="tem_parcelamento">
                                        <label class="form-check-label small" for="tem_parcelamento">
                                            Parcelado
                                        </label>
                                    </div>
                                </div> -->
                                <div class="col-md-6 div-data-vencimento">
                                    <label class="form-label small mb-0">Data de Vencimento</label>
                                    <input type="date" id="data_vencimento_atual" class="form-control form-control-sm data_vencimento_padrao">
                                </div>
                            </div>

                            <!-- Parcelamento -->
                            <div class="row mb-2 campos-especificos campos-parcelamento d-none">
                                <div class="col-md-4">
                                    <label class="form-label small mb-0">Quantidade de Parcelas</label>
                                    <input type="number" id="qtd_parcelas" class="form-control form-control-sm" min="2" max="48" value="2">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small mb-0">Data do 1° Pagamento</label>
                                    <input type="date" id="data_primeiro_pagamento" class="form-control form-control-sm data_atual">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label small mb-0">Periodicidade (dias)</label>
                                    <input type="number" id="periodicidade" class="form-control form-control-sm" min="1" value="30">
                                </div>
                            </div>

                            <!-- Botão -->
                            <div class="row">
                                <div class="col-md-12 text-end">
                                    <button type="button" id="adicionar-pagamento" class="btn btn-success btn-sm">
                                        <i class="ri-add-line"></i> Adicionar Pagamento
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Painel: Valores Adicionais -->
                <div class="col-md-6">
                    <div class="card shadow-sm h-100">
                        <div class="card-header py-2">
                            <h6 class="m-0 font-weight-bold text-primary">Valores Adicionais</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <!-- Desconto -->
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-body py-2">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="flex-grow-1 overflow-hidden">
                                                    <h6 class="text-muted text-uppercase fs-13 m-0">Desconto</h6>
                                                    <h5 id="valor_desconto" class="m-0">R$ 
                                                        @isset($item)
                                                        {{ __moeda($item->desconto) }}
                                                        @else
                                                        0,00
                                                        @endif
                                                    </h5>
                                                </div>
                                                <div class="flex-shrink-0">
                                                    <button type="button" onclick="setaDesconto()" class="btn btn-sm btn-primary rounded">
                                                        <i class="ri-checkbox-indeterminate-line"></i> Aplicar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Acréscimo -->
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-body py-2">
                                            <div class="d-flex justify-content-between align-items-center">
                                                <div class="flex-grow-1 overflow-hidden">
                                                    <h6 class="text-muted text-uppercase fs-13 m-0">Acréscimo</h6>
                                                    <h5 id="valor_acrescimo" class="m-0">R$ 
                                                        @isset($item)
                                                        {{ __moeda($item->acrescimo) }}
                                                        @else
                                                        0,00
                                                        @endif
                                                    </h5>
                                                </div>
                                                <div class="flex-shrink-0">
                                                    <button type="button" onclick="setaAcrescimo()" class="btn btn-sm btn-warning rounded">
                                                        <i class="ri-add-box-line"></i> Aplicar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Observação -->
                            <div class="row mt-2">
                                <div class="col-12">
                                    <div class="alert alert-info p-1 mb-0">
                                        <small><i class="ri-information-line"></i> Para adicionar <strong>desconto</strong> ou <strong>acréscimo</strong> à venda, clique em "Aplicar". Você pode informar valores absolutos ou percentuais (ex: %10 para 10%).</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Lista de Pagamentos Adicionados (compactada) -->
            <div class="row mt-2">
                <div class="col-md-12">
                    <div class="card shadow-sm">
                        <div class="card-header py-2 d-flex justify-content-between align-items-center">
                            <h6 class="m-0 font-weight-bold text-primary">Pagamentos Registrados</h6>
                            <div>
                                <span class="badge text-dark p-1 bg-warning" id="valor-restante-badge">
                                    Valor Restante: <span id="valor-restante">R$ 0,00</span>
                                </span>
                            </div>
                        </div>
                        <div id="mensagem-pagamento" class="text-center my-1"><span class="text-warning">Adicione pagamentos para cobrir o valor total da venda.</span></div>
                        <div class="card-body py-1">
                            <div class="table-responsive lista-pagamentos-box">
                                <table class="table table-bordered table-sm d-none" id="tabela-pagamentos">
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Valor</th>
                                            <th>Detalhes</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody id="lista-pagamentos"></tbody>
                                </table>
                            </div>
                            <div class="alert alert-info mt-1 py-1" id="sem-pagamentos">
                                <i class="ri-information-line"></i> Nenhum pagamento registrado. Adicione pelo menos uma forma de pagamento.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mb-2">

                <div class="col-md-12">
                    <div class="card shadow-sm">
                        <div class="card-body py-1">
                            <label class="form-label small mb-0">Observação</label>
                            <textarea id="observacaoFinalizar" class="form-control form-control-sm" rows="3"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-md-6 text-start">
                    <button type="button" class="btn btn-secondary btn-sm w-100" id="btn-voltar-venda">
                        <i class="ri-arrow-go-back-line me-1"></i> Voltar para venda
                    </button>
                </div>
                <div class="col-md-6 text-end">
                    <button type="button" class="btn btn-success btn-sm w-100" id="finalizar_venda_tab" disabled="">
                        <i class="ri-checkbox-line me-1"></i> Finalizar venda
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>