<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use App\Models\Fornecedor;
use App\Models\Produto;
use App\Models\Empresa;
use App\Models\Plano;
use App\Models\User;
use App\Models\PreVenda;
use App\Models\Pedido;
use App\Models\ContaReceber;
use App\Models\ContaPagar;
use App\Models\Nfe;
use App\Models\Nfce;
use Illuminate\Http\Request;

class SuiteApiController extends Controller
{
    public function stats()
    {
        return response()->json([
            'empresas' => Empresa::count(),
            'planos' => Plano::count(),
            'usuarios' => User::count(),
            'nfes' => Nfe::count(),
            'nfces' => Nfce::count(),
            'mrr' => Plano::sum('valor') ?? 0
        ]);
    }

    public function empresas()
    {
        $empresas = Empresa::with('plano')
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get()
            ->map(function($e) {
                return [
                    'id' => $e->id,
                    'nome' => $e->nome ?? $e->razao_social,
                    'razao_social' => $e->razao_social,
                    'cnpj' => $e->cpf_cnpj,
                    'email' => $e->email,
                    'telefone' => $e->telefone,
                    'cidade' => $e->cidade,
                    'uf' => $e->uf,
                    'plano' => $e->plano ? $e->plano->nome : null,
                    'status' => $e->status ? 'ativo' : 'inativo',
                    'created_at' => $e->created_at
                ];
            });

        return response()->json($empresas);
    }

    public function clientes(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $clientes = Cliente::where('empresa_id', $empresaId)
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'nome' => $c->razao_social ?? $c->nome,
                    'razao_social' => $c->razao_social,
                    'cpf_cnpj' => $c->cpf_cnpj,
                    'email' => $c->email,
                    'telefone' => $c->telefone,
                    'celular' => $c->celular,
                    'cidade' => $c->cidade,
                    'uf' => $c->uf,
                    'endereco' => $c->rua,
                    'bairro' => $c->bairro,
                    'status' => $c->status ? 'ativo' : 'inativo'
                ];
            });

        return response()->json($clientes);
    }

    public function fornecedores(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $fornecedores = Fornecedor::where('empresa_id', $empresaId)
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get()
            ->map(function($f) {
                return [
                    'id' => $f->id,
                    'nome' => $f->razao_social ?? $f->nome,
                    'razao_social' => $f->razao_social,
                    'cpf_cnpj' => $f->cpf_cnpj,
                    'email' => $f->email,
                    'telefone' => $f->telefone,
                    'cidade' => $f->cidade,
                    'uf' => $f->uf,
                    'status' => $f->status ? 'ativo' : 'inativo'
                ];
            });

        return response()->json($fornecedores);
    }

    public function produtos(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $produtos = Produto::where('empresa_id', $empresaId)
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'codigo' => $p->codigo ?? $p->id,
                    'nome' => $p->nome,
                    'descricao' => $p->descricao,
                    'ncm' => $p->ncm,
                    'unidade' => $p->unidade,
                    'valor_unitario' => $p->valor_unitario,
                    'valor_compra' => $p->valor_compra,
                    'estoque_atual' => $p->estoque_atual ?? 0,
                    'estoque_minimo' => $p->estoque_minimo ?? 0,
                    'codigo_barras' => $p->codigo_barras,
                    'categoria' => $p->categoria ? $p->categoria->nome : null,
                    'status' => $p->status ? 'ativo' : 'inativo'
                ];
            });

        return response()->json($produtos);
    }

    public function vendas(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $vendas = PreVenda::where('empresa_id', $empresaId)
            ->with(['cliente'])
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get()
            ->map(function($v) {
                return [
                    'id' => $v->id,
                    'numero' => $v->numero ?? $v->id,
                    'cliente' => $v->cliente ? $v->cliente->razao_social : 'Consumidor',
                    'valor_total' => $v->valor_total ?? 0,
                    'status' => $v->estado ?? 'pendente',
                    'data' => $v->created_at
                ];
            });

        return response()->json($vendas);
    }

    public function compras(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $compras = Pedido::where('empresa_id', $empresaId)
            ->with(['fornecedor'])
            ->orderBy('id', 'desc')
            ->limit(50)
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'numero' => $c->numero ?? $c->id,
                    'fornecedor' => $c->fornecedor ? $c->fornecedor->razao_social : null,
                    'valor_total' => $c->valor_total ?? 0,
                    'status' => $c->estado ?? 'pendente',
                    'data' => $c->created_at
                ];
            });

        return response()->json($compras);
    }

    public function contasReceber(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $contas = ContaReceber::where('empresa_id', $empresaId)
            ->with(['cliente'])
            ->orderBy('data_vencimento', 'asc')
            ->limit(50)
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'descricao' => $c->descricao,
                    'cliente' => $c->cliente ? $c->cliente->razao_social : null,
                    'valor' => $c->valor,
                    'valor_recebido' => $c->valor_recebido ?? 0,
                    'vencimento' => $c->data_vencimento,
                    'status' => $c->status
                ];
            });

        return response()->json($contas);
    }

    public function contasPagar(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        $contas = ContaPagar::where('empresa_id', $empresaId)
            ->with(['fornecedor'])
            ->orderBy('data_vencimento', 'asc')
            ->limit(50)
            ->get()
            ->map(function($c) {
                return [
                    'id' => $c->id,
                    'descricao' => $c->descricao,
                    'fornecedor' => $c->fornecedor ? $c->fornecedor->razao_social : null,
                    'valor' => $c->valor,
                    'valor_pago' => $c->valor_pago ?? 0,
                    'vencimento' => $c->data_vencimento,
                    'status' => $c->status
                ];
            });

        return response()->json($contas);
    }

    public function dashboardStats(Request $request)
    {
        $empresaId = $request->header('X-Empresa-Id', 1);
        
        try {
            $clientes = Cliente::where('empresa_id', $empresaId)->count();
        } catch (\Exception $e) {
            $clientes = 0;
        }
        
        try {
            $fornecedores = Fornecedor::where('empresa_id', $empresaId)->count();
        } catch (\Exception $e) {
            $fornecedores = 0;
        }
        
        try {
            $produtos = Produto::where('empresa_id', $empresaId)->count();
        } catch (\Exception $e) {
            $produtos = 0;
        }
        
        try {
            $vendas = PreVenda::where('empresa_id', $empresaId)->count();
        } catch (\Exception $e) {
            $vendas = 0;
        }
        
        try {
            $contasReceber = ContaReceber::where('empresa_id', $empresaId)->sum('valor') ?? 0;
        } catch (\Exception $e) {
            $contasReceber = 0;
        }
        
        try {
            $contasPagar = ContaPagar::where('empresa_id', $empresaId)->sum('valor') ?? 0;
        } catch (\Exception $e) {
            $contasPagar = 0;
        }
        
        return response()->json([
            'clientes' => $clientes,
            'fornecedores' => $fornecedores,
            'produtos' => $produtos,
            'vendas' => $vendas,
            'contas_receber' => floatval($contasReceber),
            'contas_pagar' => floatval($contasPagar)
        ]);
    }

    // ========== SUPERADMIN APIs ==========

    public function planos()
    {
        $planos = Plano::orderBy('id', 'desc')
            ->get()
            ->map(function($p) {
                return [
                    'id' => $p->id,
                    'nome' => $p->nome,
                    'valor' => floatval($p->valor ?? 0),
                    'descricao' => $p->descricao,
                    'limite_usuarios' => $p->limite_usuarios ?? 1,
                    'limite_empresas' => $p->limite_empresas ?? 1,
                    'limite_nfe' => $p->limite_nfe ?? 0,
                    'limite_nfce' => $p->limite_nfce ?? 0,
                    'modulos' => $p->modulos ?? [],
                    'status' => $p->status ? 'ativo' : 'inativo',
                    'empresas_count' => $p->empresas()->count(),
                    'created_at' => $p->created_at
                ];
            });

        return response()->json($planos);
    }

    public function criarPlano(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'valor' => 'required|numeric|min:0',
            'descricao' => 'nullable|string',
            'limite_usuarios' => 'nullable|integer|min:1',
            'limite_empresas' => 'nullable|integer|min:1',
            'limite_nfe' => 'nullable|integer|min:0',
            'limite_nfce' => 'nullable|integer|min:0',
            'modulos' => 'nullable|array',
        ]);

        $plano = Plano::create([
            'nome' => $validated['nome'],
            'valor' => $validated['valor'],
            'descricao' => $validated['descricao'] ?? null,
            'limite_usuarios' => $validated['limite_usuarios'] ?? 1,
            'limite_empresas' => $validated['limite_empresas'] ?? 1,
            'limite_nfe' => $validated['limite_nfe'] ?? 100,
            'limite_nfce' => $validated['limite_nfce'] ?? 100,
            'modulos' => $validated['modulos'] ?? [],
            'status' => true,
        ]);

        return response()->json(['success' => true, 'plano' => $plano], 201);
    }

    public function atualizarPlano(Request $request, $id)
    {
        $plano = Plano::findOrFail($id);
        
        $validated = $request->validate([
            'nome' => 'sometimes|string|max:255',
            'valor' => 'sometimes|numeric|min:0',
            'descricao' => 'nullable|string',
            'limite_usuarios' => 'nullable|integer|min:1',
            'limite_empresas' => 'nullable|integer|min:1',
            'limite_nfe' => 'nullable|integer|min:0',
            'limite_nfce' => 'nullable|integer|min:0',
            'modulos' => 'nullable|array',
            'status' => 'sometimes|boolean',
        ]);

        $plano->update($validated);

        return response()->json(['success' => true, 'plano' => $plano]);
    }

    public function deletarPlano($id)
    {
        $plano = Plano::findOrFail($id);
        
        if ($plano->empresas()->count() > 0) {
            return response()->json(['error' => 'Plano possui empresas vinculadas'], 400);
        }
        
        $plano->delete();

        return response()->json(['success' => true]);
    }

    public function usuarios()
    {
        $usuarios = User::with(['empresas'])
            ->orderBy('id', 'desc')
            ->limit(100)
            ->get()
            ->map(function($u) {
                return [
                    'id' => $u->id,
                    'nome' => $u->name,
                    'email' => $u->email,
                    'admin' => $u->admin ?? false,
                    'status' => $u->status ? 'ativo' : 'inativo',
                    'empresas_count' => $u->empresas ? $u->empresas->count() : 0,
                    'ultimo_acesso' => $u->last_login_at,
                    'created_at' => $u->created_at
                ];
            });

        return response()->json($usuarios);
    }

    public function criarEmpresa(Request $request)
    {
        $validated = $request->validate([
            'razao_social' => 'required|string|max:255',
            'nome_fantasia' => 'nullable|string|max:255',
            'cpf_cnpj' => 'required|string|max:18',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'cidade' => 'nullable|string|max:100',
            'uf' => 'nullable|string|max:2',
            'plano_id' => 'nullable|exists:planos,id',
        ]);

        $empresa = Empresa::create([
            'razao_social' => $validated['razao_social'],
            'nome' => $validated['nome_fantasia'] ?? $validated['razao_social'],
            'cpf_cnpj' => $validated['cpf_cnpj'],
            'email' => $validated['email'] ?? null,
            'telefone' => $validated['telefone'] ?? null,
            'cidade' => $validated['cidade'] ?? null,
            'uf' => $validated['uf'] ?? null,
            'plano_id' => $validated['plano_id'] ?? null,
            'status' => true,
        ]);

        return response()->json(['success' => true, 'empresa' => $empresa], 201);
    }

    public function atualizarEmpresa(Request $request, $id)
    {
        $empresa = Empresa::findOrFail($id);
        
        $validated = $request->validate([
            'razao_social' => 'sometimes|string|max:255',
            'nome_fantasia' => 'nullable|string|max:255',
            'cpf_cnpj' => 'sometimes|string|max:18',
            'email' => 'nullable|email|max:255',
            'telefone' => 'nullable|string|max:20',
            'cidade' => 'nullable|string|max:100',
            'uf' => 'nullable|string|max:2',
            'plano_id' => 'nullable|exists:planos,id',
            'status' => 'sometimes|boolean',
        ]);

        if (isset($validated['nome_fantasia'])) {
            $validated['nome'] = $validated['nome_fantasia'];
            unset($validated['nome_fantasia']);
        }

        $empresa->update($validated);

        return response()->json(['success' => true, 'empresa' => $empresa]);
    }

    public function superadminStats()
    {
        return response()->json([
            'empresas' => Empresa::count(),
            'empresas_ativas' => Empresa::where('status', true)->count(),
            'planos' => Plano::count(),
            'usuarios' => User::count(),
            'usuarios_ativos' => User::where('status', true)->count(),
            'nfes_total' => Nfe::count(),
            'nfces_total' => Nfce::count(),
            'mrr' => Empresa::whereHas('plano')->with('plano')->get()->sum(fn($e) => $e->plano->valor ?? 0),
        ]);
    }
}
