<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClienteScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_id', 'score_total', 'score_pagamentos', 'score_volume', 'score_tempo', 'score_ticket', 'score_penalidades',
        'categoria', 'limite_credito'
    ];

    public static function categorias(){
        return [
            'bronze' => 'Bronze',
            'prata' => 'Prata',
            'ouro' => 'Ouro',
        ];
    }
}
