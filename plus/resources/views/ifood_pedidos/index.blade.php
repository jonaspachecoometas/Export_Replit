@extends('layouts.app', ['title' => 'Pedidos IFood'])

@section('content')

<div class="mt-3">
    <div class="row">
        <div class="card">
            <div class="card-body">

                <div class="table-responsive-sm mt-3">
                    <table class="table table-striped table-centered mb-0">
                        <thead class="table-dark">
                            <tr>
                                <th>#</th>
                                <th>ID</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total de itens</th>
                                <th>Total</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($data as $item)
                            <tr>
                                <td>{{ $item->id_exibicao }}</td>
                                <td>{{ $item->ifood_id }}</td>
                                <td>{{ __data_pt($item->data_pedido) }}</td>
                                <td>{{ $item->cliente_nome }} {{ $item->cliente_documento }}</td>

                                <td>{{ sizeof($item->itens) }}</td>
                                <td>{{ __moeda($item->total) }}</td>

                                <td>
                                    <form action="{{ route('ifood-pedidos.destroy', $item->id) }}" method="post" id="form-{{$item->id}}">
                                        @csrf
                                        @method('delete')
                                        <!-- <button type="submit" title="Deletar" class="btn btn-danger btn-delete btn-sm"><i class="ri-delete-bin-2-line"></i></button> -->
                                        <a title="Ver pedido" class="btn btn-dark btn-sm text-white" href="{{ route('ifood-pedidos.show', [$item->id]) }}">
                                            <i class="ri-file-text-line"></i>
                                        </a>
                                    </form>
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="4" class="text-center">Nada encontrado</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                
            </div>
        </div>
    </div>
</div>

@endsection
