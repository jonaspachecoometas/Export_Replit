@extends('layouts.app', ['title' => 'Lista de Vendas PDV'])
@section('css')
<style type="text/css">
    .btn{
        margin-top: 3px;
    }
    .fiscal-loader {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.75);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .fiscal-box {
        background: #fff;
        width: 480px;
        max-width: 92%;
        border-radius: 14px;
        padding: 28px;
        text-align: center;
        animation: fadeIn .25s ease;
    }

    .fiscal-icon {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 34px;
        color: #fff;
    }

    .fiscal-icon.error {
        background: #dc3545;
    }

    .fiscal-icon.warning {
        background: #f59e0b;
    }

    .fiscal-icon.success {
        background: #16a34a;
    }

    .fiscal-content {
        text-align: left;
        margin: 16px 0;
        max-height: 240px;
        overflow-y: auto;
    }

    .fiscal-content ul {
        padding-left: 18px;
    }

    .fiscal-content li {
        margin-bottom: 8px;
    }

    .fiscal-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: scale(.96); }
        to   { opacity: 1; transform: scale(1); }
    }

    .bg-fiscal:hover{
        cursor: pointer;
    }
</style>
@endsection
@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="col-md-2">
                    @can('pdv_create')
                    <a href="{{ route('frontbox.create') }}" class="btn btn-success">
                        <i class="ri-add-circle-fill"></i>
                        PDV
                    </a>
                    @endcan
                </div>
                <hr>
                {!! Form::open()->fill(request()->all())->get() !!}
                <div class="row">
                    <div class="col-md-4">
                        {!!Form::select('cliente_id', 'Cliente')
                        ->attrs(['class' => 'select2'])
                        !!}
                    </div>
                    <div class="col-md-2">
                        {!!Form::date('start_date', 'Data inicial')
                        !!}
                    </div>
                    <div class="col-md-2">
                        {!!Form::date('end_date', 'Data final')
                        !!}
                    </div>

                    <div class="col-md-2">
                        {!!Form::select('estado', 'Estado',
                        ['novo' => 'Novas',
                        'rejeitado' => 'Rejeitadas',
                        'cancelado' => 'Canceladas',
                        'aprovado' => 'Aprovadas',
                        '' => 'Todos'])
                        ->attrs(['class' => 'form-select'])
                        !!}
                    </div>
                    
                    @if($adm)
                    <div class="col-md-2">
                        {!!Form::select('user_id', 'Usuário', ['' => 'Selecione'] + $usuarios->pluck('name', 'id')->all())
                        ->attrs(['class' => 'select2'])
                        !!}
                    </div>
                    @endif
                    <div class="col-md-4 text-left">
                        <br>
                        <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                        <a id="clear-filter" class="btn btn-danger" href="{{ route('frontbox.index') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                    </div>
                </div>
                {!! Form::close() !!}

                @if($contigencia != null)
                <div class="row">
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="text-danger">Contigência ativada</h4>
                                <p class="text-danger">Tipo: <strong>{{$contigencia->tipo}}</strong></p>
                                <p class="text-danger">Data de ínicio: <strong>{{ __data_pt($contigencia->created_at) }}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
                @endif
                <div class="col-lg-12 mt-4">
                    <div class="table-responsive">
                        <table class="table table-striped table-centered mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Ações</th>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>CPF/CNPJ</th>
                                    <th>Valor</th>
                                    <th>Status Fiscal</th>
                                    <th>Estado</th>
                                    <th>Ambiente</th>
                                    <th>Número NFCe</th>
                                    <th>Data</th>
                                    <th>Lista de preço</th>
                                    <th>Usuário</th>
                                    <th>Vendedor</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($data as $item)
                                <tr>
                                    <td class="text-start d-none d-md-table-cell">
                                        @if($usarDropdown)
                                        @include('front_box.partials.dropdown_acoes', ['item' => $item])
                                        @else
                                        @include('front_box.partials.botoes_acoes', ['item' => $item])
                                        @endif
                                    </td>

                                    <td class="d-md-none">
                                        @include('front_box.partials.botoes_acoes', ['item' => $item])
                                    </td>

                                    <td data-label="#">{{ $item->numero_sequencial }}</td>

                                    <td data-label="Cliente">
                                        <label style="width: 350px">
                                            {{ $item->cliente ? $item->cliente->razao_social : ($item->cliente_nome != "" ? $item->cliente_nome : "--") }}
                                        </label>
                                    </td>

                                    <td data-label="CPF/CNPJ">
                                        <label style="width: 150px">
                                            {{ $item->cliente ? $item->cliente->cpf_cnpj : ($item->cliente_cpf_cnpj != "" ? $item->cliente_cpf_cnpj : "--") }}
                                        </label>
                                    </td>

                                    <td data-label="Valor">
                                        <label class="fs-16 mb-1" style="width: 120px;">
                                            R$ {{ __moeda($item->total) }}
                                        </label>
                                        @if($item->valor_cashback > 0)
                                        <br>
                                        <span class="bg bg-danger text-white" style="border-radius: 5px; padding: 2px;">cashback R$ {{ __moeda($item->valor_cashback) }}</span>
                                        @endif
                                    </td>

                                    <td data-label="Status Fiscal">
                                        @if($item->fiscal_status === 'erro')
                                        <span class="badge bg-danger p-1 bg-fiscal" onclick="consultarFiscal({{ $item->id }}, 'nfce')">Erro fiscal</span>
                                        @elseif($item->fiscal_status === 'alerta')
                                        <span class="badge bg-warning p-1 bg-fiscal" onclick="consultarFiscal({{ $item->id }}, 'nfce')">Alerta fiscal</span>
                                        @else
                                        <span class="badge bg-success p-1">Fiscal OK</span>
                                        @endif
                                    </td>

                                    <td data-label="Estado">
                                        @if($item->estado == 'aprovado')
                                        <span class="badge p-1 bg-success text-white">APROVADO</span>
                                        @elseif($item->estado == 'cancelado')
                                        <span class="badge p-1 bg-danger text-white">CANCELADO</span>
                                        @elseif($item->estado == 'rejeitado')
                                        <span class="badge p-1 bg-warning text-white">REJEITADO</span>
                                        @else
                                        <span class="badge p-1 bg-info text-white">NOVO</span>
                                        @endif
                                    </td>

                                    <td data-label="Ambiente">{{ $item->ambiente == 2 ? 'Homologação' : 'Produção' }}</td>

                                    <td data-label="Número NFCe">
                                        <label style="width: 100px">{{ $item->estado == 'aprovado' ? $item->numero : '--' }}</label>
                                    </td>

                                    <td data-label="Data">{{ \Carbon\Carbon::parse($item->created_at)->format('d/m/Y H:i') }}</td>

                                    <td data-label="Lista de preço">
                                        <label style="width: 100px">{{ $item->lista ? $item->listaPreco->nome : '--' }}</label>
                                    </td>

                                    <td data-label="Usuário">{{ $item->user ? $item->user->name : '--' }}</td>

                                    <td data-label="Vendedor">{{ $item->vendedor() ? $item->vendedor() : '--' }}</td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="12" class="text-center">Nada encontrado</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>

                    </div>
                    <br>
                    {!! $data->appends(request()->all())->links() !!}
                </div>
                <h5 class="mt-2">VALOR TOTAL DAS VENDAS: <strong class="text-success">R$ {{ __moeda($somaGeral) }}</strong></h5>
            </div>
        </div>
    </div>
</div>
@include('nfe.partials.modal_envio_wpp')

<div id="fiscalLoader" class="fiscal-loader d-none">
    <div class="fiscal-box">
        <div id="fiscalIcon" class="fiscal-icon error">✖</div>

        <h4 id="fiscalTitle">Erro Fiscal</h4>
        <p id="fiscalSubtitle">
            Foram encontrados problemas fiscais que impedem a transmissão.
        </p>

        <div id="fiscalContent" class="fiscal-content"></div>

        <div class="fiscal-actions">
            <button id="btnFiscalCancel" class="btn btn-secondary">
                Fechar
            </button>

        </div>
    </div>
</div>

@endsection

@section('js')
<script type="text/javascript" src="js/nfce_transmitir.js"></script>
<script type="text/javascript">
    function imprimir(id){
        var disp_setting="toolbar=yes,location=no,";
        disp_setting+="directories=yes,menubar=yes,";
        disp_setting+="scrollbars=yes,width=850, height=600, left=100, top=25";

        var docprint=window.open(path_url+"frontbox/imprimir-nao-fiscal/"+id, "",disp_setting);

        docprint.focus();
    }

    function imprimirA4(id){
        var disp_setting="toolbar=yes,location=no,";
        disp_setting+="directories=yes,menubar=yes,";
        disp_setting+="scrollbars=yes,width=850, height=600, left=100, top=25";

        var docprint=window.open(path_url+"frontbox/imprimir-a4/"+id, "",disp_setting);

        docprint.focus();
    }
</script>
<script type="text/javascript" src="js/enviar_fatura_wpp.js"></script>
<script type="text/javascript" src="js/consulta_fiscal.js"></script>

@endsection
