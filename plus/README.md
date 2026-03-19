<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

# Ambiente Laravel com Docker + Makefile

## Pré-requisitos

-   Docker
-   Docker Compose

## UID/GID (permissões)

Ajuste o usuário local no `docker-compose.yml`:

```
id -u   # UID
id -g   # GID
```

Atualize:

```yaml
args:
    UID: <seu-uid>
    GID: <seu-gid>
```

## Configuração do .env

Crie e valide:

```
cp .env.example .env
make check-env
```

## Comandos principais

### Containers

```
make up
make down
make restart
make logs
make build
```

### Setup inicial

```
make first-build
```

### Reset completo

```
make fresh-install
```

### Utilidades

```
make composer COMPOSER_CMD="update"
make npm NPM_CMD="run dev"
make artisan ARTISAN_CMD="config:cache"
make migrate
make rollback
make seed
make fresh
make bash
make dbbash
make perms
```

## Acesso

-   http://localhost:8000
-   Ou URL definida em `APP_URL`
