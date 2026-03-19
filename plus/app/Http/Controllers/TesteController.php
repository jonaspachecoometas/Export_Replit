<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Produto;
use App\Models\Empresa;

use App\Models\RotinaExecucao;
use App\Models\Cliente;
use App\Utils\Score\ScoreUtil;
use Illuminate\Support\Facades\DB;

class TesteController extends Controller
{
    public function teste(Request $request){
        $hoje = now()->toDateString();

        DB::table('rotina_execucaos')->truncate();
        DB::table('cliente_scores')->truncate();
        if (RotinaExecucao::where('rotina', 'score_diario')->where('data_execucao', $hoje)->exists()) {
            return;
        }

        RotinaExecucao::create([
            'rotina' => 'score_diario',
            'data_execucao' => $hoje,
            'executado_em' => now(),
            'empresa_id' => $request->empresa_id
        ]);

        $clientes = Cliente::where('empresa_id', $request->empresa_id)
        ->where('status', 1)->get();

        foreach ($clientes as $cliente) {
            (new ScoreUtil($cliente))->calcular();
        }

    }

    // public function index(){

    //     Produto::whereIn('cst_csosn', ['101', '102', '500', '00'])
    //     ->whereNull('cst_ibscbs')
    //     ->update([
    //         'cst_ibscbs' => '000',
    //         'cclass_trib' => '000001'
    //     ]);

    //     Produto::whereIn('cst_csosn', ['61'])
    //     ->whereNull('cst_ibscbs')
    //     ->update([
    //         'cst_ibscbs' => '620',
    //         'cclass_trib' => '620001'
    //     ]);

    //     Produto::whereIn('cst_csosn', ['20'])
    //     ->whereNull('cst_ibscbs')
    //     ->update([
    //         'cst_ibscbs' => '200',
    //         'cclass_trib' => '200001'
    //     ]);

    //     Produto::whereIn('cst_csosn', ['40', '41'])
    //     ->whereNull('cst_ibscbs')
    //     ->update([
    //         'cst_ibscbs' => '410',
    //         'cclass_trib' => '410001'
    //     ]);

    //     Produto::whereIn('cst_csosn', ['51'])
    //     ->whereNull('cst_ibscbs')
    //     ->update([
    //         'cst_ibscbs' => '515',
    //         'cclass_trib' => '515001'
    //     ]);

    //     // $empresas = Empresa::all();
    //     // foreach($empresas as $e){

    //     //     if($e->tributacao == 'Regime Normal'){
    //     //         Produto::where('empresa_id', $e->id)
    //     //         ->update([
    //     //             'perc_ibs_uf' => 0.1,
    //     //             'perc_cbs' => 0.9,
    //     //         ]);
    //     //     }
    //     // }

    //     Produto::query()->update([
    //         'perc_ibs_uf' => 0.1,
    //         'perc_cbs' => 0.9,
    //     ]);
    // }

}
