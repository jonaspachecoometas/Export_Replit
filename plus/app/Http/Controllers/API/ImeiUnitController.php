<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ImeiUnit;
use Illuminate\Http\Request;

class ImeiUnitController extends Controller
{
    public function available(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:produtos,id',
            'branch_id' => 'required|exists:localizacaos,id',
        ]);

        $companyId = $request->empresa_id ?? null;

        $query = ImeiUnit::with('branch')
            ->where('product_id', $request->product_id)
            ->where('branch_id', $request->branch_id)
            ->where('status', 'available');

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        $units = $query->orderBy('imei_or_serial')->get();

        return response()->json($units);
    }
}
