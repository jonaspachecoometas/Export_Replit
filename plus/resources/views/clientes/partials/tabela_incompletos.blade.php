<div class="card shadow-sm">
	<div class="card-header d-flex justify-content-between align-items-center">
		<div class="fw-bold">Pendentes</div>
		<div class="text-muted small">Total: {{ $clientes->total() }}</div>
	</div>

	<div class="table-responsive">
		<table class="table table-hover align-middle mb-0">
			<thead class="table-light">
				<tr>
					<th>#</th>
					<th>Razão social</th>
					<th>CPF/CNPJ</th>
					<th>Telefone</th>
					<th>Email</th>
					<th>Cidade</th>
					<th>Ação</th>
				</tr>
			</thead>
			<tbody>
				@forelse($clientes as $c)
				<tr>
					<td>{{ $c->numero_sequencial }}</td>
					<td class="fw-semibold">{{ $c->razao_social }}</td>
					<td>{{ $c->cpf_cnpj ?: '--' }}</td>
					<td>{{ $c->telefone ?: '--' }}</td>
					<td>{{ $c->email ?: '--' }}</td>
					<td>{{ $c->cidade ? $c->cidade->info : '--' }}</td>
					<td>
						<a class="btn btn-sm btn-warning" href="{{ route('clientes.edit', $c->id) }}">
							Completar
						</a>
					</td>
				</tr>
				@empty
				<tr>
					<td colspan="6" class="text-center text-muted py-4">
						Nenhum cliente encontrado.
					</td>
				</tr>
				@endforelse
			</tbody>
		</table>
	</div>

	<div class="card-footer">
		{{ $clientes->links() }}
	</div>
</div>