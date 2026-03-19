"""
Arcádia Suite — Apache Superset Configuration
Habilita embedding nativo via Guest Token JWT
"""
import os

# ── Segurança ─────────────────────────────────────────────────────────────────
SECRET_KEY = os.environ.get("SUPERSET_SECRET_KEY", "change-in-production-use-openssl-rand-hex-32")

# ── Banco de metadados do Superset ────────────────────────────────────────────
SQLALCHEMY_DATABASE_URI = os.environ.get(
    "DATABASE_URL",
    "postgresql://arcadia:arcadia123@db:5432/arcadia_superset"
)

# ── CORS — permite o gateway Arcádia (:5000) chamar a API ────────────────────
ENABLE_CORS = True
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": {r"/api/*": {"origins": "*"}},
}

# ── Feature Flags ─────────────────────────────────────────────────────────────
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,          # Embedding via Guest Token
    "ENABLE_TEMPLATE_PROCESSING": True, # Jinja templates em queries
    "ALERT_REPORTS": True,              # Alertas automáticos
    "DRILL_TO_DETAIL": True,            # Drill-down em charts
    "DRILL_BY": True,                   # Drill-by em charts
    "DASHBOARD_NATIVE_FILTERS": True,   # Filtros nativos em dashboards
    "DASHBOARD_CROSS_FILTERS": True,    # Cross-filter entre charts
    "ENABLE_JAVASCRIPT_CONTROLS": False, # Desabilitado por segurança
}

# ── Cache ─────────────────────────────────────────────────────────────────────
CACHE_CONFIG = {
    "CACHE_TYPE": "SimpleCache",
    "CACHE_DEFAULT_TIMEOUT": 300,  # 5 minutos
}

# ── Timeout de queries ────────────────────────────────────────────────────────
SUPERSET_WEBSERVER_TIMEOUT = 300
SQLLAB_TIMEOUT = 300
SQLLAB_ASYNC_TIME_LIMIT_SEC = 300

# ── Branding Arcádia ──────────────────────────────────────────────────────────
APP_NAME = "Arcádia Insights"
LOGO_TARGET_PATH = "/"
FAVICONS = [{"href": "/static/assets/images/favicon.png"}]

# ── Segurança de sessão ───────────────────────────────────────────────────────
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False   # True em prod com HTTPS
WTF_CSRF_ENABLED = True
WTF_CSRF_EXEMPT_LIST = ["superset.views.core.log"]

# ── Guest Token (para embedding) ──────────────────────────────────────────────
GUEST_TOKEN_JWT_EXP_SECONDS = 300  # 5 minutos — frontend renova automaticamente
GUEST_ROLE_NAME = "Public"
GUEST_TOKEN_JWT_ALGO = "HS256"
GUEST_TOKEN_HEADER_NAME = "X-GuestToken"
