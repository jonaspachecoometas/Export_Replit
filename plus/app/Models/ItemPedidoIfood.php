<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemPedidoIfood extends Model
{
    use HasFactory;

    protected $fillable = [
        'pedido_id', 'nome', 'id_pedido', 'id_unico', 'codigo_externo', 'ean', 'quantidade', 'valor_unitario', 'sub_total',
        'observacao', 'imagem_url', 'unidade', 'valor_adicionais', 'valor_personalizado'
    ];

    public function adicionais()
    {
        return $this->hasMany(AdicionalItemPedidoIfood::class, 'item_pedido_id');
    }

}
