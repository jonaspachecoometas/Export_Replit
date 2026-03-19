$(function () {
    const isPurchase = $('#is_compra').val() === '1';
    if (isPurchase) {
        return;
    }

    const state = {};
    const trackable = [1, 2];
    let activeKey = null;
    const globalSelections = new Map();

    const $modal = $('#modal-imei-sale');
    const $table = $('#imei-sale-table tbody');
    const $feedback = $('#imei-sale-feedback');
    const $payloadInput = $('#sale_imeis_payload');
    const $form = $('#form-nfe');

    $('#inp-local_id').on('change', function () {
        Object.keys(state).forEach((key) => {
            releaseImeis(state[key].imeis || []);
            state[key].imeis = [];
            const row = getRowByKey(key);
            if (row) {
                updateBadge(row);
            }
        });
    });

    window.handleSaleProductSelection = function (row, product) {
        const key = getRowKey(row);
        ensureState(key);

        if (state[key].product_id && state[key].product_id !== product.id) {
            releaseImeis(state[key].imeis);
            state[key].imeis = [];
        }

        state[key].product_id = product.id;
        state[key].tracking = parseInt(product.tracking_type ?? 0, 10);

        if (requiresTracking(state[key].tracking)) {
            showButton(row);
        } else {
            hideButton(row);
            state[key].imeis = [];
        }
        updateBadge(row);
    };

    syncRowKeys();

    $(document).on('click', '.btn-add-tr-nfe', function () {
        setTimeout(syncRowKeys, 200);
    });

    $(document).on('click', '.btn-remove-tr', function () {
        const row = $(this).closest('tr');
        const key = getRowKey(row);
        releaseImeis(state[key]?.imeis || []);
        delete state[key];
        setTimeout(syncRowKeys, 200);
    });

    $(document).on('click', '.btn-manage-imei', function () {
        const row = $(this).closest('tr');
        const key = getRowKey(row);
        ensureState(key);

        if (!state[key].product_id) {
            swal('Atenção', 'Selecione o produto antes de escolher os IMEIs/Seriais.', 'warning');
            return;
        }

        if (!requiresTracking(state[key].tracking)) {
            swal('Atenção', 'Este produto não exige IMEI/Serial.', 'info');
            return;
        }

        const branchId = $('#inp-local_id').val();
        if (!branchId) {
            swal('Atenção', 'Selecione o local/filial da venda antes de continuar.', 'warning');
            return;
        }

        activeKey = key;
        $table.empty();
        $feedback.text('Carregando IMEIs disponíveis...');

        $.get(path_url + 'api/imei-units/available', {
            product_id: state[key].product_id,
            branch_id: branchId,
            empresa_id: $('#empresa_id').val()
        })
            .done(function (response) {
                if (!response.length) {
                    $feedback.text('Nenhum IMEI/Serial disponível neste local.');
                    return;
                }
                renderAvailable(response, key);
            })
            .fail(function () {
                $feedback.text('Não foi possível carregar os IMEIs disponíveis.');
            });

        $modal.modal('show');
    });

    $('#btn-save-imei-sale').on('click', function () {
        persistSaleSelection();
    });

    $(document).on('input blur', '.qtd', function () {
        updateBadge($(this).closest('tr'));
    });

    $form.on('submit', function (e) {
        if (!validateBeforeSubmit()) {
            e.preventDefault();
            return false;
        }
        const payload = buildPayload();
        if (payload === null) {
            e.preventDefault();
            return false;
        }
        if (payload.length) {
            $payloadInput.val(JSON.stringify(payload));
        } else {
            $payloadInput.val('');
        }
        return true;
    });

    function renderAvailable(units, key) {
        $table.empty();
        const selectedIds = new Set(state[key].imeis.map((item) => item.id));
        units.forEach((unit) => {
            const isSelected = selectedIds.has(unit.id);
            const disabled = globalSelections.has(unit.id) && globalSelections.get(unit.id) !== key;
            const branchName = unit.branch ? unit.branch.descricao : '';
            const row = `
                <tr>
                    <td class="text-center" width="60">
                        <input type="checkbox" class="form-check-input imei-sale-check" value="${unit.id}" data-code="${unit.imei_or_serial}" ${isSelected ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    </td>
                    <td>${unit.imei_or_serial}</td>
                    <td>${branchName}</td>
                </tr>`;
            $table.append(row);
        });
        $feedback.text('Selecione os IMEIs/Seriais desejados.');
    }

    function persistSaleSelection() {
        if (activeKey === null) {
            $modal.modal('hide');
            return;
        }
        const row = getRowByKey(activeKey);
        const requiredQty = getRowQuantity(row);
        const selections = [];
        let hasError = false;

        $table.find('.imei-sale-check:checked').each(function () {
            const id = parseInt($(this).val(), 10);
            const code = $(this).data('code');
            selections.push({ id, code });
        });

        if (selections.length !== requiredQty) {
            swal('Atenção', `Selecione ${requiredQty} IMEIs/Seriais para este item.`, 'warning');
            return;
        }

        selections.forEach((item) => {
            const other = globalSelections.get(item.id);
            if (other && other !== activeKey) {
                swal('Atenção', `O IMEI/Serial ${item.code} já foi utilizado em outro item.`, 'warning');
                hasError = true;
            }
        });

        if (hasError) {
            return;
        }

        releaseImeis(state[activeKey].imeis);
        state[activeKey].imeis = selections;
        selections.forEach((item) => {
            globalSelections.set(item.id, activeKey);
        });

        updateBadge(row);
        activeKey = null;
        $modal.modal('hide');
    }

    function releaseImeis(items) {
        items.forEach((item) => {
            if (globalSelections.get(item.id)) {
                globalSelections.delete(item.id);
            }
        });
    }

    function buildPayload() {
        const payload = [];
        let hasError = false;
        const usedCodes = new Set();

        $('.table-produtos tbody tr.dynamic-form').each(function (index) {
            const row = $(this);
            const key = getRowKey(row);
            const productId = row.find('.produto_id').val();
            const quantity = getRowQuantity(row);

            if (!productId) {
                return;
            }

            ensureState(key);

            if (!requiresTracking(state[key].tracking)) {
                return;
            }

            if (!quantity || quantity < 1) {
                swal('Atenção', `Informe a quantidade do item ${index + 1}.`, 'warning');
                hasError = true;
                return false;
            }

            if (state[key].imeis.length !== quantity) {
                swal('Atenção', `O item ${index + 1} precisa ter ${quantity} IMEIs/Seriais selecionados.`, 'warning');
                hasError = true;
                return false;
            }

            state[key].imeis.forEach((item) => {
                if (usedCodes.has(item.id)) {
                    swal('Atenção', `O IMEI/Serial ${item.code} foi associado a mais de um item.`, 'warning');
                    hasError = true;
                }
                usedCodes.add(item.id);
            });

            payload.push({
                product_id: productId,
                imei_unit_ids: state[key].imeis.map((item) => item.id),
            });
        });

        if (hasError) {
            return null;
        }

        return payload;
    }

    function validateBeforeSubmit() {
        if (!$('.btn-manage-imei').length) {
            return true;
        }
        if (!$('#inp-local_id').val()) {
            swal('Atenção', 'Selecione o local/filial da venda.', 'warning');
            return false;
        }
        return true;
    }

    function syncRowKeys() {
        $('.table-produtos tbody tr.dynamic-form').each(function () {
            const row = $(this);
            const key = getRowKey(row);
            ensureState(key);
            row.attr('data-line', key);
            row.find('.btn-manage-imei').attr('data-line', key);
            const initialTracking = row.data('initial-tracking');
            const initialProduct = row.data('initial-product');
            if (typeof initialProduct !== 'undefined' && initialProduct && !state[key].product_id) {
                state[key].product_id = initialProduct;
            }
            if (typeof initialTracking !== 'undefined' && state[key].tracking === null) {
                state[key].tracking = parseInt(initialTracking, 10);
                if (requiresTracking(state[key].tracking)) {
                    showButton(row);
                }
            }
            updateBadge(row);
        });
    }

    function showButton(row) {
        row.find('.btn-manage-imei').removeClass('d-none');
    }

    function hideButton(row) {
        row.find('.btn-manage-imei').addClass('d-none');
    }

    function getRowKey(row) {
        return row.find('._key').val() ?? row.index();
    }

    function getRowByKey(key) {
        let target = null;
        $('.table-produtos tbody tr.dynamic-form').each(function () {
            if (getRowKey($(this)) == key) {
                target = $(this);
                return false;
            }
        });
        return target;
    }

    function updateBadge(row) {
        const key = getRowKey(row);
        ensureState(key);
        const badge = row.find('.count-badge');
        const count = state[key].imeis.length;
        badge.text(count);

        if (!requiresTracking(state[key].tracking)) {
            return;
        }

        const quantity = getRowQuantity(row);
        const btn = row.find('.btn-manage-imei');
        if (count === quantity && quantity > 0) {
            btn.removeClass('btn-outline-warning').addClass('btn-outline-secondary');
        } else {
            btn.removeClass('btn-outline-secondary').addClass('btn-outline-warning');
        }
    }

    function getRowQuantity(row) {
        const input = row.find('.qtd');
        if (!input.length) {
            return 0;
        }
        const value = input.val();
        if (!value) {
            return 0;
        }
        if (typeof convertMoedaToFloat === 'function') {
            return Math.trunc(convertMoedaToFloat(value));
        }
        return parseInt(value.replace(/\D/g, ''), 10) || 0;
    }

    function ensureState(key) {
        if (!state[key]) {
            state[key] = {
                product_id: null,
                tracking: null,
                imeis: [],
            };
        }
    }

    function requiresTracking(value) {
        return trackable.includes(parseInt(value, 10));
    }
});
