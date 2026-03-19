<?php

namespace App\Http\Controllers;

use App\Models\ImeiUnit;
use Illuminate\Http\Request;

class ImeiTrackingController extends Controller
{
    public function index(Request $request)
    {
        $query = trim($request->get('imei'));
        $imeiUnit = null;
        $entryMove = null;
        $saleMove = null;
        $saleDocument = null;

        if ($query !== '') {
            $imeiUnit = ImeiUnit::with(['product', 'productVariant', 'company', 'branch'])
                ->where('imei_or_serial', $query)
                ->first();

            if ($imeiUnit) {
                $entryMove = $imeiUnit->stockMoves()->with('branch')->where('type', 'entry')->orderBy('created_at')->first();
                $saleMove = $imeiUnit->stockMoves()->with('branch')->where('type', 'sale')->orderBy('created_at')->first();
                $saleDocument = $imeiUnit->sales()->latest('nfe_imei_units.created_at')->first();
            }
        }

        return view('imei_tracking.index', compact('query', 'imeiUnit', 'entryMove', 'saleMove', 'saleDocument'));
    }
}
