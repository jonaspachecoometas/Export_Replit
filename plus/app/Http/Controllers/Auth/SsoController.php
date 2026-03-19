<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SsoController extends Controller
{
    private $ssoSecret;

    public function __construct()
    {
        $this->ssoSecret = env('SSO_SECRET');
        if (!$this->ssoSecret || strlen($this->ssoSecret) < 32) {
            throw new \RuntimeException('SSO_SECRET must be set with at least 32 characters');
        }
    }

    public function login(Request $request)
    {
        $token = $request->query('token');
        $signature = $request->query('sig');
        $timestamp = $request->query('ts');

        if (!$token || !$signature || !$timestamp) {
            return redirect('/login')->with('error', 'Token SSO inválido');
        }

        if (abs(time() - intval($timestamp)) > 300) {
            return redirect('/login')->with('error', 'Token SSO expirado');
        }

        $expectedSignature = hash_hmac('sha256', $token . $timestamp, $this->ssoSecret);
        if (!hash_equals($expectedSignature, $signature)) {
            return redirect('/login')->with('error', 'Assinatura SSO inválida');
        }

        $data = json_decode(base64_decode(strtr($token, '-_', '+/')), true);
        if (!$data || !isset($data['email'])) {
            return redirect('/login')->with('error', 'Dados SSO inválidos');
        }

        if (!isset($data['iss']) || $data['iss'] !== 'arcadia-suite') {
            return redirect('/login')->with('error', 'Token SSO com emissor inválido');
        }
        if (!isset($data['aud']) || $data['aud'] !== 'arcadia-plus') {
            return redirect('/login')->with('error', 'Token SSO com destino inválido');
        }

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            $user = User::create([
                'name' => $data['name'] ?? $data['username'] ?? 'Usuário Suite',
                'email' => $data['email'],
                'password' => Hash::make(bin2hex(random_bytes(16))),
                'admin' => $data['role'] === 'admin' ? true : false,
                'status' => true,
            ]);
        }

        Auth::login($user, true);

        return redirect('/home');
    }

    public function verify(Request $request)
    {
        return response()->json([
            'authenticated' => Auth::check(),
            'user' => Auth::user()
        ]);
    }
}
