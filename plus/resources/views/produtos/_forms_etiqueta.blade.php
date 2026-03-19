<div class="row g-2">
    <div class="col-md-3">
        {!!Form::select('modelo_id', 'Modelo', ['' => 'Selecione'] + $modelos->pluck('nome', 'id')->all())->attrs(['class' => 'select2'])
        !!}
    </div>
    <hr>
    <div class="col-md-2">
        {!!Form::select('tipo', 'Tipo', ['simples' => 'Simples', 'gondola' => 'Gôndola'])->attrs(['class' => 'form-select'])
        ->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::tel('altura', 'Altura')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::tel('largura', 'Largura')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::tel('quantidade_etiquetas', 'Quantidade de etiquetas')->attrs(['data-mask' => '000'])->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::tel('etiquestas_por_linha', 'Etiquetas por linha')->attrs(['data-mask' => '00'])->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::tel('distancia_etiquetas_lateral', 'Distância etiqueta lateral')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::tel('distancia_etiquetas_topo', 'Distância etiqueta topo')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>

    <div class="col-md-2">
        {!!Form::tel('distancia_entre_linhas', 'Distância entre linhas')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>
    
    <div class="col-md-2">
        {!!Form::tel('tamanho_fonte', 'Tamanho da fonte')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>
    <div class="col-md-3">
        {!!Form::tel('tamanho_codigo_barras', 'Tamanho do código de barras')->attrs(['data-mask' => '000.00', 'data-mask-reverse' => 'true'])->required()
        !!}
    </div>
    <hr>
    <div class="col-md-3">
        {!!Form::checkbox('nome_empresa', 'Nome da empresa')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>
    <div class="col-md-3">
        {!!Form::checkbox('nome_produto', 'Nome do produto')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>
    <div class="col-md-3">
        {!!Form::checkbox('valor_produto', 'Valor do produto')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>
    <div class="col-md-3">
        {!!Form::checkbox('codigo_produto', 'Código do produto')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>
    <div class="col-md-3">
        {!!Form::checkbox('codigo_barras_numerico', 'Código de barras numérico')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>

    <div class="col-md-3">
        {!!Form::checkbox('referencia', 'Referência')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>

    <div class="col-md-3">
        {!!Form::checkbox('valor_atacado', 'Valor de atacado')->attrs(['class' => ''])
        ->value(1)
        !!}
    </div>

    <div class="alert alert-info py-2 mt-4">
        <i class="ri-information-line"></i>
        Caso necessite inclua mais produtos para gerar a etiqueta
    </div>
    <div class="col-md-6">
        <div class="table-responsive">
            <table class="table table-dynamic">
                <thead class="table-light">
                    <tr>
                        <th>Produto</th>
                        <th>Qtd. etiquetas</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="dynamic-form">
                        <td>
                            <select name="produto_add_id[]" class="form-select produto"></select>
                            <div style="width: 280px;"></div>
                        </td>
                        <td style="width: 180px">
                            <input type="tel" value="" data-mask="000" class="form-control quantidade_add" name="quantidade_add[]">
                        </td>
                        <td style="width: 80px">
                            <button class="btn btn-danger btn-remove-tr">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="col-md-4">
            <button type="button" class="btn btn-dark btn-add-tr px-2">
                <i class="ri-add-fill"></i>
                Adicionar Produto
            </button>
        </div>
    </div>
    <hr class="mt-4">
    <div class="col-12" style="text-align: right;">
        <button type="submit" class="btn btn-success px-5" id="btn-store">Gerar</button>
    </div>
</div>
