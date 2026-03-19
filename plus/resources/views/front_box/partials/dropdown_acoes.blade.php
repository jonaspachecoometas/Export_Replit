<div class="dropdown dropdown-portal">
    <button class="btn btn-primary btn-sm dropdown-toggle btn-acoes" type="button">
        Ações
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow">

        <form action="{{ route('frontbox.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
            @csrf
            @method('delete')

            <li>
                <button type="button" class="dropdown-item" onclick="imprimir('{{$item->id}}')">
                    <i class="ri-printer-line me-1 text-primary"></i> Imprimir Não Fiscal
                </button>
            </li>

            <li>
                <button type="button" class="dropdown-item" onclick="imprimirA4('{{$item->id}}')">
                    <i class="ri-printer-fill me-1"></i> Imprimir A4
                </button>
            </li>

            @can('pdv_delete')
            @if($item->estado == 'novo' || $item->estado == 'rejeitado')
            <li>
                <button type="button" class="dropdown-item text-danger btn-delete" data-id="{{ $item->id }}">
                    <i class="ri-delete-bin-line me-1"></i> Excluir
                </button>
            </li>
            @endif
            @endcan

            @if($item->estado == 'novo' || $item->estado == 'rejeitado')
            <li>
                <button type="button" class="dropdown-item text-success" onclick="transmitir('{{$item->id}}')">
                    <i class="ri-send-plane-fill me-1"></i> Transmitir NFC-e
                </button>
            </li>

            @can('pdv_edit')
            <li>
                <a class="dropdown-item text-warning" href="{{ route('frontbox.edit', $item->id) }}">
                    <i class="ri-pencil-line me-1"></i> Editar Venda
                </a>
            </li>
            @endcan
            @endif

            @if($item->estado != 'aprovado')
            <li>
                <a class="dropdown-item" href="{{ route('frontbox.show', $item->id) }}">
                    <i class="ri-eye-line me-1"></i> Detalhes
                </a>
            </li>

            <li>
                <a class="dropdown-item text-dark" target="_blank" href="{{ route('nfce.xml-temp', $item->id) }}">
                    <i class="ri-file-line me-1"></i> XML Temporário
                </a>
            </li>
            @endif

            @if($item->estado == 'aprovado')
            <li>
                <a class="dropdown-item text-info" target="_blank" href="{{ route('nfce.imprimir', [$item->id]) }}">
                    <i class="ri-printer-line me-1"></i> Imprimir NFC-e
                </a>
            </li>
            @endif

            @if($item->cliente && sizeof($item->fatura) > 0)
            <li>
                <a class="dropdown-item" target="_blank" href="{{ route('frontbox.imprimir-carne', [$item->id]) }}">
                    <i class="ri-currency-line me-1"></i> Imprimir Carnê
                </a>
            </li>
            @endif

            @if($envioWppLink)
            <li>
                <button type="button" class="dropdown-item text-success" onclick="enviarWpp('{{$item->id}}', 'nfce')">
                    <i class="ri-whatsapp-fill me-1"></i> Enviar WhatsApp
                </button>
            </li>
            @endif

            @if($ticketTroca == 1)
            <li>
                <a target="_blank" type="button" class="dropdown-item text-danger" href="{{ route('frontbox.imprimir-ticket-troca', [$item->id]) }}">
                    <i class="ri-printer-line me-1"></i> Imprimir ticket troca
                </a>
            </li>
            @endif

        </form>

    </ul>
</div>