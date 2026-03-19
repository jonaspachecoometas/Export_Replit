<?php

namespace App\Http\Middleware;

use Closure;
use Response;
use Illuminate\Support\Facades\Auth;
use App\Models\AcessoLog;

class ValidaHorarioAcesso
{

	public function handle($request, Closure $next){

		if (!Auth::check()) {
			return $next($request);
		}

		$user = Auth::user();

        // if ($user->admin == 1) {
        //     return $next($request);
        // }

		if (!$user->bloquear_fora_horario) {
			return $next($request);
		}

		if (!$user->hora_inicio || !$user->hora_fim || !$user->dias_semana) {
			return $next($request);
		}

		$agora = now();
		$horaAtual = $agora->format('H:i');
		$diaSemana = $agora->dayOfWeekIso;

		$diasPermitidos = json_decode($user->dias_semana, true);

        // Dia não permitido
		if (!in_array($diaSemana, $diasPermitidos)) {
			return $this->bloquear($request);
		}

		if ($horaAtual < $user->hora_inicio || $horaAtual > $user->hora_fim) {
			return $this->bloquear($request);
		}

		return $next($request);
	}

	private function bloquear($request)
	{
		AcessoLog::create([
			'usuario_id' => Auth::user()->id,
			'ip' => $this->get_client_ip(),
			'acesso_bloqueado' => 1
		]);
		Auth::logout();

		return redirect()
		->route('login')
		->with('error', 'Acesso permitido apenas dentro do período autorizado.');
	}

	private function get_client_ip() {
		$ipaddress = '';
		if (isset($_SERVER['HTTP_CLIENT_IP']))
			$ipaddress = $_SERVER['HTTP_CLIENT_IP'];
		else if(isset($_SERVER['HTTP_X_FORWARDED_FOR']))
			$ipaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
		else if(isset($_SERVER['HTTP_X_FORWARDED']))
			$ipaddress = $_SERVER['HTTP_X_FORWARDED'];
		else if(isset($_SERVER['HTTP_FORWARDED_FOR']))
			$ipaddress = $_SERVER['HTTP_FORWARDED_FOR'];
		else if(isset($_SERVER['HTTP_FORWARDED']))
			$ipaddress = $_SERVER['HTTP_FORWARDED'];
		else if(isset($_SERVER['REMOTE_ADDR']))
			$ipaddress = $_SERVER['REMOTE_ADDR'];
		else
			$ipaddress = 'UNKNOWN';
		return $ipaddress;
	}
}