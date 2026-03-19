@section('css')
<link rel="stylesheet" type="text/css" href="css/pdv.css">
<link rel="stylesheet" type="text/css" href="css/pdv_extend.css">
@endsection

<input type="hidden" id="abertura" value="{{ $abertura }}" name="">
<input type="hidden" id="tef_hash" value="" name="tef_hash">
<input type="hidden" id="config_tef" value="{{ isset($configTef) && $configTef != null ? 1 : 0 }}">
<input type="hidden" id="agrupar_itens" value="{{ $config ? $config->agrupar_itens : 0 }}" name="">
<input type="hidden" id="definir_vendedor_pdv" value="{{ $config ? $config->definir_vendedor_pdv : 0 }}" name="">
<input type="hidden" id="venda_id" value="{{ isset($item) ? $item->id : '' }}">
<input type="hidden" id="lista_id" value="" name="lista_id">
<input type="hidden" id="alerta_sonoro" value="{{ $config ? $config->alerta_sonoro : 0 }}">
<input type="hidden" id="local_id" value="{{ $caixa->localizacao->id }}">
<input type="hidden" id="impressao_sem_janela_cupom" value="{{ $config ? $config->impressao_sem_janela_cupom : 0 }}">
<input type="hidden" id="documento_pdv" value="{{ $config ? $config->documento_pdv : 'nfce' }}">
<input type="hidden" id="ticket_troca" value="{{ $config ? $config->ticket_troca : '0' }}">
<input type="hidden" id="NFECNPJ" value="{{ env('NFECNPJ') }}">

<input type="hidden" id="usar_credito" value="0" name="usar_credito">

@isset($item)
<input type="hidden" value="{{ $item->fatura }}" id="fatura_venda">
@endif

@if($isVendaSuspensa)
<input type="hidden" value="{{ $item->id }}" name="venda_suspensa_id">
@endif

@if(isset($isOrcamento) && $isOrcamento)
<input type="hidden" value="{{ $item->id }}" name="orcamento_id">
@endif

@isset($acrescimo)
<input type="hidden" value="{{ $acrescimo }}" id="acrescimo_pedido">
@endif

@isset($pedido)
@isset($isDelivery)
<input name="pedido_delivery_id" id="pedido_delivery_id" value="{{ $pedido->id }}" class="d-none">
<input id="pedido_desconto" value="{{ $pedido->desconto ? $pedido->desconto : 0 }}" class="d-none">
<input name="valor_entrega" id="pedido_valor_entrega" value="{{ $pedido->valor_entrega }}" class="d-none">
@else
<input name="pedido_id" id="pedido_id" value="{{ $pedido->id }}" class="d-none">
@isset($pushItensPedido)
<input name="itens_cliente" id="pedido_id" value="{{ json_encode($pushItensPedido) }}" class="d-none">
@endif
@endif
@endif

@isset($agendamento)
<input name="agendamento_id" value="{{ $agendamento->id }}" class="d-none">
@endif

<input type="hidden" id="inp-finalizacao_pdv" value="{{ __finalizacaoPdv() }}">

<input type="hidden" id="estoque_view" value="@can('estoque_view') 1 @else 0 @endif">

<div class="row venda-content">
    <div class="col-lg-4">
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body">
                        <div class="small text-muted ps-1" style="font-size: 0.8rem; line-height: 1.1">
                            <span class="me-2"><i class="ri-store-2-line me-1 text-success"></i>Caixa: <strong>{{ $caixa->numero_sequencial }}</strong></span>
                            <span class="me-2"><i class="ri-user-line me-1 text-success"></i>{{ Auth::user()->name }}</span>
                            <span><i class="ri-calendar-event-line me-1 text-success"></i>{{ date('d/m/Y H:i') }}</span>
                        </div>

                        <a class="btn btn-danger btn-sair-pdv" href="{{ route('frontbox.index')}}">
                            <i class="ri-close-line"></i> Sair
                        </a>

                        <div class="cliente-info">
                            <i class="ri-user-add-line"></i>

                            <span class="label-text">Cliente:</span>
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

        <div class="card" style="height: 780px">
            <div class="categorias-header">
                <span>Categorias</span>
            </div>

            <div class="card categorias-card mt-2">
                <div class="categorias-wrapper" data-simplebar data-simplebar-lg>
                    <div class="d-flex flex-nowrap gap-2 px-2 py-1">
                        <button type="button" id="cat_todos" onclick="todos()" class="btn btn-cat active-cat">Todos</button>
                        @foreach ($categorias as $cat)
                        <button type="button" class="btn btn-cat btn_cat_{{ $cat->id }}" onclick="selectCat('{{ $cat->id }}')">{{ $cat->nome }}</button>
                        @endforeach
                    </div>
                </div>
            </div>
            <div class="card-body lista_produtos" data-simplebar data-simplebar-lg style="max-height: 670px;">
                <div class="cards-categorias">
                </div>
            </div>
        </div>

    </div>
    <div class="col-lg-8 produtos">
        <div class="card" style="height: 866px">
            <div class="row m-2">
                <div class="codigo-barras-input" style="margin-bottom: -15px;">
                    <div class="input-group">
                        <input class="form-control mousetrap" type="text" autofocus="" placeholder="Digite o código de barras ou quantidade*" id="codBarras" name="" style="height: 40px;">
                        <div class="input-group-append">
                            <span class="input-group-text" style="height: 40px; padding: 0.25rem 0.5rem;">
                                <i class="ri-barcode-line"></i>
                            </span>
                        </div>
                        <span id="quantidade_multipla" class="quantidade-badge animated-badge"></span>
                    </div>
                </div>
            </div>

            <div class="row m-2">
                <div class="col-md-6">
                    <div class="form-group">
                        <label for="inp-produto_id" class="">Produto</label>
                        <div class="input-group">
                            <select class="form-control produto_id" name="produto_id" id="inp-produto_id"></select>
                        </div>
                        <input name="variacao_id" id="inp-variacao_id" type="hidden" value="">
                    </div>
                </div>
                <div class="col-md-2">
                    {!! Form::tel('quantidade', 'Quantidade')->attrs(['class' => 'qtd']) !!}
                </div>
                <div class="col-md-2">
                    {!! Form::tel('valor_unitario', 'Valor Unitário')->attrs(['class' => 'moeda value_unit']) !!}
                </div>
                <div class="col-md-2">
                    <div class="row">
                        <div class="col-12">
                            <br>
                            <button class="btn btn-primary btn-add-item w-100" type="button" style="margin-left: 0px">
                                <i class="ri-add-circle-line"></i>
                                Adicionar
                            </button>
                        </div>

                    </div>
                </div>
                <div class="col-md-1">
                    {!! Form::hidden('subtotal', 'SubTotal')->attrs(['class' => 'moeda']) !!}
                    {!! Form::hidden('valor_total', 'valor Total')->attrs(['class' => 'moeda']) !!}
                </div>
            </div>

            <div class=" m-1">
                <div data-bs-target="#navbar-example2" class="scrollspy-example" style="height: 570px">
                    <table class="table table-striped dt-responsive nowrap table-itens">
                        <thead class="table-dark">
                            <tr>
                                <th></th>
                                @isset($servicos)
                                <th>Produto/Serviço</th>
                                @else
                                <th>Produto</th>
                                @endif
                                <th>Quantidade</th>
                                <th>Valor</th>
                                <th>Subtotal</th>
                                <th>#</th>
                            </tr>
                        </thead>
                        <tbody>
                            @if (isset($item))
                            @foreach ($item->itens as $key => $product)
                            <tr class="line-product">
                                <input readonly type="hidden" name="key" class="form-control" value="{{ $product->key }}">
                                <input readonly type="hidden" name="produto_id[]" class="produto_row" value="{{ $product->produto->id }}">
                                <input name="variacao_id[]" type="hidden" value="{{ $product->variacao_id }}">

                                <td>
                                    <img src="{{ $product->produto->img }}" style="width: 30px; height: 40px; border-radius: 10px;">
                                </td>
                                <td>
                                    <input style="width: 350px" readonly type="text" name="produto_nome[]" class="form-control" value="{{ $product->produto->nome }} @if($product->produtoVariacao != null) - {{ $product->produtoVariacao->descricao }} @endif">
                                </td>

                                <td class="datatable-cell">
                                    <div class="form-group mb-2" style="width: 200px">
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <button id="btn-subtrai" class="btn btn-danger" type="button">-</button>
                                            </div>
                                            <input type="tel" readonly class="form-control qtd qtd_row" name="quantidade[]" value="{{ number_format($product->quantidade, 2, ',', '') }}">
                                            <div class="input-group-append">
                                                <button class="btn btn-success" id="btn-incrementa" type="button">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <input style="width: 100px" readonly type="tel" name="valor_unitario[]" class="form-control value-unit" value="{{ __moeda($product->valor_unitario) }}">
                                </td>
                                <td>
                                    <input style="width: 100px" readonly type="tel" name="subtotal_item[]" class="form-control subtotal-item" value="{{ __moeda($product->valor_unitario * $product->quantidade) }}">
                                </td>
                                <td>

                                    @php
                                    $adds = '';

                                    if($product && $product->adicionais){
                                        foreach($product->adicionais as $a){
                                            $adds .= "$a->id,";
                                        }
                                    }
                                    @endphp
                                    <div class="inputs-adicional">
                                        @if($product->adicionais)
                                        @foreach($product->adicionais as $a)
                                        <input class='add' type='hidden' value='{{ $a->adicional_id }}' />
                                        @endforeach
                                        @endif
                                    </div>
                                    <input type="hidden" value="{{ $adds }}" class="adicionais" name="adicionais[]">
                                    <button type="button" class="btn btn-danger btn-sm btn-delete-row"><i class="ri-delete-bin-line"></i></button>
                                </td>

                            </tr>
                            @endforeach
                            @endif

                            @if (isset($servicos))
                            @foreach ($servicos as $key => $servico)
                            <tr class="line-product">
                                <input readonly type="hidden" name="servico_id[]" class="form-control" value="{{ $servico->servico->id }}">

                                <td>
                                    <img src="{{ $servico->servico->img }}" style="width: 30px; height: 40px; border-radius: 10px;">
                                </td>

                                <td>
                                    <input style="width: 350px" readonly type="text" name="servico_nome[]" class="form-control" value="{{ $servico->servico->nome }} [serviço]">
                                </td>

                                <td class="datatable-cell">
                                    <div class="form-group mb-2" style="width: 200px">

                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <button disabled id="btn-subtrai" class="btn btn-danger btn-qtd" type="button">-</button>
                                            </div>
                                            <input type="tel" readonly class="form-control qtd_row qtd" name="quantidade_servico[]" value="{{ number_format($servico->quantidade,0) }}">
                                            <div class="input-group-append">
                                                <button disabled class="btn btn-success btn-qtd" id="btn-incrementa" type="button">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                
                                <td>
                                    <input readonly type="tel" style="width: 100px" name="valor_unitario_servico[]" class="form-control value-unit" value="{{ __moeda($servico->valor) }}">
                                </td>
                                <td>
                                    <input readonly type="tel" style="width: 100px" name="subtotal_servico[]" class="form-control subtotal-item" value="{{ __moeda($servico->valor * $servico->quantidade) }}">
                                </td>
                                <td>
                                    <button disabled type="button" class="btn btn-danger btn-sm btn-delete-row"><i class="ri-delete-bin-line"></i></button>
                                </td>
                            </tr>
                            @endforeach
                            @endif

                            @if (isset($pedido) && isset($itens))
                            @foreach ($itens as $key => $product)
                            <tr class="line-product">
                                <input readonly type="hidden" name="key" class="form-control" value="{{ $product->key }}">
                                <input readonly type="hidden" name="produto_id[]" class="produto_row" value="{{ $product->produto->id }}">
                                <input name="variacao_id[]" type="hidden" value="{{ $product->variacao_id }}">

                                <td>
                                    <img src="{{ $product->produto->img }}" style="width: 30px; height: 40px; border-radius: 10px;">
                                </td>
                                <td>
                                    <input style="width: 350px" readonly type="text" name="produto_nome[]" class="form-control" value="{{ $product->produto->nome }} @if($product->produtoVariacao != null) - {{ $product->produtoVariacao->descricao }} @endif">
                                </td>

                                <td class="datatable-cell">
                                    <div class="form-group mb-2" style="width: 200px">
                                        <div class="input-group">
                                            <div class="input-group-prepend">
                                                <button id="btn-subtrai" class="btn btn-danger" type="button">-</button>
                                            </div>
                                            <input type="tel" readonly class="form-control qtd qtd_row" name="quantidade[]" value="{{ number_format($product->quantidade, 2, ',', '') }}">
                                            <div class="input-group-append">
                                                <button class="btn btn-success" id="btn-incrementa" type="button">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <input style="width: 100px" readonly type="tel" name="valor_unitario[]" class="form-control value-unit" value="{{ __moeda($product->valor_unitario) }}">
                                </td>
                                <td>
                                    <input style="width: 100px" readonly type="tel" name="subtotal_item[]" class="form-control subtotal-item" value="{{ __moeda($product->valor_unitario * $product->quantidade) }}">
                                </td>
                                <td>
                                    <button type="button" class="btn btn-danger btn-sm btn-delete-row"><i class="ri-delete-bin-line"></i></button>
                                </td>
                            </tr>
                            @endforeach
                            @endif
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="">

            <div class="row">
                <div class="col-md-6">
                    <h5 style="margin-left: 10px">Total de itens: <strong class="total-itens text-danger">0</strong></h5>
                </div>
                <div class="col-md-6 text-end">
                    <h5 style="margin-right: 10px">Total de linhas: <strong class="total-linhas text-danger">0</strong></h5>
                </div>
                <!-- <div class="col-md-7">
                    <h4 class="">Finalização da Venda</h4>
                </div> -->
            </div>
            <div class="row m-1">

                <div class="col-md-4">
                    <div class="card widget-compact mb-pdv">
                        <div class="card-body p-2">
                            <h5 class="text-muted text-uppercase small mb-1 text-center">AÇÕES DO CAIXA</h5>
                            <div class="row g-1">

                                @can('conta_receber_edit')
                                <div class="col-12">
                                    <button type="button" id="btn-recebimento" class="btn btn-primary btn-sm w-100 mb-1">
                                        <i class="ri-money-dollar-circle-line"></i> Recebimento
                                    </button>
                                </div>
                                @endcan

                                <div class="col-6">
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#sangria_caixa" class="btn btn-danger btn-sm w-100 mb-1">
                                        <i class="ri-arrow-down-circle-line"></i> Sangria
                                    </button>
                                </div>
                                <div class="col-6">
                                    <button type="button" data-bs-toggle="modal" data-bs-target="#suprimento_caixa" class="btn btn-success btn-sm w-100 mb-1">
                                        <i class="ri-arrow-up-circle-line"></i> Suprimento
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card widget-compact mb-pdv">
                        <div class="card-body p-2">
                            <h5 class="text-muted text-uppercase small mb-1 text-center">AÇÕES DO PDV</h5>

                            <div class="row g-1">

                                <div class="col-6">
                                    <button type="button" class="btn btn-sm btn-dark w-100 mb-1" data-bs-toggle="modal" data-bs-target="#lista_precos">
                                        <i class="ri-cash-line"></i> Lista de Preços
                                    </button>
                                </div>

                                <div class="col-6">
                                    <button type="button" class="btn btn-sm btn-light w-100 mb-1" onclick="modalFrete()">
                                        <i class="ri-truck-line"></i> Frete <strong class="valor-frete">R$ {{ isset($item) ? __moeda($item->valor_frete) : '0,00' }}</strong>
                                    </button>
                                </div>
                                
                                <div class="col-6">
                                    <button type="button" class="btn btn-info btn-sm w-100 mb-1 btn-vendas-suspensas" data-bs-toggle="modal" data-bs-target="#vendas_suspensas">
                                        <i class="ri-time-fill"></i> Vendas Suspensas
                                    </button>
                                </div>

                                @if(!isset($item))
                                <div class="col-6">
                                    <button type="button" class="btn btn-sm btn-secondary w-100 btn-orcamentos mb-1" data-bs-toggle="modal" data-bs-target="#orcamentos"><i class="ri-list-settings-fill"></i> Orçamentos</button>
                                </div>
                                @endif

                                <div class="col-12 btn-fatura-padrao d-none">
                                    <button type="button" class="btn btn-sm btn-dark w-100 mb-1">
                                        <i class="ri-booklet-line"></i>
                                        Fatura Padrão do Cliente
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4" style="margin-top: 0px;">

                    <div class="col-12 mt-3">
                        @if($isVendaSuspensa == 0 && (isset($isOrcamento) && $isOrcamento == 0))
                        <button type="button" id="btn-suspender" class="btn btn-light btn-sm mb-1">
                            <i class="ri-timer-line"></i> Suspender
                        </button>
                        @else
                        <a href="{{ route('frontbox.create') }}" class="btn btn-light btn-sm mb-1">
                            <i class="ri-refresh-line"></i> Nova Venda
                        </a>
                        @endif
                    </div>

                    @if(isset($item) && $isVendaSuspensa == 0 && (isset($isOrcamento) && $isOrcamento == 0))
                    <button type="button" class="btn btn-success w-100 mt-2" disabled id="editar_venda">
                        <i class="ri-checkbox-circle-line"></i>
                        EDITAR VENDA <strong class="total-venda">{{ __moeda($item->total) }}</strong>
                    </button>
                    @else
                    <button type="button" class="btn btn-success w-100 mt-2 efetuar_pagamento" id="salvar_venda">
                        <i class="ri-checkbox-circle-line"></i>
                        EFETUAR PAGAMENTO 
                        @isset($item)
                        <strong class="total-venda">{{ __moeda($item->valor_total) }}</strong>
                        @else
                        <strong class="total-venda">0,00</strong>
                        @endif
                    </button>
                    @endif
                </div>

                @if($isVendaSuspensa)
                <button id="btnSuspenderVenda" class="btn-bolinha-flutuante">
                    <i class="ri-pause-circle-fill"></i>
                </button>
                @endif

            </div>
        </div>
    </div>
</div>


</div>

@include('front_box.partials._modal_finalizar', ['not_submit' => true])

@include('front_box.partials._modal_recebimento')

@include('modals._pagamento_multiplo', ['not_submit' => true])
@include('modals._finalizar_venda', ['not_submit' => true])
@include('modals._funcionario', ['not_submit' => true])
@include('modals._cartao_credito', ['not_submit' => true])
@include('modals._variacao', ['not_submit' => true])
@include('modals._lista_precos')
@include('modals._vendas_suspensas')
@include('front_box.partials._modal_orcamentos')
@include('modals._tef_consulta')
@include('modals._valor_credito')
@include('modals._modal_pix')
@include('modals._fatura_venda')
@include('modals._frete')
@include('produtos.partials.modal_info_produto')

@include('modals._observacao_pdv')
@include('modals._adicionais_pdv')

@include('modals._cliente', ['cashback' => 1])

@section('js')
<script>
    var senhaAcao = "";

    @if(isset($config) && strlen(trim($config->senha_manipula_valor)) > 1)
    senhaAcao = "{{ $config->senha_manipula_valor }}";
    @endif
</script>
<script src="js/frente_caixa1.js" type=""></script>
<script src="js/gerencia_pagamento_pdv1.js" type=""></script>
<script src="js/comanda_pdv.js"></script>

<script type="text/javascript" src="js/mousetrap.js"></script>
<script type="text/javascript" src="js/controla_conta_empresa.js"></script>
<script src="js/novo_cliente.js"></script>

<script type="text/javascript">

    @if(Session::has('sangria_id'))
    window.open(path_url + 'sangria-print/' + {{ Session::get('sangria_id') }}, "_blank")
    @endif
    @if(Session::has('suprimento_id'))
    window.open(path_url + 'suprimento-print/' + {{ Session::get('suprimento_id') }}, "_blank")
    @endif

    $('.btn-novo-cliente').click(() => {
        $('.modal-select-cliente .btn-close').trigger('click')
        $('#modal_novo_cliente').modal('show')

    })
    // addProdutos(2)
    // setTimeout(() => {
    //     $('.efetuar_pagamento').trigger('click')
    // }, 2000)

</script>

@endsection
