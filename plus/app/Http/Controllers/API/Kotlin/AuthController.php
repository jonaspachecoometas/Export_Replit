<?php

namespace App\Http\Controllers\API\Kotlin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function auth(Request $request){

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Credenciais inválidas'
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'nome' => $user->name,
                'empresa_nome' => $user->empresa->empresa->nome,
                'empresa_id' => $user->empresa->empresa_id,
            ]
        ], 200);
    }
}
