"""
Arcádia MiroFlow Service — Agentes científicos via MiroFlow + Ollama local
FastAPI microserviço porta 8006
"""
import os
import sys
import time
import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Adicionar o submodule MiroFlow ao path
MIROFLOW_MODULE_PATH = os.path.join(
    os.path.dirname(__file__), "..", "modules", "miroflow"
)
sys.path.insert(0, os.path.abspath(MIROFLOW_MODULE_PATH))

from miroflow.agents.factory import build_agent
from miroflow.agents.context import AgentContext

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
RESEARCHER_MODEL = os.getenv("MIROFLOW_RESEARCHER_MODEL", "llama3.1:8b")

AGENT_MODELS = {
    "statistician": "deepseek-r1:14b",
    "fiscal_auditor": "deepseek-r1:14b",
    "researcher": RESEARCHER_MODEL,
}


def make_agent_cfg(agent_type: str) -> dict:
    model = AGENT_MODELS.get(agent_type, "deepseek-r1:14b")
    return {
        "type": "IterativeAgentWithToolAndRollback",
        "name": f"arcadia_{agent_type}",
        "max_turns": 10,
        "llm": {
            "provider_class": "UnifiedOpenAIClient",
            "model_name": model,
            "api_key": "ollama",
            "base_url": f"{OLLAMA_BASE_URL}/v1",
            "max_tokens": 8192,
            "temperature": 0.7,
            "top_p": 1.0,
            "min_p": 0.0,
            "top_k": -1,
            "reasoning_effort": None,
            "repetition_penalty": 1.0,
            "max_context_length": -1,
            "async_client": True,
            "disable_cache_control": True,
            "keep_tool_result": -1,
            "use_tool_calls": False,
            "oai_tool_thinking": False,
        },
    }


async def run_agent(agent_type: str, task: str) -> tuple[str, str]:
    """Retorna (result_text, model_name)"""
    if agent_type not in AGENT_MODELS:
        raise ValueError(f"Agente desconhecido: {agent_type}. Use: {list(AGENT_MODELS.keys())}")
    cfg = make_agent_cfg(agent_type)
    agent = build_agent(cfg)
    ctx = AgentContext(
        task_description=task,
        system_prompt=(
            "Você é um agente científico da Arcádia Suite especializado em análise de dados "
            "empresariais. Responda em português de forma clara e objetiva. "
            "Quando precisar de dados, explique o que analisaria e quais conclusões seriam esperadas."
        ),
        initial_user_message=task,
    )
    result = await agent.run(ctx)
    text = result.get("summary", str(result)) if isinstance(result, dict) else str(result)
    return text, cfg["llm"]["model_name"]


app = FastAPI(title="Arcádia MiroFlow Service", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    agent: str
    task: str
    context: dict = {}
    tenant_id: Optional[int] = None


class AnalyzeResponse(BaseModel):
    agent: str
    model: str
    result: str
    execution_id: str
    duration_ms: int


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "miroflow", "agents": list(AGENT_MODELS.keys())}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    if req.agent not in AGENT_MODELS:
        raise HTTPException(status_code=422, detail=f"Agente inválido: {req.agent}")
    start = time.time()
    try:
        result_text, model_name = await run_agent(req.agent, req.task)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return AnalyzeResponse(
        agent=req.agent,
        model=model_name,
        result=result_text,
        execution_id=str(uuid.uuid4()),
        duration_ms=int((time.time() - start) * 1000),
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("MIROFLOW_PORT", 8006))
    uvicorn.run(app, host="0.0.0.0", port=port)
