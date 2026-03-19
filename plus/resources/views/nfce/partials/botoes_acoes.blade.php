<form action="{{ route('nfce.destroy', $item->id) }}" method="post" id="form-{{$item->id}}" style="width: 320px">
    @method('delete')
    @csrf
    @if($item->estado == 'aprovado')
    <a class="btn btn-primary btn-sm" title="Imprimir NFCe" target="_blank" href="{{ route('nfce.imprimir', [$item->id]) }}">
        <i class="ri-printer-line"></i>
    </a>
    @can('nfce_transmitir')
    <button title="Cancelar NFCe" type="button" class="btn btn-danger btn-sm" onclick="cancelar('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-close-circle-line"></i>
    </button>
    @endcan
    @endif
    @if($item->estado == 'aprovado' || $item->estado == 'rejeitado')
    <button title="Consultar Chave" type="button" class="btn btn-dark btn-sm" onclick="info('{{$item->motivo_rejeicao}}', '{{$item->chave}}', '{{$item->estado}}', '{{$item->recibo}}')">
        <i class="ri-file-line"></i>
    </button>
    @endif
    @if($item->estado == 'novo' || $item->estado == 'rejeitado')
    @can('nfce_edit')
    <a class="btn btn-warning btn-sm" href="{{ route('nfce.edit', $item->id) }}">
        <i class="ri-edit-line"></i>
    </a>
    @endcan
    <a target="_blank" title="XML temporário" class="btn btn-light btn-sm" href="{{ route('nfce.xml-temp', $item->id) }}">
        <i class="ri-file-line"></i>
    </a>
    @can('nfce_delete')
    <button type="button" class="btn btn-danger btn-sm btn-delete">
        <i class="ri-delete-bin-line"></i>
    </button>
    @endcan
    @can('nfce_transmitir')
    <button title="Transmitir NFCe" type="button" class="btn btn-success btn-sm" onclick="transmitir('{{$item->id}}')">
        <i class="ri-send-plane-fill"></i>
    </button>
    @endcan
    @endif
    @if($item->estado == 'aprovado' || $item->estado == 'cancelado')
    <button title="Consultar NFCe" type="button" class="btn btn-light btn-sm" onclick="consultar('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-search-eye-line"></i>
    </button>
    @endif
    @can('nfce_edit')
    <a title="Alterar estado fiscal" class="btn btn-danger btn-sm" href="{{ route('nfce.alterar-estado', $item->id) }}">
        <i class="ri-arrow-up-down-line"></i>
    </a>
    @endcan
    <a class="btn btn-ligth btn-sm" title="Detalhes" href="{{ route('nfce.show', $item->id) }}">
        <i class="ri-eye-line"></i>
    </a>
    <a class="btn btn-danger btn-sm" title="DANFCE Temporária" target="_blank" href="{{ route('nfce.danfce-temporaria', [$item->id]) }}">
        <i class="ri-printer-fill"></i>
    </a>
    @if($item->estado == 'aprovado')
    <button title="Enviar Email" type="button" class="btn btn-light btn-sm" onclick="enviarEmail('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-mail-send-line"></i>
    </button>
    <a title="Download XML" href="{{ route('nfce.download-xml', [$item->id]) }}" class="btn btn-dark btn-sm">
        <i class="ri-download-line"></i>
    </a>
    @endif
</form>