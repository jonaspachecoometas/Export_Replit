<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\SecurityLog;

class UploadFirewall
{
    public function handle(Request $request, Closure $next)
    {
        foreach ($request->files->all() as $file) {

            if (is_array($file)) {
                foreach ($file as $f) {
                    $this->checkFile($f, $request);
                }
            } else {
                $this->checkFile($file, $request);
            }
        }

        return $next($request);
    }

    private function checkFile($file, Request $request)
    {
        if (!$file) return;

        $ext = strtolower($file->getClientOriginalExtension());

        $bloqueados = [
            'php','phtml','phar','php3','php4','php5','php7',
            'exe','sh','bat','cmd','js','jsp','asp','aspx'
        ];

        if (in_array($ext, $bloqueados)) {

            SecurityLog::create([
                'ip' => $request->ip(),
                'user_id' => \Auth::user()->id,
                'rota' => $request->path(),
                'arquivo' => $file->getClientOriginalName(),
                'acao' => 'upload_bloqueado'
            ]);

            abort(403, 'Upload bloqueado por segurança');
        }
    }
}
