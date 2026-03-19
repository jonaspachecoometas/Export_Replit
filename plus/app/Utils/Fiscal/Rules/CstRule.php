<?php

namespace App\Utils\Fiscal\Rules;

use App\Utils\Fiscal\FiscalResult;

class CstRule implements FiscalRuleInterface
{
    public function validate($nfe, $empresa, FiscalResult $result): void
    {
        if ($empresa->tributacao === 'Simples Nacional' || $empresa->tributacao === 'MEI') {
            foreach ($nfe->itens as $key =>  $item) {
                if ($item->cst_csosn === '00') {
                    $result->add(
                        'erro',
                        'cst',
                        'Empresa do Simples Nacional não pode usar CST 00, Item '.($key+1) ,
                        'Utilize CSOSN 102 ou 500'
                    );
                }
            }
        }

        if ($empresa->tributacao === 'Regime Normal') {
            foreach ($nfe->itens as $key => $item) {
                if (str_starts_with($item->cst_csosn, '1')) {
                    $result->add(
                        'erro',
                        'cst',
                        'Empresa do Regime Normal não pode usar CSOSN, Item'.($key+1),
                        'Utilize CST (00, 10, 20, 40, 41, 60...)'
                    );
                }
            }
        }
    }
}
