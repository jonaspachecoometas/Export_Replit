<?php

namespace App\Utils\Fiscal;

use App\Utils\Fiscal\Rules\{
    CfopRule,
    CstRule,
    ProdutoRule
};

class FiscalValidator
{
    protected array $rules;

    public function __construct()
    {
        $this->rules = [
            new CfopRule(),
            new CstRule(),
            new ProdutoRule(),
        ];
    }

    public function validate($nfe, $empresa): array
    {
        $result = new FiscalResult();

        foreach ($this->rules as $rule) {
            $rule->validate($nfe, $empresa, $result);
        }

        return $result->toArray();
    }
}
