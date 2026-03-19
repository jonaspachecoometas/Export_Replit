// Consulta CEP via ViaCEP
$(document).on("blur", "#inp-cep", function () {
    let cep = $(this).val().replace(/[^0-9]/g, '');
    
    if (cep.length == 8) {
        $.get('https://viacep.com.br/ws/' + cep + '/json/')
        .done(function(data) {
            if (data && !data.erro) {
                $("#inp-rua").val(data.logradouro || '');
                $("#inp-bairro").val(data.bairro || '');
                
                // Busca cidade pelo código IBGE
                if (data.ibge && typeof findCidade === 'function') {
                    findCidade(data.ibge);
                }
            }
        })
        .fail(function(err) {
            console.log('Erro ao consultar CEP:', err);
        });
    }
});

// Consulta CNPJ alternativa (fallback)
$(document).on("blur", ".cnpj-lookup", function () {
    let cnpj = $(this).val().replace(/[^0-9]/g, '');
    
    if (cnpj.length == 14) {
        // Tenta API principal
        $.get('https://publica.cnpj.ws/cnpj/' + cnpj)
        .done(function(data) {
            if (data != null) {
                preencherDadosCNPJ(data);
            }
        })
        .fail(function(err) {
            console.log('Erro na API CNPJ.ws, tentando BrasilAPI...');
            // Fallback para BrasilAPI
            $.get('https://brasilapi.com.br/api/cnpj/v1/' + cnpj)
            .done(function(data) {
                if (data) {
                    preencherDadosBrasilAPI(data);
                }
            })
            .fail(function(err2) {
                console.log('Erro ao consultar CNPJ:', err2);
            });
        });
    }
});

function preencherDadosCNPJ(data) {
    let ie = '';
    if (data.estabelecimento && data.estabelecimento.inscricoes_estaduais && data.estabelecimento.inscricoes_estaduais.length > 0) {
        ie = data.estabelecimento.inscricoes_estaduais[0].inscricao_estadual;
    }
    
    $('#inp-ie').val(ie);
    if (ie != "") {
        $('#inp-contribuinte').val(1).change();
    }
    $('#inp-nome').val(data.razao_social);
    $('#inp-nome_fantasia').val(data.estabelecimento.nome_fantasia);
    $("#inp-rua").val((data.estabelecimento.tipo_logradouro || '') + " " + (data.estabelecimento.logradouro || ''));
    $('#inp-numero').val(data.estabelecimento.numero);
    $("#inp-bairro").val(data.estabelecimento.bairro);
    
    if (data.estabelecimento.cep) {
        let cep = data.estabelecimento.cep.replace(/[^\d]+/g, '');
        $('#inp-cep').val(cep.substring(0, 5) + '-' + cep.substring(5, 9));
    }
    
    $('#inp-email').val(data.estabelecimento.email);
    $('#inp-telefone').val(data.estabelecimento.telefone1);

    if (data.estabelecimento.cidade && data.estabelecimento.cidade.ibge_id && typeof findCidade === 'function') {
        findCidade(data.estabelecimento.cidade.ibge_id);
    }
}

function preencherDadosBrasilAPI(data) {
    $('#inp-nome').val(data.razao_social);
    $('#inp-nome_fantasia').val(data.nome_fantasia);
    $("#inp-rua").val(data.logradouro || '');
    $('#inp-numero').val(data.numero);
    $("#inp-bairro").val(data.bairro);
    
    if (data.cep) {
        let cep = data.cep.replace(/[^\d]+/g, '');
        $('#inp-cep').val(cep.substring(0, 5) + '-' + cep.substring(5, 9));
    }
    
    $('#inp-email').val(data.email);
    $('#inp-telefone').val(data.ddd_telefone_1);
}
