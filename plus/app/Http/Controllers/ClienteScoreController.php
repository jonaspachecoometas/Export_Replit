<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use App\Models\ScoreConfig;

class ClienteScoreController extends Controller
{

    public function __construct()
    {
        $this->middleware('permission:score_clientes_view', ['only' => ['show', 'index']]);
    }

    public function index(Request $request)
    {
        $start_date = $request->get('start_date');
        $end_date = $request->get('end_date');
        $categoria = $request->get('categoria');

        $clientes = Cliente::with('score')
        ->select('clientes.*')
        ->where('empresa_id', $request->empresa_id)
        ->where('status', 1)
        ->join('cliente_scores', 'cliente_scores.cliente_id', '=', 'clientes.id')
        ->when(!empty($request->razao_social), function ($q) use ($request) {
            return  $q->where(function ($quer) use ($request) {
                return $quer->where('razao_social', 'LIKE', "%$request->razao_social%");
            });
        })
        ->when(!empty($start_date), function ($query) use ($start_date) {
            return $query->whereDate('created_at', '>=', $start_date);
        })
        ->when(!empty($end_date), function ($query) use ($end_date) {
            return $query->whereDate('created_at', '<=', $end_date);
        })
        ->when(!empty($categoria), function ($query) use ($categoria) {
            return $query->where('cliente_scores.categoria', $categoria);
        })
        ->get();

        return view('clientes.score.index', compact('clientes'));
    }

    public function show($clienteId)
    {
        $cliente = Cliente::with(['score', 'scoreHistorico'])
        ->findOrFail($clienteId);

        return view('clientes.score.show', compact('cliente'));
    }

    public function config(Request $request){
        $item = ScoreConfig::firstOrCreate(
            ['empresa_id' => $request->empresa_id],
            $this->defaultConfig($request->empresa_id)
        );

        return view('clientes.score.config', compact('item'));
    }

    private function defaultConfig($empresaId): array
    {
        return [
            'empresa_id' => $empresaId,
            'pagamentos' => [
                ['min'=>95,'score'=>350],
                ['min'=>80,'score'=>250],
                ['min'=>60,'score'=>120],
                ['min'=>0,'score'=>0],
            ],
            'volume' => [
                ['min'=>100000,'score'=>200],
                ['min'=>30000,'score'=>120],
                ['min'=>0,'score'=>60],
            ],
            'tempo' => [
                ['min'=>3,'score'=>150],
                ['min'=>1,'score'=>100],
                ['min'=>0,'score'=>40],
            ],
            'ticket' => [
                ['min'=>3000,'score'=>150],
                ['min'=>1000,'score'=>90],
                ['min'=>0,'score'=>40],
            ],
            'penalidades' => [
                ['min'=>10,'score'=>150],
                ['min'=>5,'score'=>80],
                ['min'=>0,'score'=>0],
            ],
            'categorias' => [
                ['min'=>800,'nome'=>'Ouro'],
                ['min'=>500,'nome'=>'Prata'],
                ['min'=>0,'nome'=>'Bronze'],
            ],
        ];
    }

    public function updateConfig(Request $request)
    {
        $empresaId = $request->empresa_id;

        $data = $request->only(['pagamentos','volume','tempo','ticket','penalidades','categorias']);

        foreach ($data as $k => $arr) {
            // $data[$k] = array_values(array_filter($arr, fn($r) => isset($r['min'])));
            $data[$k] = array_values(array_map(function ($r) {

                if (isset($r['min'])) {
                    $r['min'] = str_replace(',', '.', $r['min']);
                    $r['min'] = is_numeric($r['min']) ? (float)$r['min'] : 0;
                }

                if (isset($r['score'])) {
                    $r['score'] = str_replace(',', '.', $r['score']);
                    $r['score'] = is_numeric($r['score']) ? (float)$r['score'] : 0;
                }

                return $r;

            }, array_filter($arr, fn($r) => isset($r['min']))));
        }

        foreach (['pagamentos','volume','tempo','ticket','penalidades'] as $k) {
            usort($data[$k], fn($a,$b) => ($b['min'] <=> $a['min']));
        }
        usort($data['categorias'], fn($a,$b) => ($b['min'] <=> $a['min']));

        $cfg = ScoreConfig::firstOrCreate(['empresa_id' => $empresaId], $this->defaultConfig($empresaId));
        $cfg->update($data);

        session()->flash("flash_success", "Configuração de score salva com sucesso!");
        return redirect()->back();
    }

}
