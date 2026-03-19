#!/bin/bash
# ─── ERPNext init — cria site e instala app se necessário ─────────────────────
# Executado como entrypoint do container frappe/erpnext:version-15

set -e

SITE_NAME="${FRAPPE_SITE_NAME:-erpnext.local}"
DB_HOST="${DB_HOST:-erpnext-db}"
DB_ROOT_PASSWORD="${ERPNEXT_DB_ROOT_PASSWORD:-erpnext-root-2026}"
ADMIN_PASSWORD="${ERPNEXT_ADMIN_PASSWORD:-admin2026}"
BENCH_DIR="/home/frappe/frappe-bench"

echo "[ERPNext Init] Aguardando MariaDB em ${DB_HOST}..."
until mysqladmin ping -h "${DB_HOST}" -u root --password="${DB_ROOT_PASSWORD}" --silent 2>/dev/null; do
  echo "[ERPNext Init] MariaDB ainda não disponível — aguardando 3s..."
  sleep 3
done
echo "[ERPNext Init] MariaDB disponível."

cd "${BENCH_DIR}"

SITES_DIR="${BENCH_DIR}/sites"
SITE_DIR="${SITES_DIR}/${SITE_NAME}"

if [ ! -f "${SITE_DIR}/site_config.json" ]; then
  echo "[ERPNext Init] Criando site ${SITE_NAME}..."

  bench new-site "${SITE_NAME}" \
    --mariadb-root-password "${DB_ROOT_PASSWORD}" \
    --admin-password "${ADMIN_PASSWORD}" \
    --db-host "${DB_HOST}" \
    --no-mariadb-socket \
    --verbose || true

  echo "[ERPNext Init] Instalando app erpnext..."
  bench --site "${SITE_NAME}" install-app erpnext || true

  echo "[ERPNext Init] Ativando modo developer..."
  bench --site "${SITE_NAME}" set-config developer_mode 1 || true

  echo "[ERPNext Init] Desativando SSL para env local..."
  bench --site "${SITE_NAME}" set-config ssl_certificate "" || true

  echo "[ERPNext Init] Site criado com sucesso."
else
  echo "[ERPNext Init] Site ${SITE_NAME} já existe — pulando criação."
fi

# Configura common_site_config.json para servir na porta 8080
if [ ! -f "${SITES_DIR}/common_site_config.json" ]; then
  echo '{"serve_default_site": true, "socketio_port": 9000, "background_workers": 1}' \
    > "${SITES_DIR}/common_site_config.json"
fi

echo "[ERPNext Init] Iniciando servidor Frappe na porta 8080..."
exec bench serve --port 8080 --site "${SITE_NAME}"
