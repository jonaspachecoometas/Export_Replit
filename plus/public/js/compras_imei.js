$(function () {
    const isPurchase = $("#is_compra").val() === "1";
    if (!isPurchase) {
        return;
    }

    const trackableTypes = [1, 2];
    const imeiState = {};
    let activeRowKey = null;

    const $modal = $("#modal-imei");
    const $tableBody = $("#imei-table tbody");
    const $productsTable = $(".table-produtos tbody");
    const $form = $("#form-nfe");
    const $saveButton = $(".btn-salvar-nfe");
    const localItemSelector = ".local-item-select";

    window.handlePurchaseProductSelection = function (row, product) {
        const key = getRowKey(row);
        ensureState(key);
        if (
            imeiState[key].product_id &&
            imeiState[key].product_id !== product.id
        ) {
            imeiState[key].imeis = [];
        }
        imeiState[key].product_id = product.id;
        imeiState[key].tracking = parseInt(product.tracking_type ?? 0, 10);

        if (requiresTracking(imeiState[key].tracking)) {
            showManageButton(row);
        } else {
            hideManageButton(row);
            imeiState[key].imeis = [];
        }
        updateBadge(row);
    };

    syncRowKeys();

    $(document).on("click", ".btn-add-tr-nfe", function () {
        setTimeout(syncRowKeys, 300);
    });

    $(document).on("click", ".btn-remove-tr", function () {
        const row = $(this).closest("tr");
        const key = getRowKey(row);
        delete imeiState[key];
        setTimeout(syncRowKeys, 300);
    });

    $(document).on("click", ".btn-manage-imei", function () {
        const row = $(this).closest("tr");
        const key = getRowKey(row);
        ensureState(key);

        if (!row.find(".produto_id").val()) {
            swal(
                "Atenção",
                "Selecione o produto antes de gerenciar os IMEIs.",
                "info"
            );
            return;
        }

        if (!requiresTracking(imeiState[key].tracking)) {
            swal("Atenção", "Este produto não exige IMEI/Serial.", "info");
            return;
        }

        activeRowKey = key;
        $tableBody.empty();

        const quantity = getRowQuantity(row);
        const currentImeis = imeiState[key].imeis;
        const total = Math.max(quantity, currentImeis.length || 1);

        for (let i = 0; i < total; i++) {
            appendImeiRow(currentImeis[i] || "");
        }

        $modal.modal("show");
    });

    $("#modal-imei-add-row").on("click", function () {
        appendImeiRow("");
    });

    $("#btn-save-imei").on("click", function () {
        persistModalData();
    });

    $tableBody.on("click", ".btn-remove-imei", function () {
        $(this).closest("tr").remove();
        if ($tableBody.find("tr").length === 0) {
            appendImeiRow("");
        }
    });

    $(document).on("blur change", ".qtd", function () {
        const row = $(this).closest("tr");
        updateBadge(row);
    });

    $form.on("submit", function (e) {
        if ($form.data("imeiProcessing")) {
            return true;
        }

        const payload = buildPayload();
        if (payload === null) {
            e.preventDefault();
            return false;
        }

        if (payload.items.length === 0) {
            return true;
        }

        e.preventDefault();
        payload.origin_type = "purchase";

        toggleSavingState(true);

        $.ajax({
            url: path_url + "api/stock-entries",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(payload),
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
            },
        })
            .done(function () {
                $form.data("imeiProcessing", true);
                $form.submit();
            })
            .fail(function (xhr) {
                const errors = xhr.responseJSON?.errors;
                let message =
                    xhr.responseJSON?.message ||
                    "Não foi possível registrar a entrada dos IMEIs.";
                if (errors) {
                    const firstKey = Object.keys(errors)[0];
                    if (errors[firstKey]?.length) {
                        message = errors[firstKey][0];
                    }
                }
                swal("Erro", message, "error");
            })
            .always(function () {
                toggleSavingState(false);
            });
    });

    function requiresTracking(value) {
        return trackableTypes.includes(parseInt(value, 10));
    }

    function ensureState(key) {
        if (!imeiState[key]) {
            imeiState[key] = {
                imeis: [],
                tracking: null,
                product_id: null,
            };
        }
    }

    function getRowKey(row) {
        return row.find("._key").val() ?? row.index();
    }

    function showManageButton(row) {
        row.find(".btn-manage-imei").removeClass("d-none");
    }

    function hideManageButton(row) {
        row.find(".btn-manage-imei").addClass("d-none");
    }

    function appendImeiRow(value) {
        const template = `
            <tr>
                <td>
                    <input type="text" class="form-control imei-value" value="${
                        value || ""
                    }" placeholder="Informe o IMEI/Serial">
                </td>
                <td class="text-center">
                    <button type="button" class="btn btn-outline-danger btn-sm btn-remove-imei">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </td>
            </tr>
        `;
        $tableBody.append(template);
    }

    function persistModalData() {
        if (activeRowKey === null) {
            $modal.modal("hide");
            return;
        }
        const row = getRowByKey(activeRowKey);
        const inputs = $tableBody.find(".imei-value");
        const imeis = [];
        const seen = new Set();
        let hasError = false;

        inputs.each(function () {
            const value = $(this).val().trim();
            if (!value) {
                return;
            }
            if (seen.has(value)) {
                swal("Atenção", "Existem IMEIs/Seriais repetidos.", "warning");
                hasError = true;
                return false;
            }
            seen.add(value);
            imeis.push(value);
        });

        if (hasError) {
            return;
        }

        imeiState[activeRowKey].imeis = imeis;
        updateBadge(row);
        activeRowKey = null;
        $modal.modal("hide");
    }

    function updateBadge(row) {
        const key = getRowKey(row);
        ensureState(key);

        const badge = row.find(".count-badge");
        const count = imeiState[key].imeis.length;
        badge.text(count);

        if (!requiresTracking(imeiState[key].tracking)) {
            return;
        }

        const quantity = getRowQuantity(row);
        const btn = row.find(".btn-manage-imei");
        if (count === quantity) {
            btn.removeClass("btn-outline-warning").addClass(
                "btn-outline-secondary"
            );
        } else {
            btn.removeClass("btn-outline-secondary").addClass(
                "btn-outline-warning"
            );
        }
    }

    function getRowQuantity(row) {
        const qtdInput = row.find(".qtd");
        if (!qtdInput.length) {
            return 0;
        }
        const value = qtdInput.val();
        if (!value) {
            return 0;
        }
        if (typeof convertMoedaToFloat === "function") {
            return Math.trunc(convertMoedaToFloat(value));
        }
        return parseInt(value.replace(/\D/g, ""), 10) || 0;
    }

    function getRowByKey(key) {
        let target = null;
        $productsTable.find("tr").each(function () {
            const rowKey = getRowKey($(this));
            if (rowKey == key) {
                target = $(this);
                return false;
            }
        });
        return target;
    }

    function syncRowKeys() {
        $productsTable.find("tr.dynamic-form").each(function () {
            const row = $(this);
            const key = getRowKey(row);
            ensureState(key);
            row.attr("data-line", key);
            row.find(".btn-manage-imei").attr("data-line", key);

            const initialTracking = row.data("initial-tracking");
            const initialProduct = row.data("initial-product");
            if (initialProduct) {
                imeiState[key].product_id = initialProduct;
            }
            if (
                typeof initialTracking !== "undefined" &&
                imeiState[key].tracking === null
            ) {
                imeiState[key].tracking = parseInt(initialTracking, 10);
                if (requiresTracking(initialTracking)) {
                    showManageButton(row);
                }
            }
            updateBadge(row);
        });
    }

    function buildPayload() {
        let branchId = $("#inp-local_id").val();
        const companyId = $("#empresa_id").val();

        if (!companyId) {
            swal(
                "Atenção",
                "Não foi possível identificar a empresa.",
                "warning"
            );
            return null;
        }
        const payload = {
            company_id: companyId,
            branch_id: branchId,
            items: [],
        };

        const globalImeis = new Set();
        let hasError = false;

        $productsTable.find("tr.dynamic-form").each(function (index) {
            const row = $(this);
            const key = getRowKey(row);
            const productId = row.find(".produto_id").val();
            const quantity = getRowQuantity(row);

            if (!productId) {
                return;
            }

            ensureState(key);
            imeiState[key].product_id = imeiState[key].product_id || productId;

            if (!requiresTracking(imeiState[key].tracking)) {
                return;
            }

            if (!quantity || quantity < 1) {
                swal(
                    "Atenção",
                    `Informe uma quantidade válida para o item ${index + 1}.`,
                    "warning"
                );
                hasError = true;
                return false;
            }

            if (imeiState[key].imeis.length !== quantity) {
                swal(
                    "Atenção",
                    `O item ${
                        index + 1
                    } precisa ter ${quantity} IMEIs/Seriais cadastrados.`,
                    "warning"
                );
                hasError = true;
                return false;
            }

            const imeis = imeiState[key].imeis;
            for (let i = 0; i < imeis.length; i++) {
                const code = imeis[i];
                if (globalImeis.has(code)) {
                    swal(
                        "Atenção",
                        `O IMEI/Serial "${code}" foi informado em mais de um item.`,
                        "warning"
                    );
                    hasError = true;
                    return false;
                }
                globalImeis.add(code);
            }

            payload.items.push({
                product_id: productId,
                quantity: quantity,
                imeis: imeis,
            });
        });

        if (payload.items.length > 0) {
            if (!payload.branch_id) {
                payload.branch_id = getFirstItemBranch();
            }
            // Corrigir a verificação de branch_id aqui abaixo, parace haver duas verificacoes sem necessidade

            // if (!payload.branch_id) {
            //     swal(
            //         "Atenção",
            //         "Selecione o local/filial para continuar.",
            //         "warning"
            //     );
            //     return null;
            // }
        }

        if (hasError) {
            return null;
        }

        return payload;
    }

    function toggleSavingState(disabled) {
        if (disabled) {
            $saveButton.prop("disabled", true);
        } else {
            $saveButton.prop("disabled", false);
        }
    }

    function getFirstItemBranch() {
        let branch = null;
        $productsTable.find(localItemSelector).each(function () {
            const value = $(this).val();
            if (value) {
                branch = value;
                return false;
            }
        });
        return branch;
    }
});
