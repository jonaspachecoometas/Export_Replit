<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SecurityLog;

class UploadMonitoradoController extends Controller
{

    public function index(Request $request){
        $start_date = $request->start_date;
        $end_date = $request->end_date;

        $data = SecurityLog::latest()
        ->when(!empty($start_date), function ($query) use ($start_date) {
            return $query->whereDate('created_at', '>=', $start_date);
        })
        ->when(!empty($end_date), function ($query) use ($end_date) {
            return $query->whereDate('created_at', '<=', $end_date);
        })
        ->paginate(50);

        return view('upload_monitorado.index', compact('data'));
    }
}
