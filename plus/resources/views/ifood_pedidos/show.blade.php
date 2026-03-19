@extends('layouts.app', ['title' => 'Pedido Ifood'])
@section('css')

@endsection
@section('content')
<div class="mt-1 print">
    <div class="row">
        <div class="card">
            <div class="card-body">

                <div class="col-12">
                    <div class="card shadow-sm">


                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="ri-shopping-bag-3-line"></i>
                                Pedido iFood
                            </h5>
                            <span class="badge bg-light text-dark">
                                #{{ $item->id_exibicao }}
                            </span>
                        </div>

                        <div class="card-body">

                            <div style="text-align: right; margin-top: -5px;">
                                <a href="{{ route('ifood-pedidos.index') }}" class="btn btn-danger btn-sm px-3">
                                    <i class="ri-arrow-left-double-fill"></i>Voltar
                                </a>
                            </div>

                            <div class="mb-3">
                                <h6 class="fw-bold text-primary">Dados do Pedido</h6>
                                <div class="row">
                                    <div class="col-md-6">
                                        <strong>Cliente:</strong> {{ $item->cliente_nome }}
                                    </div>
                                    <div class="col-md-3">
                                        <strong>Pedido iFood:</strong> {{ $item->ifood_id }}
                                    </div>
                                    <div class="col-md-3">
                                        <strong>Data:</strong> {{ date('d/m/Y H:i', strtotime($item->data_pedido)) }}
                                    </div>
                                </div>
                            </div>

                            <hr>

                            <div class="mb-3">
                                <h6 class="fw-bold text-primary">Entrega</h6>
                                <p class="mb-1">
                                    {{ $item->entrega->rua }},
                                    {{ $item->entrega->numero }} –
                                    {{ $item->entrega->bairro }}
                                </p>

                                @if($item->entrega->complemento)
                                <p class="mb-1">
                                    <strong>Complemento:</strong> {{ $item->entrega->complemento }}
                                </p>
                                @endif

                                @if($item->entrega->referencia)
                                <p class="mb-1">
                                    <strong>Referência:</strong> {{ $item->entrega->referencia }}
                                </p>
                                @endif

                                <p class="mb-1">
                                    {{ $item->entrega->cidade }} / {{ $item->entrega->uf }} –
                                    CEP {{ $item->entrega->cep }}
                                </p>

                                @if($item->entrega->observacao)
                                <p class="text-muted mb-0">
                                    {{ $item->entrega->observacao }}
                                </p>
                                @endif
                            </div>

                            <hr>

                            <div class="mb-3">
                                <h6 class="fw-bold text-primary">Itens</h6>

                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered">
                                        <thead class="table-light">
                                            <tr>
                                                <th></th>
                                                <th>Produto</th>
                                                <th class="text-center">Qtd</th>
                                                <th class="text-end">Unitário</th>
                                                <th class="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            @foreach($item->itens as $produto)
                                            <tr>
                                                <td>
                                                    <img class="img-60" src="{{ $produto->imagem_url }}">
                                                </td>

                                                <td>{{ $produto->nome }}</td>
                                                <td class="text-center">{{ number_format($produto->quantidade, 0, '', '') }}</td>

                                                <td class="text-end">
                                                    R$ {{ __moeda($produto->valor_unitario) }}

                                                    @if($produto->valor_adicionais)
                                                    <br>
                                                    <span class="text-success fs-11">R$ {{ __moeda($produto->valor_adicionais) }}</span>
                                                    @endif

                                                    @if($produto->valor_personalizado)
                                                    <br>
                                                    <span class="text-primary fs-11">R$ {{ __moeda($produto->valor_personalizado) }}</span>
                                                    @endif
                                                </td>
                                                <td class="text-end">R$ {{ __moeda($produto->sub_total) }}</td>
                                            </tr>

                                            @foreach($produto->adicionais as $add)

                                            <tr>
                                                <td></td>
                                                <td>{{ $add->nome }}</td>
                                                <td class="text-center">{{ number_format($add->quantidade, 0, '', '') }}</td>
                                                <td class="text-end">R$ {{ __moeda($add->valor_unitario) }}</td>
                                                <td class="text-end">R$ {{ __moeda($add->sub_total) }}</td>
                                            </tr>
                                            @endforeach
                                            @endforeach
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <hr>

                            <div class="mb-3">
                                <h6 class="fw-bold text-primary">Pagamento</h6>

                                <table class="table table-sm table-bordered">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Tipo</th>
                                            <th class="text-center">Pré-pago</th>
                                            <th class="text-end">Valor</th>
                                            <th>Bandeira</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($item->pagamentos as $pagamento)
                                        <tr>
                                            <td>{{ $pagamento->tipo_pagamento }}</td>
                                            <td class="text-center">
                                                @if($pagamento->pre_pago)
                                                <span class="badge bg-success">Sim</span>
                                                @else
                                                <span class="badge bg-warning text-dark">Não</span>
                                                @endif
                                            </td>
                                            <td class="text-end">
                                                R$ {{ number_format($pagamento->valor, 2, ',', '.') }}
                                            </td>
                                            <td>{{ $pagamento->bandeira_cartao }}</td>
                                        </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>

                            <hr>

                            <div class="row">
                                <div class="col-md-4">
                                    <strong>Produtos:</strong>
                                    R$ {{ number_format($item->valor_produtos, 2, ',', '.') }}
                                </div>
                                <div class="col-md-4">
                                    <strong>Entrega:</strong>
                                    R$ {{ number_format($item->valor_entrega, 2, ',', '.') }}
                                </div>
                                <div class="col-md-4">
                                    <strong>Total:</strong>
                                    <span class="fw-bold text-success">
                                        R$ {{ number_format($item->total, 2, ',', '.') }}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>
</div>
@endsection