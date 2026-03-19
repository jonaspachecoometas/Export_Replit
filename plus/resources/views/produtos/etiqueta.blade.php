@extends('layouts.app', ['title' => 'Gerar etiqueta'])
@section('content')

<div class="card mt-1">
    <div class="card-header">
        <h4>Gerar etiqueta - <strong class="text-success">{{ $item->nome }} [<i class="ri-barcode-line"></i> {{ $item->codigo_barras }}]</strong></h4>
        <div style="text-align: right; margin-top: -35px;">
            <a href="{{ route('produtos.index') }}" class="btn btn-danger btn-sm px-3">
                <i class="ri-arrow-left-double-fill"></i>Voltar
            </a>
        </div>
    </div>
    <div class="card-body">
        {!!Form::open()
        ->post()
        ->route('produtos.etiqueta-store', [$item->id])
        !!}
        <div class="pl-lg-4">
            @include('produtos._forms_etiqueta')
        </div>
        {!!Form::close()!!}
    </div>
</div>

@endsection
@section('js')
<script type="text/javascript">
    $(function(){
        $('#inp-modelo_id').val('').change()
    })

    $('body').on('change', '#inp-modelo_id', function () {
        if($(this).val()){
            $.get(path_url + 'api/etiqueta', {modelo_id: $(this).val()})
            .done((res) => {

                $('#inp-tipo').val(res.tipo).change()
                $('#inp-altura').val(res.altura)
                $('#inp-largura').val(res.largura)
                $('#inp-largura').val(res.largura)
                $('#inp-etiquestas_por_linha').val(res.etiquestas_por_linha)
                $('#inp-distancia_etiquetas_lateral').val(res.distancia_etiquetas_lateral)
                $('#inp-distancia_etiquetas_topo').val(res.distancia_etiquetas_topo)
                $('#inp-distancia_entre_linhas').val(res.distancia_entre_linhas)
                $('#inp-quantidade_etiquetas').val(res.quantidade_etiquetas)
                $('.quantidade_add').val(res.quantidade_etiquetas)
                $('#inp-tamanho_fonte').val(res.tamanho_fonte)
                $('#inp-tamanho_codigo_barras').val(res.tamanho_codigo_barras)

                $('#inp-nome_empresa').prop('checked', res.nome_empresa)
                $('#inp-nome_produto').prop('checked', res.nome_produto)
                $('#inp-valor_produto').prop('checked', res.valor_produto)
                $('#inp-codigo_produto').prop('checked', res.codigo_produto)
                $('#inp-codigo_barras_numerico').prop('checked', res.codigo_barras_numerico)
                $('#inp-valor_atacado').prop('checked', res.valor_atacado)
                $('#inp-referencia').prop('checked', res.referencia)

            })
            .fail((err) => {
                console.log(err)
            })
        }
    })

    $(".produto").select2({
        minimumInputLength: 2,
        language: "pt-BR",
        placeholder: "Digite para buscar o produto",
        width: "100%",
        ajax: {
            cache: true,
            url: path_url + "api/produtos-filtro-codigo-barras",
            dataType: "json",
            data: function (params) {
                let empresa_id = $('#empresa_id').val()
                console.clear();
                var query = {
                    pesquisa: params.term,
                    empresa_id: empresa_id,
                };
                return query;
            },
            processResults: function (response) {
                var results = [];

                $.each(response, function (i, v) {
                    var o = {};
                    o.id = v.id;
                    if(v.codigo_variacao){
                        o.codigo_variacao = v.codigo_variacao
                    }

                    o.text = v.nome
                    o.value = v.id;
                    results.push(o);
                });
                return {
                    results: results,
                };
            },
        },
    });

    $('.btn-add-tr').on("click", function () {

        var $table = $(this)
        .closest(".col-md-4")
        .prev()
        .find(".table-dynamic");

        var hasEmpty = false;

        $table.find("input, select").each(function () {
            if (($(this).val() === "" || $(this).val() === null) && $(this).attr("type") !== "hidden" && $(this).attr("type") !== "file" && !$(this).hasClass("ignore")) {
                hasEmpty = true;
            }
        });

        if (hasEmpty) {
            swal(
                "Atenção",
                "Preencha todos os campos antes de adicionar novos.",
                "warning"
                );
            return;
        }

        var $trBase = $table.find(".dynamic-form").last();

        $trBase.find(".produto").select2("destroy");

        var $clone = $trBase.clone();
        $clone.show();

        // $clone.find("input").val("");
        $clone.find("select").val(null);

        $table.append($clone);

        $clone.find(".produto").select2({
            minimumInputLength: 2,
            language: "pt-BR",
            placeholder: "Digite para buscar o produto",
            width: "100%",
            ajax: {
                cache: true,
                url: path_url + "api/produtos-filtro-codigo-barras",
                dataType: "json",
                data: function (params) {
                    return {
                        pesquisa: params.term,
                        empresa_id: $('#empresa_id').val()
                    };
                },
                processResults: function (response) {
                    return {
                        results: response.map(v => ({
                            id: v.id,
                            text: v.nome,
                            codigo_variacao: v.codigo_variacao ?? null
                        }))
                    };
                }
            }
        });

    });


</script>
@endsection
