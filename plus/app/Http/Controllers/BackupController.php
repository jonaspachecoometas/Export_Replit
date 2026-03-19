<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BackupController extends Controller
{

    public function start()
    {
        $token = (string) Str::uuid();
        $dir = env('APP_NAME');

        Cache::put("backup:$token:status", 'running', 600);

        try {
            $disk = Storage::disk('local');

            if ($disk->exists($dir)) {
                $disk->deleteDirectory($dir);
            }
            $disk->makeDirectory($dir);

            Artisan::call('backup:run', [
                '--disable-notifications' => true,
            ]);

            $files = collect($disk->files($dir))
            ->filter(fn($f) => str_ends_with($f, '.zip'))
            ->sortDesc();

            if ($files->isEmpty()) {
                Cache::put("backup:$token:status", 'error', 600);
                return response()->json(['ok' => false, 'message' => 'Backup não gerado'], 500);
            }

            $backupFile = $files->first();

            Cache::put("backup:$token:status", 'ready', 600);
            Cache::put("backup:$token:file", $backupFile, 600);

            return response()->json(['ok' => true, 'token' => $token]);
        } catch (\Throwable $e) {
            Cache::put("backup:$token:status", 'error', 600);
            return response()->json(['ok' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function status(string $token)
    {
        $status = Cache::get("backup:$token:status", 'not_found');
        return response()->json(['ok' => true, 'status' => $status]);
    }

    public function downloadByToken(string $token)
    {
        $status = Cache::get("backup:$token:status");

        if ($status !== 'ready') {
            abort(404);
        }

        $backupFile = Cache::get("backup:$token:file");
        if (!$backupFile) abort(404);

        return response()->download(
            storage_path('app/' . $backupFile),
            'backup-slym-' . now()->format('Y-m-d_H-i') . '.zip'
        );
    }


}
