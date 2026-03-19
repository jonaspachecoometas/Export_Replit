# Manual de Instalação - Arcádia Suite

## Requisitos do Servidor

### Hardware Mínimo
- CPU: 2 cores
- RAM: 4GB
- Disco: 40GB SSD
- Rede: 100 Mbps

### Hardware Recomendado
- CPU: 4+ cores
- RAM: 8GB+
- Disco: 100GB SSD
- Rede: 1 Gbps

### Sistema Operacional
- Ubuntu 22.04 LTS (recomendado)
- Debian 12
- Rocky Linux 9

---

## 1. Preparação do Servidor

### 1.1 Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar Dependências Básicas
```bash
sudo apt install -y curl wget git unzip build-essential
```

---

## 2. Instalar Node.js 20

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # v20.x.x
npm --version   # 10.x.x
```

---

## 3. Instalar Python 3.11

```bash
# Instalar Python e pip
sudo apt install -y python3.11 python3.11-venv python3-pip

# Criar link simbólico (se necessário)
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Verificar instalação
python3 --version  # Python 3.11.x
```

---

## 4. Instalar PostgreSQL 15

```bash
# Adicionar repositório oficial
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt update

# Instalar PostgreSQL
sudo apt install -y postgresql-15

# Iniciar e habilitar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco de dados
sudo -u postgres psql << EOF
CREATE USER arcadia WITH PASSWORD 'SuaSenhaSegura123!';
CREATE DATABASE arcadia_suite OWNER arcadia;
GRANT ALL PRIVILEGES ON DATABASE arcadia_suite TO arcadia;
\q
EOF
```

---

## 5. Instalar Redis (Opcional - Cache/Sessions)

```bash
sudo apt install -y redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar
redis-cli ping  # PONG
```

---

## 6. Clonar Projeto

```bash
# Criar diretório de aplicação
sudo mkdir -p /opt/arcadia
sudo chown $USER:$USER /opt/arcadia
cd /opt/arcadia

# Clonar repositório
git clone https://github.com/seu-usuario/arcadia-suite.git .

# Ou extrair arquivo ZIP
# unzip arcadia-suite.zip -d /opt/arcadia
```

---

## 7. Configurar Variáveis de Ambiente

### 7.1 Criar arquivo .env
```bash
cd /opt/arcadia
cp .env.example .env
nano .env
```

### 7.2 Conteúdo do .env
```env
# Banco de Dados
DATABASE_URL=postgresql://arcadia:SuaSenhaSegura123!@localhost:5432/arcadia_suite
PGHOST=localhost
PGPORT=5432
PGUSER=arcadia
PGPASSWORD=SuaSenhaSegura123!
PGDATABASE=arcadia_suite

# Aplicação
NODE_ENV=production
PORT=5000
SESSION_SECRET=sua-chave-secreta-muito-longa-e-aleatoria-aqui

# OpenAI (para recursos de IA)
OPENAI_API_KEY=sk-sua-chave-openai

# ERPNext (opcional)
ERPNEXT_URL=https://seu-erpnext.com
ERPNEXT_API_KEY=sua-api-key
ERPNEXT_API_SECRET=sua-api-secret

# WhatsApp (opcional)
# Configurado via interface

# Protocolos MCP/A2A
PROTOCOL_API_KEYS=chave1,chave2,chave3
```

---

## 8. Instalar Dependências do Projeto

### 8.1 Node.js (Frontend + Backend)
```bash
cd /opt/arcadia
npm install
```

### 8.2 Python (Serviços de IA)
```bash
cd /opt/arcadia
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 9. Build da Aplicação

```bash
cd /opt/arcadia

# Build do frontend (Vite)
npm run build

# Verificar build
ls -la dist/
```

---

## 10. Executar Migrações do Banco

```bash
cd /opt/arcadia

# Gerar migrações (se necessário)
npm run db:generate

# Aplicar migrações
npm run db:push
```

---

## 11. Configurar Serviço Systemd

### 11.1 Criar serviço principal
```bash
sudo nano /etc/systemd/system/arcadia-suite.service
```

```ini
[Unit]
Description=Arcadia Suite - Office Estratégico
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/arcadia
Environment=NODE_ENV=production
EnvironmentFile=/opt/arcadia/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 11.2 Criar serviço Python (IA/Fiscal)
```bash
sudo nano /etc/systemd/system/arcadia-python.service
```

```ini
[Unit]
Description=Arcadia Suite - Python Services
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/arcadia/python
Environment=PYTHONUNBUFFERED=1
EnvironmentFile=/opt/arcadia/.env
ExecStart=/opt/arcadia/venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 11.3 Ativar serviços
```bash
# Ajustar permissões
sudo chown -R www-data:www-data /opt/arcadia

# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar e iniciar serviços
sudo systemctl enable arcadia-suite
sudo systemctl enable arcadia-python
sudo systemctl start arcadia-suite
sudo systemctl start arcadia-python

# Verificar status
sudo systemctl status arcadia-suite
sudo systemctl status arcadia-python
```

---

## 12. Configurar Nginx (Proxy Reverso)

### 12.1 Instalar Nginx
```bash
sudo apt install -y nginx
```

### 12.2 Configurar Virtual Host
```bash
sudo nano /etc/nginx/sites-available/arcadia
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com.br;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com.br;

    # SSL (usar certbot para gerar)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Logs
    access_log /var/log/nginx/arcadia.access.log;
    error_log /var/log/nginx/arcadia.error.log;

    # Tamanho máximo de upload (para migrações)
    client_max_body_size 500M;

    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket para Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API Python (IA/Fiscal)
    location /api/python/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 12.3 Ativar configuração
```bash
sudo ln -s /etc/nginx/sites-available/arcadia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 13. Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com.br

# Renovação automática (já configurada)
sudo certbot renew --dry-run
```

---

## 14. Configurar Firewall

```bash
# Instalar UFW
sudo apt install -y ufw

# Configurar regras
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ativar firewall
sudo ufw enable
sudo ufw status
```

---

## 15. Backup Automático

### 15.1 Script de backup
```bash
sudo nano /opt/arcadia/scripts/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/arcadia"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -h localhost -U arcadia arcadia_suite | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup dos arquivos de upload
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /opt/arcadia/uploads

# Manter últimos 7 dias
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
```

### 15.2 Agendar no cron
```bash
chmod +x /opt/arcadia/scripts/backup.sh
sudo crontab -e

# Adicionar linha (backup às 3h da manhã)
0 3 * * * /opt/arcadia/scripts/backup.sh >> /var/log/arcadia-backup.log 2>&1
```

---

## 16. Monitoramento

### 16.1 Logs em tempo real
```bash
# Aplicação Node.js
sudo journalctl -u arcadia-suite -f

# Serviço Python
sudo journalctl -u arcadia-python -f

# Nginx
sudo tail -f /var/log/nginx/arcadia.access.log
sudo tail -f /var/log/nginx/arcadia.error.log
```

### 16.2 Verificar saúde
```bash
# Status dos serviços
sudo systemctl status arcadia-suite
sudo systemctl status arcadia-python
sudo systemctl status postgresql
sudo systemctl status nginx

# Uso de recursos
htop
df -h
free -m
```

---

## 17. Primeiro Acesso

1. Acesse: `https://seu-dominio.com.br`
2. Faça login com credenciais iniciais:
   - Email: `admin@arcadia.com.br`
   - Senha: `admin123` (altere imediatamente!)
3. Configure seu tenant/empresa
4. Configure integrações (ERPNext, WhatsApp, OpenAI)

---

## 18. Comandos Úteis

```bash
# Reiniciar aplicação
sudo systemctl restart arcadia-suite

# Ver logs
sudo journalctl -u arcadia-suite -n 100

# Atualizar código
cd /opt/arcadia
git pull origin main
npm install
npm run build
sudo systemctl restart arcadia-suite

# Executar migrações
npm run db:push

# Limpar cache
redis-cli FLUSHALL
```

---

## 19. Solução de Problemas

### Aplicação não inicia
```bash
# Verificar logs
sudo journalctl -u arcadia-suite -n 50

# Verificar permissões
ls -la /opt/arcadia

# Testar manualmente
cd /opt/arcadia
node dist/index.js
```

### Erro de conexão com banco
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
psql -h localhost -U arcadia -d arcadia_suite

# Verificar .env
cat /opt/arcadia/.env | grep DATABASE
```

### WebSocket não conecta
```bash
# Verificar configuração Nginx
sudo nginx -t

# Verificar porta
netstat -tlpn | grep 5000
```

---

## 20. Estrutura de Módulos Instalados

| Categoria | Módulos |
|-----------|---------|
| Inteligência | Agent, Scientist, Knowledge, Automações, MCP, A2A |
| Comunicação | XOS Inbox, Chat, Comunidades, XOS Central, NPS |
| Negócios | CRM, Compass, Produção, Suporte, Valuation, Fisco, Contábil, People, ERP, Financeiro, Retail, Plus, Marketplace |
| Analytics | Insights, Central APIs |
| Desenvolvimento | IDE, Canvas, API Hub, API Tester, DocType/Page Builder, Engineering |
| Educação | LMS |
| Operações | Field Ops, Quality ISO, Assistência Técnica, Suppliers |
| Administração | Admin, Home, Migration XOS, Super Admin |

**Total: 40+ módulos**

---

## Suporte

- Documentação: `/docs/`
- Email: suporte@arcadia.com.br
- API Docs: `https://seu-dominio.com.br/api-hub`

---

*Arcádia Suite - O Office Estratégico da Empresa Moderna*
