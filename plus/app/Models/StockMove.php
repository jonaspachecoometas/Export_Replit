<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockMove extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'branch_id',
        'type',
        'origin_type',
        'origin_id',
    ];

    public function company()
    {
        return $this->belongsTo(Empresa::class, 'company_id');
    }

    public function branch()
    {
        return $this->belongsTo(Localizacao::class, 'branch_id');
    }

    public function imeiUnits()
    {
        return $this->belongsToMany(ImeiUnit::class, 'stock_move_imei', 'stock_move_id', 'imei_unit_id')->withTimestamps();
    }

    public function origin()
    {
        return $this->morphTo();
    }
}
