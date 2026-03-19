from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import subprocess
import sys
import tempfile
import os

app = FastAPI(title="Arcádia Python Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PythonExecuteRequest(BaseModel):
    code: str
    timeout: Optional[int] = 30

class PythonExecuteResponse(BaseModel):
    success: bool
    output: Optional[str] = None
    error: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    n_results: Optional[int] = 5

class AddDocumentRequest(BaseModel):
    doc_id: str
    document: str
    metadata: Optional[Dict[str, Any]] = {}

class AnalyzeDataRequest(BaseModel):
    data: List[Dict[str, Any]]

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "arcadia-python"}

@app.post("/execute", response_model=PythonExecuteResponse)
def execute_python(request: PythonExecuteRequest):
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(request.code)
            temp_file = f.name
        
        try:
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=request.timeout,
                cwd=tempfile.gettempdir()
            )
            
            if result.returncode == 0:
                return PythonExecuteResponse(
                    success=True,
                    output=result.stdout
                )
            else:
                return PythonExecuteResponse(
                    success=False,
                    error=result.stderr
                )
                
        except subprocess.TimeoutExpired:
            return PythonExecuteResponse(
                success=False,
                error="Execução do código excedeu o tempo limite."
            )
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def semantic_search(request: SearchRequest):
    try:
        from services.embeddings import search_documents
        results = search_documents(request.query, request.n_results)
        return {"success": True, "results": results}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/documents/add")
async def add_document(request: AddDocumentRequest):
    try:
        from services.embeddings import add_document
        add_document(request.doc_id, request.document, request.metadata)
        return {"success": True, "message": "Documento adicionado com sucesso"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/embeddings/add")
async def embeddings_add(request: AddDocumentRequest):
    try:
        from services.embeddings import add_document
        add_document(request.doc_id, request.document, request.metadata or {})
        return {"success": True, "doc_id": request.doc_id}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/embeddings/search")
async def embeddings_search(request: SearchRequest):
    try:
        from services.embeddings import search_documents
        results = search_documents(request.query, request.n_results or 5)
        return results
    except Exception as e:
        return {"error": str(e), "documents": [], "metadatas": []}

@app.post("/analyze")
async def analyze_data(request: AnalyzeDataRequest):
    try:
        from services.cientista import analyze_data
        result = analyze_data(request.data)
        return {"success": True, "analysis": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

class DetectOpportunitiesRequest(BaseModel):
    domain: str
    min_confidence: Optional[float] = 0.7

@app.post("/detect_opportunities")
async def detect_opportunities(request: DetectOpportunitiesRequest):
    try:
        from services.embeddings import search_documents
        
        domain_queries = {
            'vendas': 'oportunidades vendas clientes conversão receita',
            'produto': 'melhorias produto features funcionalidades desenvolvimento',
            'suporte': 'problemas suporte reclamações tickets chamados',
            'clientes': 'satisfação clientes feedback retenção churn',
            'financeiro': 'custos receitas margem lucro despesas',
            'operacional': 'eficiência processos automação produtividade'
        }
        
        query = domain_queries.get(request.domain, request.domain)
        results = search_documents(query, 10)
        
        opportunities = []
        if results and 'documents' in results and results['documents']:
            docs = results['documents'][0] if results['documents'] else []
            metadatas = results['metadatas'][0] if results.get('metadatas') else []
            
            for i, doc in enumerate(docs[:5]):
                metadata = metadatas[i] if i < len(metadatas) else {}
                confidence = 0.9 - (i * 0.05)
                
                if confidence >= request.min_confidence:
                    opportunities.append({
                        'name': f"Oportunidade {i+1}: {metadata.get('title', 'Análise de ' + request.domain)}",
                        'description': doc[:200] + '...' if len(doc) > 200 else doc,
                        'confidence': confidence,
                        'source': metadata.get('url', 'knowledge_graph'),
                        'domain': request.domain
                    })
        
        return {"success": True, "opportunities": opportunities, "domain": request.domain}
    except Exception as e:
        return {"success": True, "opportunities": [], "domain": request.domain, "note": f"Busca limitada: {str(e)}"}

@app.post("/workflow/run")
async def run_workflow_endpoint(request: dict):
    try:
        from services.workflow import run_workflow
        spec = request.get("spec")
        data = request.get("data", {})
        result = run_workflow(spec, data)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/workflow/validate")
async def validate_workflow_endpoint(request: dict):
    try:
        from services.workflow import validate_workflow
        spec = request.get("spec")
        result = validate_workflow(spec)
        return {"success": True, "validation": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/workflow/templates/{workflow_type}")
async def get_workflow_template(workflow_type: str):
    try:
        from services.workflow import create_workflow_template
        template = create_workflow_template(workflow_type)
        return {"success": True, "template": template}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/rpa/execute")
async def execute_rpa(request: dict):
    try:
        from services.rpa import execute_rpa_script
        script = request.get("script", {})
        result = await execute_rpa_script(script)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/rpa/record")
async def record_rpa(request: dict):
    try:
        from services.rpa import start_recording
        target_url = request.get("url", "")
        result = await start_recording(target_url)
        return {"success": True, "recording": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/scientist/generate-code")
async def generate_code(request: dict):
    try:
        from services.cientista import get_scientist
        scientist = get_scientist()
        data_description = request.get("data_description", "")
        goal = request.get("goal", "")
        result = scientist.generate_analysis_code(data_description, goal)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/scientist/generate-automation")
async def generate_automation(request: dict):
    try:
        from services.cientista import get_scientist
        scientist = get_scientist()
        task = request.get("task", "")
        result = scientist.generate_automation_code(task)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/scientist/suggest-improvements")
async def suggest_improvements(request: dict):
    try:
        from services.cientista import get_scientist
        scientist = get_scientist()
        data = request.get("data", [])
        suggestions = scientist.suggest_improvements(data)
        return {"success": True, "suggestions": suggestions}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/scientist/learn")
async def learn_from_execution(request: dict):
    try:
        from services.cientista import get_scientist
        scientist = get_scientist()
        task = request.get("task", "")
        code = request.get("code", "")
        result = request.get("result")
        success = request.get("success", True)
        execution = scientist.learn_from_execution(task, code, result, success)
        return {"success": True, "execution": execution}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/scientist/status")
async def scientist_status():
    try:
        from services.cientista import get_scientist
        scientist = get_scientist()
        status = scientist.get_status()
        return {"success": True, "status": status}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/scientist/patterns")
async def detect_patterns_endpoint(request: dict):
    try:
        from services.cientista import detect_patterns
        data = request.get("data", [])
        patterns = detect_patterns(data)
        return {"success": True, "patterns": patterns}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/scientist/insights")
async def generate_insights_endpoint(request: dict):
    try:
        from services.cientista import generate_insights
        data = request.get("data", [])
        insights = generate_insights(data)
        return {"success": True, "insights": insights}
    except Exception as e:
        return {"success": False, "error": str(e)}

class CaptureRequest(BaseModel):
    url: str
    wait_time: Optional[int] = 3000
    extract_requirements: Optional[bool] = False
    context: Optional[str] = ""

@app.post("/capture/url")
async def capture_url_endpoint(request: CaptureRequest):
    try:
        from services.capture import capture_url, extract_requirements
        
        capture_result = await capture_url(request.url, request.wait_time)
        
        if not capture_result.get("success"):
            return capture_result
        
        if request.extract_requirements and capture_result.get("text_content"):
            extraction = await extract_requirements(
                capture_result["text_content"],
                request.context
            )
            capture_result["extraction"] = extraction.get("extraction") if extraction.get("success") else None
            capture_result["extraction_error"] = extraction.get("error")
        
        return capture_result
        
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/capture/extract")
async def extract_from_text(request: dict):
    try:
        from services.capture import extract_requirements
        
        text = request.get("text", "")
        context = request.get("context", "")
        
        result = await extract_requirements(text, context)
        return result
        
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
