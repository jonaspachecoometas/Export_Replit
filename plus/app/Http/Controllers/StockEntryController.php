<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStockEntryRequest;
use App\Services\StockEntryService;
use Illuminate\Support\Facades\Auth;

class StockEntryController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:estoque_create', ['only' => ['create']]);
    }

    public function create()
    {
        $empresaWrapper = Auth::user()->empresa;
        $company = $empresaWrapper ? $empresaWrapper->empresa : null;
        $branches = __getLocaisAtivoUsuario();
        return view('stock_entries.create', [
            'company' => $company,
            'companyId' => $company?->id,
            'branches' => $branches,
        ]);
    }

    public function store(StoreStockEntryRequest $request, StockEntryService $service)
    {
        $result = $service->createEntry($request->validated());

        return response()->json([
            'message' => 'Entrada de estoque registrada com sucesso.',
            'stock_move_id' => $result['stock_move']->id,
            'imei_units' => collect($result['imei_units'])->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'product_id' => $unit->product_id,
                    'imei_or_serial' => $unit->imei_or_serial,
                    'status' => $unit->status,
                ];
            }),
        ], 201);
    }
}
