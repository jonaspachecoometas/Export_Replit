$(function () {
    const itemsState = {};
    const trackableTypes = [1, 2];
    let rowIndex = 0;
    let activeRowIndex = null;

    const trackingLabels = window.stockEntryConfig?.trackingLabels || {
        0: "Sem controle",
        1: "Nº de Série",
        2: "IMEI",
        3: "Grade (cor/tamanho)",
    };

    const $itemsTable = $("#items-table tbody");
    const $imeiModal = $("#modal-imei");
    const $imeiTable = $("#imei-table tbody");

    addItemRow();

    $("#btn-add-item").on("click", function () {
        addItemRow();
    });

    $("#btn-submit-entry").on("click", function () {
        submitEntry();
    });

    $("#modal-imei-add-row").on("click", function () {
        appendImeiRow("");
    });

    $("#btn-save-imei").on("click", function () {
        persistImeiModal();
    });

    $imeiTable.on("click", ".btn-remove-imei", function () {
        $(this).closest("tr").remove();
        if ($imeiTable.find("tr").length === 0) {
            appendImeiRow("");
        }
    });

    $itemsTable.on("click", ".btn-remove-item", function () {
        const index = $(this).data("index");
        delete itemsState[index];
        $(this).closest("tr").remove();
        if ($itemsTable.find("tr").length === 0) {
            addItemRow();
        }
    });

    $itemsTable.on("click", ".btn-manage-imei", function () {
        const index = $(this).data("index");
        openImeiModal(index);
    });

    $itemsTable.on("change", ".quantity-input", function () {
        const index = $(this).data("index");
        const quantity = parseInt($(this).val(), 10) || 0;
        if (!itemsState[index]) return;
        const btn = getRow(index).find(".btn-manage-imei");
        if (
            requiresImei(itemsState[index].tracking_type) &&
            itemsState[index].imeis.length !== quantity
        ) {
            btn.removeClass("btn-outline-secondary").addClass(
                "btn-outline-warning"
            );
        } else {
            btn.removeClass("btn-outline-warning").addClass(
                "btn-outline-secondary"
            );
        }
        updateImeiBadge(index);
    });

    $itemsTable.on("select2:select", ".produto-select", function () {
        const index = $(this).data("index");
        const productId = $(this).val();
        fetchProductData(index, productId);
    });

    $itemsTable.on("select2:clear", ".produto-select", function () {
        const index = $(this).data("index");
        itemsState[index] = {
            imeis: [],
            tracking_type: null,
            product_id: null,
        };
        const row = getRow(index);
        row.find(".btn-manage-imei").addClass("d-none");
        row.find(".tracking-label").text("");
        row.find(".count-badge").text("0");
    });

    function addItemRow() {
        const index = rowIndex++;
        itemsState[index] = {
            imeis: [],
            tracking_type: null,
            product_id: null,
        };

        const row = `
            <tr data-index="${index}">
                <td>
                    <select class="form-select produto-select" data-index="${index}" data-placeholder="Selecione um produto"></select>
                    <div class="text-muted small mt-1 tracking-label"></div>
                </td>
                <td width="140">
                    <input type="number" min="1" value="1" class="form-control quantity-input" data-index="${index}">
                </td>
                <td class="text-nowrap text-center">
                    <button type="button" class="btn btn-outline-secondary btn-sm me-1 btn-manage-imei d-none" data-index="${index}">
                        <i class="ri-qr-code-line me-1"></i> IMEIs/Seriais
                        <span class="badge bg-secondary ms-1 count-badge">0</span>
                    </button>
                    <button type="button" class="btn btn-outline-danger btn-sm btn-remove-item" data-index="${index}">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `;
        $itemsTable.append(row);
        initProdutoSelect(index);
    }

    function initProdutoSelect(index) {
        const $select = getRow(index).find(".produto-select");
        $select.select2({
            minimumInputLength: 2,
            language: "pt-BR",
            placeholder: "Digite para buscar o produto",
            width: "100%",
            ajax: {
                cache: true,
                url: path_url + "api/produtos",
                dataType: "json",
                data: function (params) {
                    return {
                        pesquisa: params.term,
                        empresa_id: $("#empresa_id").val(),
                        usuario_id: $("#usuario_id").val(),
                    };
                },
                processResults: function (response) {
                    const results = [];
                    $.each(response, function (_, item) {
                        const option = {
                            id: item.id,
                            text: item.nome,
                        };
                        if (item.codigo_variacao) {
                            option.codigo_variacao = item.codigo_variacao;
                        }
                        results.push(option);
                    });
                    return { results };
                },
            },
            allowClear: true,
        });
    }

    function fetchProductData(index, productId) {
        if (!productId) return;
        $.get(path_url + "api/produtos/find", {
            produto_id: productId,
            usuario_id: $("#usuario_id").val(),
        })
            .done(function (product) {
                const trackingType = parseInt(product.tracking_type ?? 0, 10);
                const row = getRow(index);
                itemsState[index] = itemsState[index] || { imeis: [] };
                itemsState[index].product_id = product.id;
                itemsState[index].tracking_type = trackingType;

                const requires = requiresImei(trackingType);
                const manageBtn = row.find(".btn-manage-imei");
                row.find(".tracking-label").text(
                    trackingLabels[trackingType] || ""
                );

                if (requires) {
                    manageBtn.removeClass("d-none");
                } else {
                    manageBtn.addClass("d-none");
                    itemsState[index].imeis = [];
                    manageBtn
                        .removeClass("btn-outline-warning")
                        .addClass("btn-outline-secondary");
                }

                updateImeiBadge(index);
            })
            .fail(function () {
                swal(
                    "Erro",
                    "Não foi possível carregar o produto selecionado.",
                    "error"
                );
            });
    }

    function requiresImei(trackingType) {
        return trackableTypes.includes(parseInt(trackingType, 10));
    }

    function openImeiModal(index) {
        const state = itemsState[index];
        if (!state || !requiresImei(state.tracking_type)) {
            swal(
                "Atenção",
                "Este item não requer controle por IMEI/Serial.",
                "info"
            );
            return;
        }

        activeRowIndex = index;
        $imeiTable.empty();

        const quantity =
            parseInt(getRow(index).find(".quantity-input").val(), 10) || 1;
        const currentImeis = state.imeis || [];
        const totalRows = Math.max(quantity, currentImeis.length || 1);

        for (let i = 0; i < totalRows; i++) {
            appendImeiRow(currentImeis[i] || "");
        }

        $imeiModal.modal("show");
    }

    function appendImeiRow(value) {
        const row = `
            <tr>
                <td>
                    <input type="text" class="form-control imei-value" value="${
                        value || ""
                    }" placeholder="Informe o código">
                </td>
                <td class="text-center">
                    <button type="button" class="btn btn-outline-danger btn-sm btn-remove-imei">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `;
        $imeiTable.append(row);
    }

    function persistImeiModal() {
        if (activeRowIndex === null) {
            $imeiModal.modal("hide");
            return;
        }

        const inputs = $imeiTable.find(".imei-value");
        const imeis = [];
        const seen = new Set();

        let hasError = false;
        inputs.each(function () {
            const value = $(this).val().trim();
            if (value.length === 0) {
                return;
            }
            if (seen.has(value)) {
                hasError = true;
                swal(
                    "Atenção",
                    "Existem IMEIs/Seriais duplicados no formulário.",
                    "warning"
                );
                return false;
            }
            seen.add(value);
            imeis.push(value);
        });

        if (hasError) {
            return;
        }

        itemsState[activeRowIndex].imeis = imeis;
        updateImeiBadge(activeRowIndex);
        $imeiModal.modal("hide");
        activeRowIndex = null;
    }

    function updateImeiBadge(index) {
        const row = getRow(index);
        const badge = row.find(".count-badge");
        const state = itemsState[index];
        const count = state?.imeis?.length || 0;
        badge.text(count);

        const quantity = parseInt(row.find(".quantity-input").val(), 10) || 0;
        const btn = row.find(".btn-manage-imei");
        if (requiresImei(state?.tracking_type) && count !== quantity) {
            btn.removeClass("btn-outline-secondary").addClass(
                "btn-outline-warning"
            );
        } else {
            btn.removeClass("btn-outline-warning").addClass(
                "btn-outline-secondary"
            );
        }
    }

    function getRow(index) {
        return $itemsTable.find(`tr[data-index="${index}"]`);
    }

    function submitEntry() {
        const branchId = $("#branch_id").val();
        const companyId =
            $("#empresa_id").val() || $("#company_fallback_id").val();

        if (!branchId) {
            swal(
                "Atenção",
                "Selecione o local/filial para a entrada.",
                "warning"
            );
            return;
        }

        const payload = {
            company_id: companyId,
            branch_id: branchId,
            items: [],
        };

        if (!payload.company_id) {
            swal(
                "Atenção",
                "Não foi possível identificar a empresa ativa.",
                "warning"
            );
            return;
        }

        let hasError = false;
        $itemsTable.find("tr").each(function (idx) {
            const index = $(this).data("index");
            const productId = $(this).find(".produto-select").val();
            const quantity = parseInt(
                $(this).find(".quantity-input").val(),
                10
            );
            const state = itemsState[index];

            if (!productId) {
                swal(
                    "Atenção",
                    `Selecione o produto na linha ${idx + 1}.`,
                    "warning"
                );
                hasError = true;
                return false;
            }

            if (!quantity || quantity < 1) {
                swal(
                    "Atenção",
                    `Informe uma quantidade válida na linha ${idx + 1}.`,
                    "warning"
                );
                hasError = true;
                return false;
            }

            const item = {
                product_id: productId,
                quantity: quantity,
            };

            if (state && requiresImei(state.tracking_type)) {
                if (!state.imeis || state.imeis.length !== quantity) {
                    swal(
                        "Atenção",
                        `A linha ${
                            idx + 1
                        } precisa ter ${quantity} IMEIs/Seriais cadastrados.`,
                        "warning"
                    );
                    hasError = true;
                    return false;
                }
                item.imeis = state.imeis;
            }

            payload.items.push(item);
        });

        if (hasError) {
            return;
        }

        if (payload.items.length === 0) {
            swal(
                "Atenção",
                "Informe ao menos um item para a entrada.",
                "warning"
            );
            return;
        }

        $("#btn-submit-entry").prop("disabled", true);

        $.ajax({
            url: path_url + "api/stock-entries",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        })
            .done(function (response) {
                swal(
                    "Sucesso",
                    response.message || "Entrada registrada com sucesso.",
                    "success"
                );
                resetForm();
            })
            .fail(function (xhr) {
                const errors = xhr.responseJSON?.errors;
                let message =
                    xhr.responseJSON?.message ||
                    "Não foi possível registrar a entrada.";
                if (errors) {
                    const firstKey = Object.keys(errors)[0];
                    if (errors[firstKey] && errors[firstKey].length > 0) {
                        message = errors[firstKey][0];
                    }
                }
                swal("Erro", message, "error");
            })
            .always(function () {
                $("#btn-submit-entry").prop("disabled", false);
            });
    }

    function resetForm() {
        $itemsTable.empty();
        Object.keys(itemsState).forEach((key) => delete itemsState[key]);
        rowIndex = 0;
        addItemRow();
    }
});
