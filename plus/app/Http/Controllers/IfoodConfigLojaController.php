<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IfoodConfig;
use App\Utils\IfoodUtil;

class IfoodConfigLojaController extends Controller
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

        $dataStatus = $this->util->statusMerchant($config);
        $dataInterruptions = $this->util->getInterruptions($config);
        if(isset($dataStatus->error)){
            session()->flash("flash_error", $dataStatus->error->message);
            return redirect()->route('ifood-config.index');
        }

        if(isset($dataStatus->message)){
            if($dataStatus->message == 'token expired'){
                return redirect()->route('ifood-config.index');
            }

            session()->flash("flash_error", $dataStatus->message);
            return redirect()->route('ifood-config.index');
        }
        $status = null;
        if(is_array($dataStatus)){
            $status = json_decode(json_encode($dataStatus[0]), true);
        }
        // dd($status);

        return view('ifood.config_loja', compact('dataInterruptions', 'status'));
    }

    public function interrupcaoStore(Request $request){

        $config = IfoodConfig::
        where('empresa_id', $request->empresa_id)
        ->first();

        $data = [
            'description' => $request->description,
            'start' => \Carbon\Carbon::parse($request->start)->utc()->format('Y-m-d\TH:i:s.000\Z'),
            'end' => \Carbon\Carbon::parse($request->end)->utc()->format('Y-m-d\TH:i:s.000\Z'),
        ];

        $result = $this->util->storeInterruption($config, $data);

        if(isset($result->id)){
            session()->flash("flash_success", "Interrupção cadastrada!");
            return redirect()->back();
        }
    }

    public function interrupcaoDestroy($id){
        $config = IfoodConfig::
        where('empresa_id', request()->empresa_id)
        ->first();

        $result = $this->util->destroyInterruption($config, $id);
        dd($result);
    }
}
