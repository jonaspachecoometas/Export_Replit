// Configuração PM2 para Arcádia Suite
// Uso: pm2 start ecosystem.config.js

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
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/arcadia-main-error.log',
      out_file: '/var/log/pm2/arcadia-main-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'arcadia-fisco',
      script: '/var/www/arcadia/venv/bin/python',
      args: '-m uvicorn server.fisco.main:app --host 0.0.0.0 --port 8002',
      cwd: '/var/www/arcadia',
      env: {
        PYTHONPATH: '/var/www/arcadia'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/arcadia-fisco-error.log',
      out_file: '/var/log/pm2/arcadia-fisco-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'arcadia-contabil',
      script: '/var/www/arcadia/venv/bin/python',
      args: '-m uvicorn server.contabil.main:app --host 0.0.0.0 --port 8003',
      cwd: '/var/www/arcadia',
      env: {
        PYTHONPATH: '/var/www/arcadia'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/arcadia-contabil-error.log',
      out_file: '/var/log/pm2/arcadia-contabil-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
