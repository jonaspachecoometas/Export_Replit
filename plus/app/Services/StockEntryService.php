<?php

namespace App\Services;

use App\Models\StockMove;
use App\Models\Produto;
use App\Models\ImeiUnit;
use Illuminate\Support\Facades\DB;

class StockEntryService
{
    public function createEntry(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $stockMove = StockMove::create([
                'company_id' => $data['company_id'],
                'branch_id' => $data['branch_id'],
                'type' => 'entry',
                'origin_type' => $data['origin_type'] ?? null,
                'origin_id' => $data['origin_id'] ?? null,
            ]);

            $createdImeiUnits = [];

            foreach ($data['items'] as $item) {
                $product = Produto::find($item['product_id']);

                if (!$product) {
                    continue;
                }

                if (!in_array($product->tracking_type, [Produto::TRACKING_SERIAL, Produto::TRACKING_IMEI], true)) {
                    continue;
                }

                $imeis = $item['imeis'] ?? [];
                $variantId = $item['product_variant_id'] ?? null;

                foreach ($imeis as $imei) {
                    $imeiUnit = ImeiUnit::create([
                        'product_id' => $product->id,
                        'product_variant_id' => $variantId,
                        'company_id' => $data['company_id'],
                        'branch_id' => $data['branch_id'],
                        'imei_or_serial' => trim($imei),
                        'status' => 'available',
                    ]);

                    $createdImeiUnits[] = $imeiUnit;
                }
            }

            if (!empty($createdImeiUnits)) {
                $stockMove->imeiUnits()->syncWithoutDetaching(collect($createdImeiUnits)->pluck('id')->all());
            }

            return [
                'stock_move' => $stockMove,
                'imei_units' => $createdImeiUnits,
            ];
        });
    }
}
