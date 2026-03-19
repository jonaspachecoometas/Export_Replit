<div class="row g-2">
    @foreach($produtos as $prod)
    <div class="col-6 col-md-4 col-xl-3">
        <div class="card-produto" onclick="addProdutos('{{ $prod->id }}')">

            @if($prod->precoComPromocao())
            <div class="badge-promocao">Promoção</div>
            @endif


            <button type="button" class="btn-info-produto" onclick="event.stopPropagation(); abrirModalProdutoAjax('{{ $prod->id }}')">
                <i class="ri-information-line"></i>
            </button>

            <div class="card-produto-img">
                <img src="{{ $prod->img }}" alt="{{ $prod->nome }}">
            </div>

            <p class="nome-produto">{{ $prod->nome }}</p>

            <p class="preco-produto">
                @if($prod->precoComPromocao())
                R$ {{ __moeda($prod->precoComPromocao()->valor) }}
                @else
                {{ $prod->valor_unitario > 0 ? 'R$ '.__moeda($prod->valor_unitario) : '--' }}
                @endif
            </p>

        </div>

    </div>
    @endforeach
</div>
