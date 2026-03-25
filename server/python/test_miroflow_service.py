"""Tests for miroflow_service.py -- REQ-3.1 to REQ-3.4"""
import sys
import os

MIROFLOW_MODULE_PATH = os.path.join(
    os.path.dirname(__file__), "../modules/miroflow"
)
sys.path.insert(0, os.path.abspath(MIROFLOW_MODULE_PATH))

import pytest
from httpx import AsyncClient, ASGITransport
from miroflow_service import app, make_agent_cfg, AnalyzeRequest, AnalyzeResponse

@pytest.mark.asyncio
async def test_health():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        resp = await c.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "miroflow"

def test_statistician_config():
    cfg = make_agent_cfg("statistician")
    llm = cfg["llm"]
    assert llm["model_name"] == "deepseek-r1:14b"
    assert llm["base_url"].endswith("/v1")

def test_fiscal_auditor_config():
    cfg = make_agent_cfg("fiscal_auditor")
    llm = cfg["llm"]
    assert llm["model_name"] == "deepseek-r1:14b"

def test_researcher_config():
    cfg = make_agent_cfg("researcher")
    llm = cfg["llm"]
    assert llm["model_name"] in ("llama3.1:8b", "llama3.2:3b")

@pytest.mark.asyncio
async def test_analyze_request_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        resp = await c.post("/analyze", json={"agent": "invalid", "task": "test"})
    assert resp.status_code == 422

def test_analyze_request_schema():
    req = AnalyzeRequest(agent="statistician", task="Analyze this", context={"k":"v"}, tenant_id=1)
    assert req.agent == "statistician"
    assert req.task == "Analyze this"
    assert req.tenant_id == 1
    resp = AnalyzeResponse(agent="statistician", model="deepseek-r1:14b", result="r", execution_id="abc", duration_ms=500)
    assert resp.agent == "statistician"
    assert resp.model == "deepseek-r1:14b"
    assert resp.duration_ms == 500
