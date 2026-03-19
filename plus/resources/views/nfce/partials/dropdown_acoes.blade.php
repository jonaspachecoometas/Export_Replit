<div class="dropdown dropdown-portal">
    <button class="btn btn-primary btn-sm dropdown-toggle btn-acoes" type="button">
        Ações
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow">

        <form action="{{ route('nfce.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
            @method('delete')
            @csrf
            @if($item->estado == 'aprovado')
            <li>
                <a class="dropdown-item text-info" title="Imprimir NFCe" target="_blank" href="{{ route('nfce.imprimir', [$item->id]) }}">
                    <i class="ri-printer-line"></i> Imprimir NFCe
                </a>
            </li>
            @can('nfce_transmitir')
            <li>
                <button title="Cancelar NFCe" type="button" class="dropdown-item text-danger" onclick="cancelar('{{$item->id}}', '{{$item->numero}}')">
                    <i class="ri-close-circle-line"></i> Cancelar NFCe
                </button>
            </li>
            @endcan
            @endif
            @if($item->estado == 'aprovado' || $item->estado == 'rejeitado')
            <li>
                <button title="Consultar Chave" type="button" class="dropdown-item text-secondary" onclick="info('{{$item->motivo_rejeicao}}', '{{$item->chave}}', '{{$item->estado}}', '{{$item->recibo}}')">
                    <i class="ri-file-line"></i> Consultar Chave
                </button>
            </li>
            @endif
            @if($item->estado == 'novo' || $item->estado == 'rejeitado')
            @can('nfce_edit')
            <li>
                <a class="dropdown-item text-warning" href="{{ route('nfce.edit', $item->id) }}">
                    <i class="ri-edit-line"></i> Editar
                </a>
            </li>
            @endcan
            <li>
                <a target="_blank" title="XML temporário" class="dropdown-item text-dark" href="{{ route('nfce.xml-temp', $item->id) }}">
                    <i class="ri-file-line"></i> XML temporário
                </a>
            </li>
            @can('nfce_delete')
            <li>
                <button type="button" class="dropdown-item btn-delete text-danger">
                    <i class="ri-delete-bin-line"></i> Excluir
                </button>
            </li>
            @endcan
            @can('nfce_transmitir')
            <li>
                <button title="Transmitir NFCe" type="button" class="dropdown-item text-success" onclick="transmitir('{{$item->id}}')">
                    <i class="ri-send-plane-fill"></i> Transmitir NFCe
                </button>
            </li>
            @endcan
            @endif
            @if($item->estado == 'aprovado' || $item->estado == 'cancelado')
            <li>
                <button title="Consultar NFCe" type="button" class="dropdown-item text-primary" onclick="consultar('{{$item->id}}', '{{$item->numero}}')">
                    <i class="ri-search-eye-line"></i> Consultar NFCe
                </button>
            </li>
            @endif
            @can('nfce_edit')
            <li>
                <a title="Alterar estado fiscal" class="dropdown-item text-secondary" href="{{ route('nfce.alterar-estado', $item->id) }}">
                    <i class="ri-arrow-up-down-line"></i> Alterar estado fiscal
                </a>
            </li>
            @endcan
            <li>
                <a class="dropdown-item text-info" title="Detalhes" href="{{ route('nfce.show', $item->id) }}">
                    <i class="ri-eye-line"></i> Detalhes
                </a>
            </li>
            <li>
                <a class="dropdown-item" title="DANFCE Temporária" target="_blank" href="{{ route('nfce.danfce-temporaria', [$item->id]) }}">
                    <i class="ri-printer-fill"></i> DANFCE Temporária
                </a>
            </li>
            @if($item->estado == 'aprovado')
            <li>
                <button title="Enviar Email" type="button" class="dropdown-item text-warning" onclick="enviarEmail('{{$item->id}}', '{{$item->numero}}')">
                    <i class="ri-mail-send-line"></i> Enviar Email
                </button>
            </li>
            <li>
                <a title="Download XML" href="{{ route('nfce.download-xml', [$item->id]) }}" class="dropdown-item text-info">
                    <i class="ri-download-line"></i> Download XML
                </a>
            </li>
            @endif
        </form>


    </ul>
</div>