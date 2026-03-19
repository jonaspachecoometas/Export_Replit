@extends('layouts.app', ['title' => 'Configurações de Custo'])
@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="row">
                    <div class="col-4">
                        <h4>Configurações de Custo</h4>
                    </div>
                    <div class="col-8 text-end">
                        <a class="btn btn-outline-primary" href="{{ route('custo-configuracao.analise') }}">
                            <i class="ri-bar-chart-line"></i>
                            Análise de Margem
                        </a>
                    </div>
                </div>
                <hr>
                <div class="row mt-3">
                    <h5>Configuração Geral</h5>
                    <div class="alert alert-info py-2">
                        <i class="ri-information-line"></i>
                        Estes percentuais serão aplicados a <b>todos os produtos</b>,
                        exceto aqueles que possuírem configuração específica.
                    </div>
                    <div class="col-lg-12">
                        {!!Form::open()->fill($item)
                        ->post()
                        ->route('custo-configuracao.store')
                        !!}
                        
                        <div class="row g-2">
                            <div class="col-md-2">
                                {!!Form::tel('imposto_percentual', 'Imposto')
                                ->attrs(['class' => 'percentual'])
                                !!}
                            </div>
                            <div class="col-md-2">
                                {!!Form::tel('taxa_cartao_percentual', 'Taxa de cartão')
                                ->attrs(['class' => 'percentual'])
                                !!}
                            </div>
                            <div class="col-md-2">
                                {!!Form::tel('despesas_percentual', 'Outras despesas')
                                ->attrs(['class' => 'percentual'])
                                !!}
                            </div>

                            <div class="col-md-2">
                                {!!Form::tel('margem_minima_percentual', 'Margem mínima')
                                ->attrs(['class' => 'percentual'])
                                ->required()
                                !!}
                            </div>

                            <div class="col-12" style="text-align: right;">
                                <button type="submit" class="btn btn-success px-5" id="btn-store">Salvar</button>
                            </div>
                        </div>
                        {!!Form::close()!!}
                    </div>
                </div>

                <!-- por produto -->

                <hr>
                <h5 class="mt-4 text-muted">Exceções por Produto</h5>

                {!!Form::open()->fill(request()->all())
                ->get()
                !!}
                <div class="row mt-3">
                    <div class="col-md-3">
                        {!!Form::text('pesquisa', 'Buscar produto por nome ou código')
                        !!}
                    </div>
                    <div class="col-md-3 text-left ">
                        <br>
                        <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                        <a id="clear-filter" class="btn btn-danger" href="{{ route('custo-configuracao.index') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                    </div>
                </div>
                {!!Form::close()!!}

                <div class="row mb-2">
                    <div class="col-md-12 text-end">
                        <button class="btn btn-primary" id="btnAdicionarProduto">
                            <i class="ri-add-line"></i>
                            Adicionar configuração
                        </button>
                    </div>
                </div>


                <div class="table-responsive">
                    <table class="table table-sm table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Imagem</th>
                                <th>Produto</th>
                                <th>Imposto</th>
                                <th>Taxa cartão</th>
                                <th>Outras Despesas</th>
                                <th>Margem mínima</th>
                                <th width="120">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($produtos as $p)
                            <tr>
                                <td><img class="img-60" src="{{ $p->produto->img }}"></td>
                                <td>
                                    <strong>{{ $p->produto->nome }}</strong><br>
                                    <small class="text-muted">
                                        {{ $p->produto->codigo_barras }}
                                    </small>
                                </td>

                                <td>{{ $p->imposto_percentual ?? '—' }}%</td>
                                <td>{{ $p->taxa_cartao_percentual ?? '—' }}%</td>
                                <td>{{ $p->despesas_percentual ?? '—' }}%</td>
                                <td>
                                    <span class="badge bg-warning text-dark">
                                        {{ $p->margem_minima_percentual ?? '—' }}%
                                    </span>
                                </td>

                                <td>
                                    <button class="btn btn-sm btn-outline-warning btn-editar" data-item='@json($p)' data-produto='@json($p->produto)'
                                        >
                                        <i class="ri-pencil-line"></i>
                                    </button>

                                    <form method="POST" action="{{ route('custo-configuracao-produto.destroy', $p->id) }}" class="d-inline" id="form-{{$p->id}}">
                                        @csrf
                                        @method('DELETE')
                                        <button class="btn btn-sm btn-outline-danger btn-delete">
                                            <i class="ri-delete-bin-line"></i>
                                        </button>
                                    </form>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="6" class="text-center text-muted">
                                    Nenhum produto com configuração específica
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                {{ $produtos->links() }}


            </div>
        </div>
    </div>
</div>

@include('config_custo._modal_produto')
@endsection
@section('js')
<script type="text/javascript">


    $('#btnAdicionarProduto').on('click', function () {

        $('#modal_produto_id').val('');
        $('#modal_produto_nome').text('Novo produto');

        $('#modalProdutoCusto #inp-produto_id').prop('disabled', 0);

        var newOption = new Option('', '', false, false);
        $('#modalProdutoCusto #inp-produto_id').html('');

        $('#usar_personalizado').prop('checked', true);
        $('#campos-personalizados').show();
        $('#campos-personalizados input').val('');

        $('#modalProdutoCusto').modal('show');
    });


    $('.btn-editar').on('click', function () {

        let item = $(this).data('item');
        let produto = $(this).data('produto');

        $('#modal_produto_nome').text(produto.nome);
        $('#modal_produto_id').val(item.produto_id);
        $('#modalProdutoCusto #inp-produto_id').prop('disabled', 1);

        var newOption = new Option(produto.nome, item.produto_id, false, false);
        $('#modalProdutoCusto #inp-produto_id').append(newOption).trigger('change');

        $('#modalProdutoCusto #inp-imposto_percentual').val(item.imposto_percentual);
        $('#modalProdutoCusto #inp-taxa_cartao_percentual').val(item.taxa_cartao_percentual);
        $('#modalProdutoCusto #inp-despesas_percentual').val(item.despesas_percentual);
        $('#modalProdutoCusto #inp-margem_minima_percentual').val(item.margem_minima_percentual);

        $('#modalProdutoCusto').modal('show');
    });

    $("#inp-produto_id").select2({
        minimumInputLength: 2,
        language: "pt-BR",
        placeholder: "Digite para buscar o produto",
        width: "100%",
        dropdownParent: $('#modalProdutoCusto'),
        ajax: {
            cache: true,
            url: path_url + "api/produtos",
            dataType: "json",
            data: function (params) {
                let empresa_id = $('#empresa_id').val()
                console.clear();
                var query = {
                    pesquisa: params.term,
                    empresa_id: empresa_id,
                    usuario_id: $('#usuario_id').val()
                };
                return query;
            },
            processResults: function (response) {
                var results = [];


                $.each(response, function (i, v) {
                    var o = {};
                    o.id = v.id;

                    o.text = v.nome
                    if(v.codigo_barras){
                        o.text += ' [' + v.codigo_barras  + ']';
                    }
                    o.value = v.id;
                    results.push(o);
                });
                return {
                    results: results,
                };
            },
        },
    });

</script>
@endsection
