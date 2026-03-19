<div class="dropdown dropdown-portal">
    <button class="btn btn-primary btn-sm dropdown-toggle btn-acoes" type="button">
        Ações
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow">


        @can('compras_edit')
        <li>
            <a class="dropdown-item text-warning" href="{{ route('nfe.edit', $item->id) }}">
                <i class="ri-edit-line me-1"></i> Editar
            </a>
        </li>
        @endcan

        @if($item->estado == 'cancelado')
        <li>
            <a class="dropdown-item text-danger" target="_blank" href="{{ route('nfe.imprimir-cancela', [$item->id]) }}">
                <i class="ri-printer-line me-1"></i> Cancelamento
            </a>
        </li>
        @endif

        @if($item->estado == 'aprovado')
        <li>
            <a class="dropdown-item text-primary" target="_blank" href="{{ route('nfe.imprimir', [$item->id]) }}">
                <i class="ri-printer-line me-1"></i> Imprimir NFe
            </a>
        </li>

        @if(!$item->chave_importada)
        @can('nfe_transmitir')
        <li>
            <button type="button" class="dropdown-item text-danger" onclick="cancelar('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-close-circle-line me-1"></i> Cancelar
            </button>
        </li>
        <li>
            <button type="button" class="dropdown-item text-warning" onclick="corrigir('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-file-warning-line me-1"></i> CC-e
            </button>
        </li>
        @endcan
        @endif
        @endif

        @if($item->estado == 'aprovado' || $item->estado == 'rejeitado')
        <li>
            <button type="button" class="dropdown-item" onclick="info('{{$item->motivo_rejeicao}}','{{$item->chave}}','{{$item->estado}}','{{$item->recibo}}')">
                <i class="ri-file-line me-1"></i> Status
            </button>
        </li>
        @endif

        @if($item->estado == 'novo' || $item->estado == 'rejeitado')
        <li>
            <a class="dropdown-item" target="_blank" href="{{ route('nfe.xml-temp', $item->id) }}">
                <i class="ri-file-line me-1"></i> XML Temporário
            </a>
        </li>

        @can('compras_delete')
        <li>
            <button type="button" class="dropdown-item text-danger btn-delete-drop" data-form="delete-nfe-{{ $item->id }}">
                <i class="ri-delete-bin-line me-1"></i> Excluir
            </button>
        </li>
        @endcan

        @if(!$item->chave_importada)
        @can('nfe_transmitir')
        <li>
            <button type="button" class="dropdown-item text-success" onclick="transmitir('{{$item->id}}')">
                <i class="ri-send-plane-fill me-1"></i> Transmitir
            </button>
        </li>
        @endcan
        @endif
        @endif

        @if($item->estado == 'aprovado' || $item->estado == 'cancelado')
        <li>
            <button type="button" class="dropdown-item" onclick="consultar('{{$item->id}}','{{$item->numero}}')">
                <i class="ri-file-search-line me-1"></i> Consultar
            </button>
        </li>
        @endif

        @if($item->isItemValidade())
        <li>
            <a class="dropdown-item text-info" href="{{ route('compras.info-validade', $item->id) }}">
                <i class="ri-pencil-line me-1"></i> Validade
            </a>
        </li>
        @endif

        <li>
            <button type="button" class="dropdown-item text-info" onclick="printPedido('{{$item->id}}')">
                <i class="ri-printer-line me-1"></i> Pedido
            </button>
        </li>

        <li>
            <a class="dropdown-item" target="_blank" href="{{ route('compras.etiqueta', [$item->id]) }}">
                <i class="ri-barcode-box-line me-1"></i> Etiqueta
            </a>
        </li>

        @if($item->chave_importada)
        <li>
            <a class="dropdown-item text-dark" target="_blank" href="{{ route('compras.download-xml-importado', [$item->id]) }}">
                <i class="ri-download-line me-1"></i> XML Importado
            </a>
        </li>
        @endif

        @if($item->estado == 'aprovado')
        <li>
            <a class="dropdown-item text-dark" target="_blank" href="{{ route('nfe.download-xml', [$item->id]) }}">
                <i class="ri-download-line me-1"></i> XML
            </a>
        </li>
        @endif
    </ul>
</div>

<form id="delete-nfe-{{ $item->id }}" action="{{ route('nfe.destroy', $item->id) }}" method="POST" style="display:none">
    @csrf
    @method('DELETE')
</form>
