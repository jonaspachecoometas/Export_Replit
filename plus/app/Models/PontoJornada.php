<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PontoJornada extends Model
{
    use HasFactory;

    protected $fillable = [
        'empresa_id', 'descricao', 'intervalo_minutos', 'tolerancia_atraso', 'hora_extra_apos_minutos', 'ativo'
    ];
}
