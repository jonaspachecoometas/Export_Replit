<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClienteScoreHistorico extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id', 'score_total', 'categoria', 'limite_credito', 'referencia_mes'
    ];
}
