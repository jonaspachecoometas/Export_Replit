import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, AlignmentType } from "docx";
import * as fs from "fs";

async function generateArchitectureDoc() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: "ARCÁDIA SUITE",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Documentação de Arquitetura",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: `Gerado em: ${new Date().toLocaleDateString("pt-BR")}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "1. Visão Geral da Plataforma",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Arcádia Suite é uma plataforma de inteligência de negócios projetada como um ambiente desktop estilo navegador. Oferece um workspace integrado para gerenciamento de aplicações empresariais, assistência por IA, e integrações com sistemas ERP.",
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "2. Arquitetura de Alto Nível",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Frontend (React/Vite)", alignment: AlignmentType.CENTER })],
                    shading: { fill: "1E40AF" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Backend (Express/Node)", alignment: AlignmentType.CENTER })],
                    shading: { fill: "1E40AF" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Dados & Integrações", alignment: AlignmentType.CENTER })],
                    shading: { fill: "1E40AF" },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({ text: "• Browser Shell UI" }),
                      new Paragraph({ text: "• Abas / Omnibox" }),
                      new Paragraph({ text: "• Workspace Router" }),
                      new Paragraph({ text: "• Páginas (wouter)" }),
                      new Paragraph({ text: "• React Query" }),
                      new Paragraph({ text: "• shadcn/ui components" }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: "• REST API Gateway" }),
                      new Paragraph({ text: "• /api/auth" }),
                      new Paragraph({ text: "• /api/agent" }),
                      new Paragraph({ text: "• /api/compass" }),
                      new Paragraph({ text: "• /api/insights" }),
                      new Paragraph({ text: "• /api/manus" }),
                      new Paragraph({ text: "• Socket.IO (chat)" }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({ text: "• PostgreSQL (Drizzle ORM)" }),
                      new Paragraph({ text: "• users, applications" }),
                      new Paragraph({ text: "• RBAC, tenants" }),
                      new Paragraph({ text: "• OpenAI (Agent/Manus)" }),
                      new Paragraph({ text: "• ERP (Arcadia Plus, TOTVS, SAP)" }),
                      new Paragraph({ text: "• WhatsApp Cloud" }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3. Módulos Desenvolvidos",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3.1 Agent (Assistente IA)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Funcionalidades: ", bold: true }),
              new TextRun({ text: "Chat com GPT, Histórico de conversas, Base de conhecimento, Geração de imagens" }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3.2 Process Compass (Consultoria)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Funcionalidades: ", bold: true }),
              new TextRun({ text: "Canvas BMC com perguntas diagnósticas, Análise SWOT, Ciclos PDCA, CRM Pipeline, Mapeamento de Processos, Gestão de Tarefas, Multi-tenancy" }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3.3 Insights (BI Analytics)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Funcionalidades: ", bold: true }),
              new TextRun({ text: "Data Sources, Datasets, Charts, Dashboards, Backups automáticos, File Upload (CSV, JSON, SQL)" }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3.4 Manus (Agente Autônomo)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Funcionalidades: ", bold: true }),
              new TextRun({ text: "Loop Think-Act-Observe, Ferramentas (ERP Query, Web Search, Relatórios), Execução autônoma de tarefas" }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3.5 WhatsApp (Mensageria)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Funcionalidades: ", bold: true }),
              new TextRun({ text: "Multi-sessão, Contatos, Mensagens, Autenticação QR Code, Status em tempo real" }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "3.6 Staging (Migração de Dados)",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Funcionalidades: ", bold: true }),
              new TextRun({ text: "SQL Parser, MongoDB Import, CSV/JSON, Mapeamento para ERP, Migration Jobs" }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "4. Estrutura do Banco de Dados",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Área", alignment: AlignmentType.CENTER })],
                    shading: { fill: "374151" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Tabelas", alignment: AlignmentType.CENTER })],
                    shading: { fill: "374151" },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Core (Usuários/Apps)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "users, applications, user_applications" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Agent (Chat IA)" })] }),
                  new TableCell({ children: [new Paragraph({ text: "conversations, messages, knowledge_base, erp_connections" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Process Compass" })] }),
                  new TableCell({ children: [new Paragraph({ text: "tenants, tenant_users, pc_clients, pc_projects, pc_canvas_blocks, pc_canvas_questions, pc_swot_analyses, pc_processes, pc_pdca_cycles, pc_crm_*, pc_tasks" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Business Intelligence" })] }),
                  new TableCell({ children: [new Paragraph({ text: "data_sources, bi_datasets, bi_charts, bi_dashboards, backup_jobs, backup_artifacts" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Manus Agent" })] }),
                  new TableCell({ children: [new Paragraph({ text: "manus_runs, manus_steps" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "WhatsApp" })] }),
                  new TableCell({ children: [new Paragraph({ text: "whatsapp_sessions, whatsapp_contacts, whatsapp_messages" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Staging/Migration" })] }),
                  new TableCell({ children: [new Paragraph({ text: "staged_tables, staging_mappings, migration_jobs" })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "5. Stack Tecnológico",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Camada", alignment: AlignmentType.CENTER })],
                    shading: { fill: "059669" },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Tecnologias", alignment: AlignmentType.CENTER })],
                    shading: { fill: "059669" },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Frontend" })] }),
                  new TableCell({ children: [new Paragraph({ text: "React 18, TypeScript, Vite, Wouter, React Query, Tailwind CSS, shadcn/ui, Radix UI, Framer Motion" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Backend" })] }),
                  new TableCell({ children: [new Paragraph({ text: "Node.js 20+, Express, TypeScript (ESM), Socket.IO, Passport.js, Zod" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Banco de Dados" })] }),
                  new TableCell({ children: [new Paragraph({ text: "PostgreSQL, Drizzle ORM, connect-pg-simple" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "IA/LLM" })] }),
                  new TableCell({ children: [new Paragraph({ text: "OpenAI API (GPT-4o, DALL-E)" })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ text: "Integrações" })] }),
                  new TableCell({ children: [new Paragraph({ text: "ERPs (Arcadia Plus, TOTVS, SAP), WhatsApp (Baileys)" })] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "6. Fluxo de Integrações",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({ text: "[Frontend UI] ⟷ [Express API] ⟷ [PostgreSQL]", font: "Consolas" }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "           │", font: "Consolas" }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "    ┌──────┼──────┐", font: "Consolas" }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "    ▼      ▼      ▼", font: "Consolas" }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "[OpenAI] [ERP] [WhatsApp]", font: "Consolas" }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          new Paragraph({
            text: "Documento gerado automaticamente pelo Arcádia Suite",
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Documento gerado automaticamente pelo Arcádia Suite", italics: true, size: 20 }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("Arcadia_Suite_Arquitetura.docx", buffer);
  console.log("Documento gerado: Arcadia_Suite_Arquitetura.docx");
}

generateArchitectureDoc().catch(console.error);
