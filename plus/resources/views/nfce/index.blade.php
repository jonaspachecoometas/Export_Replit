@extends('layouts.app', ['title' => 'NFCe'])
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
                <div class="row">
                    <div class="col-md-2">
                        @can('nfce_view')
                        <a href="{{ route('nfce.create') }}" class="btn btn-success">
                            <i class="ri-add-circle-fill"></i>
                            Nova NFCe
                        </a>
                        @endcan
                    </div>
                    <div class="col-md-8"></div>

                    <div class="col-md-2">
                        <button id="btn-consulta-sefaz" class="btn btn-dark" style="float: right;">
                            <i class="ri-refresh-line"></i>
                            Consultar Status Sefaz
                        </button>
                    </div>
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
                            {!!Form::tel('numero_nfce', 'Número NFCe')
                            !!}
                        </div>

                        @if(__countLocalAtivo() > 1)
                        <div class="col-md-2">
                            {!!Form::select('local_id', 'Local', ['' => 'Selecione'] + __getLocaisAtivoUsuario()->pluck('descricao', 'id')->all())
                            ->attrs(['class' => 'select2'])
                            !!}
                        </div>
                        @endif

                        <div class="col-md-4">
                            <br>

                            <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                            <a id="clear-filter" class="btn btn-danger" href="{{ route('nfce.index') }}"><i class="ri-eraser-fill"></i>Limpar</a>
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
                <div class="col-lg-12 mt-4">
                    <div class="table-responsive">
                        <table class="table table-striped table-centered mb-0">
                            <thead class="table-dark">
                                <tr>
                                    <th>Ações</th>
                                    <th>#</th>
                                    <th>Cliente</th>
                                    <th>CPF/CNPJ</th>
                                    @if(__countLocalAtivo() > 1)
                                    <th>Local</th>
                                    @endif
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
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($data as $item)
                                <tr>

                                    <td class="text-start d-none d-md-table-cell">
                                        @if($usarDropdown)
                                        @include('nfce.partials.dropdown_acoes', ['item' => $item])
                                        @else
                                        @include('nfce.partials.botoes_acoes', ['item' => $item])
                                        @endif
                                    </td>
                                    
                                    <td data-label="#"> {{ $item->numero_sequencial }}</td>
                                    <td data-label="Cliente">{{ $item->cliente ? $item->cliente->razao_social : ($item->cliente_nome != "" ? $item->cliente_nome : "--") }}</td>
                                    <td data-label="CPF/CNPJ">{{ $item->cliente ? $item->cliente->cpf_cnpj : ($item->cliente_cpf_cnpj != "" ? $item->cliente_cpf_cnpj : "--") }}</td>
                                    @if(__countLocalAtivo() > 1)
                                    <td data-label="Local" class="text-danger">{{ $item->localizacao->descricao }}</td>
                                    @endif
                                    <td data-label="Número">{{ $item->numero }}</td>
                                    <td data-label="Número Série">{{ $item->numero_serie }}</td>
                                    <td data-label="Valor">{{ number_format($item->total, 2, ',', '.') }}</td>
                                    @if(__isPlanoFiscal())
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
                                    @endif
                                    <td data-label="Data de cadastro"><label style="width: 120px">{{ __data_pt($item->created_at) }}</label></td>
                                    <td data-label="Data de emissão"><label style="width: 120px">{{ $item->data_emissao ? __data_pt($item->data_emissao) : '--' }}</label></td>
                                    
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="11" class="text-center">Nada encontrado</td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>

                    </div>
                    {!! $data->appends(request()->all())->links() !!}
                </div>
                <h5 class="mt-2">Soma: <strong class="text-success">R$ {{ __moeda($data->sum('total')) }}</strong></h5>
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

<div class="modal fade" id="modal-cancelar" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Cancelar NFCe <strong class="ref-numero"></strong></h5>
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
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Enviar email NFCe <strong class="ref-numero"></strong></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">

                    <div class="col-md-12">
                        {!!Form::text('email', 'Email')
                        ->required()
                        ->type('email')
                        !!}
                    </div>

                    <div class="col-md-4 mt-2">
                        {!!Form::checkbox('danfe', 'DANFCE Cupom')
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
                <button type="button" id="btn-enviar-email" class="btn btn-success">Enviar Email</button>
            </div>
        </div>
    </div>
</div>

@endsection

@section('js')
<script type="text/javascript">
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
        $.post(path_url + 'api/nfce_painel/consulta-status-sefaz', { 
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
            try{
                swal("Erro", err.responseText, "error")
            }catch{
                swal("Erro", "Algo deu errado", "error")
            }
        })
    })

</script>
<script type="text/javascript" src="js/nfce_transmitir.js"></script>
<script type="text/javascript" src="js/consulta_fiscal.js"></script>

@endsection
