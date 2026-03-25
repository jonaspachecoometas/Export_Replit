import { getToolsDescription } from "../../manus/tools";

export const ARCADIA_AGENT_SYSTEM_PROMPT = `Você é o Manus, assistente empresarial inteligente da Arcádia Suite.

IDENTIDADE:
- Você é o Manus, assistente empresarial da Arcádia Suite.
- Se perguntado sobre identidade: "Sou o Manus, assistente da Arcádia Suite."
- NÃO mencione modelos de linguagem, APIs ou infraestrutura técnica.
- NUNCA diga que é uma "IA local" ou que "não tem acesso externo" — você tem capacidades completas.

COMPORTAMENTO:
- Seja direto e objetivo. Responda exatamente o que foi perguntado.
- Para cálculos e perguntas simples: responda diretamente, sem rodeios.
- NUNCA adicione SWOT, Canvas, PDCA, matrizes ou frameworks NÃO solicitados.
- NUNCA adicione rodapés automáticos ou citações de fonte não pedidas.
- Quando não souber algo, diga claramente sem inventar.
- Use Markdown para tabelas e dados estruturados quando fizer sentido.

CAPACIDADES COMPLETAS DO MANUS:
- Responde perguntas gerais, realiza cálculos e análises
- Pesquisa na web e sintetiza informações atualizadas
- Analisa documentos, planilhas e arquivos anexados
- Consulta dados do ERP, CRM, financeiro e base de conhecimento
- Gera gráficos, relatórios e dashboards no BI
- Executa diagnósticos empresariais (Canvas, SWOT, PDCA) quando SOLICITADO
- Comunica-se com agentes especializados da plataforma

ANÁLISE E DADOS:
- Use tabelas Markdown formatadas para dados estruturados.
- Calcule variações percentuais e tendências quando relevante.
- Forneça insights reais, não apenas dados brutos.`;

export interface DiagnosticContext {
  canvas?: any[];
  swot?: { analyses: any[]; items: any[] };
  pdca?: { cycles: any[]; actions: any[] };
  processes?: { processes: any[]; steps: any[] };
  requirements?: any[];
  projectName?: string;
  clientName?: string;
}

export function buildPromptWithContext(
  knowledgeBaseContext: string, 
  fileContent?: string,
  diagnosticContext?: DiagnosticContext
): string {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' });
  let prompt = ARCADIA_AGENT_SYSTEM_PROMPT + `\n\nDATA/HORA ATUAL: ${now}`;
  
  if (knowledgeBaseContext) {
    prompt += `\n\n## Contexto da Inteligência Arcádia Business
Os seguintes documentos da base de conhecimento são relevantes para esta consulta. Use essas informações e CITE as fontes conforme as regras acima:

${knowledgeBaseContext}`;
  }
  
  if (fileContent) {
    prompt += `\n\n## Documento Anexado pelo Usuário
O usuário anexou o seguinte documento para análise:

${fileContent}`;
  }

  if (diagnosticContext) {
    prompt += `\n\n## Contexto do Process Compass (Diagnóstico Empresarial)`;
    
    if (diagnosticContext.projectName) {
      prompt += `\n\n**Projeto:** ${diagnosticContext.projectName}`;
    }
    if (diagnosticContext.clientName) {
      prompt += `\n**Cliente:** ${diagnosticContext.clientName}`;
    }

    if (diagnosticContext.canvas && diagnosticContext.canvas.length > 0) {
      prompt += `\n\n### Canvas de Modelo de Negócios
${diagnosticContext.canvas.map(block => 
  `**${block.blockType}** (Nível: ${block.level || 'intenção'}, Completude: ${block.completionScore || 0}%):\n${block.content || 'Sem conteúdo'}`
).join('\n\n')}`;
    }

    if (diagnosticContext.swot?.analyses && diagnosticContext.swot.analyses.length > 0) {
      prompt += `\n\n### Análises SWOT`;
      diagnosticContext.swot.analyses.forEach(analysis => {
        const items = diagnosticContext.swot!.items.filter(i => i.swotAnalysisId === analysis.id);
        const strengths = items.filter(i => i.type === 'strength');
        const weaknesses = items.filter(i => i.type === 'weakness');
        const opportunities = items.filter(i => i.type === 'opportunity');
        const threats = items.filter(i => i.type === 'threat');
        
        prompt += `\n\n**${analysis.name}** (Setor: ${analysis.sector || 'geral'}):
- Forças (${strengths.length}): ${strengths.map(s => s.description).join('; ') || 'Nenhuma'}
- Fraquezas (${weaknesses.length}): ${weaknesses.map(w => w.description).join('; ') || 'Nenhuma'}
- Oportunidades (${opportunities.length}): ${opportunities.map(o => o.description).join('; ') || 'Nenhuma'}
- Ameaças (${threats.length}): ${threats.map(t => t.description).join('; ') || 'Nenhuma'}`;
      });
    }

    if (diagnosticContext.pdca?.cycles && diagnosticContext.pdca.cycles.length > 0) {
      prompt += `\n\n### Ciclos PDCA`;
      diagnosticContext.pdca.cycles.forEach(cycle => {
        const actions = diagnosticContext.pdca!.actions.filter(a => a.cycleId === cycle.id);
        const planActions = actions.filter(a => a.phase === 'plan');
        const doActions = actions.filter(a => a.phase === 'do');
        const checkActions = actions.filter(a => a.phase === 'check');
        const actActions = actions.filter(a => a.phase === 'act');
        
        prompt += `\n\n**${cycle.title}** (Status: ${cycle.status}, Prioridade: ${cycle.priority || 'medium'}):
${cycle.description || ''}
- Plan (${planActions.length} ações): ${planActions.map(a => a.title).join(', ') || 'Nenhuma'}
- Do (${doActions.length} ações): ${doActions.map(a => a.title).join(', ') || 'Nenhuma'}
- Check (${checkActions.length} ações): ${checkActions.map(a => a.title).join(', ') || 'Nenhuma'}
- Act (${actActions.length} ações): ${actActions.map(a => a.title).join(', ') || 'Nenhuma'}`;
      });
    }

    if (diagnosticContext.processes?.processes && diagnosticContext.processes.processes.length > 0) {
      prompt += `\n\n### Processos Mapeados`;
      diagnosticContext.processes.processes.forEach(process => {
        const steps = diagnosticContext.processes!.steps.filter(s => s.processId === process.id);
        prompt += `\n\n**${process.name}** (${process.department || 'Geral'}):
${process.description || ''}
Etapas: ${steps.map(s => `${s.stepNumber}. ${s.name}`).join(' → ') || 'Nenhuma etapa'}`;
      });
    }

    if (diagnosticContext.requirements && diagnosticContext.requirements.length > 0) {
      prompt += `\n\n### Requisitos do Projeto
${diagnosticContext.requirements.map(req => 
  `- **${req.code || 'REQ'}**: ${req.title} (${req.type}, ${req.priority}, ${req.status})`
).join('\n')}`;
    }
  }
  
  return prompt;
}

export function buildAgentPromptForChat(
  knowledgeBaseContext: string,
  fileContent?: string,
  diagnosticContext?: DiagnosticContext
): string {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' });

  let prompt = `Você é o Manus, assistente da Arcádia Suite.

IDENTIDADE: Manus, assistente da Arcádia Suite.
- NUNCA mencione "OnboardBI", modelos de linguagem, APIs ou infraestrutura.
- NUNCA diga que não tem acesso a dados — use as ferramentas para buscar.
- Se perguntado sobre identidade: "Sou o Manus, assistente da Arcádia Suite."

DATA/HORA: ${now}

FERRAMENTAS DISPONÍVEIS:
${getToolsDescription()}

⚠️ REGRA ABSOLUTA: Responda SEMPRE e APENAS em JSON válido. NUNCA escreva texto livre.

FORMATO (toda resposta deve ser exatamente assim):
{"thought": "raciocínio breve", "tool": "nome_ferramenta", "tool_input": {"param": "valor"}}

Para perguntas simples/cálculos (sem precisar de dados do sistema):
{"thought": "resposta direta", "tool": "finish", "tool_input": {"answer": "resposta em Markdown"}}

QUANDO USAR FERRAMENTAS:
- Perguntas sobre dados da empresa, clientes, vendas, financeiro → erp_query
- Perguntas sobre BI, tabelas, dashboards → bi_list_tables ou bi_execute_query
- Pesquisa de mercado, notícias, tendências → deep_research ou web_search
- Base de conhecimento interna → knowledge_query
- Análise de documento → analyze_file
- Qualquer dúvida sobre o que existe no sistema → use as ferramentas para descobrir

REGRAS:
- NUNCA diga "não tenho acesso" — use as ferramentas.
- NUNCA adicione SWOT, Canvas, PDCA sem ser solicitado.
- Para análises com dados: use tabelas Markdown e variações percentuais.
- Máximo 8 passos.`;

  if (knowledgeBaseContext) {
    prompt += `\n\n## Base de Conhecimento\nDocumentos relevantes encontrados:\n\n${knowledgeBaseContext}`;
  }

  if (fileContent) {
    prompt += `\n\n## Documento Anexado\n${fileContent}`;
  }

  if (diagnosticContext) {
    prompt += `\n\n## Contexto Empresarial (Process Compass)`;
    if (diagnosticContext.projectName) prompt += `\n**Projeto:** ${diagnosticContext.projectName}`;
    if (diagnosticContext.clientName) prompt += `\n**Cliente:** ${diagnosticContext.clientName}`;

    if (diagnosticContext.canvas?.length) {
      prompt += `\n\n### Canvas BMC\n${diagnosticContext.canvas.map(b =>
        `**${b.blockType}**: ${b.content || 'Sem conteúdo'}`).join('\n')}`;
    }
    if (diagnosticContext.swot?.analyses?.length) {
      prompt += `\n\n### SWOT`;
      diagnosticContext.swot.analyses.forEach(a => {
        const items = diagnosticContext.swot!.items.filter(i => i.swotAnalysisId === a.id);
        prompt += `\n**${a.name}**: F:${items.filter(i=>i.type==='strength').length} Fr:${items.filter(i=>i.type==='weakness').length} O:${items.filter(i=>i.type==='opportunity').length} A:${items.filter(i=>i.type==='threat').length}`;
      });
    }
    if (diagnosticContext.pdca?.cycles?.length) {
      prompt += `\n\n### PDCA\n${diagnosticContext.pdca.cycles.map(c => `**${c.title}** (${c.status})`).join('\n')}`;
    }
    if (diagnosticContext.processes?.processes?.length) {
      prompt += `\n\n### Processos\n${diagnosticContext.processes.processes.map(p => `**${p.name}** (${p.department||'Geral'})`).join('\n')}`;
    }
  }

  return prompt;
}
