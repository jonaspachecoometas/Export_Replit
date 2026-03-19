<?php

namespace App\Utils;

use Illuminate\Support\Facades\Http;

class PrintUtil
{
    public function sendPrint(string $agentUrl, string $token, string $printer, array $content)
    {
        return Http::withHeaders([
            'x-slym-token' => $token
        ])->timeout(5)->post($agentUrl.'/print', [
            'printer' => $printer,
            'content' => $content
        ]);
    }
}
