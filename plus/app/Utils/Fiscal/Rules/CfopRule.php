<?php

namespace App\Utils\Fiscal\Rules;

use App\Utils\Fiscal\FiscalResult;

class CfopRule implements FiscalRuleInterface
{
    public function validate($nfe, $empresa, FiscalResult $result): void
    {   

        foreach ($nfe->itens as $index => $item) {
            if (empty($item->cfop) || strlen($item->cfop) < 4) {
                $result->add(
                    'erro',
                    "cfop_item_" . ($index + 1),
                    "Item ".($index + 1)." sem CFOP informado ou incompleto",
                    'Informe o CFOP do item'
                );
            }
        }

        if ($nfe->tpNF == 1 && $nfe->outroEstado() == 0) {
            foreach ($nfe->itens as $index => $item) {
                if (str_starts_with($item->cfop, '6')) {
                    $result->add(
                        'alerta',
                        "cfop_item_" . ($index + 1),
                        "CFOP interestadual usado em operação interna Item " . ($index + 1),
                        'Utilize CFOP iniciado em 5'
                    );
                }
            }
        }

        if (
            $nfe->tpNF == 1 &&
            $nfe->outroEstado() &&
            !isset($nfe->troco)
        ) {
            foreach ($nfe->itens as $index => $item) {
                if (str_starts_with($item->cfop, '5')) {
                    $result->add(
                        'erro',
                        "cfop_item_" . ($index + 1),
                        "CFOP interno usado em operação interestadual Item " . ($index + 1),
                        'Utilize CFOP iniciado em 6'
                    );
                }
            }
        }
    }
}
