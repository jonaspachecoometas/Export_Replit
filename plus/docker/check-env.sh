#!/usr/bin/env bash
set -eo pipefail

ENV_FILE="/var/www/html/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "ERRO: Arquivo .env não encontrado. Crie um .env baseado em .env.example."
    exit 1
fi

REQUIRED_VARS=(
    APP_ENV
    DB_HOST
    DB_DATABASE
    DB_USERNAME
    DB_PASSWORD
)

MISSING_VARS=()

# 1. Validação normal das outras variáveis
for VAR in "${REQUIRED_VARS[@]}"; do
    LINE=$(grep -E "^${VAR}=" "$ENV_FILE" || true)
    VALUE="${LINE#*=}"
    VALUE=$(echo "$VALUE" | tr -d '\r')

    # Se linha não existe ou valor está vazio → erro
    if [ -z "$LINE" ] || [ -z "$VALUE" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

# 2. Validação ESPECIAL de APP_KEY
# Regra: APP_KEY precisa EXISTIR, mesmo que vazia
APP_KEY_LINE=$(grep -E "^APP_KEY=" "$ENV_FILE" || true)

if [ -z "$APP_KEY_LINE" ]; then
    echo "ERRO: APP_KEY deve existir no .env (pode ser vazia: APP_KEY=, ou conter uma chave válida)."
    MISSING_VARS+=("APP_KEY")
fi

# 3. Saída final
if [ "${#MISSING_VARS[@]}" -ne 0 ]; then
    echo "Variáveis obrigatórias ausentes ou inválidas no .env:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "  - $VAR"
    done
    exit 1
fi

exec "$@"
