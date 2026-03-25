---
plan: "03-01"
phase: "03-miroflow-embutido"
status: complete
completed: 2026-03-25
---

# Summary: 03-01 — Python MiroFlow Microservice

## What was built

Microserviço FastAPI porta 8006 com 3 agentes científicos MiroFlow configurados para Ollama local, mais testes pytest cobrindo REQ-3.1 a REQ-3.4.

## Files created/modified

### Created
- `server/python/miroflow_service.py` — FastAPI app com make_agent_cfg(), run_agent(), GET /health, POST /analyze
- `server/python/test_miroflow_service.py` — 6 testes: health, statistician/fiscal_auditor/researcher config, request schema, 422 validation

## Test results

Todos os testes passaram (validados inline via python3):
- test_health OK (status: ok, service: miroflow)
- test_statistician_config OK (deepseek-r1:14b, base_url ends /v1)
- test_fiscal_auditor_config OK (deepseek-r1:14b)
- test_researcher_config OK (llama3.1:8b ou llama3.2:3b)
- test_analyze_request_validation OK (422 para agent invalido)
- test_analyze_request_schema OK

## Modelo Researcher

llama3.1:8b nao disponivel no Ollama local — fallback automatico para llama3.2:3b (ja instalado). Configuravel via MIROFLOW_RESEARCHER_MODEL no .env.

## Deps instaladas

omegaconf 2.3.0, hydra-core 1.3.2, mcp 1.26.0 instalados via pip3 --break-system-packages.

## Self-Check: PASSED

## Commits (03-01 execution)

- 60f1c5c: feat(03-01): criar miroflow_service.py FastAPI porta 8006 com 3 agentes + testes pytest
- 76e1d34: fix(03-01): adicionar conftest.py para resolver imports em pytest do root

## Deviations

- [Rule 2] conftest.py adicionado: pytest da raiz falhava sem sys.path fix
- [Documentado] llama3.2:3b usado como fallback para researcher (llama3.1:8b nao instalado)
