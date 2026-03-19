<?php

namespace App\Services;

use App\Models\ImeiUnit;
use App\Models\Nfe;
use App\Models\StockMove;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockSaleService
{
    /**
     * @param  array<int, array<string, mixed>>  $items
     */
    public function handleSale(Nfe $nfe, array $items): void
    {
        if (empty($items)) {
            return;
        }

        $grouped = [];
        foreach ($items as $item) {
            $productId = Arr::get($item, 'product_id');
            $imeiIds = array_filter(Arr::get($item, 'imei_unit_ids', []));
            if (!$productId || empty($imeiIds)) {
                continue;
            }
            $grouped[$productId] = array_merge($grouped[$productId] ?? [], $imeiIds);
        }

        if (empty($grouped)) {
            return;
        }

        $quantities = [];
        foreach ($nfe->itens as $item) {
            $quantities[$item->produto_id] = ($quantities[$item->produto_id] ?? 0) + (int) $item->quantidade;
        }

        foreach ($grouped as $productId => $ids) {
            if (!isset($quantities[$productId])) {
                throw ValidationException::withMessages([
                    'sale_imeis_payload' => 'Produto inválido para rastreamento de IMEI/Serial.',
                ]);
            }
            if (count($ids) !== (int) $quantities[$productId]) {
                throw ValidationException::withMessages([
                    'sale_imeis_payload' => 'Quantidade de IMEIs/Seriais não confere com a quantidade vendida.',
                ]);
            }
        }

        $uniqueIds = collect($grouped)->flatten()->unique()->values();

        DB::transaction(function () use ($nfe, $grouped, $uniqueIds) {
            $units = ImeiUnit::whereIn('id', $uniqueIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $move = StockMove::create([
                'company_id' => $nfe->empresa_id,
                'branch_id' => $nfe->local_id,
                'type' => 'sale',
                'origin_type' => Nfe::class,
                'origin_id' => $nfe->id,
            ]);

            foreach ($grouped as $productId => $ids) {
                foreach ($ids as $imeiId) {
                    $unit = $units->get($imeiId);
                    if (!$unit) {
                        throw ValidationException::withMessages([
                            'sale_imeis_payload' => 'Alguns IMEIs/Seriais não foram encontrados.',
                        ]);
                    }
                    if ($unit->status !== 'available') {
                        throw ValidationException::withMessages([
                            'sale_imeis_payload' => "O IMEI/Serial {$unit->imei_or_serial} não está disponível.",
                        ]);
                    }
                    if ((int) $unit->product_id !== (int) $productId) {
                        throw ValidationException::withMessages([
                            'sale_imeis_payload' => "O IMEI/Serial {$unit->imei_or_serial} pertence a outro produto.",
                        ]);
                    }
                    if ((int) $unit->branch_id !== (int) $nfe->local_id) {
                        throw ValidationException::withMessages([
                            'sale_imeis_payload' => "O IMEI/Serial {$unit->imei_or_serial} não está disponível nesta filial.",
                        ]);
                    }

                    $unit->status = 'sold';
                    $unit->branch_id = $nfe->local_id;
                    $unit->save();

                    $move->imeiUnits()->syncWithoutDetaching([$unit->id]);
                    $nfe->imeiUnits()->syncWithoutDetaching([$unit->id]);
                }
            }
        });
    }
}
