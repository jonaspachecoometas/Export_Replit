import os
from typing import Dict, Any, List, Optional

CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

_client = None
_collection = None

def get_collection():
    global _client, _collection
    
    if _collection is not None:
        return _collection
    
    try:
        import chromadb
        from chromadb.utils import embedding_functions
        
        if OPENAI_API_KEY:
            openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=OPENAI_API_KEY,
                model_name="text-embedding-ada-002"
            )
        else:
            openai_ef = embedding_functions.DefaultEmbeddingFunction()
        
        _client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
        
        _collection = _client.get_or_create_collection(
            name="arcadia_graph",
            embedding_function=openai_ef,
            metadata={"hnsw:space": "cosine"}
        )
        
        return _collection
    except Exception as e:
        print(f"Erro ao conectar ao ChromaDB: {e}")
        return None

def add_document(doc_id: str, document: str, metadata: Dict[str, Any] = {}):
    collection = get_collection()
    if collection is None:
        raise Exception("ChromaDB não disponível")
    
    collection.add(
        documents=[document],
        metadatas=[metadata],
        ids=[doc_id]
    )

def search_documents(query: str, n_results: int = 5) -> Dict[str, Any]:
    collection = get_collection()
    if collection is None:
        raise Exception("ChromaDB não disponível")
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    return results

def update_document(doc_id: str, document: str, metadata: Dict[str, Any] = {}):
    collection = get_collection()
    if collection is None:
        raise Exception("ChromaDB não disponível")
    
    collection.update(
        ids=[doc_id],
        documents=[document],
        metadatas=[metadata]
    )

def delete_document(doc_id: str):
    collection = get_collection()
    if collection is None:
        raise Exception("ChromaDB não disponível")
    
    collection.delete(ids=[doc_id])
