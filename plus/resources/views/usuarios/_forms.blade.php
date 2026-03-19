<div class="row g-2">
    <div class="col-md-3">
        {!!Form::text('name', 'Nome')
        ->attrs(['class' => ''])
        ->required()
        !!}
    </div>
    <div class="col-md-3">
        {!!Form::text('email', 'Email')
        ->attrs(['class' => ''])
        ->required()
        !!}
    </div>
    <div class="col-md-2">
        {!!Form::select('admin', 'Admin', [0 => 'Não', 1 => 'Sim'])
        ->attrs(['class' => 'form-select'])
        ->required()
        !!}
    </div>

    <div class="col-md-2">
        {!!Form::select('status', 'Status', [1 => 'Ativo', 0 => 'Desativado'])
        ->attrs(['class' => 'form-select'])
        ->required()
        !!}
    </div>

    @if(__isNotificacao(Auth::user()->empresa))
    <div class="col-md-2">
        {!!Form::select('notificacao_cardapio', 'Notificação cardápio', [0 => 'Não', 1 => 'Sim'])
        ->attrs(['class' => 'form-select'])
        ->required()
        !!}
    </div>
    @endif

    @if(__isNotificacaoMarketPlace(Auth::user()->empresa))
    <div class="col-md-2">
        {!!Form::select('notificacao_marketplace', 'Notificação delivery', [0 => 'Não', 1 => 'Sim'])
        ->attrs(['class' => 'form-select'])
        ->required()
        !!}
    </div>
    @endif

    @if(__isNotificacaoEcommerce(Auth::user()->empresa))
    <div class="col-md-2">
        {!!Form::select('notificacao_ecommerce', 'Notificação ecommerce', [0 => 'Não', 1 => 'Sim'])
        ->attrs(['class' => 'form-select'])
        ->required()
        !!}
    </div>
    @endif
    
    @if(!isset($passwdHidden))
    <div class="col-md-2">
        <label class="required">Senha</label>
        <div class="input-group" id="show_hide_password">
            <input required type="password" class="form-control" id="senha" name="password" autocomplete="off" @if(isset($senhaCookie)) value="{{$senhaCookie}}" @endif>
            <a class="input-group-text"><i class='ri-eye-line'></i></a>
        </div>
    </div>
    @else
    @if($passwdHidden == 0)
    <div class="col-md-2">
        <label>Nova Senha</label>
        <div class="input-group" id="show_hide_password">
            <input type="password" class="form-control" id="senha" name="nova_senha">
            <a class="input-group-text"><i class='ri-eye-line'></i></a>
        </div>
    </div>
    @endif
    @endif

    <div class="col-md-3">
        {!!Form::select('role_id', 'Controle de acesso', ['' => 'Selecione'] + $roles->pluck('description', 'id')->all())
        ->attrs(['class' => 'select2'])
        ->value(isset($item) && $item->roles ? $item->roles->first()->id : null)
        ->required()
        !!}
    </div>

    @if(__countLocalAtivo() > 1)
    <div class="col-md-4">
        <label for="">Locais de acesso</label>

        <select required class="select2 form-control select2-multiple" data-toggle="select2" name="locais[]" multiple="multiple">
            @foreach(__getLocaisAtivos() as $local)
            <option @if(in_array($local->id, (isset($item) ? $item->locais->pluck('localizacao_id')->toArray() : []))) selected @endif value="{{ $local->id }}">{{ $local->descricao }}</option>
            @endforeach
        </select>
    </div>
    @else
    <input type="hidden" value="{{ __getLocalAtivo() ? __getLocalAtivo()->id : '' }}" name="local_id">
    @endif

    <div class="col-md-3">
        {!!Form::select('escolher_localidade_venda', 'Escolher localização em compra e venda', [0 => 'Não', 1 => 'Sim'])
        ->attrs(['class' => 'form-select tooltipp'])
        !!}

        <div class="text-tooltip d-none">
            Marcar como sim se for escolher a localização ao realizar a venda, compra e devolução
        </div>
    </div>

    <div class="col-md-2">
        {!!Form::select('finalizacao_pdv', 'Finalização PDV', ['fiscal' => 'Fiscal', 'nao_fiscal' => 'Não fiscal', 'todos' => 'Todos'])
        ->attrs(['class' => 'form-select tooltipp2'])
        !!}

        <div class="text-tooltip2 d-none">
            Para finalizar Venda PDV
        </div>
    </div>

    <div class="col-md-2">
        {!! Form::time('hora_inicio', 'Hora início')
        ->attrs(['class' => 'form-control'])
        ->value(isset($item) ? $item->hora_inicio : null)
        !!}
    </div>
    <div class="col-md-2">
        {!! Form::time('hora_fim', 'Hora fim')
        ->attrs(['class' => 'form-control'])
        ->value(isset($item) ? $item->hora_fim : null)
        !!}
    </div>

    <div class="col-md-2">
        {!! Form::select(
        'bloquear_fora_horario',
        'Bloquear fora do horário',
        [1 => 'Sim', 0 => 'Não']
        )
        ->attrs(['class' => 'form-select'])
        ->value(isset($item) ? $item->bloquear_fora_horario : 1)
        !!}
    </div>

    <div class="col-md-12 mt-2">
        <label class="form-label">Dias permitidos</label>
        <div class="d-flex flex-wrap gap-3">
            @php
            $diasSemana = [
            1 => 'Seg',
            2 => 'Ter',
            3 => 'Qua',
            4 => 'Qui',
            5 => 'Sex',
            6 => 'Sáb',
            7 => 'Dom',
            ];

            $diasSelecionados = isset($item) && $item->dias_semana
            ? json_decode($item->dias_semana, true)
            : [];
            @endphp

            @foreach($diasSemana as $num => $label)
            <div class="form-check">
                <input
                class="form-check-input"
                type="checkbox"
                name="dias_semana[]"
                value="{{ $num }}"
                id="dia_{{ $num }}"
                @if(in_array($num, $diasSelecionados)) checked @endif
                >
                <label class="form-check-label" for="dia_{{ $num }}">
                    {{ $label }}
                </label>
            </div>
            @endforeach
        </div>
    </div>
    
    <hr>
    <div class="card col-md-3 mt-3 form-input" style="width: 210px">
        <p>Selecione uma imagem</p>

        <div class="preview">
            <button type="button" id="btn-remove-imagem" class="btn btn-link-danger btn-sm btn-danger">x</button>
            @isset($item)
            <img id="file-ip-1-preview" src="{{ $item->img }}">
            @else
            <img id="file-ip-1-preview" src="imgs/no-client.png">
            @endif
        </div>
        <label for="file-ip-1">Foto</label>
        <input type="file" id="file-ip-1" name="image" accept="image/*" onchange="showPreview(event);">
    </div>

    <hr class="mt-4">
    <div class="col-12" style="text-align: right;">
        <button type="submit" class="btn btn-success px-5" id="btn-store">Salvar</button>
    </div>
</div>

@section('js')
<script>
    $(document).ready(function() {
        $("#show_hide_password a").on('click', function(event) {
            event.preventDefault();
            if ($('#show_hide_password input').attr("type") == "text") {
                $('#show_hide_password input').attr('type', 'password');
                $('#show_hide_password i').addClass("bx-hide");
                $('#show_hide_password i').removeClass("bx-show");
            } else if ($('#show_hide_password input').attr("type") == "password") {
                $('#show_hide_password input').attr('type', 'text');
                $('#show_hide_password i').removeClass("bx-hide");
                $('#show_hide_password i').addClass("bx-show");
            }
        });
    });

</script>
@endsection
