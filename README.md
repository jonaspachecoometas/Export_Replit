# Arcádia Suite

O Escritório Estratégico para a Empresa Moderna.

Plataforma que centraliza produtividade, inteligência, tomada de decisão e governança, orquestrando ERPs, pessoas e dados.

## Arquitetura

- **Frontend:** React 18 + TypeScript + Tailwind CSS + shadcn/ui (66 páginas)
- **Backend:** Express.js + Socket.IO (38 grupos de rotas API)
- **Inteligência:** OpenAI GPT-4o + 6 Agentes Autônomos (Dev Center XOS)
- **Motores:** Fiscal (8002), Contábil (8003), BI (8004), Automação (8005), Comunicação (8006)
- **ERP Plus:** Laravel/PHP (8080) com NF-e/NFC-e/CT-e/MDF-e
- **Banco:** PostgreSQL 16 + Drizzle ORM + ChromaDB

## Módulos Principais

- SOE (Sistema Operacional Empresarial)
- Financeiro, Contábil, Fiscal
- CRM + WhatsApp Multi-sessão
- Varejo (Celulares + Assistência Técnica)
- Business Intelligence
- Dev Center com Pipeline Autônomo
- Casa de Máquinas (Engine Room)
- Governança XOS
- Knowledge Graph + IA

## Quick Start

```bash
npm install
cp .env.example .env  # Configure DATABASE_URL, OPENAI_API_KEY
npx drizzle-kit push
npm run dev
```

**Login padrão:** admin / admin

## Documentação

- [Mapa Geral do Sistema](MAPA_SISTEMA_ARCADIA.md)
- [Relatório Técnico Retail](RELATORIO_TECNICO_RETAIL.md)
- [Mapa Retail](MAPA_GERAL_RETAIL.md)

## Licença

Proprietário - Arcádia Suite
