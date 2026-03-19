<div class="dropdown dropdown-portal">
    <button class="btn btn-primary btn-sm dropdown-toggle btn-acoes" type="button">
        Ações
    </button>

    <ul class="dropdown-menu dropdown-menu-end shadow">
        <form action="{{ route('produtos.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
            @method('delete')
            @csrf
            @can('produtos_edit')
            <li>
                <a class="dropdown-item" href="{{ route('produtos.edit', [$item->id]) }}">
                    <i class="ri-edit-line text-warning me-1"></i> Editar
                </a>
            </li>
            @endcan

            @can('produtos_delete')
            <li>
                <button class="dropdown-item text-danger btn-delete" data-id="{{ $item->id }}">
                    <i class="ri-delete-bin-line me-1"></i> Excluir
                </button>
            </li>
            @endcan

            @if($item->composto == true)
            <li>
                <a class="dropdown-item" href="{{ route('produto-composto.show', [$item->id]) }}">
                    <i class="ri-search-eye-fill text-info me-1"></i> Ver composição
                </a>
            </li>
            @endif

            @if($item->alerta_validade != '')
            <li>
                <button class="dropdown-item" onclick="infoVencimento('{{ $item->id }}')" data-bs-toggle="modal" data-bs-target="#info_vencimento">
                    <i class="ri-eye-line me-1"></i> Lote e validade
                </button>
            </li>
            @endif

            <li>
                <a class="dropdown-item" href="{{ route('produtos.show', [$item->id]) }}">
                    <i class="ri-draft-line me-1"></i> Movimentações
                </a>
            </li>

            <li>
                <a class="dropdown-item" href="{{ route('produtos.duplicar', [$item->id]) }}">
                    <i class="ri-file-copy-line text-primary me-1"></i> Duplicar
                </a>
            </li>

            <li>
                <a class="dropdown-item" href="{{ route('produtos.etiqueta', [$item->id]) }}">
                    <i class="ri-barcode-box-line me-1"></i> Etiqueta
                </a>
            </li>

            @if(__countLocalAtivo() > 1)
            <li>
                <a class="dropdown-item" href="{{ route('produto-tributacao-local.index', [$item->id]) }}">
                    <i class="ri-percent-fill me-1"></i> Valores por local
                </a>
            </li>
            @endif
        </form>
    </ul>
</div>