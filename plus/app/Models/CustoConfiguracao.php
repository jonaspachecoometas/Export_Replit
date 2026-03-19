<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustoConfiguracao extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id', 'imposto_percentual', 'taxa_cartao_percentual', 'despesas_percentual', 'margem_minima_percentual'
    ];
}
