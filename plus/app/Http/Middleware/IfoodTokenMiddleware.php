<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Carbon\Carbon;
use App\Models\IfoodConfig;
use App\Utils\IfoodUtil;

class IfoodTokenMiddleware
{

    protected $util;

    public function __construct(IfoodUtil $util)
    {
        $this->util = $util;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $config = IfoodConfig::
        where('empresa_id', $request->empresa_id)
        ->first();

        if (!$config->accessToken || $config->updated_at->lte(now()->subHours(6))) {
            $this->util->oAuthToken($config);
            $this->util->newToken($config);
        }

        return $next($request);
    }
}
