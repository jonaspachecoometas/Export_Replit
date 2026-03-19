#!/bin/bash
# Arcádia Suite — Apache Superset Init Script
# Executado ao iniciar o container
set -e

SUPERSET_ADMIN_USER="${SUPERSET_ADMIN_USER:-admin}"
SUPERSET_ADMIN_EMAIL="${SUPERSET_ADMIN_EMAIL:-admin@arcadia.app}"
SUPERSET_ADMIN_PASSWORD="${SUPERSET_ADMIN_PASSWORD:-arcadia2026}"
ARCADIA_DB_URL="${ARCADIA_DATABASE_URL:-postgresql://arcadia:arcadia123@db:5432/arcadia}"

echo "[Superset Init] Aguardando PostgreSQL..."
until python -c "
import psycopg2, os, sys, re
try:
    # Health check no banco 'postgres' (sempre existe), não no 'superset' que ainda não existe
    url = os.environ.get('DATABASE_URL', 'postgresql://arcadia:SuaSenhaSegura@db:5432/superset')
    check_url = re.sub(r'/[^/?]+(\?.*)?$', '/postgres', url)
    psycopg2.connect(check_url)
except Exception:
    sys.exit(1)
" 2>/dev/null; do
  sleep 2
done
echo "[Superset Init] PostgreSQL disponível!"

echo "[Superset Init] Criando banco superset se necessário..."
python - <<'DBEOF'
import psycopg2, os, re
url = os.environ.get('DATABASE_URL', 'postgresql://arcadia:SuaSenhaSegura@db:5432/superset')
conn_url = re.sub(r'/[^/?]+(\?.*)?$', '/postgres', url)
conn = psycopg2.connect(conn_url)
conn.autocommit = True
cur = conn.cursor()
cur.execute("SELECT 1 FROM pg_database WHERE datname = 'superset'")
if not cur.fetchone():
    cur.execute("CREATE DATABASE superset")
    print("[Superset Init] Banco 'superset' criado.")
else:
    print("[Superset Init] Banco 'superset' já existe.")
conn.close()
DBEOF

echo "[Superset Init] Rodando migrações do banco..."
superset db upgrade

echo "[Superset Init] Criando admin..."
superset fab create-admin \
  --username "${SUPERSET_ADMIN_USER}" \
  --firstname "Arcádia" \
  --lastname "Admin" \
  --email "${SUPERSET_ADMIN_EMAIL}" \
  --password "${SUPERSET_ADMIN_PASSWORD}" 2>/dev/null || echo "[Superset Init] Admin já existe."

echo "[Superset Init] Inicializando roles e permissões..."
superset init

echo "[Superset Init] Registrando banco Arcádia Suite..."
python - <<PYEOF
import sys
try:
    from superset import create_app
    from superset.extensions import db as sdb
    from superset.models.core import Database as SupersetDB

    app = create_app()
    with app.app_context():
        existing = sdb.session.query(SupersetDB).filter_by(database_name="Arcádia Suite").first()
        if not existing:
            new_db = SupersetDB(
                database_name="Arcádia Suite",
                sqlalchemy_uri="${ARCADIA_DB_URL}",
                expose_in_sqllab=True,
                allow_run_async=True,
                allow_csv_upload=False,
                allow_ctas=False,
                allow_cvas=False,
                allow_dml=False,
                extra='{"metadata_params":{},"engine_params":{},"metadata_cache_timeout":{},"schemas_allowed_for_file_upload":[]}',
            )
            sdb.session.add(new_db)
            sdb.session.commit()
            print("[Superset Init] Banco 'Arcádia Suite' registrado com sucesso!")
        else:
            print("[Superset Init] Banco 'Arcádia Suite' já está registrado.")
except Exception as e:
    print(f"[Superset Init] Aviso ao registrar banco: {e}")
    sys.exit(0)
PYEOF

echo "[Superset Init] Iniciando servidor Superset..."
exec gunicorn \
  --bind "0.0.0.0:${SUPERSET_WEBSERVER_PORT:-8088}" \
  --access-logfile - \
  --error-logfile - \
  --workers "${SUPERSET_WORKERS:-4}" \
  --worker-class gthread \
  --threads 2 \
  --timeout 120 \
  --limit-request-line 0 \
  --limit-request-field_size 0 \
  "superset.app:create_app()"
