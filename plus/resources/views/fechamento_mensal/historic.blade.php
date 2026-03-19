@extends('layouts.app', ['title' => 'Fechamentos Mensais'])

@section('content')
<div class="mt-1">
    <div class="row">
        <div class="card">
            <div class="card-body">
                <div class="container-fluid">

                    <h4 class="mb-3">Fechamentos Mensais</h4>

                    <div class="card">
                        <div class="card-body table-responsive">
                            <table class="table table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>Mês</th>
                                        <th>Total Vendas</th>
                                        <th>Despesas</th>
                                        <th>Lucro</th>
                                        <th>Fechado em</th>
                                        <th>Usuário</th>
                                        <th class="text-end">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse($fechamentos as $f)
                                    <tr>
                                        <td class="fw-bold">
                                            {{ \Carbon\Carbon::createFromFormat('Y-m', $f->mes)->format('m/Y') }}
                                        </td>
                                        <td>R$ {{ __moeda($f->total_vendas) }}</td>
                                        <td class="text-danger">R$ {{ __moeda($f->total_despesas) }}</td>
                                        <td class="text-success">R$ {{ __moeda($f->lucro_estimado) }}</td>
                                        <td>{{ $f->fechado_em->format('d/m/Y H:i') }}</td>
                                        <td>{{ optional($f->user)->name ?? '-' }}</td>
                                        <td class="text-end">
                                            <a href="{{ route('fechamento-mensal.show', [$f->id]) }}"
                                             class="btn btn-sm btn-outline-primary">
                                             <i class="ri-eye-line"></i> Ver
                                         </a>
                                     </td>
                                 </tr>
                                 @empty
                                 <tr>
                                    <td colspan="7" class="text-center text-muted">
                                        Nenhum fechamento encontrado
                                    </td>
                                </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>
@endsection
