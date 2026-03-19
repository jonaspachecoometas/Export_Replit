import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from 'docx';
import * as fs from 'fs';

async function generateDocumentation() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Título Principal
        new Paragraph({
          children: [new TextRun({ text: "ARCÁDIA SUITE", bold: true, size: 56 })],
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: "Sistema Operacional de Negócios com Inteligência Artificial", size: 28, italics: true })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: "Documentação Técnica Completa", size: 24 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: `Versão 1.0 - ${new Date().toLocaleDateString('pt-BR')}`, size: 20 })],
          alignment: AlignmentType.CENTER,
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // Sumário
        new Paragraph({
          children: [new TextRun({ text: "SUMÁRIO", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "1. Visão Geral do Sistema" })] }),
        new Paragraph({ children: [new TextRun({ text: "2. Arquitetura Técnica" })] }),
        new Paragraph({ children: [new TextRun({ text: "3. Camadas do Sistema" })] }),
        new Paragraph({ children: [new TextRun({ text: "4. Módulos Principais" })] }),
        new Paragraph({ children: [new TextRun({ text: "5. Manus Agent - Agente Autônomo" })] }),
        new Paragraph({ children: [new TextRun({ text: "6. Módulo Cientista - Auto-Programação" })] }),
        new Paragraph({ children: [new TextRun({ text: "7. Motor de Workflow BPMN" })] }),
        new Paragraph({ children: [new TextRun({ text: "8. Automação RPA" })] }),
        new Paragraph({ children: [new TextRun({ text: "9. IDE Integrada" })] }),
        new Paragraph({ children: [new TextRun({ text: "10. Grafo de Conhecimento" })] }),
        new Paragraph({ children: [new TextRun({ text: "11. Regras de Segurança" })] }),
        new Paragraph({ children: [new TextRun({ text: "12. Variáveis de Ambiente" })] }),
        new Paragraph({ children: [new TextRun({ text: "13. APIs e Endpoints" })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 1. Visão Geral
        new Paragraph({
          children: [new TextRun({ text: "1. VISÃO GERAL DO SISTEMA", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O Arcádia Suite é um Sistema Operacional de Negócios (Business Operating System) potencializado por Inteligência Artificial. Ele transforma operações empresariais através de cinco pilares fundamentais:",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Grafo de Conhecimento: ", bold: true, size: 24 }),
            new TextRun({ text: "Todos os dados do negócio conectados e pesquisáveis", size: 24 })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Inteligência Central (Módulo Cientista): ", bold: true, size: 24 }),
            new TextRun({ text: "IA que aprende e auto-programa soluções", size: 24 })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Agente Autônomo (Manus): ", bold: true, size: 24 }),
            new TextRun({ text: "Executa tarefas, gera código, automatiza processos", size: 24 })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• Comunicação Unificada: ", bold: true, size: 24 }),
            new TextRun({ text: "WhatsApp e Email integrados com mensagens multicanal", size: 24 })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "• IDE Completa: ", bold: true, size: 24 }),
            new TextRun({ text: "Ambiente de desenvolvimento Node.js + Python com 4 modos de criação", size: 24 })
          ]
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 2. Arquitetura Técnica
        new Paragraph({
          children: [new TextRun({ text: "2. ARQUITETURA TÉCNICA", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "2.1 Arquitetura Híbrida em 4 Camadas", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        // Tabela de Camadas
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Camada", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tecnologia", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Responsabilidade", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Apresentação" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "React 18 + TypeScript" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Interface do usuário tipo navegador" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Orquestração" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Manus Agent (Node.js)" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Coordena todas as operações" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Inteligência" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Python (FastAPI)" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Cientista, RPA, Embeddings" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dados" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PostgreSQL + ChromaDB" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Persistência e busca semântica" })] })] }),
              ],
            }),
          ],
        }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "2.2 Stack Tecnológico", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Frontend:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "• React 18 com TypeScript", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Wouter para roteamento", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• TanStack React Query para estado", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Tailwind CSS v4 + shadcn/ui", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Monaco Editor (mesmo do VS Code)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Xterm.js para terminal integrado", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Vite como bundler", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Backend Node.js:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "• Express.js com TypeScript", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Porta: 5000", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Passport.js para autenticação", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Drizzle ORM para banco de dados", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Scrypt para hash de senhas", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Serviço Python:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "• FastAPI", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Porta: 8001", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Playwright para RPA", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Pandas/NumPy para análise", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Scikit-learn para ML", size: 24 })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 3. Camadas do Sistema
        new Paragraph({
          children: [new TextRun({ text: "3. CAMADAS DO SISTEMA", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "3.1 Camada de Apresentação", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [new TextRun({ 
            text: "Interface web moderna com simulação de navegador (browser chrome). Inclui sistema de abas, barra de endereço (omnibox), e painéis de trabalho.",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Estrutura de Arquivos:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "client/src/", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "├── pages/           # Páginas da aplicação", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "├── components/      # Componentes reutilizáveis", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "├── modules/         # Módulos de negócio", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "│   ├── ide/         # IDE Integrada", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "│   └── manus/       # Interface Manus Agent", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "├── hooks/           # Hooks customizados", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "└── lib/             # Utilitários", size: 22, font: "Courier New" })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "3.2 Camada de Orquestração (Manus Agent)", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O Manus Agent é o cérebro do sistema. Utiliza um loop de Pensamento-Ação-Observação para executar tarefas complexas de forma autônoma.",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Localização:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "server/manus/", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "├── service.ts       # Serviço principal", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "└── tools.ts         # 20+ ferramentas disponíveis", size: 22, font: "Courier New" })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "3.3 Camada de Inteligência (Python)", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [new TextRun({ 
            text: "Serviços especializados em Python para tarefas que requerem processamento avançado:",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "python-service/", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "├── main.py          # Servidor FastAPI", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "└── services/", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "    ├── executor.py  # Execução segura de código", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "    ├── embeddings.py # Busca semântica ChromaDB", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "    ├── cientista.py # Auto-programação", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "    ├── workflow.py  # Motor BPMN", size: 22, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "    └── rpa.py       # Automação Playwright", size: 22, font: "Courier New" })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "3.4 Camada de Dados", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          children: [new TextRun({ text: "PostgreSQL:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "• Banco principal via Drizzle ORM", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Schema em shared/schema.ts", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Migrações via Drizzle Kit", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "ChromaDB:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "• Armazenamento vetorial para embeddings", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Busca por similaridade semântica", size: 24 })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 4. Módulos Principais
        new Paragraph({
          children: [new TextRun({ text: "4. MÓDULOS PRINCIPAIS", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Módulo", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Localização", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Dashboard" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Painel principal com aplicações" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "client/src/pages/Dashboard.tsx" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Manus Agent" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Agente autônomo de IA" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "server/manus/" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "IDE" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ambiente de desenvolvimento" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "client/src/modules/ide/" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Arcádia Insights" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Business Intelligence" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "client/src/pages/Insights.tsx" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Process Compass" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Consultoria multi-tenant" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "client/src/pages/ProcessCompass/" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Arcádia CRM" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gestão de relacionamento" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "client/src/pages/ArcadiaCRM/" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Knowledge Base" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Base de conhecimento" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "client/src/pages/KnowledgeBase.tsx" })] })] }),
              ],
            }),
          ],
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 5. Manus Agent
        new Paragraph({
          children: [new TextRun({ text: "5. MANUS AGENT - AGENTE AUTÔNOMO", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O Manus é um agente autônomo que executa tarefas complexas usando um loop de raciocínio:",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Loop Pensamento-Ação-Observação:", bold: true, size: 24 })]
        }),
        new Paragraph({ children: [new TextRun({ text: "1. Pensamento: Analisa a tarefa e decide próxima ação", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "2. Ação: Executa uma ferramenta disponível", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "3. Observação: Analisa resultado e planeja próximo passo", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "4. Repete até concluir a tarefa", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "5.1 Ferramentas Disponíveis (20+)", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ferramenta", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "web_search" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Pesquisa na web" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "knowledge_query" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Consulta grafo de conhecimento" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "erp_query" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Consulta sistemas ERP" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "calculate" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Executa cálculos matemáticos" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "message" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Envia mensagens WhatsApp/Email" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "report" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Gera relatórios" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "schedule_task" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Agenda tarefas futuras" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "python_execute" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Executa código Python" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "semantic_search" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Busca semântica nos documentos" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "file_read / file_write" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Leitura e escrita de arquivos" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "shell_execute" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Executa comandos shell (seguro)" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "ask_human" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Solicita aprovação do usuário" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "analyze_data" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Analisa dados com estatísticas" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "add_to_knowledge" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Adiciona ao grafo de conhecimento" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "workflow_execute" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Executa workflow BPMN" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "rpa_execute" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Executa automação RPA" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "fiscal_emit" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Emite NFe/NFCe" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "fiscal_query" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Consulta notas fiscais" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "scientist_*" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ferramentas do Módulo Cientista" })] })] }),
              ],
            }),
          ],
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 6. Módulo Cientista
        new Paragraph({
          children: [new TextRun({ text: "6. MÓDULO CIENTISTA - AUTO-PROGRAMAÇÃO", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O Módulo Cientista é a inteligência central do sistema, capaz de gerar código automaticamente, detectar padrões e aprender com o uso.",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "6.1 Geração de Código de Análise", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Templates disponíveis:", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• aggregate_data: Agrupamento e agregação de dados", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• filter_data: Filtragem com condições", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• transform_data: Normalização, log, categorização", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• simple_predict: Predição com regressão linear", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• generate_report: Relatório estatístico completo", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "6.2 Geração de Código de Automação", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Templates disponíveis:", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• send_notification: Envio de emails", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• api_request: Requisições HTTP", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• process_files: Processamento de arquivos", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• scheduled_task: Tarefas agendadas", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "6.3 Detecção de Padrões", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Padrões detectados automaticamente:", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Tendências temporais (crescimento, sazonalidade)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Correlações entre variáveis", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Outliers e anomalias", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Distribuições estatísticas", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "6.4 Aprendizado Contínuo", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "O sistema aprende com:", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Histórico de execuções bem-sucedidas", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Feedback do usuário", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Padrões de uso recorrentes", size: 24 })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 7. Motor de Workflow BPMN
        new Paragraph({
          children: [new TextRun({ text: "7. MOTOR DE WORKFLOW BPMN", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "Sistema de execução de processos de negócio baseado em BPMN (Business Process Model and Notation).",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "7.1 Estrutura de Workflow", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Definição em JSON:", size: 24, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "{", size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '  "id": "workflow_001",', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '  "name": "Processo de Vendas",', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '  "tasks": [', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '    { "id": "t1", "type": "service", "action": "..." },', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '    { "id": "t2", "type": "gateway", "condition": "..." }', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '  ],', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: '  "transitions": [...]', size: 20, font: "Courier New" })] }),
        new Paragraph({ children: [new TextRun({ text: "}", size: 20, font: "Courier New" })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "7.2 Tipos de Tarefas", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "• service: Executa uma ação automática", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• user: Requer interação humana", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• gateway: Ponto de decisão condicional", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• script: Executa código Python", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "7.3 Avaliador Seguro", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O motor utiliza um avaliador de expressões seguro (safe_evaluate_condition) que substitui eval() por parsing AST, prevenindo injeção de código.",
            size: 24
          })]
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 8. Automação RPA
        new Paragraph({
          children: [new TextRun({ text: "8. AUTOMAÇÃO RPA", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "Sistema de Robotic Process Automation usando Playwright para automação de navegador.",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "8.1 Templates Disponíveis", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Template", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Parâmetros", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "login" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Login automático em sites" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "url, username, password, selectors" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "scrape_table" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Extração de dados de tabelas" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "url, table_selector" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "form_fill" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Preenchimento de formulários" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "url, fields, submit_selector" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "download_report" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Download de relatórios" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "url, download_selector" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "nfe_consulta" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Consulta NFe no portal" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "chave_acesso" })] })] }),
              ],
            }),
          ],
        }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "8.2 Segurança", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "• Execução em navegador headless isolado", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Timeout configurável por operação", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Screenshots para auditoria", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Credenciais via variáveis de ambiente", size: 24 })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 9. IDE Integrada
        new Paragraph({
          children: [new TextRun({ text: "9. IDE INTEGRADA", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "Ambiente de desenvolvimento completo integrado ao sistema, suportando Node.js e Python.",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "9.1 Quatro Modos de Criação", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Modo", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Usuário Alvo", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Auto-Code" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "IA gera código automaticamente" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qualquer usuário" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Full-Code" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Desenvolvedor escreve código" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Desenvolvedores" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Low-Code" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Regras visuais e conectores" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Analistas técnicos" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No-Code" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Arrastar e soltar componentes" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Usuários de negócio" })] })] }),
              ],
            }),
          ],
        }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "9.2 Recursos", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "• Monaco Editor com syntax highlighting", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Suporte a TypeScript, JavaScript, Python", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Terminal integrado (Xterm.js)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Gerenciador de arquivos", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Execução de código em tempo real", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• IntelliSense e autocompletar", size: 24 })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 10. Grafo de Conhecimento
        new Paragraph({
          children: [new TextRun({ text: "10. GRAFO DE CONHECIMENTO", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O Grafo de Conhecimento conecta todas as informações do negócio em uma estrutura navegável e pesquisável.",
            size: 24
          })]
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "10.1 Schema do Banco de Dados", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Tabela: graph_nodes", bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• id: Identificador único (serial)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• type: Tipo do nó (pessoa, empresa, documento, etc)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• label: Nome/rótulo do nó", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• properties: Dados adicionais (JSONB)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• embedding: Vetor para busca semântica", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• tenantId: Isolamento multi-tenant", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Tabela: graph_edges", bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• id: Identificador único (serial)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• sourceId: Nó de origem", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• targetId: Nó de destino", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• type: Tipo da relação (trabalha_em, possui, etc)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• properties: Dados da relação (JSONB)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• weight: Peso/força da relação", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "10.2 Busca Semântica", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "ChromaDB armazena embeddings vetoriais dos documentos, permitindo busca por similaridade semântica em linguagem natural.",
            size: 24
          })]
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 11. Regras de Segurança
        new Paragraph({
          children: [new TextRun({ text: "11. REGRAS DE SEGURANÇA", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "11.1 Execução de Código", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "• Código Python executado em ambiente isolado", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Timeout de 30 segundos por execução", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Imports restritos a bibliotecas seguras", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Sem acesso a system calls perigosas", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "11.2 Execução Shell", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Comandos bloqueados:", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• rm -rf, dd, mkfs, fdisk", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• chmod 777, chown, sudo, su", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• wget, curl (para URLs externas)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• kill, pkill, shutdown, reboot", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "11.3 Acesso a Arquivos", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Diretórios permitidos:", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• /tmp - Arquivos temporários", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• ./uploads - Uploads do usuário", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• ./data - Dados da aplicação", size: 24 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "11.4 Avaliação de Expressões", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ 
            text: "O sistema usa safe_evaluate_condition() com parsing AST ao invés de eval(), prevenindo injeção de código em condições de workflow.",
            size: 24
          })]
        }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "11.5 Autenticação", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "• Passport.js com estratégia local", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Senhas com hash Scrypt", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• Sessões em PostgreSQL (connect-pg-simple)", size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "• RBAC (Role-Based Access Control)", size: 24 })] }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 12. Variáveis de Ambiente
        new Paragraph({
          children: [new TextRun({ text: "12. VARIÁVEIS DE AMBIENTE", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Variável", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Descrição", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Obrigatória", bold: true })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "DATABASE_URL" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "URL de conexão PostgreSQL" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sim" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "SESSION_SECRET" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chave para criptografia de sessão" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sim" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "OPENAI_API_KEY" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Chave API da OpenAI" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Sim" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PYTHON_SERVICE_URL" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "URL do serviço Python" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Não (default: http://localhost:8001)" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PLUS_URL" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "URL do Arcadia Plus ERP" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Não" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "PLUS_API_TOKEN" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Token de autenticação ERP" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Não" })] })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "CHROMA_HOST" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Host do ChromaDB" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Não (default: localhost)" })] })] }),
              ],
            }),
          ],
        }),

        // Quebra de página
        new Paragraph({ children: [], pageBreakBefore: true }),

        // 13. APIs e Endpoints
        new Paragraph({
          children: [new TextRun({ text: "13. APIs E ENDPOINTS", bold: true, size: 32 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "13.1 API Principal (Node.js - Porta 5000)", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Autenticação:", bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/register - Registro de usuário", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/login - Login", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/logout - Logout", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "GET /api/user - Usuário atual", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Manus Agent:", bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/manus/execute - Executa tarefa", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "GET /api/manus/history - Histórico de execuções", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "IDE:", bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "GET /api/ide/files - Lista arquivos", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "GET /api/ide/file/:path - Lê arquivo", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/ide/file - Salva arquivo", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/ide/execute - Executa código", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "Grafo de Conhecimento:", bold: true, size: 24 })] }),
        new Paragraph({ children: [new TextRun({ text: "GET /api/graph/nodes - Lista nós", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/graph/nodes - Cria nó", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "GET /api/graph/edges - Lista relações", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /api/graph/edges - Cria relação", size: 22 })] }),

        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "13.2 API Python (FastAPI - Porta 8001)", bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /execute - Executa código Python", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /embeddings/index - Indexa documento", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /embeddings/search - Busca semântica", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /workflow/execute - Executa workflow BPMN", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /rpa/execute - Executa automação RPA", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /scientist/generate-analysis - Gera código de análise", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /scientist/generate-automation - Gera código de automação", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /scientist/detect-patterns - Detecta padrões", size: 22 })] }),
        new Paragraph({ children: [new TextRun({ text: "POST /scientist/suggest-improvements - Sugere melhorias", size: 22 })] }),

        // Página final
        new Paragraph({ children: [], pageBreakBefore: true }),
        new Paragraph({
          children: [new TextRun({ text: "FIM DA DOCUMENTAÇÃO", bold: true, size: 32 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ children: [new TextRun({ text: "" })] }),
        new Paragraph({
          children: [new TextRun({ text: "Arcádia Suite - Sistema Operacional de Negócios", size: 24 })],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [new TextRun({ text: `Documentação gerada em ${new Date().toLocaleDateString('pt-BR')}`, size: 20 })],
          alignment: AlignmentType.CENTER,
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('Arcadia_Suite_Documentacao.docx', buffer);
  console.log('Documentação gerada: Arcadia_Suite_Documentacao.docx');
}

generateDocumentation().catch(console.error);
