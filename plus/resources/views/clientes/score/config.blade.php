@extends('layouts.app', ['title' => 'Configuração de Score'])

@section('content')
<div class="card mt-1">

    <div class="card-header">
        <h4>Configuração do Score de Cliente</h4>
        <div style="text-align: right; margin-top: -35px;">
            <a href="{{ route('clientes-score.index') }}" class="btn btn-danger btn-sm px-3">
                <i class="ri-arrow-left-double-fill"></i>Voltar
            </a>
        </div>
    </div>
    <div class="card-body">

        <div class="container-fluid">

            @if($errors->any())
            <div class="alert alert-danger">
                <div class="fw-bold mb-1">Corrija os campos abaixo:</div>
                <ul class="mb-0">
                    @foreach($errors->all() as $e) <li>{{ $e }}</li> @endforeach
                </ul>
            </div>
            @endif

            <form method="POST" action="{{ route('score-config.update') }}">
                @csrf

                <div class="card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="fw-bold">Pagamentos em dia</div>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addRow('pagamentos', {min:0, score:0})">
                            + Adicionar
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="box_pagamentos">
                            @foreach(old('pagamentos', $item->pagamentos ?? []) as $i => $r)
                            @include('clientes.score.score_row', [
                            'group' => 'pagamentos',
                            'i' => $i,
                            'labelMin' => 'Mínimo (%)',
                            'min' => $r['min'] ?? 0,
                            'score' => $r['score'] ?? 0,
                            'type' => 'percentual'
                            ])
                            @endforeach
                        </div>
                        <small class="text-muted">Ex.: >=95% = 350 pontos</small>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="fw-bold">Volume (últimos 12 meses)</div>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addRow('volume', {min:0, score:0})">
                            + Adicionar
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="box_volume">
                            @foreach(old('volume', $item->volume ?? []) as $i => $r)
                            @include('clientes.score.score_row', [
                            'group' => 'volume',
                            'i' => $i,
                            'labelMin' => 'Mínimo (R$)',
                            'min' => $r['min'] ?? 0,
                            'score' => $r['score'] ?? 0,
                            'type' => 'moeda'
                            ])
                            @endforeach
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="fw-bold">Tempo de cadastro</div>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addRow('tempo', {min:0, score:0})">
                            + Adicionar
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="box_tempo">
                            @foreach(old('tempo', $item->tempo ?? []) as $i => $r)
                            @include('clientes.score.score_row', [
                            'group' => 'tempo',
                            'i' => $i,
                            'labelMin' => 'Mínimo (anos)',
                            'min' => $r['min'] ?? 0,
                            'score' => $r['score'] ?? 0,
                            'type' => ''
                            ])
                            @endforeach
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="fw-bold">Ticket médio</div>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addRow('ticket', {min:0, score:0})">
                            + Adicionar
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="box_ticket">
                            @foreach(old('ticket', $item->ticket ?? []) as $i => $r)
                            @include('clientes.score.score_row', [
                            'group' => 'ticket',
                            'i' => $i,
                            'labelMin' => 'Mínimo (R$)',
                            'min' => $r['min'] ?? 0,
                            'score' => $r['score'] ?? 0,
                            'type' => 'moeda'
                            ])
                            @endforeach
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="fw-bold">Penalidades (devoluções)</div>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addRow('penalidades', {min:0, score:0})">
                            + Adicionar
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="box_penalidades">
                            @foreach(old('penalidades', $item->penalidades ?? []) as $i => $r)
                            @include('clientes.score.score_row', [
                            'group' => 'penalidades',
                            'i' => $i,
                            'labelMin' => 'Mínimo (qtd)',
                            'min' => $r['min'] ?? 0,
                            'score' => $r['score'] ?? 0,
                            'type' => 'integer'
                            ])
                            @endforeach
                        </div>
                    </div>
                </div>

                <div class="card mb-3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                        <div class="fw-bold">Categorias</div>
                        <!-- <button type="button" class="btn btn-sm btn-outline-primary" onclick="addCategoriaRow()">
                            + Adicionar categoria
                        </button> -->
                    </div>
                    <div class="card-body">
                        <div id="box_categorias">
                            @foreach(old('categorias', $item->categorias ?? []) as $i => $r)
                            <div class="row g-2 align-items-end mb-2 score-row" data-group="categorias">
                                <div class="col-md-4">
                                    <label class="form-label">Mínimo (score)</label>
                                    <input type="number" step="1" min="0" class="form-control"
                                    name="categorias[{{ $i }}][min]" value="{{ $r['min'] ?? 0 }}">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Nome</label>
                                    <input readonly type="text" class="form-control"
                                    name="categorias[{{ $i }}][nome]" value="{{ $r['nome'] ?? '' }}">
                                </div>
                                <div class="col-md-2">
                                    <button type="button" class="btn btn-outline-danger w-100" onclick="removeRow(this)">
                                        Remover
                                    </button>
                                </div>
                            </div>
                            @endforeach
                        </div>
                        <small class="text-muted">A maior pontuação define a categoria (ex.: >=800 ouro).</small>
                    </div>
                </div>

                <div class="col-12" style="text-align: right;">

                    <button type="submit" class="btn btn-success px-5">Salvar</button>
                </div>
            </form>
        </div>
    </div>
</div>

<template id="tpl_score_row">
    <div class="row g-2 align-items-end mb-2 score-row">
        <div class="col-md-5">
            <label class="form-label js-label-min required">Mínimo</label>
            <input type="tel" required class="form-control js-min" />
        </div>
        <div class="col-md-5">
            <label class="form-label required">Score</label>
            <input type="tel" required class="form-control js-score integer" />
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger w-100" onclick="removeRow(this)">
                Remover
            </button>
        </div>
    </div>
</template>


@endsection
@section('js')

<script>
    function nextIndex(group) {
        const box = document.getElementById('box_' + group);
        const rows = box.querySelectorAll('.score-row');
        return rows.length;
    }

    function addRow(group, defaults) {
        const tpl = document.getElementById('tpl_score_row').content.cloneNode(true);
        const idx = nextIndex(group);

        const row = tpl.querySelector('.score-row');
        row.dataset.group = group;

        const min = row.querySelector('.js-min');
        const score = row.querySelector('.js-score');
        const labelMin = row.querySelector('.js-label-min');

        const labels = {
            pagamentos: 'Mínimo (%)',
            volume: 'Mínimo (R$)',
            tempo: 'Mínimo (anos)',
            ticket: 'Mínimo (R$)',
            penalidades: 'Mínimo (qtd)'
        };
        labelMin.textContent = labels[group] ?? 'Mínimo';

        min.name = `${group}[${idx}][min]`;
        score.name = `${group}[${idx}][score]`;

        min.value = defaults?.min ?? 0;
        score.value = defaults?.score ?? 0;

        document.getElementById('box_' + group).appendChild(row);
    }

    function removeRow(btn) {
        btn.closest('.score-row').remove();
    }
</script>
@endsection
