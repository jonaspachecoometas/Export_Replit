<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Produto;
use App\Models\ProdutoVariacao;
use App\Models\ImeiUnit;

class StoreStockEntryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'company_id' => 'required|exists:empresas,id',
            'branch_id' => 'required|exists:localizacaos,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:produtos,id',
            'items.*.product_variant_id' => 'nullable|exists:produto_variacaos,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.imeis' => 'nullable|array',
            'items.*.imeis.*' => 'nullable|string',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $itemsInput = $this->input('items', []);

            if (!is_array($itemsInput)) {
                return;
            }

            $items = $itemsInput;

            $productIds = array_filter(array_column($itemsInput, 'product_id'));
            $products = Produto::whereIn('id', $productIds)->get()->keyBy('id');

            $globalImeis = [];

            foreach ($items as $index => $item) {
                $productId = $item['product_id'] ?? null;
                $quantity = (int) ($item['quantity'] ?? 0);
                $imeis = $item['imeis'] ?? [];
                $variantId = $item['product_variant_id'] ?? null;

                if (!$productId || !$products->has($productId)) {
                    $validator->errors()->add("items.$index.product_id", 'Produto inválido.');
                    continue;
                }

                $product = $products->get($productId);

                if ($variantId) {
                    $variantExists = ProdutoVariacao::where('produto_id', $productId)
                        ->where('id', $variantId)
                        ->exists();

                    if (!$variantExists) {
                        $validator->errors()->add("items.$index.product_variant_id", 'Variação não pertence ao produto informado.');
                    }
                }

                if (in_array($product->tracking_type, [Produto::TRACKING_SERIAL, Produto::TRACKING_IMEI], true)) {
                    if (empty($imeis) || !is_array($imeis)) {
                        $validator->errors()->add("items.$index.imeis", 'Informe os IMEIs/seriais para este produto.');
                        continue;
                    }

                    $imeis = array_values(array_filter(array_map('trim', $imeis), fn ($value) => $value !== ''));

                    if (count($imeis) !== $quantity) {
                        $validator->errors()->add("items.$index.imeis", 'A quantidade de IMEIs/seriais deve ser igual à quantidade.');
                    }

                    if (count($imeis) !== count(array_unique($imeis))) {
                        $validator->errors()->add("items.$index.imeis", 'Existem IMEIs/seriais repetidos neste item.');
                    }

                    $duplicates = array_intersect($globalImeis, $imeis);
                    if (!empty($duplicates)) {
                        $validator->errors()->add("items.$index.imeis", 'Existem IMEIs/seriais duplicados na requisição.');
                    }

                    if (!empty($imeis) && ImeiUnit::whereIn('imei_or_serial', $imeis)->exists()) {
                        $validator->errors()->add("items.$index.imeis", 'Um ou mais IMEIs/seriais já estão cadastrados.');
                    }

                    $globalImeis = array_merge($globalImeis, $imeis);
                    $items[$index]['imeis'] = $imeis;
                }
            }

            if ($items !== $itemsInput) {
                $this->merge(['items' => $items]);
            }
        });
    }
}
