<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FechamentoMensalDespesa extends Model
{
    use HasFactory;

    protected $fillable = [
        'fechamento_id', 'fornecedor', 'data', 'categoria', 'valor'
    ];

}
