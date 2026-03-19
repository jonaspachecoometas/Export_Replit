<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PagamentoPedidoIfood extends Model
{
    use HasFactory;

    protected $fillable = [
        'pedido_id', 'valor', 'tipo_pagamento', 'pre_pago', 'codigo_autorizacao', 'bandeira_cartao'
    ];
}
