-- Inicialização do PostgreSQL com extensão pgvector
-- Executado automaticamente pelo container na primeira inicialização

-- Habilitar extensão pgvector para busca por similaridade de embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Habilitar extensão pg_trgm para busca textual rápida
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Habilitar uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
