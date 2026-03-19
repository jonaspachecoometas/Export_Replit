#!/bin/sh
# Entrypoint dos microserviços Python
# Seleciona o script correto baseado em SERVICE_NAME

set -e

SERVICE_NAME=${SERVICE_NAME:-contabil}
SERVICE_PORT=${SERVICE_PORT:-8000}

echo "[entrypoint] Iniciando serviço: $SERVICE_NAME na porta $SERVICE_PORT"

case "$SERVICE_NAME" in
  contabil)
    exec python -m uvicorn server.python.contabil_service:app \
      --host 0.0.0.0 \
      --port "$SERVICE_PORT" \
      --workers 2
    ;;
  bi)
    exec python -m uvicorn server.python.bi_engine:app \
      --host 0.0.0.0 \
      --port "$SERVICE_PORT" \
      --workers 2
    ;;
  automation)
    exec python -m uvicorn server.python.automation_engine:app \
      --host 0.0.0.0 \
      --port "$SERVICE_PORT" \
      --workers 1
    ;;
  fisco)
    exec python -m uvicorn server.python.fisco_service:app \
      --host 0.0.0.0 \
      --port "$SERVICE_PORT" \
      --workers 2
    ;;
  people)
    exec python -m uvicorn server.python.people_service:app \
      --host 0.0.0.0 \
      --port "$SERVICE_PORT" \
      --workers 2
    ;;
  embeddings)
    exec python -m uvicorn server.python.embeddings_service:app \
      --host 0.0.0.0 \
      --port "$SERVICE_PORT" \
      --workers 1
    ;;
  *)
    echo "[entrypoint] ERRO: SERVICE_NAME desconhecido: $SERVICE_NAME"
    echo "Valores válidos: contabil | bi | automation | fisco | people | embeddings"
    exit 1
    ;;
esac
