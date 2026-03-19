<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EntregaPedidoIfood extends Model
{
    use HasFactory;

    protected $fillable = [
        'pedido_id', 'descricao', 'rua', 'numero', 'bairro', 'complemento', 'referencia', 'cidade', 'uf',
        'cep', 'latitude', 'longitude', 'observacao'
    ];
}
