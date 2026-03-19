# Guia de Deploy - Arcádia Suite em VPS

Este guia explica como fazer o deploy do Arcádia Suite em um servidor VPS (Ubuntu 22.04).

---

## Requisitos Mínimos do Servidor

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| RAM | 4 GB | 8 GB |
| CPU | 2 cores | 4 cores |
| Armazenamento | 40 GB SSD | 80 GB SSD |
| Sistema | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

---

## 1. Preparação do Servidor

### 1.1 Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalar dependências básicas
```bash
sudo apt install -y curl wget git build-essential software-properties-common
```

---

## 2. Instalar Node.js 20

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

---

## 3. Instalar Python 3.11

```bash
# Adicionar repositório
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update

# Instalar Python 3.11
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Definir como padrão (opcional)
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

# Verificar instalação
python3.11 --version
```

---

## 4. Instalar e Configurar PostgreSQL

### 4.1 Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### 4.2 Criar banco de dados e usuário
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Executar os comandos SQL:
CREATE USER arcadia WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE arcadia_suite OWNER arcadia;
GRANT ALL PRIVILEGES ON DATABASE arcadia_suite TO arcadia;
\q
```

### 4.3 Configurar acesso (se necessário)
```bash
# Editar pg_hba.conf para permitir conexões locais
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Adicionar linha:
# local   arcadia_suite   arcadia                                 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

---

## 5. Instalar Nginx

```bash
sudo apt install -y nginx

# Habilitar na inicialização
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 6. Instalar PM2 (Gerenciador de Processos)

```bash
sudo npm install -g pm2

# Configurar para iniciar automaticamente
pm2 startup systemd
```

---

## 7. Clonar e Configurar o Projeto

### 7.1 Criar diretório e clonar
```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/arcadia
sudo chown $USER:$USER /var/www/arcadia

# Clonar o repositório (substitua pela URL do seu repo)
cd /var/www/arcadia
git clone https://github.com/seu-usuario/arcadia-suite.git .
```

### 7.2 Instalar dependências Node.js
```bash
npm install
```

### 7.3 Configurar ambiente Python
```bash
# Criar ambiente virtual
python3.11 -m venv venv

# Ativar ambiente
source venv/bin/activate

# Instalar dependências Python
pip install fastapi uvicorn nfelib lxml signxml python-dotenv psycopg2-binary

# Desativar ambiente
deactivate
```

---

## 8. Configurar Variáveis de Ambiente

### 8.1 Criar arquivo .env
```bash
nano /var/www/arcadia/.env
```

### 8.2 Adicionar variáveis
```env
# Banco de Dados
DATABASE_URL=postgresql://arcadia:sua_senha_segura@localhost:5432/arcadia_suite
PGHOST=localhost
PGPORT=5432
PGUSER=arcadia
PGPASSWORD=sua_senha_segura
PGDATABASE=arcadia_suite

# Ambiente
NODE_ENV=production

# ERPNext (se usar)
ERPNEXT_URL=https://seu-erpnext.com
ERPNEXT_API_KEY=sua_api_key
ERPNEXT_API_SECRET=seu_api_secret

# OpenAI (se usar IA)
OPENAI_API_KEY=sua_chave_openai

# Sessão
SESSION_SECRET=gere_uma_chave_aleatoria_longa_aqui
```

---

## 9. Build da Aplicação

```bash
cd /var/www/arcadia

# Build do frontend
npm run build

# Executar migrações do banco
npm run db:push
```

---

## 10. Configurar PM2

### 10.1 Criar arquivo de configuração
```bash
nano /var/www/arcadia/ecosystem.config.js
```

### 10.2 Conteúdo do arquivo
```javascript
module.exports = {
  apps: [
    {
      name: 'arcadia-main',
      script: 'npm',
      args: 'run start',
      cwd: '/var/www/arcadia',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'arcadia-fisco',
      script: '/var/www/arcadia/venv/bin/python',
      args: '-m uvicorn server.fisco.main:app --host 0.0.0.0 --port 8002',
      cwd: '/var/www/arcadia',
      autorestart: true,
      watch: false
    },
    {
      name: 'arcadia-contabil',
      script: '/var/www/arcadia/venv/bin/python',
      args: '-m uvicorn server.contabil.main:app --host 0.0.0.0 --port 8003',
      cwd: '/var/www/arcadia',
      autorestart: true,
      watch: false
    }
  ]
};
```

### 10.3 Iniciar aplicações
```bash
cd /var/www/arcadia
pm2 start ecosystem.config.js
pm2 save
```

---

## 11. Configurar Nginx

### 11.1 Criar configuração do site
```bash
sudo nano /etc/nginx/sites-available/arcadia
```

### 11.2 Conteúdo da configuração
```nginx
server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket para Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # APIs FastAPI
    location /api/fisco/ {
        proxy_pass http://localhost:8002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/contabil/ {
        proxy_pass http://localhost:8003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 11.3 Ativar site
```bash
sudo ln -s /etc/nginx/sites-available/arcadia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 12. Instalar Certificado SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com.br -d www.seu-dominio.com.br

# Renovação automática (já configurado por padrão)
sudo certbot renew --dry-run
```

---

## 13. Firewall (UFW)

```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow OpenSSH

# Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'

# Verificar status
sudo ufw status
```

---

## 14. Comandos Úteis

### Gerenciamento PM2
```bash
# Ver status das aplicações
pm2 status

# Ver logs
pm2 logs arcadia-main
pm2 logs --lines 100

# Reiniciar aplicação
pm2 restart arcadia-main

# Reiniciar todas
pm2 restart all

# Parar aplicação
pm2 stop arcadia-main
```

### Atualizar Aplicação
```bash
cd /var/www/arcadia

# Puxar atualizações
git pull

# Instalar novas dependências
npm install

# Rebuild
npm run build

# Reiniciar
pm2 restart all
```

### Backup do Banco de Dados
```bash
# Backup
pg_dump -U arcadia arcadia_suite > backup_$(date +%Y%m%d).sql

# Restaurar
psql -U arcadia arcadia_suite < backup_arquivo.sql
```

---

## 15. Checklist Final

- [ ] PostgreSQL rodando e acessível
- [ ] Variáveis de ambiente configuradas (.env)
- [ ] Build do frontend concluído
- [ ] Migrações do banco executadas
- [ ] PM2 iniciado com todas as aplicações
- [ ] Nginx configurado e rodando
- [ ] Certificado SSL instalado
- [ ] Firewall configurado
- [ ] Domínio apontando para o servidor

---

## Suporte

Em caso de problemas:

1. Verifique os logs: `pm2 logs`
2. Verifique o Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Verifique o PostgreSQL: `sudo journalctl -u postgresql`

---

*Guia criado para Arcádia Suite - Business Operating System*
