<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\StockEntryController as WebStockEntryController;

class StockEntryController extends WebStockEntryController
{
    public function __construct()
    {
        // Intentionally bypass the permission middleware defined in the web controller.
    }
}

