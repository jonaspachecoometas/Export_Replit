"""
Serviço de Embeddings com pgvector

Expõe endpoints compatíveis com o que o learning/service.ts espera:
  POST /embeddings/add    — adiciona documento com embedding
  POST /embeddings/search — busca por similaridade semântica
  GET  /health            — healthcheck

Usa pgvector (PostgreSQL) em vez de ChromaDB — sem dependência extra.
"""

import os
import json
import logging
from contextlib import asynccontextmanager
from typing import Optional

import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://arcadia:arcadia123@localhost:5432/arcadia")
PORT = int(os.getenv("SERVICE_PORT", "8001"))
EMBEDDING_DIM = 1536  # OpenAI text-embedding-3-small


# ─── Modelos Pydantic ──────────────────────────────────────────────────────────

class AddDocumentRequest(BaseModel):
    doc_id: str
    document: str
    metadata: Optional[dict] = {}

class SearchRequest(BaseModel):
    query: str
    n_results: int = 5
    filter_type: Optional[str] = None


# ─── Setup do banco ────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(DATABASE_URL)


def setup_database():
    """Cria a tabela de embeddings e instala pgvector se não existir."""
    try:
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS document_embeddings (
                id          SERIAL PRIMARY KEY,
                doc_id      TEXT NOT NULL UNIQUE,
                document    TEXT NOT NULL,
                metadata    JSONB DEFAULT '{}',
                embedding   vector(1536),
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_embeddings_vector
            ON document_embeddings
            USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """)
        conn.commit()
        cur.close()
        conn.close()
        logger.info("✅ Tabela document_embeddings pronta com pgvector")
    except Exception as e:
        logger.error(f"Erro no setup do banco: {e}")


# ─── Embedding via LiteLLM/OpenAI ─────────────────────────────────────────────

def generate_embedding(text: str) -> Optional[list]:
    """
    Gera embedding via LiteLLM proxy (que pode usar OpenAI ou Ollama).
    Retorna None se falhar — documentos sem embedding ainda são indexados (busca textual).
    """
    litellm_url = os.getenv("LITELLM_BASE_URL", "http://litellm:4000")
    api_key = os.getenv("LITELLM_API_KEY", "arcadia-internal")

    try:
        import urllib.request
        import urllib.error

        payload = json.dumps({
            "model": "text-embedding-3-small",
            "input": text[:8000]  # limite de tokens
        }).encode()

        req = urllib.request.Request(
            f"{litellm_url}/v1/embeddings",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            }
        )

        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read())
            return result["data"][0]["embedding"]

    except Exception as e:
        logger.warning(f"Embedding não gerado (usando busca textual como fallback): {e}")
        return None


# ─── App FastAPI ───────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_database()
    yield

app = FastAPI(
    title="Arcádia Embeddings Service",
    description="Serviço de embeddings com pgvector para busca semântica",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("APP_URL", "http://localhost:5000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "embeddings"}


@app.post("/embeddings/add")
def add_document(req: AddDocumentRequest):
    """Adiciona ou atualiza um documento com embedding."""
    embedding = generate_embedding(req.document)

    try:
        conn = get_conn()
        cur = conn.cursor()

        if embedding:
            cur.execute("""
                INSERT INTO document_embeddings (doc_id, document, metadata, embedding, updated_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (doc_id) DO UPDATE SET
                    document   = EXCLUDED.document,
                    metadata   = EXCLUDED.metadata,
                    embedding  = EXCLUDED.embedding,
                    updated_at = CURRENT_TIMESTAMP
            """, (req.doc_id, req.document, json.dumps(req.metadata), str(embedding)))
        else:
            cur.execute("""
                INSERT INTO document_embeddings (doc_id, document, metadata, updated_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (doc_id) DO UPDATE SET
                    document   = EXCLUDED.document,
                    metadata   = EXCLUDED.metadata,
                    updated_at = CURRENT_TIMESTAMP
            """, (req.doc_id, req.document, json.dumps(req.metadata)))

        conn.commit()
        cur.close()
        conn.close()

        return {
            "success": True,
            "doc_id": req.doc_id,
            "has_embedding": embedding is not None
        }

    except Exception as e:
        logger.error(f"Erro ao adicionar documento: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/embeddings/search")
def search_documents(req: SearchRequest):
    """Busca documentos similares por embedding ou texto."""
    query_embedding = generate_embedding(req.query)

    try:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        if query_embedding:
            # Busca vetorial por similaridade coseno
            cur.execute("""
                SELECT
                    doc_id,
                    document,
                    metadata,
                    1 - (embedding <=> %s::vector) AS similarity
                FROM document_embeddings
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """, (str(query_embedding), str(query_embedding), req.n_results))
        else:
            # Fallback: full-text search com LIKE
            cur.execute("""
                SELECT
                    doc_id,
                    document,
                    metadata,
                    0.5 AS similarity
                FROM document_embeddings
                WHERE document ILIKE %s
                ORDER BY updated_at DESC
                LIMIT %s
            """, (f"%{req.query}%", req.n_results))

        rows = cur.fetchall()
        cur.close()
        conn.close()

        return {
            "results": [dict(r) for r in rows],
            "query": req.query,
            "method": "vector" if query_embedding else "text_fallback"
        }

    except Exception as e:
        logger.error(f"Erro na busca: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/documents/add")
def add_document_compat(req: AddDocumentRequest):
    """Alias compatível com o formato do python-service/."""
    return add_document(req)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)

