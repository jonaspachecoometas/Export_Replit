<form action="{{ route('nfe.destroy', $item->id) }}" method="post" id="form-{{$item->id}}" style="width: 300px;">
    @method('delete')
    @csrf

    @can('compras_edit')
    <a class="btn btn-warning btn-sm" href="{{ route('nfe.edit', $item->id) }}">
        <i class="ri-edit-line"></i>
    </a>
    @endcan

    @if($item->estado == 'cancelado')
    <a class="btn btn-danger btn-sm" target="_blank" href="{{ route('nfe.imprimir-cancela', [$item->id]) }}">
        <i class="ri-printer-line"></i>
    </a>
    @endif
    @if($item->estado == 'aprovado')
    <a class="btn btn-primary btn-sm" target="_blank" href="{{ route('nfe.imprimir', [$item->id]) }}">
        <i class="ri-printer-line"></i>
    </a>
    @if(!$item->chave_importada)
    @can('nfe_transmitir')
    <button title="Cancelar NFe" type="button" class="btn btn-danger btn-sm" onclick="cancelar('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-close-circle-line"></i>
    </button>
    <button title="Corrigir NFe" type="button" class="btn btn-warning btn-sm" onclick="corrigir('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-file-warning-line"></i>
    </button>
    @endcan
    @endif
    @endif

    @if($item->estado == 'aprovado' || $item->estado == 'rejeitado')
    <button type="button" class="btn btn-dark btn-sm" onclick="info('{{$item->motivo_rejeicao}}', '{{$item->chave}}', '{{$item->estado}}', '{{$item->recibo}}')">
        <i class="ri-file-line"></i>
    </button>
    @endif

    @if($item->estado == 'novo' || $item->estado == 'rejeitado')
    <a target="_blank" title="XML temporário" class="btn btn-light btn-sm" href="{{ route('nfe.xml-temp', $item->id) }}">
        <i class="ri-file-line"></i>
    </a>
    @can('compras_delete')
    <button type="button" class="btn btn-danger btn-sm btn-delete"><i class="ri-delete-bin-line"></i></button>
    @endcan
    @if(!$item->chave_importada)
    @can('nfe_transmitir')
    <button title="Transmitir NFe" type="button" class="btn btn-success btn-sm" onclick="transmitir('{{$item->id}}')">
        <i class="ri-send-plane-fill"></i>
    </button>
    @endcan
    @endif
    @endif

    @if($item->estado == 'aprovado' || $item->estado == 'cancelado')
    <button title="Consultar NFe" type="button" class="btn btn-light btn-sm" onclick="consultar('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-file-search-line"></i>
    </button>
    @endif

    @if($item->isItemValidade())
    <a href="{{ route('compras.info-validade', $item->id) }}" title="Editar Validade" type="button" class="btn btn-info btn-sm"><i class="ri-pencil-line"></i></a>
    @endif

    <a class="btn btn-info btn-sm" title="Imprimir Pedido" onclick="printPedido('{{ $item->id }}')">
        <i class="ri-printer-line"></i>
    </a>

    <a class="btn btn-light btn-sm" title="Gerar etiqueta" target="_blank" href="{{ route('compras.etiqueta', [$item->id]) }}">
        <i class="ri-barcode-box-line"></i>
    </a>

    @if($item->chave_importada)
    <a class="btn btn-dark btn-sm" title="Download XML importado" target="_blank" href="{{ route('compras.download-xml-importado', [$item->id]) }}">
        <i class="ri-download-line"></i>
    </a>
    @endif

    @if($item->estado == 'aprovado')
    <a title="Download XML" href="{{ route('nfe.download-xml', [$item->id]) }}" class="btn btn-dark btn-sm">
        <i class="ri-download-line"></i>
    </a>
    @endif
</form>