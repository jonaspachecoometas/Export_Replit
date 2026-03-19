<form action="{{ route('frontbox.destroy', $item->id) }}" method="post" id="form-{{$item->id}}" style="width: 380px">
    @method('delete')
    @csrf

    <a title="Imprimir não fiscal" onclick="imprimir('{{$item->id}}')" class="btn btn-primary btn-sm">
        <i class="ri-printer-line"></i>
    </a>

    <a title="Imprimir A4" onclick="imprimirA4('{{$item->id}}')" class="btn btn-dark btn-sm">
        <i class="ri-printer-fill"></i>
    </a>

    @can('pdv_delete')
    @if($item->estado == 'novo' || $item->estado == 'rejeitado')
    <button type="button" class="btn btn-danger btn-sm btn-delete">
        <i class="ri-delete-bin-line"></i>
    </button>
    @endif
    @endcan

    @if($item->estado == 'novo' || $item->estado == 'rejeitado')
    <button title="Transmitir NFCe" type="button" class="btn btn-success btn-sm" onclick="transmitir('{{$item->id}}')">
        <i class="ri-send-plane-fill"></i>
    </button>

    @can('pdv_edit')
    <a class="btn btn-warning btn-sm" title="Editar venda" href="{{ route('frontbox.edit', $item->id) }}">
        <i class="ri-pencil-line"></i>
    </a>
    @endcan
    @endif

    @if($item->estado != 'aprovado')
    <a class="btn btn-ligth btn-sm" title="Detalhes" href="{{ route('frontbox.show', $item->id) }}">
        <i class="ri-eye-line"></i>
    </a>
    <a target="_blank" title="XML temporário" class="btn btn-dark btn-sm" href="{{ route('nfce.xml-temp', $item->id) }}">
        <i class="ri-file-line"></i>
    </a>
    @endif

    @if($item->estado == 'aprovado')
    <a class="btn btn-info btn-sm" title="Imprimir NFCe" target="_blank" href="{{ route('nfce.imprimir', [$item->id]) }}">
        <i class="ri-printer-line"></i>
    </a>
    @endif

    @if($item->cliente && sizeof($item->fatura) > 0)
    <a target="_blank" title="Imprimir carnê" href="{{ route('frontbox.imprimir-carne', [$item->id]) }}" class="btn btn-light btn-sm">
        <i class="ri-currency-line"></i>
    </a>
    @endif

    @if($envioWppLink)
    <button title="Enviar Mensagem" onclick="enviarWpp('{{$item->id}}', 'nfce')" type="button" class="btn btn-success btn-sm">
        <i class="ri-whatsapp-fill"></i>
    </button>
    @endif

    @if($ticketTroca == 1)
        <a title="Imprimir ticket de troca" target="_blank" type="button" class="btn btn-secondary btn-sm" href="{{ route('frontbox.imprimir-ticket-troca', [$item->id]) }}">
            <i class="ri-printer-line"></i>
        </a>
    @endif
</form>