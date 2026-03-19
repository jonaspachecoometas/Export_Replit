<form action="{{ route('nfe.destroy', $item->id) }}" method="post" id="form-{{$item->id}}" style="width: 420px">
    @method('delete')
    @csrf

    @if($item->estado == 'cancelado')
    <a class="btn btn-danger btn-sm" target="_blank" href="{{ route('nfe.imprimir-cancela', [$item->id]) }}">
        <i class="ri-printer-line"></i>
    </a>
    @endif

    @if($item->estado == 'aprovado')
    <button type="button" onclick="imprimir('{{$item->id}}', '{{$item->numero}}')" class="btn btn-primary btn-sm" title="Imprimir NFe">
        <i class="ri-printer-line"></i>
    </button>
    @can('nfe_transmitir')
    <button title="Cancelar NFe" type="button" class="btn btn-danger btn-sm" onclick="cancelar('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-close-circle-line"></i>
    </button>
    <button title="Corrigir NFe" type="button" class="btn btn-warning btn-sm" onclick="corrigir('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-file-warning-line"></i>
    </button>
    @endcan
    @endif

    @if($item->estado == 'aprovado' || $item->estado == 'rejeitado')
    <button title="Consultar status" type="button" class="btn btn-dark btn-sm" onclick="info('{{$item->motivo_rejeicao}}', '{{$item->chave}}', '{{$item->estado}}', '{{is_numeric($item->recibo) ? $item->recibo : ''}}')">
        <i class="ri-file-line"></i>
    </button>
    @endif

    @if($item->estado == 'novo' || $item->estado == 'rejeitado')
    @can('nfe_edit')
    <a class="btn btn-warning btn-sm" href="{{ route('nfe.edit', $item->id) }}">
        <i class="ri-edit-line"></i>
    </a>
    @endcan

    @if(__isPlanoFiscal())
    <a target="_blank" title="XML temporário" class="btn btn-light btn-sm" href="{{ route('nfe.xml-temp', $item->id) }}">
        <i class="ri-file-line"></i>
    </a>
    @endif

    @can('nfe_delete')
    <button type="button" class="btn btn-danger btn-sm btn-delete"><i class="ri-delete-bin-line"></i></button>
    @endcan

    @if(__isPlanoFiscal())
    @can('nfe_transmitir')
    <button title="Transmitir NFe" type="button" class="btn btn-success btn-sm" onclick="transmitir('{{$item->id}}')">
        <i class="ri-send-plane-fill"></i>
    </button>
    @endcan
    @endif
    @endif

    <a class="btn btn-info btn-sm" title="Imprimir Pedido" onclick="printPedido('{{ $item->id }}')">
        <i class="ri-printer-line"></i>
    </a>

    @if($item->estado == 'aprovado' || $item->estado == 'cancelado' || $item->estado == 'rejeitado')
    <button title="Consultar NFe" type="button" class="btn btn-light btn-sm" onclick="consultar('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-file-search-line"></i>
    </button>
    @endif

    @if(__isPlanoFiscal())
    @can('nfe_edit')
    <a title="Alterar estado fiscal" class="btn btn-danger btn-sm" href="{{ route('nfe.alterar-estado', $item->id) }}">
        <i class="ri-arrow-up-down-line"></i>
    </a>
    @endcan
    @endif

    <a class="btn btn-ligth btn-sm" title="Detalhes" href="{{ route('nfe.show', $item->id) }}">
        <i class="ri-eye-line"></i>
    </a>

    @if($item->estado != 'aprovado')
    <a class="btn btn-danger btn-sm" title="DANFE Temporária" target="_blank" href="{{ route('nfe.danfe-temporaria', [$item->id]) }}">
        <i class="ri-printer-fill"></i>
    </a>
    @endif

    <a class="btn btn-primary btn-sm" href="{{ route('nfe.duplicar', [$item->id]) }}" title="Duplicar venda">
        <i class="ri-file-copy-line"></i>
    </a>

    @if($item->estado == 'aprovado' || $item->estado == 'cancelado')
    <button title="Enviar Email" type="button" class="btn btn-light btn-sm" onclick="enviarEmail('{{$item->id}}', '{{$item->numero}}')">
        <i class="ri-mail-send-line"></i>
    </button>
    <a title="Download XML" href="{{ route('nfe.download-xml', [$item->id]) }}" class="btn btn-dark btn-sm">
        <i class="ri-download-line"></i>
    </a>
    @endif

    @if($item->sequencia_cce > 0)
    <a class="btn btn-warning btn-sm" target="_blank" href="{{ route('nfe.imprimir-correcao', [$item->id]) }}">
        <i class="ri-printer-fill"></i>
    </a>
    @endif

    @if($envioWppLink)
    <button title="Enviar Mensagem" onclick="enviarWpp('{{$item->id}}', 'nfe')" type="button" class="btn btn-success btn-sm">
        <i class="ri-whatsapp-fill"></i>
    </button>
    @endif

    @if(sizeof($item->fatura) > 0)
    <a target="_blank" title="Imprimir carnê" href="{{ route('nfe.imprimir-carne', [$item->id]) }}" class="btn btn-light btn-sm">
        <i class="ri-currency-line"></i>
    </a>
    @endif
</form>