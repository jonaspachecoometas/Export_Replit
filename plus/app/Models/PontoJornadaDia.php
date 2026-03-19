<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PontoJornadaDia extends Model
{
    use HasFactory;

    protected $fillable = [
        'jornada_id', 'dia_semana', 'entrada', 'intervalo_inicio', 'intervalo_fim', 'saida'
    ];
}
