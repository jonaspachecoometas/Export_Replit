@extends('layouts.app', ['title' => 'Análise de Custo'])
@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="row mt-3">

                    <div class="col-lg-12">
                        {!!Form::open()->fill(request()->all())
                        ->get()
                        !!}
                        <div class="row mt-3">
                            <div class="col-md-3">
                                <input type="text" name="q" class="form-control"
                                placeholder="Buscar produto"
                                value="{{ request('q') }}">
                            </div>

                            <div class="col-md-2">
                                <select name="status" class="form-select">
                                    <option value="">Todos</option>
                                    <option value="prejuizo" @selected(request('status')=='prejuizo')>Prejuízo</option>
                                    <option value="baixa" @selected(request('status')=='baixa')>Margem baixa</option>
                                    <option value="ok" @selected(request('status')=='ok')>Saudável</option>
                                </select>
                            </div>
                            <div class="col-md-3 text-left">
                                <button class="btn btn-primary" type="submit"> <i class="ri-search-line"></i>Pesquisar</button>
                                <a id="clear-filter" class="btn btn-danger" href="{{ route('custo-configuracao.analise') }}"><i class="ri-eraser-fill"></i>Limpar</a>
                            </div>
                        </div>
                        {!!Form::close()!!}
                    </div>
                </div>

                <div class="row m-3">
                    <div class="col-md-3">
                        <div class="card border-danger">
                            <div class="card-body text-center">
                                <h3 class="text-danger">{{ $totais['prejuizo'] }}</h3>
                                <small class="text-muted">Produtos com prejuízo</small>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card border-warning">
                            <div class="card-body text-center">
                                <h3 class="text-warning">{{ $totais['baixa'] }}</h3>
                                <small class="text-muted">Margem baixa</small>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card border-success">
                            <div class="card-body text-center">
                                <h3 class="text-success">{{ $totais['ok'] }}</h3>
                                <small class="text-muted">Margem saudável</small>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="card border-secondary">
                            <div class="card-body text-center">
                                <h3>{{ $totais['total'] }}</h3>
                                <small class="text-muted">Total analisado</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row ">
                    <div class="table-responsive">
                        <table class="table table-sm table-hover align-middle">
                            <thead class="table-dark">
                                <tr>
                                    <th>Produto</th>
                                    <th>Compra</th>
                                    <th>Venda</th>
                                    <th>Custo real</th>
                                    <th>Margem (R$)</th>
                                    <th>Margem (%)</th>
                                    <th>Status</th>
                                    <th width="90">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse($produtos as $item)
                                <tr>
                                    <td>
                                        <strong>{{ $item['produto']->nome }}</strong><br>
                                        <small class="text-muted">
                                            {{ $item['produto']->codigo_barras }}
                                        </small>
                                    </td>

                                    <td>R$ {{ __moeda($item['produto']->valor_compra) }}</td>
                                    <td>R$ {{ __moeda($item['produto']->valor_unitario) }}</td>
                                    <td>R$ {{ __moeda($item['custo_real']) }}</td>

                                    <td class="{{ $item['margem_valor'] < 0 ? 'text-danger' : '' }}">
                                        R$ {{ __moeda($item['margem_valor']) }}
                                    </td>

                                    <td>
                                        {{ $item['margem_percentual'] }}%
                                        <small class="text-muted">
                                            (min {{ $item['margem_minima'] }}%)
                                        </small>
                                    </td>

                                    <td>
                                        @if($item['status'] == 'prejuizo')
                                        <span class="badge bg-danger">Prejuízo</span>
                                        @elseif($item['status'] == 'baixa')
                                        <span class="badge bg-warning text-dark">Margem baixa</span>
                                        @else
                                        <span class="badge bg-success">Saudável</span>
                                        @endif
                                    </td>

                                    <td>
                                        <a class="btn btn-sm btn-outline-primary btn-ajustar" data-produto='@json($item["produto"])' data-analise='@json($item)'>
                                            Ajustar
                                        </a>
                                    </td>
                                </tr>
                                @empty
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        Nenhum produto encontrado
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
                <br>
                {{ $produtos->links() }}


            </div>
        </div>
    </div>
</div>

@include('config_custo._modal_ajustar')
@endsection


@section('js')
<script>
    $('.btn-ajustar').on('click', function () {

        let produto = $(this).data('produto');
        let analise = $(this).data('analise');

        $('#aj_produto_id').val(produto.id);
        $('#aj_produto_nome').text(produto.nome);

        $('#aj_valor_compra').val(convertFloatToMoeda(produto.valor_compra));
        $('#aj_valor_venda').val(convertFloatToMoeda(produto.valor_unitario));
        $('#aj_custo_real').val(convertFloatToMoeda(analise.custo_real));

        $('#aj_imposto').val('');
        $('#aj_cartao').val('');
        $('#aj_despesas').val('');
        $('#aj_margem_min').val(analise.margem_minima);

        montarDetalhamentoCusto(analise);
        atualizarMargem();

        $('#modalAjusteCusto').modal('show');
    });

    function montarDetalhamentoCusto(analise){
        console.log(analise)
        let compra = parseFloat(analise.produto.valor_compra) || 0;

        let impostoPerc  = parseFloat(analise.imposto_percentual || 0);
        let cartaoPerc   = parseFloat(analise.cartao_percentual || 0);
        let despesaPerc  = parseFloat(analise.despesas_percentual || 0);

        let vlImposto = compra * impostoPerc / 100;
        let vlCartao  = compra * cartaoPerc / 100;
        let vlDespesa = compra * despesaPerc / 100;

        let html = `
        <tr>
        <td><strong>Custo base (compra)</strong></td>
        <td></td>
        <td class="text-end">${convertFloatToMoeda(compra)}</td>
        </tr>
        `;

        if(impostoPerc > 0){
            html += `
            <tr>
            <td>Impostos</td>
            <td>${impostoPerc}%</td>
            <td class="text-end">${convertFloatToMoeda(vlImposto)}</td>
            </tr>
            `;
        }

        if(cartaoPerc > 0){
            html += `
            <tr>
            <td>Taxa de cartão</td>
            <td>${cartaoPerc}%</td>
            <td class="text-end">${convertFloatToMoeda(vlCartao)}</td>
            </tr>
            `;
        }

        if(despesaPerc > 0){
            html += `
            <tr>
            <td>Outras despesas</td>
            <td>${despesaPerc}%</td>
            <td class="text-end">${convertFloatToMoeda(vlDespesa)}</td>
            </tr>
            `;
        }

        $('#detalhe-custo-body').html(html);
        $('#detalhe-custo-final').text(
            convertFloatToMoeda(analise.custo_real)
            );
    }

    function atualizarMargem(){
        const venda = convertMoedaToFloat($('#aj_valor_venda').val());
        const custo = convertMoedaToFloat($('#aj_custo_real').val());

        if(venda <= 0 || custo <= 0){
            $('#box-margem').hide();
            return;
        }

        const margemValor = venda - custo;
        const margemPerc = (margemValor / custo) * 100;

        $('#margem-valor').text(
            margemValor.toLocaleString('pt-BR', { style:'currency', currency:'BRL' })
            );

        $('#margem-percentual').text(
            margemPerc.toFixed(2) + '%'
            );

        const box = $('#box-margem');
        box.removeClass('alert-danger alert-warning alert-success');

        if(margemValor < 0){
            box.addClass('alert-danger');
        }else if(margemPerc < {{ $item['margem_minima'] ?? 0 }}){
            box.addClass('alert-warning');
        }else{
            box.addClass('alert-success');
        }

        box.show();
    }

    $('#aj_valor_venda').on('keyup change', function () {
        atualizarMargem();
    });

</script>
@endsection

