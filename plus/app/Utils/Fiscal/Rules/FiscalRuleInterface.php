<?php

namespace App\Utils\Fiscal\Rules;

use App\Utils\Fiscal\FiscalResult;

interface FiscalRuleInterface
{
    public function validate($nfe, $empresa, FiscalResult $result): void;
}
