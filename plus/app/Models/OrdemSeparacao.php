<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrdemSeparacao extends Model
{
    use HasFactory;

    protected $fillable = [
        'nfe_id', 'cliente_id', 'numero_sequencial', 'status', 'funcionario_id', 'empresa_id', 'observacao',
        'usuario_id_inicia', 'usuario_id_inicia', 'usuario_id_finaliza', 'prioridade'
    ];

    public function orcamento()
    {
        return $this->belongsTo(Nfe::class, 'nfe_id');
    }

    public function usuarioInicia()
    {
        return $this->belongsTo(User::class, 'usuario_id_inicia');
    }

    public function usuarioFinaliza()
    {
        return $this->belongsTo(User::class, 'usuario_id_finaliza');
    }

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'cliente_id');
    }

    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'funcionario_id');
    }

    public function itens()
    {
        return $this->hasMany(ItemOrdemSeparacao::class, 'ordem_id');
    }

}
