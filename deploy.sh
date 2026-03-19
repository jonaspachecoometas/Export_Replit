#!/bin/bash
# ==============================================
# Arcádia Suite - Script de Deploy para VPS
# ==============================================

set -e

echo "=========================================="
echo "  Arcádia Suite - Deploy VPS"
echo "=========================================="

if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "Docker instalado! Faça logout e login novamente para aplicar as permissões."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Docker Compose não encontrado. Instalando..."
    sudo apt-get update && sudo apt-get install -y docker-compose-plugin
fi

if [ ! -f .env ]; then
    echo "Arquivo .env não encontrado. Criando a partir do .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANTE: Edite o arquivo .env com suas configurações antes de continuar!"
    echo "   nano .env"
    echo ""
    echo "Depois execute este script novamente."
    exit 1
fi

echo ""
echo "1/4 - Parando containers existentes..."
docker compose down 2>/dev/null || docker-compose down 2>/dev/null || true

echo ""
echo "2/5 - Construindo a aplicação..."
docker compose build --no-cache 2>/dev/null || docker-compose build --no-cache

echo ""
echo "3/5 - Iniciando o banco de dados..."
docker compose up -d db 2>/dev/null || docker-compose up -d db
echo "Aguardando banco ficar pronto..."
sleep 5

echo ""
echo "4/5 - Aplicando migrations do banco de dados..."
docker compose run --rm app npx drizzle-kit push 2>/dev/null || docker-compose run --rm app npx drizzle-kit push

echo ""
echo "5/5 - Iniciando a aplicação..."
docker compose up -d 2>/dev/null || docker-compose up -d
sleep 10

echo ""
echo "=========================================="
echo "  Deploy concluído!"
echo "=========================================="
echo ""
echo "  App:  http://$(hostname -I | awk '{print $1}'):5000"
echo "  DB:   PostgreSQL na porta 5432"
echo ""
echo "  Comandos úteis:"
echo "    Ver logs:     docker compose logs -f app"
echo "    Parar tudo:   docker compose down"
echo "    Reiniciar:    docker compose restart app"
echo "    Status:       docker compose ps"
echo ""
