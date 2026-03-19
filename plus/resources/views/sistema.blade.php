@extends('layouts.app', ['title' => 'Sistema'])
@section('content')
<div class="mt-1">
	<div class="card">
		<div class="card-header">
			<h5><i class="ri-server-line"></i> Ambiente do Servidor</h5>
		</div>
		<div class="card-body" id="phpInfoBox">
			<div class="text-muted">Carregando informações...</div>
		</div>
	</div>
</div>
@section('js')
<script type="text/javascript">
	$.ajax({
		url: "{{ url('/sistema-info') }}",
		method: "GET",
	})
	.done(function (res) {

		let html = `
		<strong>PHP:</strong> ${res.php.version}<br>
		<strong>Servidor:</strong> ${res.php.server}<br>
		<strong>SO:</strong> ${res.php.os}<hr>

		<strong>Limites:</strong><br>
		<ul>
		<li>Memory limit: <b>${res.limits.memory_limit}</b></li>
		<li>Max execution time: <b>${res.limits.max_execution_time}s</b></li>
		<li>Upload max filesize: <b>${res.limits.upload_max_filesize}</b></li>
		<li>Post max size: <b>${res.limits.post_max_size}</b></li>
		</ul>

		<strong>Extensões:</strong>
		<ul>
		`;

		$.each(res.extensions, function (ext, enabled) {
			html += `
			<li>
			${ext}
			${enabled
				? '<span class="text-success fs-18"><i class="ri-check-line"></i></span>'
				: '<span class="text-danger fs-18"><i class="ri-close-line"></i></span>'}
				</li>`;
			});

		html += `</ul>`;

		$('#phpInfoBox').html(html);
	})
	.fail(function () {
		$('#phpInfoBox').html('<span class="text-danger">Erro ao carregar informações do servidor</span>');
	});

</script>
@endsection
@endsection