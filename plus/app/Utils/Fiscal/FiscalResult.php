<?php

namespace App\Utils\Fiscal;

class FiscalResult
{
    protected array $mensagens = [];

    public function add(
        string $tipo,      // alerta | erro
        string $campo,
        string $mensagem,
        ?string $sugestao = null
    ): void {
        $this->mensagens[] = [
            'tipo' => $tipo,
            'campo' => $campo,
            'mensagem' => $mensagem,
            'sugestao' => $sugestao
        ];
    }

    public function hasErro(): bool
    {
        return collect($this->mensagens)->contains('tipo', 'erro');
    }

    public function getRisco(): string
    {
        if ($this->hasErro()) return 'alto';
        if (!empty($this->mensagens)) return 'medio';
        return 'baixo';
    }

    public function toArray(): array
    {
        return [
            'status' => $this->hasErro()
                ? 'erro'
                : (empty($this->mensagens) ? 'ok' : 'alerta'),
            'risco' => $this->getRisco(),
            'mensagens' => $this->mensagens
        ];
    }
}
