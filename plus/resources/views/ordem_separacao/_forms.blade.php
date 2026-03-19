<div class="row g-2">
    <input type="hidden" name="orcamento_id" value="{{ $orcamento->id }}">
    
    <div class="col-md-4">
        <div class="card shadow-sm border-0 h-100">
            <div class="card-body">

                <div class="d-flex align-items-center mb-3">
                    <div class="avatar-sm  rounded-circle me-2 d-flex align-items-center justify-content-center">
                        <img class="img-60" src="{{ $orcamento->cliente->img }}">
                    </div>
                    <div>
                        <h6 class="mb-0 fw-semibold">{{ $orcamento->cliente->info }}</h6>
                        <small class="text-muted">Cliente</small>
                    </div>
                </div>

                <hr class="my-2">
                <div class="row text-center">

                    <div class="col-6 mb-3">
                        <small class="text-muted">Orçamento</small>
                        <div class="fw-semibold">
                            #{{ $orcamento->numero_sequencial }}
                        </div>
                    </div>

                    <div class="col-6 mb-3">
                        <small class="text-muted">Data</small>
                        <div class="fw-semibold">
                            {{ __data_pt($orcamento->created_at) }}
                        </div>
                    </div>

                    <div class="col-6">
                        <small class="text-muted">Itens</small>
                        <div class="fw-semibold">
                            {{ $orcamento->itens->count() }}
                        </div>
                    </div>

                    <div class="col-6">
                        <small class="text-muted">Valor Total</small>
                        <div class="fw-bold text-success">
                            R$ {{ number_format($orcamento->total, 2, ',', '.') }}
                        </div>
                    </div>

                    <div class="col-12 mt-2">
                        {!!Form::select('funcionario_id', 'Responsável pela separação', ['' => 'Selecione'] + $funcionarios->pluck('nome', 'id')->all())
                        ->id('funcionario')
                        ->required()
                        ->attrs(['class' => 'form-select'])
                        !!}
                    </div>

                </div>
            </div>

            
        </div>
    </div>

    <div class="col-md-8">
        <div class="table-responsive">
            <table class="table">
                <thead class="table-dark">
                    <tr>
                        <th></th>
                        <th>#</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Observação do Item</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($orcamento->itens as $i)
                    <tr>
                        <td><img class="img-60" src="{{ $i->produto->img }}"></td>
                        <td>{{ $i->produto->numero_sequencial }}</td>
                        <td>{{ $i->produto->nome }}</td>
                        <td>
                            @if(!$i->produto->unidadeDecimal())
                            {{ number_format($i->quantidade, 0, '.', '') }}
                            @else
                            {{ number_format($i->quantidade, 3, '.', '') }}
                            @endif
                        </td>
                        <td>
                            <input type="" name="observacao_item[]" class="form-control">
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>

    <div class="col-2 mt-2">
        {!!Form::select('prioridade', 'Prioridade', ['normal' => 'Normal', 'urgente' => 'Urgente'])
        ->attrs(['class' => 'form-select'])
        !!}
    </div>
    <div class="col-md-12">
        {!! Form::textarea('observacao', 'Observação')->attrs(['rows' => '4']) !!}
    </div>

    <hr class="mt-4">
    <div class="col-12" style="text-align: right;">
        <button type="submit" class="btn btn-success px-5" id="btn-store">Salvar</button>
    </div>
</div>

