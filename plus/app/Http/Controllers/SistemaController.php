<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SistemaController extends Controller
{

    public function index(){

        if(env("APP_ENV") == "demo"){
            die;
        }
        return view('sistema');
    }

    public function phpInfoResumo()
    {
        $extensions = [
            'curl',
            'zip',
            'gd',
            'imagick',
            'openssl',
            'mbstring',
            'intl',
            'soap',
            'pdo_mysql',
            'bcmath',
            'fileinfo',
        ];

        return response()->json([
            'php' => [
                'version' => PHP_VERSION,
                'os' => PHP_OS,
                'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'N/A',
            ],
            'limits' => [
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
                'max_input_time' => ini_get('max_input_time'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'default_socket_timeout' => ini_get('default_socket_timeout'),
            ],
            'extensions' => collect($extensions)->mapWithKeys(fn ($ext) => [
                $ext => extension_loaded($ext)
            ]),
            'laravel' => [
                'app_env' => config('app.env'),
                'app_debug' => config('app.debug'),
                'timezone' => config('app.timezone'),
            ]
        ]);
    }
}
