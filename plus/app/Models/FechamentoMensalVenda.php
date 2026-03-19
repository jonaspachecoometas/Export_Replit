<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FechamentoMensalVenda extends Model
{
    use HasFactory;

    protected $fillable = [
        'fechamento_id', 'tipo', 'codigo', 'cliente', 'data', 'valor'
    ];

}
