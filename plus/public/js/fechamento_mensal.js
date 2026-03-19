
let dadosCarregados = false;

$(function(){
    // $('input[type="checkbox"]').prop('checked', false);
})

$('#btnCarregar').click(function () {
    let mes = $('#mes').val();

    $.get(path_url + "fechamento-mensal-resumo", { mes })
    .done(function (res) {

        if (res.fechado) {

            swal({
                title: "Mês já fechado",
                text: "Este mês já possui um fechamento realizado.\n\n" +
                "Os dados não podem mais ser alterados.",
                icon: "info",
                buttons: {
                    confirm: {
                        text: "Entendi",
                        className: "btn btn-primary"
                    }
                }
            });

            limparResumo();
            $('#btnFechar').prop('disabled', true);
            return;
        }

        preencherResumo(res);
        preencherAlertas(res.alertas);
        preencherTopClientes(res.top_clientes);

        dadosCarregados = true;
        validarBotao();

    })
    .fail(function () {
        swal("Erro", "Erro ao carregar os dados do mês.", "error");
    });
});

$('#btnCarregar').click(function () {
    dadosCarregados = true;
    validarBotao();
});

$('.checklist').change(function () {
    validarBotao();
});

function preencherTopClientes(lista) {

    $('#tbodyTopClientes').empty();

    $('#loadingTopClientes').addClass('d-none');
    $('#boxTopClientes').addClass('d-none');
    $('#topClientesVazio').addClass('d-none');

    if (!lista || lista.length === 0) {
        $('#topClientesVazio').removeClass('d-none');
        return;
    }

    $('#boxTopClientes').removeClass('d-none');

    lista.forEach((item, index) => {

        let pos = index + 1;
        let medalha =
        pos === 1 ? '🥇' :
        pos === 2 ? '🥈' :
        pos === 3 ? '🥉' : pos;

        let badgePDV = item.cliente_id ? '' :
        '<span class="badge bg-light text-dark border ms-1">PDV</span>';

        let linha = `
        <tr class="hover-pointer" data-cliente="${item.cliente_id ?? ''}">
        <td class="fw-bold">${medalha}</td>

        <td>
        <div class="fw-semibold text-truncate" style="max-width:230px">
        ${item.nome}
        ${badgePDV}
        </div>
        </td>

        <td class="text-center">
        <span class="badge bg-light text-dark border">
        ${item.total_vendas}
        </span>
        </td>

        <td class="text-end fw-bold text-primary">
        R$ ${convertFloatToMoeda(item.total_comprado)}
        </td>
        </tr>
        `;

        $('#tbodyTopClientes').append(linha);
    });
}


function validarBotao() {
    let total = $('.checklist').length;
    let marcados = $('.checklist:checked').length;

    if(dadosCarregados){
        $('#buscar-vendas').removeClass('d-none')
        $('#buscar-despesas').removeClass('d-none')
    }

    $('#btnFechar').prop(
        'disabled',
        !(dadosCarregados && marcados === total)
        );
}

function limparResumo() {
    $('#totalVendas').text('R$ 0,00');
    $('#totalDespesas').text('R$ 0,00');
    $('#lucroEstimado').text('R$ 0,00');
    $('#ticketMedio').text('R$ 0,00');
}

function preencherResumo(res) {
    $('#totalVendas').text("R$ " + convertFloatToMoeda(res.total_vendas));
    $('#totalDespesas').text("R$ " + convertFloatToMoeda(res.total_despesas));
    $('#lucroEstimado').text("R$ " + convertFloatToMoeda(res.lucro_estimado));
    $('#ticketMedio').text("R$ " + convertFloatToMoeda(res.ticket_medio));

    $('#totalNfe').text("R$ " + convertFloatToMoeda(res.fiscal?.nfe?.total ?? 0) + " - registros: " + res.fiscal?.nfe?.quantidade ?? 0);

    $('#totalNfce').text("R$ " + convertFloatToMoeda(res.fiscal?.nfce?.total ?? 0) + " - registros: " + res.fiscal?.nfce?.quantidade ?? 0);

    $('#estoqueCompra').text("R$ " + convertFloatToMoeda(res.estoque?.total_compra ?? 0));
    $('#estoqueVenda').text("R$ " + convertFloatToMoeda(res.estoque?.total_venda ?? 0));
    $('#totalProdutos').text(res.estoque?.total_produtos ?? 0);
    $('#totalRecebido').text("R$ " + convertFloatToMoeda(res.financeiro?.recebido ?? 0));

    $('#totalAberto').text("R$ " + convertFloatToMoeda(res.financeiro?.em_aberto ?? 0));

    if (res.comparativo?.toggle) {

        let vendas = res.comparativo.vendas.toFixed(1);
        let lucro  = res.comparativo.lucro.toFixed(1);

        $('#compVendas')
        .text((vendas >= 0 ? '↑ ' : '↓ ') + Math.abs(vendas) + '%')
        .removeClass()
        .addClass(vendas >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold');

        $('#compLucro')
        .text((lucro >= 0 ? '↑ ' : '↓ ') + Math.abs(lucro) + '%')
        .removeClass()
        .addClass(lucro >= 0 ? 'text-success fw-bold' : 'text-danger fw-bold');

    } else {
        $('#compVendas').text('—');
        $('#compLucro').text('—');
    }
}

function preencherAlertas(alertas) {

    let temAlerta = false;

    if ((alertas.produtos_sem_custo ?? 0) > 0) {
        $('#qtdSemCusto').text(alertas.produtos_sem_custo);
        $('#alertaSemCusto').removeClass('d-none');
        temAlerta = true;
    }

    if ((alertas.produtos_parados_90 ?? 0) > 0) {
        $('#qtdParados').text(alertas.produtos_parados_90);
        $('#alertaParados').removeClass('d-none');
        temAlerta = true;
    }

    if (alertas.qtd_caixas_aberto > 0) {
        $('#alertaCaixa').removeClass('d-none');
        $('#qtdCaixas').text(alertas.qtd_caixas_aberto);

        temAlerta = true;
    }

    if (!temAlerta) {
        $('#alertaOk').removeClass('d-none');
    }
}


$('.checklist').change(function () {
    let total = $('.checklist').length;
    let marcados = $('.checklist:checked').length;
    let perc = Math.round((marcados / total) * 100);

    $('#progressFechamento')
    .css('width', perc + '%')
    .text(perc + '%');

    $('#btnFechar').prop('disabled', perc < 100);
});

$('#btnFechar').click(function () {
    let mes = $('#mes').val();

    swal({
        title: "Confirmar fechamento?",
        text: "Após confirmar, os dados deste mês não poderão ser alterados.",
        icon: "warning",
        buttons: {
            cancel: {
                text: "Cancelar",
                value: null,
                visible: true,
                className: "btn btn-secondary",
                closeModal: true,
            },
            confirm: {
                text: "Sim, fechar mês",
                value: true,
                visible: true,
                className: "btn btn-success",
                closeModal: false
            }
        },
        dangerMode: true,
    }).then(function (isConfirm) {

        if (!isConfirm) return;

        $.get(path_url + "fechamento-mensal-fechar", {
            mes: mes,
        })
        .done(function (res) {
            console.log(res)
            swal("Fechamento realizado!",
                "O mês foi fechado com sucesso.",
                "success"
                ).then(function () {
                    location.reload();
                });

            })
        .fail(function (xhr) {
            // console.log(xhr)
            let msg = "Erro ao fechar o mês.";
            if (xhr.responseJSON) {
                msg = xhr.responseJSON;
            }

            swal("Erro", msg, "error");

        });

    });
});

$('#buscar-vendas').on('click', function () {

    const mes = $('#mes').val();

    $('#listaVendas').html(`
        <tr>
            <td colspan="5" class="text-center text-muted">
                Carregando vendas...
            </td>
        </tr>
    `);

    $.ajax({
        url: path_url + "fechamento-mensal-vendas",
        type: "GET",
        data: {
            empresa_id: $('#empresa_id').val(),
            mes: mes
        },
        success: function (resp) {
            // console.log(resp)
            $('#modalVendas').modal('show')
            if (!resp.vendas || resp.vendas.length === 0) {
                $('#listaVendas').html(`
                    <tr>
                        <td colspan="5" class="text-center text-muted">
                            Nenhuma venda encontrada
                        </td>
                    </tr>
                `);
                return;
            }

            let html = '';

            resp.vendas.forEach(v => {
                html += `
                    <tr>
                        <td>#${v.codigo}</td>
                        <td>${v.cliente}</td>
                        <td>${v.data}</td>
                        <td class="text-end text-success fw-semibold">
                            R$ ${v.valor}
                        </td>
                        <td>
                            <span class="badge bg-${v.tipo === 'NFe' ? 'primary' : 'success'}">
                                ${v.tipo}
                            </span>
                        </td>
                    </tr>
                `;
            });

            $('#listaVendas').html(html);

        },
        error: function () {
            $('#listaVendas').html(`
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Erro ao buscar vendas
                    </td>
                </tr>
            `);
        }
    });
});

$('#buscar-despesas').on('click', function () {

    const mes = $('#mes').val();

    $('#listaVendas').html(`
        <tr>
            <td colspan="5" class="text-center text-muted">
                Carregando despesas...
            </td>
        </tr>
    `);

    $.ajax({
        url: path_url + "fechamento-mensal-despesas",
        type: "GET",
        data: {
            empresa_id: $('#empresa_id').val(),
            mes: mes
        },
        success: function (resp) {
            // console.log(resp)
            $('#modalDespesas').modal('show')
            if (!resp.despesas || resp.despesas.length === 0) {
                $('#listaDespesas').html(`
                    <tr>
                        <td colspan="5" class="text-center text-muted">
                            Nenhuma despesa encontrada
                        </td>
                    </tr>
                `);
                return;
            }

            let html = '';

            resp.despesas.forEach(v => {
                html += `
                    <tr>
                        <td>${v.fornecedor}</td>
                        <td>${v.data}</td>
                        <td class="text-end text-success fw-semibold">
                            R$ ${v.valor}
                        </td>
                        <td>${v.categoria}</td>
                            
                    </tr>
                `;
            });

            $('#listaDespesas').html(html);

        },
        error: function () {
            $('#listaDespesas').html(`
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Erro ao buscar despesas
                    </td>
                </tr>
            `);
        }
    });
});
