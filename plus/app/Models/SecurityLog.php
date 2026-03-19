<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip', 'user_id', 'rota', 'arquivo', 'acao'
    ];

    public function usuario(){
        return $this->belongsTo(User::class, 'user_id');
    }

}
