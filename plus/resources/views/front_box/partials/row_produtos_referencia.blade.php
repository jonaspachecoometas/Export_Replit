<tr class="line-product">

    <input readonly type="hidden" name="key" class="form-control" value="{{ $item->key }}">
    <input class="produto_row" readonly type="hidden" name="produto_id[]" class="form-control" value="{{ $item->id }}">

    <td>
        <img src="{{ $item->img }}" style="width: 30px; height: 40px; border-radius: 10px;">
    </td>
    <td class="col-6">
        <!-- <input readonly type="text" name="produto_nome[]" class="form-control" value="{{ $item->nome }}"> -->
        <input style="width: 350px" readonly type="text" name="produto_nome[]" class="form-control" value="{{ $item->nome }}">

        @if($item->precoComPromocao())
        <p>Promoção: <strong class="text-primary">{{ __data_pt($item->precoComPromocao()->data_inicio, 0) }}</strong> até <strong class="text-primary">{{ __data_pt($item->precoComPromocao()->data_fim, 0) }}</strong></p>
        @endif
    </td>
    <td class="datatable-cell">
        <div class="form-group mb-2" style="width: 200px">

            <div class="input-group">
                <div class="input-group-prepend">
                    <button id="btn-subtrai" class="btn btn-danger btn-qtd" type="button">-</button>
                </div>
                <input type="tel" readonly class="form-control" name="quantidade[]" value="{{ number_format($quantidade, 3) }}">
                <div class="input-group-append">
                    <button class="btn btn-success btn-qtd" id="btn-incrementa" type="button">+</button>
                </div>
            </div>
        </div>
    </td>
    <td>
        <input style="width: 100px" readonly type="tel" name="valor_unitario[]" class="form-control value-unit" value="{{ __moeda($item->valor_unitario) }}">
    </td>
    <td>
        <input style="width: 100px" readonly type="tel" name="subtotal_item[]" class="form-control subtotal-item" value="{{ __moedaInput($subtotal) }}">
    </td>
    <td>
        <input type="hidden" class="adicionais" name="adicionais[]">
        <button type="button" class="btn btn-danger btn-sm btn-delete-row"><i class="ri-delete-bin-line"></i></button>
    </td>
</tr>
