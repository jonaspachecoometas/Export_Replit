@extends('layouts.app', ['title' => 'Editar Produto IFood'])

@section('content')
<div class="card mt-1">
    <div class="card-header">
        <h4>Editar Produto iFood</h4>
        <div style="text-align: right; margin-top: -35px;">
            <a href="{{ route('ifood-produtos.index') }}" class="btn btn-danger btn-sm px-3">
                <i class="ri-arrow-left-double-fill"></i>Voltar
            </a>
        </div>

    </div>

    <div class="card-body">
        <form class="g-2" action="{{ route('ifood-produtos.update', $item->id) }}" method="POST" id="form-edit-produto" enctype="multipart/form-data">
            @csrf
            @method('PUT')
            <input type="hidden" name="externalCode" value="{{ $item->ifood_id_aux ?? $item->ifood_id }}">

            <div class="row g-2">
                <div class="col-md-12">
                    <label>Nome</label>
                    <input type="text" class="form-control" required id="nome" name="nome" value="{{ $item->nome }}" required>
                </div>

                <div class="col-md-2">
                    <label>Valor</label>
                    <input type="tel" class="form-control moeda" id="valor" name="valor" value="{{ __moedaInput($item->valor) }}" required>
                </div>

                <div class="col-md-2">
                    <label>Código de barras</label>
                    <input type="text" class="form-control" name="codigo_barras" value="{{ $item->produto->codigo_barras }}">
                </div>

                <div class="col-md-2">
                    <label>Status</label>
                    <select class="form-select" name="status" required>
                        <option value="AVAILABLE" {{ $item->status == 'AVAILABLE' ? 'selected' : '' }}>Disponível</option>
                        <option value="UNAVAILABLE" {{ $item->status == 'UNAVAILABLE' ? 'selected' : '' }}>Indisponível</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label for="categoria_produto_ifood_id" class="form-label">Categoria</label>
                    <select class="form-select" id="categoria_produto_ifood_id" name="categoria_produto_ifood_id" required>
                        <option value="">Selecione uma categoria</option>
                        @foreach($categorias as $categoria)
                        <option value="{{ $categoria->id }}" {{ $item->categoria_produto_ifood_id == $categoria->id ? 'selected' : '' }}>
                            {{ $categoria->nome }}
                        </option>
                        @endforeach
                    </select>
                </div>
                <div class="col-md-2">
                    <label for="estoque" class="form-label">Estoque</label>
                    <input type="tel" class="form-control qtd" id="estoque" name="estoque" value="{{ $item->estoque }}">
                    <small class="text-muted">O estoque é gerenciado automaticamente pelo iFood</small>
                </div>

                <!-- <div class="col-md-6">
                    <label for="serving" class="form-label">Porção</label>
                    <input type="text" class="form-control" id="serving" name="serving" value="{{ $item->serving }}">
                </div> -->


                <div class="col-md-12">
                    <label for="descricao" class="form-label">Descrição</label>
                    <textarea class="form-control" id="descricao" name="descricao" rows="3">{{ $item->descricao }}</textarea>
                </div>

                <div class="card col-md-3 mt-3 ml-2 form-input" style="width: 210px">
                    <div class="preview">
                        <button type="button" id="btn-remove-imagem" class="btn btn-link-danger btn-sm btn-danger">x</button>
                        @isset($item->imagem)
                        <img id="file-ip-1-preview" src="{{ $item->imagem }}">
                        @else
                        <img id="file-ip-1-preview" src="imgs/no-image.png">
                        @endif
                    </div>
                    <label for="file-ip-1">Imagem</label>
                    
                    <input type="file" id="file-ip-1" name="image" accept="image/*" onchange="showPreview(event);">
                </div>

            </div>
            <hr class="mt-4">

            <div class="col-12" style="text-align: right;">
                <button type="submit" class="btn btn-success px-5" id="btn-store">Salvar</button>
            </div>
        </form>
    </div>
</div>

@endsection

