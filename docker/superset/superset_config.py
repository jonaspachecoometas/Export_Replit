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
APP_ICON = "/static/assets/images/arcadia_logo.png"
APP_ICON_WIDTH = 150
LOGO_TARGET_PATH = "/"
FAVICONS = [{"href": "/static/assets/images/favicon.png"}]

# ── Segurança de sessão ───────────────────────────────────────────────────────
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_SECURE = False   # True em prod com HTTPS
WTF_CSRF_ENABLED = True
WTF_CSRF_EXEMPT_LIST = ["superset.views.core.log"]

# ── Embedding cross-origin ────────────────────────────────────────────────────
# Desabilita Flask-Talisman para permitir embedding via iframe cross-origin
# (HTTPS é gerenciado pelo Traefik upstream)
TALISMAN_ENABLED = False
HTTP_HEADERS = {}
X_FRAME_OPTIONS = "ALLOWALL"

# ── Guest Token (para embedding) ──────────────────────────────────────────────
GUEST_TOKEN_JWT_EXP_SECONDS = 300  # 5 minutos — frontend renova automaticamente
GUEST_ROLE_NAME = "Public"
GUEST_TOKEN_JWT_ALGO = "HS256"
GUEST_TOKEN_HEADER_NAME = "X-GuestToken"

# ── Fix: g.user a partir do Bearer JWT ────────────────────────────────────────
# Quando o papel Public tem can_read on Dashboard, o decorator protect() do FAB
# trata o endpoint como público e pula a verificação JWT, deixando g.user como
# AnonymousUser. Este hook corrige isso: se há um Bearer JWT válido e g.user é
# anônimo, carrega o usuário do JWT antes do handler ser invocado.
def FLASK_APP_MUTATOR(app):  # noqa
    @app.before_request
    def _set_g_user_from_bearer_jwt():
        from flask import g, request  # noqa
        user = getattr(g, "user", None)
        if user is not None and not getattr(user, "is_anonymous", True):
            return  # já autenticado (ex: guest token via request_loader)
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return
        try:
            from flask_jwt_extended import decode_token  # noqa
            decoded = decode_token(auth[7:])
            user_id = decoded.get("sub")
            if user_id is not None:
                from superset.extensions import security_manager as sm  # noqa
                jwt_user = sm.get_user_by_id(int(user_id))
                if jwt_user and jwt_user.is_active:
                    g.user = jwt_user
        except Exception:  # noqa
            pass
