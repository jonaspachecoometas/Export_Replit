<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustoProdutoConfiguracao extends Model
{
    use HasFactory;

    protected $fillable = [
        'produto_id', 'imposto_percentual', 'taxa_cartao_percentual', 'despesas_percentual', 'margem_minima_percentual', 'ativo'
    ];

    public function produto(){
        return $this->belongsTo(Produto::class, 'produto_id');
    }
}
