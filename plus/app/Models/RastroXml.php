<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RastroXml extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_nfe_id', 'nLote', 'qLote', 'dFab', 'dVal'
    ];

    public function item()
    {
        return $this->belongsTo(ItemNfe::class, 'item_nfe_id');
    }
}
