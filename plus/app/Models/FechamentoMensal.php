<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FechamentoMensal extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id',
        'mes',
        'total_vendas',
        'total_despesas',
        'lucro_estimado',
        'ticket_medio',
        'dados',
        'fechado_em',
        'fechado_por',
    ];

    protected $casts = [
        'dados' => 'array',
        'fechado_em' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'fechado_por');
    }
    
}
