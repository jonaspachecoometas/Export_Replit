<form style="width: 330px" action="{{ route('produtos.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
    @method('delete')
    @can('produtos_edit')
    <a class="btn btn-warning btn-sm" href="{{ route('produtos.edit', [$item->id]) }}">
        <i class="ri-edit-line"></i>
    </a>
    @endcan
    @csrf
    @can('produtos_delete')
    <button type="button" class="btn btn-delete btn-sm btn-danger">
        <i class="ri-delete-bin-line"></i>
    </button>
    @endcan
    @if($item->composto == true)
    <a class="btn btn-info btn-sm" href="{{ route('produto-composto.show', [$item->id]) }}" title="Ver composição"><i class="ri-search-eye-fill"></i></a>
    @endif
    @if($item->alerta_validade != '')
    <a title="Ver lote e vencimento" type="button" class="btn btn-light btn-sm" onclick="infoVencimento('{{$item->id}}')" data-bs-toggle="modal" data-bs-target="#info_vencimento"><i class="ri-eye-line"></i></a>
    @endif
    <a title="Ver movimentações" href="{{ route('produtos.show', [$item->id]) }}" class="btn btn-dark btn-sm"><i class="ri-draft-line"></i></a>
    <a class="btn btn-primary btn-sm" href="{{ route('produtos.duplicar', [$item->id]) }}" title="Duplicar produto">
        <i class="ri-file-copy-line"></i>
    </a>
    <a class="btn btn-light btn-sm" href="{{ route('produtos.etiqueta', [$item->id]) }}" title="Gerar etiqueta">
        <i class="ri-barcode-box-line"></i>
    </a>
    @if(__countLocalAtivo() > 1)
    <a class="btn btn-dark btn-sm" href="{{ route('produto-tributacao-local.index', [$item->id]) }}" title="Valores por local">
        <i class="ri-percent-fill"></i>
    </a>
    @endif
</form>