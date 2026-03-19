<div class="row g-2 align-items-end mb-2 score-row" data-group="{{ $group }}">
    <div class="col-md-5">
        <label class="form-label required">{{ $labelMin }}</label>
        <input required type="tel" class="form-control {{$type}}"
        name="{{ $group }}[{{ $i }}][min]" value="{{ $type == 'moeda' ? __moedaInput((float)$min) : $min }}">
    </div>
    <div class="col-md-5">
        <label class="form-label required">Score</label>
        <input required type="tel" class="form-control integer" name="{{ $group }}[{{ $i }}][score]" value="{{ $score }}">
    </div>
    <div class="col-md-2">
        <button type="button" class="btn btn-outline-danger w-100" onclick="removeRow(this)">
            Remover
        </button>
    </div>
</div>
