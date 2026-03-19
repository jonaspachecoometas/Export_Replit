<div class="dropdown dropdown-portal">
    <button class="btn btn-primary btn-sm dropdown-toggle btn-acoes" type="button">
        Ações
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow">


        @if($item->estado == 'cancelado')
        <li>
            <a class="dropdown-item" target="_blank" href="{{ route('nfe.imprimir-cancela', [$item->id]) }}">
                <i class="ri-printer-line me-1"></i> Imprimir Cancelamento
            </a>
        </li>
        @endif

        @if($item->estado == 'aprovado')
        <li>
            <button type="button" class="dropdown-item" onclick="imprimir('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-printer-line text-primary me-1"></i> Imprimir NFe
            </button>
        </li>

        @can('nfe_transmitir')
        <li>
            <button type="button" class="dropdown-item text-danger" onclick="cancelar('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-close-circle-line me-1"></i> Cancelar
            </button>
        </li>

        <li>
            <button type="button" class="dropdown-item text-warning" onclick="corrigir('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-file-warning-line me-1"></i> Carta de Correção
            </button>
        </li>
        @endcan
        @endif

        @if($item->estado == 'aprovado' || $item->estado == 'rejeitado')
        <li>
            <button type="button" class="dropdown-item" onclick="info('{{$item->motivo_rejeicao}}','{{$item->chave}}','{{$item->estado}}','{{ is_numeric($item->recibo) ? $item->recibo : '' }}')">
                <i class="ri-file-line me-1"></i> Status
            </button>
        </li>
        @endif

        @if($item->estado == 'novo' || $item->estado == 'rejeitado')

        @can('nfe_edit')
        <li>
            <a class="dropdown-item" href="{{ route('nfe.edit', $item->id) }}">
                <i class="ri-edit-line text-warning me-1"></i> Editar
            </a>
        </li>
        @endcan

        @if(__isPlanoFiscal())
        <li>
            <a class="dropdown-item" target="_blank" href="{{ route('nfe.xml-temp', $item->id) }}">
                <i class="ri-file-line me-1"></i> XML Temporário
            </a>
        </li>
        @endif

        @can('nfe_delete')
        <li>
            <button type="button" class="dropdown-item text-danger btn-delete-drop" data-form="delete-nfe-{{ $item->id }}">
                <i class="ri-delete-bin-line me-1"></i> Excluir
            </button>
        </li>
        @endcan

        @if(__isPlanoFiscal())
        @can('nfe_transmitir')
        <li>
            <button type="button" class="dropdown-item text-success" onclick="transmitir('{{$item->id}}')">
                <i class="ri-send-plane-fill me-1"></i> Transmitir
            </button>
        </li>
        @endcan
        @endif
        @endif

        <li>
            <button type="button" class="dropdown-item" onclick="printPedido('{{ $item->id }}')">
                <i class="ri-printer-line me-1"></i> Imprimir Pedido
            </button>
        </li>

        @if(in_array($item->estado, ['aprovado','cancelado','rejeitado']))
        <li>
            <button type="button" class="dropdown-item" onclick="consultar('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-file-search-line me-1"></i> Consultar NFe
            </button>
        </li>
        @endif

        @if(__isPlanoFiscal())
        @can('nfe_edit')
        <li>
            <a class="dropdown-item text-danger" href="{{ route('nfe.alterar-estado', $item->id) }}">
                <i class="ri-arrow-up-down-line me-1"></i> Alterar Estado Fiscal
            </a>
        </li>
        @endcan
        @endif

        <li>
            <a class="dropdown-item" href="{{ route('nfe.show', $item->id) }}">
                <i class="ri-eye-line me-1"></i> Detalhes
            </a>
        </li>

        @if($item->estado != 'aprovado')
        <li>
            <a target="_blank" class="dropdown-item text-danger" href="{{ route('nfe.danfe-temporaria', [$item->id]) }}">
                <i class="ri-printer-fill me-1"></i> DANFE Temporária
            </a>
        </li>
        @endif

        <li>
            <a class="dropdown-item" href="{{ route('nfe.duplicar', $item->id) }}">
                <i class="ri-file-copy-line me-1"></i> Duplicar Venda
            </a>
        </li>

        @if(in_array($item->estado, ['aprovado','cancelado']))
        <li>
            <button type="button" class="dropdown-item" onclick="enviarEmail('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-mail-send-line me-1"></i> Enviar E-mail
            </button>
        </li>

        <li>
            <a class="dropdown-item text-dark" href="{{ route('nfe.download-xml', [$item->id]) }}">
                <i class="ri-download-line me-1"></i> Download XML
            </a>
        </li>
        @endif

        @if($item->sequencia_cce > 0)
        <li>
            <a class="dropdown-item text-warning" target="_blank" href="{{ route('nfe.imprimir-correcao', [$item->id]) }}">
                <i class="ri-printer-fill me-1"></i> Imprimir CC-e
            </a>
        </li>
        @endif

        @if($envioWppLink)
        <li>
            <button type="button" class="dropdown-item text-success" onclick="enviarWpp('{{$item->id}}','nfe')">
                <i class="ri-whatsapp-fill me-1"></i> WhatsApp
            </button>
        </li>
        @endif

        @if(sizeof($item->fatura) > 0)
        <li>
            <a class="dropdown-item" target="_blank" href="{{ route('nfe.imprimir-carne', [$item->id]) }}">
                <i class="ri-currency-line me-1"></i> Imprimir Carnê
            </a>
        </li>
        @endif

    </ul>
</div>

<form id="delete-nfe-{{ $item->id }}" action="{{ route('nfe.destroy', $item->id) }}" method="POST" style="display:none">
    @csrf
    @method('DELETE')
</form>