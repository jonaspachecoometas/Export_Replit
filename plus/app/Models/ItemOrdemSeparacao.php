<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemOrdemSeparacao extends Model
{
    use HasFactory;

    protected $fillable = [
        'ordem_id', 'produto_id', 'quantidade', 'status', 'observacao_item'
    ];

    public function produto(){
        return $this->belongsTo(Produto::class, 'produto_id');
    }

    public function estadoItem(){
        if($this->status == 'pendente'){
            return "<span class='badge bg-warning p-1'>PENDENTE</span>";
        }elseif($this->status == 'separado'){
            return "<span class='badge bg-success p-1'>SEPARADO</span>";
        }elseif($this->status == 'sem_estoque'){
            return "<span class='badge bg-danger p-1'>SEM ESTOQUE</span>";
        }
    }
}
