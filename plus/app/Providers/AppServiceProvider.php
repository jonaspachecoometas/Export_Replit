<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Paginator::useBootstrap();

        Blade::if('routeHas', function ($name) {
            return Route::has($name);
        });
        
        // Force HTTPS and correct host when behind proxy (Arcádia Suite)
        $forwardedHost = request()->header('X-Forwarded-Host');
        $forwardedProto = request()->header('X-Forwarded-Proto');
        $forwardedPrefix = request()->header('X-Forwarded-Prefix');
        
        if ($forwardedHost) {
            // Running behind Arcádia Suite proxy
            $proto = $forwardedProto ?: 'https';
            $baseUrl = $proto . '://' . $forwardedHost;
            
            // Add prefix if running behind /plus proxy
            if ($forwardedPrefix) {
                $baseUrl .= rtrim($forwardedPrefix, '/');
            }
            
            URL::forceScheme($proto);
            URL::forceRootUrl($baseUrl);
        } elseif (env('ARCADIA_PROXY_URL')) {
            // Fallback to environment variable if headers not present
            $proxyUrl = rtrim(env('ARCADIA_PROXY_URL'), '/');
            URL::forceRootUrl($proxyUrl);
            if (str_starts_with($proxyUrl, 'https')) {
                URL::forceScheme('https');
            }
        }
    }
}
