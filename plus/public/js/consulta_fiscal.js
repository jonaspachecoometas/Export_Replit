function consultarFiscal(id, tipo = 'nfe') {
    abrirFiscalLoader();

    $('#fiscalTitle').text('Validando nota...');
    $('#fiscalSubtitle').text('Analisando regras fiscais');
    $('#fiscalContent').html('<p>Aguarde...</p>');
    $('#fiscalIcon').attr('class', 'fiscal-icon').text('⏳');
    $('#btnFiscalConfirm').addClass('d-none');
    let url = path_url + 'api/nfe_painel/consulta-fiscal'
    if(tipo == 'nfce'){
        url = path_url + 'api/nfce_painel/consulta-fiscal'
    }

    $.get(url, {
        nfe_id: id
    })
    .done(function (res) {
        console.log(res)
        let html = '<ul>';

        res.mensagens.forEach(function (m) {
            let icon = m.tipo === 'erro' ? '❌' : '⚠️';

            html += `
            <li>
            ${icon} <strong>${m.tipo.toUpperCase()}:</strong>
            ${m.mensagem}
            ${m.sugestao ? `<br><em>Sugestão: ${m.sugestao}</em>` : ''}
            </li>
            `;
        });

        html += '</ul>';

        $('#fiscalContent').html(html);

        // ERRO
        if (res.status === 'erro') {
            $('#fiscalIcon').attr('class', 'fiscal-icon error').text('✖');
            $('#fiscalTitle').text('Erro Fiscal');
            $('#fiscalSubtitle').text(
                'Foram encontrados problemas que impedem a transmissão.'
                );
            $('#btnFiscalConfirm').addClass('d-none');
        }

        // ALERTA
        if (res.status === 'alerta') {
            $('#fiscalIcon').attr('class', 'fiscal-icon warning').text('!');
            $('#fiscalTitle').text('Atenção Fiscal');
            $('#fiscalSubtitle').text(
                'Existem alertas fiscais. Deseja continuar mesmo assim?'
                );
            $('#btnFiscalConfirm')
            .removeClass('d-none')
            .removeClass('btn-danger')
            .addClass('btn-warning')
            .text('Transmitir mesmo assim')
            .off()
            .on('click', function () {
                fecharFiscalLoader();
            });
        }

        // OK
        if (res.status === 'ok') {
            fecharFiscalLoader();
        }

    })
    .fail(function () {
        $('#fiscalIcon').attr('class', 'fiscal-icon error').text('✖');
        $('#fiscalTitle').text('Erro');
        $('#fiscalSubtitle').text('Falha ao consultar validação fiscal');
        $('#fiscalContent').html('');
    });
}

function abrirFiscalLoader() {
    $('#fiscalLoader').removeClass('d-none');
}

function fecharFiscalLoader() {
    $('#fiscalLoader').addClass('d-none');
}

$('#btnFiscalCancel').on('click', function () {
    fecharFiscalLoader();
});
