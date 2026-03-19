<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdicionalItemPedidoIfood extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_pedido_id', 'nome', 'tipo', 'quantidade', 'valor_unitario', 'sub_total'
    ];
}
