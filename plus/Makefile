# ---------------------------------------
# Controle do ambiente Docker - Laravel + Vite + MySQL
# ---------------------------------------

COMPOSE     = docker compose
APP_SERVICE = app
DB_SERVICE  = db

DB_WAIT_RETRIES ?= 30
DB_WAIT_SECONDS ?= 2

REQUIRED_ENV = \
	APP_ENV \
	APP_URL \
    APP_KEY \
	DB_CONNECTION \
	DB_HOST \
	DB_PORT \
	DB_DATABASE \
	DB_USERNAME \
	DB_PASSWORD

.PHONY: setup up dev \
	check-env wait-db \
	perms docker-up docker-up-build docker-down docker-down-volumes \
	composer-install npm-install assets-build \
	key migrate-seed

# ---------------------------
# Setup completo (instalação inicial)
# ---------------------------
setup: check-env docker-up-build perms composer-install npm-install wait-db key migrate-seed assets-build docker-down
	@echo "✅ Setup completo (containers parados)."

# ---------------------------
# Subir ambiente normal (sem Vite)
# ---------------------------
up: check-env docker-up
	@echo "✅ Containers ativos:"
	@echo "   Backend: http://localhost:8000"

# ---------------------------
# Subir ambiente dev (com Vite)
# ---------------------------
dev: check-env docker-up
	$(COMPOSE) exec -d $(APP_SERVICE) npm run dev -- --host 0.0.0.0 --port 5173
	@echo "✅ Ambiente DEV iniciado:"
	@echo "   Backend: http://localhost:8000"
	@echo "   Vite:    http://localhost:5173"

# ---------------------------
# Remove tudo relacionado ao projeto e reconstrói do zero
# ---------------------------
rebuild-force:
	@echo "🧨 Removendo containers, volumes, redes e imagens relacionadas..."
	$(COMPOSE) down -v --rmi all --remove-orphans
	@echo "🧨 Removendo imagens órfãs..."
	docker image prune -f
	docker volume prune -f
	@echo "🔨 Reconstruindo tudo do zero..."
	$(MAKE) setup
# ---------------------------
# Helpers internos
# ---------------------------
check-env:
	@echo "Verificando .env..."
	@if [ ! -f .env ]; then \
		echo "ERRO: .env não encontrado."; \
		exit 1; \
	fi; \
	missing=""; \
	for var in $(REQUIRED_ENV); do \
		if ! grep -q "^$$var=" .env; then \
			if [ "$$var" = "APP_KEY" ]; then \
				echo "ERRO: APP_KEY deve existir no .env (pode estar vazia: APP_KEY=, ou conter uma chave válida)."; \
			fi; \
			missing="$$missing $$var"; \
		fi; \
	done; \
	if [ -n "$$missing" ]; then \
		echo "ERRO: variáveis faltando no .env:"; \
		echo "  $$missing"; \
		exit 1; \
	fi; \
	echo ".env OK."


# Espera real pelo MySQL
wait-db:
	@echo "Aguardando MySQL..."
	@$(COMPOSE) exec -T $(DB_SERVICE) sh -c '\
		c=0; \
		while ! mysqladmin ping -h127.0.0.1 --silent 2>/dev/null; do \
			c=$$((c+1)); \
			if [ $$c -ge $(DB_WAIT_RETRIES) ]; then \
				echo "ERRO: MySQL não respondeu."; \
				exit 1; \
			fi; \
			echo "   aguardando... (tentativa $$c)"; \
			sleep $(DB_WAIT_SECONDS); \
		done; \
		echo "✅ MySQL está pronto."; \
	'

perms:
	$(COMPOSE) exec -T $(APP_SERVICE) sh -c "\
		mkdir -p storage/logs bootstrap/cache && \
		chown -R www-data:www-data storage bootstrap/cache && \
		chmod -R 775 storage bootstrap/cache \
	"

docker-up-build:
	$(COMPOSE) up -d --build

docker-up:
	$(COMPOSE) up -d

docker-down:
	$(COMPOSE) down

docker-down-volumes:
	$(COMPOSE) down -v

composer-install:
	$(COMPOSE) exec -T $(APP_SERVICE) composer install --no-interaction --prefer-dist

npm-install:
	$(COMPOSE) exec -T $(APP_SERVICE) npm install

assets-build:
	$(COMPOSE) exec -T $(APP_SERVICE) npm run build

key:
	$(COMPOSE) exec -T $(APP_SERVICE) php artisan key:generate || true

migrate-seed:
	$(COMPOSE) exec -T $(APP_SERVICE) php artisan migrate --seed
