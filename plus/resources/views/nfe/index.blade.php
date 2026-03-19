@extends('layouts.app', ['title' => 'NFe'])
@section('css')
<style type="text/css">
    .btn{
        margin-top: 3px;
    }

    input[type="file"] {
        display: none;
    }

    .file-certificado label {
        padding: 8px 8px;
        width: 100%;
        background-color: #8833FF;
        color: #FFF;
        text-transform: uppercase;
        text-align: center;
        display: block;
        margin-top: 20px;
        cursor: pointer;
        border-radius: 5px;
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
                <div class="row">
                    @can('nfe_create')
                    <div class="col-md-2">
                        <a href="{{ route('nfe.create') }}" class="btn btn-success">
                            <i class="ri-add-circle-fill"></i>
                            Nova Venda
                        </a>
                    </div>
                    @endcan

                    <div class="col-md-8"></div>

                    @if(__isPlanoFiscal())
                    <div class="col-md-2">
                        <button id="btn-consulta-sefaz" class="btn btn-dark" style="float: right;">
                            <i class="ri-refresh-line"></i>
                            Consultar Status Sefaz
                        </button>
                    </div>
                    @endif
                </div>
                <hr class="mt-3">
                <div class="col-lg-12">
                    {!!Form::open()->fill(request()->all())
                    ->get()
                    !!}
                    <div class="row mt-3 g-2">
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
                        @if(__isPlanoFiscal())
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

                        <div class="col-md-2">
                            {!!Form::tel('numero_nfe', 'Número NFe')
                            !!}
                        </div>

                        <div class="col-md-2">
                            {!!Form::select('tpNF', 'Tipo',
                            [
                            '1' => 'Saída',
                            '0' => 'Entrada',
                            '-' => 'Todos'
                            ])
                            ->attrs(['class' => 'form-select'])
                            !!}
                        </div>
                        @endif

                        @if(__countLocalAtivo() > 1)
                        <div class="col-md-2">
                            {!!Form::select('local_id', 'Local', ['' => 'Selecione'] + __getLocaisAtivoUsuario()->pluck('descricao', 'id')->all())
                            ->attrs(['class' => 'select2'])
                            !!}
                        </div>
                        @endif

                        <div class="col-lg-4 col-12">
                            <br>
                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('nfe.index') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                        </div>
                    </div>
                    {!!Form::close()!!}
                </div>
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

                <div class="col-md-12 mt-3">
                    <div class="table-responsive">
                        <div class="tabela-scroll" style="overflow-x:auto;">
                            <table class="table table-striped table-centered mb-0">
                                <thead class="table-dark">
                                    <tr>
                                        <th>Ações</th>
                                        <th>#</th>
                                        <th>Cliente/Fornecedor</th>
                                        <th>CPF/CNPJ</th>
                                        @if(__countLocalAtivo() > 1)
                                        <th>Local</th>
                                        @endif
                                        <th>Usuário</th>
                                        <th>Número</th>
                                        <th>Número Série</th>
                                        <th>Valor</th>
                                        @if(__isPlanoFiscal())
                                        <th>Status Fiscal</th>
                                        <th>Estado</th>
                                        <th>Ambiente</th>
                                        @endif
                                        <th>Data de cadastro</th>
                                        <th>Data de emissão</th>
                                        <th>Tipo</th>
                                        <th>*</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($data as $item)
                                    <tr>
                                        <!-- menu açoes -->

                                        <td class="text-start d-none d-md-table-cell">
                                            @if($usarDropdown)
                                            @include('nfe.partials.dropdown_acoes', ['item' => $item])
                                            @else
                                            @include('nfe.partials.botoes_acoes', ['item' => $item])
                                            @endif
                                        </td>

                                        <td class="d-md-none">
                                            @include('nfe.partials.botoes_acoes', ['item' => $item])
                                        </td>

                                        <td data-label="#">{{ $item->numero_sequencial }}</td>

                                        @if($item->cliente)
                                        <td data-label="Cliente/Fornecedor">
                                            <label style="width: 350px">{{ $item->cliente->razao_social ?? '--' }}</label>
                                        </td>
                                        <td data-label="CPF/CNPJ">{{ $item->cliente->cpf_cnpj ?? '--' }}</td>
                                        @else
                                        <td data-label="Cliente/Fornecedor">
                                            <label style="width: 350px">{{ $item->fornecedor->razao_social ?? '--' }}</label>
                                        </td>
                                        <td data-label="CPF/CNPJ">{{ $item->fornecedor->cpf_cnpj ?? '--' }}</td>
                                        @endif

                                        @if(__countLocalAtivo() > 1)
                                        <td data-label="Local" class="text-danger">{{ $item->localizacao->descricao }}</td>
                                        @endif

                                        <td data-label="Usuário">{{ $item->user->name ?? '--' }}</td>
                                        <td data-label="Número">{{ $item->numero ?? '' }}</td>
                                        <td data-label="Número Série">
                                            <label style="width: 100px">{{ $item->numero_serie ?? '' }}</label>
                                        </td>
                                        <td data-label="Valor">{{ __moeda($item->total) }}</td>

                                        @if(__isPlanoFiscal())
                                        <td data-label="Status Fiscal">
                                            @if($item->fiscal_status === 'erro')
                                            <span class="badge bg-danger p-1 bg-fiscal" onclick="consultarFiscal({{ $item->id }})">Erro fiscal</span>
                                            @elseif($item->fiscal_status === 'alerta')
                                            <span class="badge bg-warning p-1 bg-fiscal" onclick="consultarFiscal({{ $item->id }})">Alerta fiscal</span>
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
                                        @endif

                                        <td data-label="Data de cadastro">
                                            <label style="width: 120px">{{ __data_pt($item->created_at) }}</label>
                                        </td>

                                        <td data-label="Data de emissão">
                                            <label style="width: 120px">{{ $item->data_emissao ? __data_pt($item->data_emissao, 1) : '--' }}</label>
                                        </td>

                                        <td data-label="Tipo">
                                            @if($item->tpNF)
                                            <span class="text-success">Saída</span>
                                            @else
                                            <span class="text-primary">Entrada</span>
                                            @endif
                                        </td>

                                        <td data-label="*">
                                            @if($item->pedidoEcommerce)
                                            <a title="Pedido de ecommerce" class="btn btn-sm btn-danger" href="{{ route('pedidos-ecommerce.show', [$item->pedidoEcommerce->id]) }}">EC</a>
                                            @elseif($item->ordemServico)
                                            <a title="Ordem de serviço" class="btn btn-sm btn-primary" href="{{ route('ordem-servico.show', [$item->ordemServico->id]) }}">OS</a>
                                            @elseif($item->pedidoMercadoLivre)
                                            <a title="Pedido mercado livre" class="btn btn-sm btn-warning" href="{{ route('mercado-livre-pedidos.show', [$item->pedidoMercadoLivre->id]) }}">ML</a>
                                            @elseif($item->pedidoNuvemShop)
                                            <a title="Pedido nuvem shop" class="btn btn-sm btn-dark" href="{{ route('nuvem-shop-pedidos.show', [$item->pedidoNuvemShop->pedido_id]) }}">NS</a>
                                            @elseif($item->reserva)
                                            <a title="Reserva" class="btn btn-sm btn-dark" href="{{ route('reservas.show', [$item->reserva->id]) }}">RS</a>
                                            @elseif($item->pedidoWoocomerce)
                                            <a title="Pedido woocommerce" class="btn btn-sm btn-info" href="{{ route('woocommerce-pedidos.show', [$item->pedidoWoocomerce->id]) }}">WO</a>
                                            @else
                                            --
                                            @endif
                                        </td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="15" class="text-center">Nada encontrado</td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>

                        </div>
                    </div>
                    <button type="button" id="scrollToggle2" class="scroll-btn-jidox hidden">
                        <i class="ri-arrow-right-circle-line"></i>
                    </button>
                    <br>
                    {!! $data->appends(request()->all())->links() !!}
                </div>
                <h5 class="mt-2">VALOR TOTAL DAS VENDAS: <strong class="text-success">R$ {{ __moeda($somaGeral) }}</strong></h5>
            </div>
        </div>
    </div>
</div>

@include('nfe.partials.modal_envio_wpp')

<div class="modal fade" id="modal-print" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Imprimir NFe <strong class="ref-numero"></strong></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-12 col-lg-4">
                        <button type="button" class="btn btn-success w-100" onclick="gerarDanfe('danfe')">
                            <i class="ri-printer-line"></i>
                            DANFE
                        </button>
                    </div>

                    <div class="col-12 col-lg-4">
                        <button type="button" class="btn btn-primary w-100" onclick="gerarDanfe('simples')">
                            <i class="ri-printer-line"></i>
                            DANFE Simples
                        </button>
                    </div>

                    <div class="col-12 col-lg-4">
                        <button type="button" class="btn btn-dark w-100" onclick="gerarDanfe('etiqueta')">
                            <i class="ri-printer-line"></i>
                            DANFE Etiqueta
                        </button>
                    </div>

                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modal-cancelar" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Cancelar NFe <strong class="ref-numero"></strong></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">

                    <div class="col-md-12">
                        {!!Form::text('motivo-cancela', 'Motivo')
                        ->required()
                        !!}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button>
                <button type="button" id="btn-cancelar" class="btn btn-danger">Cancelar</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modal-email" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <form class="modal-content" method="post" action="{{ route('nfe.send-email') }}" enctype="multipart/form-data">
            @csrf
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Enviar email NFe <strong class="ref-numero"></strong></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row g-2">
                    <input type="hidden" id="nfe_email_id" name="id">
                    <div class="col-md-12">
                        {!!Form::text('email', 'Email')
                        ->required()
                        ->type('email')
                        !!}
                    </div>

                    <div class="col-md-12 file-certificado">
                        {!! Form::file('arquivo', 'Arquivo') !!}
                        <span class="text-danger" id="filename"></span>
                    </div>

                    <div class="col-md-4 mt-2">
                        {!!Form::checkbox('danfe', 'DANFE')
                        !!}
                    </div>
                    <div class="col-md-4 mt-2">
                        {!!Form::checkbox('xml', 'XML')
                        !!}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button>
                <button type="submit" class="btn btn-success btn-enviar-email">Enviar Email</button>
            </div>
        </form>
    </div>
</div>

<div class="modal fade" id="modal-corrigir" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Corrigir NFe <strong class="ref-numero"></strong></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">

                    <div class="col-md-12">
                        {!!Form::text('motivo-corrigir', 'Motivo')
                        ->required()

                        !!}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Fechar</button>
                <button type="button" id="btn-corrigir" class="btn btn-warning">Corrigir</button>
            </div>
        </div>
    </div>
</div>

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
<script type="text/javascript">

    $(function(){
        let url = "{{ session('url_carne') }}";

        if(url){
            swal({
                title: "Sucesso",
                text: "Deseja imprimir o carnê desta venda?",
                icon: "success",
                buttons: true,
                buttons: ["Não", "Sim"],
                dangerMode: true,
            }).then((isConfirm) => {
                if (isConfirm) {
                    window.open(url, '_blank');
                } else {
                }

            });
        }
    })

    function info(motivo_rejeicao, chave, estado, recibo) {

        if (estado == 'rejeitado') {
            let text = "Motivo: " + motivo_rejeicao + "\n"
            text += "Chave: " + chave + "\n"
            swal("", text, "warning")
        } else {
            let text = "Chave: " + chave + "\n"
            text += "Recibo: " + recibo + "\n"
            swal("", text, "success")
        }
    }

    $('#btn-consulta-sefaz').click(() => {
        $.post(path_url + 'api/nfe_painel/consulta-status-sefaz', {
            empresa_id: $('#empresa_id').val(),
            usuario_id: $('#usuario_id').val(),
        })
        .done((res) => {
            let msg = "cStat: " + res.cStat
            msg += "\nMotivo: " + res.xMotivo
            msg += "\nAmbiente: " + (res.tpAmb == 2 ? "Homologação" : "Produção")
            msg += "\nverAplic: " + res.verAplic

            swal("Sucesso", msg, "success")
        })
        .fail((err) => {
            try {
                swal("Erro", err.responseText, "error")
            } catch {
                swal("Erro", "Algo deu errado", "error")
            }
        })
    })

    function printPedido(id){
        var disp_setting="toolbar=yes,location=no,";
        disp_setting+="directories=yes,menubar=yes,";
        disp_setting+="scrollbars=yes,width=850, height=600, left=100, top=25";

        var docprint=window.open(path_url+"nfe/imprimirVenda/"+id, "",disp_setting);

        docprint.focus();
    }


</script>
<script type="text/javascript" src="js/nfe_transmitir.js"></script>
<script type="text/javascript" src="js/enviar_fatura_wpp.js"></script>
<script type="text/javascript" src="js/consulta_fiscal.js"></script>
@endsection
