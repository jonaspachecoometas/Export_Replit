<?php

namespace App\Utils\Fiscal\Rules;

use App\Utils\Fiscal\FiscalResult;

class ProdutoRule implements FiscalRuleInterface
{
    public function validate($nfe, $empresa, FiscalResult $result): void
    {
        foreach ($nfe->itens as $key => $item) {
            if (empty($item->ncm)) {
                $result->add(
                    'erro',
                    'ncm',
                    'Produto sem NCM informado, Item ' . ($key+1),
                    'Informe o NCM antes de emitir a nota'
                );
            }
        }
    }
}
