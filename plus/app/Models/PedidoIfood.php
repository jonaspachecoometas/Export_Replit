<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PedidoIfood extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id', 'cliente_nome', 'cliente_documento', 'ifood_id', 'tipo_pedido', 'id_exibicao', 'data_pedido', 'valor_produtos',
        'valor_entrega', 'valor_adicional', 'total', 'informacao_adicional'
    ];

    public function itens()
    {
        return $this->hasMany(ItemPedidoIfood::class, 'pedido_id');
    }

    public function entrega()
    {
        return $this->hasOne(EntregaPedidoIfood::class, 'pedido_id');
    }

    public function pagamentos()
    {
        return $this->hasMany(PagamentoPedidoIfood::class, 'pedido_id');
    }

}
