<div class="col-md-12 mt-3">
    <h6>Total de registros: <strong>{{ $data->total() }}</strong></h6>
    <div class="table-responsive">
        <div class="tabela-scroll" style="overflow-x:auto;">

            <table class="table table-striped table-centered mb-0">
                <thead class="table-dark">
                    <tr>
                        @can('produtos_delete')
                        <th>
                            <div class="form-check form-checkbox-danger mb-2">
                                <input class="form-check-input" type="checkbox" id="select-all-checkbox">
                            </div>
                        </th>
                        @endcan
                        <th>Ações</th>
                        <th>Imagem</th>
                        <th>#</th>
                        <th class="sticky-col first-col">Nome</th>
                        <th>Valor de venda</th>
                        <th>Valor de compra</th>
                        @if(__countLocalAtivo() > 1)
                        <th>Disponibilidade</th>
                        @endif
                        <th>Categoria</th>
                        <th>Código de barras</th>
                        <th>NCM</th>
                        <th>Unidade</th>
                        <th>Data de cadastro</th>
                        <th>CFOP</th>
                        <th>Gerenciar estoque</th>
                        @can('estoque_view')
                        <th>Estoque</th>
                        @endcan
                        <th>Status</th>
                        <th>Variação</th>
                        <th>Combo</th>
                        @if(__isActivePlan(Auth::user()->empresa, 'Cardapio'))
                        <th>Cardápio</th>
                        @endif
                        @if(__isActivePlan(Auth::user()->empresa, 'Delivery'))
                        <th>Delivery</th>
                        @endif
                        @if(__isActivePlan(Auth::user()->empresa, 'Ecommerce'))
                        <th>Ecommerce</th>
                        @endif
                        @if(__isActivePlan(Auth::user()->empresa, 'Reservas'))
                        <th>Reserva</th>
                        @endif

                    </tr>
                </thead>
                <tbody>
                    @forelse($data as $item)
                    <tr>
                        @can('produtos_delete')
                        <td data-label="#">
                            <div class="form-check form-checkbox-danger mb-2">
                                <input class="form-check-input check-delete" type="checkbox" name="item_delete[]" value="{{ $item->id }}">
                            </div>
                        </td>
                        @endcan

                        <td class="text-start d-none d-md-table-cell">
                            @if($usarDropdown)
                            @include('produtos.partials.dropdown_acoes', ['item' => $item])
                            @else
                            @include('produtos.partials.botoes_acoes', ['item' => $item])
                            @endif
                        </td>

                        <td class="d-md-none">
                            @include('produtos.partials.botoes_acoes', ['item' => $item])
                        </td>


                        <td><img class="img-60" src="{{ $item->img }}"></td>
                        <td data-label="Código" style="font-weight: bold;">{{ $item->numero_sequencial }}</td>
                        <td class="sticky-col first-col" data-label="Nome">
                            <label style="width: 300px">{{ $item->nome }}</label>
                            @if($item->local_armazenamento)
                            <br>
                            <label style="font-size: 11px; width: 300px">Local de armazenamento: <strong class="text-primary">{{ $item->local_armazenamento }}</strong></label>
                            @endif
                        </td>
                        @if($item->variacoes && sizeof($item->variacoes) > 0)
                        <td data-label="Valor de venda">
                            <div class="div-overflow">{{ $item->valoresVariacao() }}</div>
                        </td>
                        @else
                        <td data-label="Valor de venda"><label style="width: 100px">{{ __moeda($item->valor_unitario) }}</label></td>
                        @endif
                        <td data-label="Valor de compra"><label style="width: 120px">{{ __moeda($item->valor_compra) }}</label></td>
                        @if(__countLocalAtivo() > 1)
                        <td data-label="Disponibilidade">
                            <label style="width: 250px">
                                @foreach($item->locais as $l)
                                @if($l->localizacao)
                                <strong>{{ $l->localizacao->descricao }}</strong>
                                @if(!$loop->last) | @endif
                                @endif
                                @endforeach
                            </label>
                        </td>
                        @endif
                        <td data-label="Categoria">{{ $item->categoria ? $item->categoria->nome : '--' }}</td>
                        <td data-label="Código de barras">{{ $item->codigo_barras ?? '--' }}</td>
                        <td data-label="NCM">{{ $item->ncm }}</td>
                        <td data-label="Unidade">{{ $item->unidade }}</td>
                        <td data-label="Data de cadastro">{{ __data_pt($item->created_at) }}</td>
                        <td data-label="CFOP">{{ $item->cfop_estadual }}/{{ $item->cfop_outro_estado }}</td>
                        <td data-label="Gerenciar estoque">
                            @if($item->gerenciar_estoque)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        @can('estoque_view')
                        <td data-label="Estoque">
                            <label style="width: 200px">
                                @if(__countLocalAtivo() == 1)
                                {{ $item->estoqueAtual() }}
                                @else
                                @foreach($item->estoqueLocais as $e)
                                @if($e->local)
                                {{ $e->local->descricao }}:
                                <strong class="text-success">
                                    @if(!$item->unidadeDecimal())
                                    {{ number_format($e->quantidade, 0, '.', '') }}
                                    @else
                                    {{ number_format($e->quantidade, 3, '.', '') }}
                                    @endif
                                </strong>
                                @endif
                                @if(!$loop->last) | @endif
                                @endforeach
                                @endif
                            </label>
                        </td>
                        @endcan
                        <td data-label="Status">
                            @if($item->status)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        <td data-label="Variação">
                            @if(sizeof($item->variacoes) > 0)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        <td data-label="Combo">
                            @if($item->combo)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        @if(__isActivePlan(Auth::user()->empresa, 'Cardapio'))
                        <td data-label="Cardápio">
                            @if($item->cardapio)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        @endif
                        @if(__isActivePlan(Auth::user()->empresa, 'Delivery'))
                        <td data-label="Delivery">
                            @if($item->delivery)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        @endif
                        @if(__isActivePlan(Auth::user()->empresa, 'Ecommerce'))
                        <td data-label="Ecommerce">
                            @if($item->ecommerce)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        @endif
                        @if(__isActivePlan(Auth::user()->empresa, 'Reservas'))
                        <td data-label="Reserva">
                            @if($item->reserva)
                            <i class="ri-checkbox-circle-fill text-success"></i>
                            @else
                            <i class="ri-close-circle-fill text-danger"></i>
                            @endif
                        </td>
                        @endif
                    </tr>
                    @empty
                    <tr>
                        <td colspan="23" class="text-center">Nada encontrado</td>
                    </tr>
                    @endforelse
                </tbody>

            </table>
        </div>
    </div>
    <button type="button" id="scrollToggle2" class="scroll-btn-jidox hidden">
        <i class="ri-arrow-right-circle-line"></i>
    </button>
</div>