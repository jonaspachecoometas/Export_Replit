@extends('layouts.app', ['title' => 'Configuração'])
@section('content')
<div class="mt-3">
    <div class="row">
        <div class="card">
            <div class="card-body">

                <div class="container">

                    <div class="card shadow-sm mb-4">
                        <div class="card-body d-flex align-items-center justify-content-between">

                            <div>
                                <h4 class="mb-1">
                                    <span class="badge bg-primary me-2">STATUS</span>
                                    {{ $status['message']['title'] }}
                                </h4>
                                <small class="text-muted">
                                    {{ $status['message']['subtitle'] }}
                                </small>
                            </div>

                            <div class="text-end">
                                <span class="badge bg-primary">
                                    Prioridade {{ $status['message']['priority'] }}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div class="row">

                        <div class="col-md-4">
                            <div class="card shadow-sm mb-3">
                                <div class="card-body">
                                    <h6>Status Geral</h6>
                                    <span class="badge bg-success">
                                        {{ $status['state'] }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card shadow-sm mb-3">
                                <div class="card-body">
                                    <h6>Canal</h6>
                                    <strong>{{ $status['salesChannel'] }}</strong>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="card shadow-sm mb-3">
                                <div class="card-body">
                                    <h6>Operação</h6>
                                    <strong>{{ ucfirst($status['operation']) }}</strong>
                                </div>
                            </div>
                        </div>

                    </div>


                    <div class="card shadow-sm">
                        <div class="card-header">
                            <strong>Validações do iFood</strong>
                        </div>
                        <div class="card-body p-2">
                            <table class="table mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Item</th>
                                        <th>Status</th>
                                        <th>Código</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach($status['validations'] as $v)
                                    <tr>
                                        <td>{{ $v['id'] }}</td>
                                        <td>
                                            @if($v['state'] === 'OK')
                                            <span class="badge bg-success">OK</span>
                                            @else
                                            <span class="badge bg-danger">{{ $v['state'] }}</span>
                                            @endif
                                        </td>
                                        <td class="text-muted">{{ $v['code'] }}</td>
                                    </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <div class="container">
                    <div class="card shadow-sm mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <strong>Interrupções da Loja</strong>

                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalInterrupcao">
                                <i class="ri-add-line"></i> Nova interrupção
                            </button>
                        </div>

                        <div class="card-body p-2">
                            <table class="table table-striped mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Início</th>
                                        <th>Fim</th>
                                        <th class="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($dataInterruptions as $i)
                                    <tr>
                                        <td>{{ $i->description }}</td>
                                        <td>{{ \Carbon\Carbon::parse($i->start)->format('d/m/Y H:i') }}</td>
                                        <td>{{ \Carbon\Carbon::parse($i->end)->format('d/m/Y H:i') }}</td>
                                        <td class="text-end">
                                            <form method="POST" action="{{ route('ifood-interrupcao.destroy', $i->id) }}" id="form-{{ $i->id }}">
                                                @csrf
                                                @method('DELETE')
                                                <button class="btn btn-danger btn-sm btn-delete">
                                                    <i class="ri-delete-bin-line"></i>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="4" class="text-center text-muted py-3">
                                            Nenhuma interrupção cadastrada
                                        </td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- <div class="container">
                    <div class="card shadow-sm mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <strong>Horário de funcionamento</strong>

                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#modalFuncionamento">
                                <i class="ri-add-line"></i> Novo horário
                            </button>
                        </div>

                        <div class="card-body p-2">
                            <table class="table table-striped mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Início</th>
                                        <th>Fim</th>
                                        <th class="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($dataInterruptions as $i)
                                    <tr>
                                        <td>{{ $i->description }}</td>
                                        <td>{{ \Carbon\Carbon::parse($i->start)->format('d/m/Y H:i') }}</td>
                                        <td>{{ \Carbon\Carbon::parse($i->end)->format('d/m/Y H:i') }}</td>
                                        <td class="text-end">
                                            <form method="POST" action="{{ route('ifood-interrupcao.destroy', $i->id) }}" id="form-{{ $i->id }}">
                                                @csrf
                                                @method('DELETE')
                                                <button class="btn btn-danger btn-sm btn-delete">
                                                    <i class="ri-delete-bin-line"></i>
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                    @empty
                                    <tr>
                                        <td colspan="4" class="text-center text-muted py-3">
                                            Nenhuma interrupção cadastrada
                                        </td>
                                    </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div> -->

                
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalInterrupcao" tabindex="-1">
    <div class="modal-dialog modal-md modal-dialog-centered">
        <div class="modal-content">

            <form method="POST" action="{{ route('ifood-interrupcao.store') }}">
                @csrf

                <div class="modal-header">
                    <h5 class="modal-title">Nova Interrupção</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">

                    <div class="mb-3">
                        <label class="form-label">Descrição</label>
                        <input type="text" name="description" class="form-control" required>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Início</label>
                            <input type="datetime-local" name="start" class="form-control" required>
                        </div>

                        <div class="col-md-6 mb-3">
                            <label class="form-label">Fim</label>
                            <input type="datetime-local" name="end" class="form-control" required>
                        </div>
                    </div>

                    <div class="alert alert-warning small">
                        Durante a interrupção, a loja ficará indisponível no iFood.
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">
                        Salvar interrupção
                    </button>
                </div>

            </form>

        </div>
    </div>
</div>

@endsection