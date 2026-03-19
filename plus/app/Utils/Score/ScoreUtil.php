<?php

namespace App\Utils\Score;

use App\Models\Cliente;
use App\Models\ClienteScore;
use App\Models\ClienteScoreHistorico;
use App\Models\ScoreConfig;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ScoreUtil
{
    protected Cliente $cliente;
    protected ScoreConfig $config;

    protected int $scorePagamentos = 0;
    protected int $scoreVolume = 0;
    protected int $scoreTempo = 0;
    protected int $scoreTicket = 0;
    protected int $scorePenalidades = 0;

    protected int $scoreTotal = 0;
    protected string $categoria = 'bronze';
    protected float $limiteCredito = 0;

    public function __construct(Cliente $cliente)
    {
        $this->cliente = $cliente;
        $this->config = ScoreConfig::where('empresa_id', $cliente->empresa_id)->first();
    }

    public function calcular()
    {
        DB::transaction(function () {

            $this->calcularPagamentos();
            $this->calcularVolume();
            $this->calcularTempo();
            $this->calcularTicket();
            $this->calcularPenalidades();

            $this->scoreTotal = max(0,
                $this->scorePagamentos +
                $this->scoreVolume +
                $this->scoreTempo +
                $this->scoreTicket -
                $this->scorePenalidades
            );

            $this->definirCategoria();
            $this->definirLimiteCredito();

            $this->persistir();
        });

        return $this;
    }

    protected function aplicarRegras(float $valor, array $regras): int
    {
        foreach ($regras as $r) {
            if ($valor >= $r['min']) {
                return (int)$r['score'];
            }
        }
        return 0;
    }

    protected function calcularPagamentos()
    {
        $total = $this->cliente->contasReceber()->count();
        $emDia = $this->cliente->contasReceber()->where('status', 1)->count();

        if ($total === 0) { $this->scorePagamentos = 0; return; }

        $percentual = ($emDia / $total) * 100;

        $this->scorePagamentos = $this->aplicarRegras($percentual, $this->config->pagamentos);
    }

    protected function calcularVolume()
    {
        $total = $this->cliente->vendas()->where('created_at','>=',now()->subMonths(12))->sum('total');
        $total += $this->cliente->vendasPdv()->where('created_at','>=',now()->subMonths(12))->sum('total');

        $this->scoreVolume = $this->aplicarRegras($total, $this->config->volume);
    }

    protected function calcularTempo()
    {
        $anos = Carbon::parse($this->cliente->created_at)->diffInYears();
        $this->scoreTempo = $this->aplicarRegras($anos, $this->config->tempo);
    }

    protected function calcularTicket()
    {
        $ticket = $this->cliente->vendas()->avg('total') ?? 0;
        $this->scoreTicket = $this->aplicarRegras($ticket, $this->config->ticket);
    }

    protected function calcularPenalidades()
    {
        $devolucoes = $this->cliente->devolucoes()->count();
        $this->scorePenalidades = $this->aplicarRegras($devolucoes, $this->config->penalidades);
    }

    protected function definirCategoria()
    {
        foreach ($this->config->categorias as $c) {
            if ($this->scoreTotal >= $c['min']) {
                $this->categoria = $c['nome'];
                break;
            }
        }
    }

    protected function definirLimiteCredito()
    {
        $ticketMedio = $this->cliente->vendas()->avg('total') ?? 0;

        $multiplicadores = [
            'ouro' => 6,
            'prata' => 3,
            'bronze' => 1,
        ];

        $this->limiteCredito = $ticketMedio * ($multiplicadores[$this->categoria] ?? 1);
    }

    protected function persistir()
    {
        ClienteScore::updateOrCreate(
            ['cliente_id' => $this->cliente->id],
            [
                'score_total' => $this->scoreTotal,
                'score_pagamentos' => $this->scorePagamentos,
                'score_volume' => $this->scoreVolume,
                'score_tempo' => $this->scoreTempo,
                'score_ticket' => $this->scoreTicket,
                'score_penalidades' => $this->scorePenalidades,
                'categoria' => $this->categoria,
                'limite_credito' => $this->limiteCredito,
            ]
        );

        ClienteScoreHistorico::updateOrCreate(
            [
                'cliente_id' => $this->cliente->id,
                'referencia_mes' => now()->startOfMonth()->toDateString(),
            ],
            [
                'score_total' => $this->scoreTotal,
                'categoria' => $this->categoria,
                'limite_credito' => $this->limiteCredito,
            ]
        );
    }
}
