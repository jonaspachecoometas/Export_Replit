#!/bin/bash

# ===========================================
# Script de Deploy - Arcádia Suite
# ===========================================
# Uso: ./scripts/deploy.sh [opção]
# Opções:
#   install   - Instalação inicial completa
#   update    - Atualizar aplicação existente
#   backup    - Fazer backup do banco de dados
#   restart   - Reiniciar todos os serviços
#   status    - Ver status dos serviços
#   logs      - Ver logs em tempo real
# ===========================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Diretório da aplicação
APP_DIR="/var/www/arcadia"
BACKUP_DIR="/var/backups/arcadia"

# Funções auxiliares
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Verificar se está rodando como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script precisa ser executado como root (sudo)"
        exit 1
    fi
}

# Instalação inicial
install() {
    print_header "Instalação Inicial - Arcádia Suite"
    
    echo ""
    print_warning "Este script vai instalar:"
    echo "  - Node.js 20"
    echo "  - Python 3.11"
    echo "  - PostgreSQL"
    echo "  - Nginx"
    echo "  - PM2"
    echo "  - Certbot"
    echo ""
    read -p "Continuar? (s/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
    
    # Atualizar sistema
    print_header "Atualizando Sistema"
    apt update && apt upgrade -y
    apt install -y curl wget git build-essential software-properties-common
    print_success "Sistema atualizado"
    
    # Node.js
    print_header "Instalando Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    print_success "Node.js $(node --version) instalado"
    
    # Python
    print_header "Instalando Python 3.11"
    add-apt-repository ppa:deadsnakes/ppa -y
    apt update
    apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
    print_success "Python $(python3.11 --version) instalado"
    
    # PostgreSQL
    print_header "Instalando PostgreSQL"
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
    print_success "PostgreSQL instalado"
    
    # Nginx
    print_header "Instalando Nginx"
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx instalado"
    
    # PM2
    print_header "Instalando PM2"
    npm install -g pm2
    print_success "PM2 instalado"
    
    # Certbot
    print_header "Instalando Certbot"
    apt install -y certbot python3-certbot-nginx
    print_success "Certbot instalado"
    
    # Criar diretórios
    mkdir -p $APP_DIR
    mkdir -p $BACKUP_DIR
    
    print_header "Instalação Concluída!"
    echo ""
    echo "Próximos passos:"
    echo "  1. Clone seu repositório em $APP_DIR"
    echo "  2. Configure o arquivo .env"
    echo "  3. Execute: ./scripts/deploy.sh update"
    echo ""
}

# Atualizar aplicação
update() {
    print_header "Atualizando Aplicação"
    
    cd $APP_DIR
    
    # Backup antes de atualizar
    print_warning "Fazendo backup do banco de dados..."
    backup_db
    
    # Puxar atualizações
    echo "Puxando atualizações do Git..."
    git pull origin main || git pull origin master
    print_success "Código atualizado"
    
    # Instalar dependências Node
    echo "Instalando dependências Node.js..."
    npm install
    print_success "Dependências Node.js instaladas"
    
    # Atualizar ambiente Python
    echo "Atualizando ambiente Python..."
    source venv/bin/activate
    pip install -r requirements.txt 2>/dev/null || echo "Sem requirements.txt"
    deactivate
    print_success "Ambiente Python atualizado"
    
    # Build
    echo "Fazendo build do frontend..."
    npm run build
    print_success "Build concluído"
    
    # Migrações
    echo "Executando migrações do banco..."
    npm run db:push 2>/dev/null || echo "Sem migrações pendentes"
    print_success "Migrações executadas"
    
    # Reiniciar serviços
    restart
    
    print_header "Atualização Concluída!"
}

# Backup do banco de dados
backup_db() {
    BACKUP_FILE="$BACKUP_DIR/arcadia_$(date +%Y%m%d_%H%M%S).sql"
    
    # Carregar variáveis do .env
    if [ -f "$APP_DIR/.env" ]; then
        source $APP_DIR/.env
    fi
    
    PGPASSWORD=${PGPASSWORD:-""} pg_dump -h ${PGHOST:-localhost} -U ${PGUSER:-arcadia} ${PGDATABASE:-arcadia_suite} > $BACKUP_FILE
    
    # Comprimir backup
    gzip $BACKUP_FILE
    
    print_success "Backup salvo em ${BACKUP_FILE}.gz"
    
    # Manter apenas os últimos 7 backups
    ls -t $BACKUP_DIR/*.gz 2>/dev/null | tail -n +8 | xargs rm -f 2>/dev/null
}

# Backup completo
backup() {
    print_header "Backup Completo"
    backup_db
    print_header "Backup Concluído!"
}

# Reiniciar serviços
restart() {
    print_header "Reiniciando Serviços"
    
    cd $APP_DIR
    
    pm2 restart ecosystem.config.js 2>/dev/null || pm2 start ecosystem.config.js
    
    print_success "Serviços reiniciados"
    
    # Aguardar inicialização
    sleep 3
    status
}

# Ver status
status() {
    print_header "Status dos Serviços"
    
    echo ""
    echo -e "${BLUE}PM2:${NC}"
    pm2 status
    
    echo ""
    echo -e "${BLUE}Nginx:${NC}"
    systemctl status nginx --no-pager -l | head -5
    
    echo ""
    echo -e "${BLUE}PostgreSQL:${NC}"
    systemctl status postgresql --no-pager -l | head -5
}

# Ver logs
logs() {
    print_header "Logs em Tempo Real"
    echo "Pressione Ctrl+C para sair"
    echo ""
    pm2 logs
}

# Configurar Nginx
setup_nginx() {
    print_header "Configurar Nginx"
    
    read -p "Digite seu domínio (ex: arcadia.seudominio.com.br): " DOMAIN
    
    cat > /etc/nginx/sites-available/arcadia << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/arcadia /etc/nginx/sites-enabled/
    nginx -t && systemctl reload nginx
    
    print_success "Nginx configurado para $DOMAIN"
    
    read -p "Deseja instalar certificado SSL? (s/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        certbot --nginx -d $DOMAIN -d www.$DOMAIN
        print_success "SSL instalado"
    fi
}

# Setup banco de dados
setup_db() {
    print_header "Configurar Banco de Dados"
    
    read -p "Nome do usuário PostgreSQL [arcadia]: " DB_USER
    DB_USER=${DB_USER:-arcadia}
    
    read -sp "Senha do usuário: " DB_PASS
    echo ""
    
    read -p "Nome do banco de dados [arcadia_suite]: " DB_NAME
    DB_NAME=${DB_NAME:-arcadia_suite}
    
    sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

    print_success "Banco de dados configurado"
    
    echo ""
    echo "Adicione ao seu .env:"
    echo "DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME"
}

# Menu de ajuda
show_help() {
    echo ""
    echo "Script de Deploy - Arcádia Suite"
    echo ""
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos:"
    echo "  install      Instalação inicial completa (Node, Python, PostgreSQL, etc)"
    echo "  update       Atualizar aplicação (git pull, npm install, build, restart)"
    echo "  backup       Fazer backup do banco de dados"
    echo "  restart      Reiniciar todos os serviços (PM2)"
    echo "  status       Ver status de todos os serviços"
    echo "  logs         Ver logs em tempo real"
    echo "  setup-nginx  Configurar Nginx e SSL"
    echo "  setup-db     Configurar banco de dados PostgreSQL"
    echo "  help         Mostrar esta ajuda"
    echo ""
}

# Main
case "$1" in
    install)
        check_root
        install
        ;;
    update)
        update
        ;;
    backup)
        backup
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs
        ;;
    setup-nginx)
        check_root
        setup_nginx
        ;;
    setup-db)
        check_root
        setup_db
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac
