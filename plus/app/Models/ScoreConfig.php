<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScoreConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id', 'pagamentos', 'volume', 'tempo', 'ticket', 'penalidades', 'categorias'
    ];

    protected $casts = [
        'pagamentos'   => 'array',
        'volume'       => 'array',
        'tempo'        => 'array',
        'ticket'       => 'array',
        'penalidades'  => 'array',
        'categorias'   => 'array',
    ];
}
