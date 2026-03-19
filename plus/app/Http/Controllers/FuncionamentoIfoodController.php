<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Utils\IfoodUtil;
use App\Models\IfoodConfig;

class FuncionamentoIfoodController extends Controller
{

    protected $util;

    public function __construct(IfoodUtil $util)
    {
        $this->util = $util;
    }
    
    public function index(Request $request){
        $config = IfoodConfig::
        where('empresa_id', $request->empresa_id)
        ->first();
    }
}
