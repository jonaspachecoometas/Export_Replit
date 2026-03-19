<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RotinaExecucao extends Model
{
    use HasFactory;
    protected $table = 'rotina_execucaos';
    public $timestamps = false;

    protected $fillable = [
        'empresa_id', 'rotina', 'data_execucao', 'executado_em'
    ];
}
