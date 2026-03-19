<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImeiUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'product_variant_id',
        'company_id',
        'branch_id',
        'imei_or_serial',
        'status',
    ];

    public function product()
    {
        return $this->belongsTo(Produto::class, 'product_id');
    }

    public function productVariant()
    {
        return $this->belongsTo(ProdutoVariacao::class, 'product_variant_id');
    }

    public function company()
    {
        return $this->belongsTo(Empresa::class, 'company_id');
    }

    public function branch()
    {
        return $this->belongsTo(Localizacao::class, 'branch_id');
    }

    public function stockMoves()
    {
        return $this->belongsToMany(StockMove::class, 'stock_move_imei', 'imei_unit_id', 'stock_move_id')->withTimestamps();
    }

    public function sales()
    {
        return $this->belongsToMany(Nfe::class, 'nfe_imei_units');
    }
}
