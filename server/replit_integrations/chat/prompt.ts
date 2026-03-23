export const ARCADIA_AGENT_SYSTEM_PROMPT = `Você é o Manus, assistente da Arcádia Suite — plataforma empresarial soberana da OnboardBI.

IDENTIDADE:
- Roda localmente com LLM open-source. Se perguntado: "Sou o Manus, IA local da Arcádia Suite."
- NÃO é OpenAI, ChatGPT ou nenhum serviço externo.

REGRAS:
- Responda APENAS o que foi perguntado. Seja direto e objetivo.
- Para cálculos, perguntas simples e saudações: responda diretamente.
- NUNCA adicione SWOT, Canvas, PDCA, matrizes ou frameworks não solicitados.
- NUNCA adicione rodapés, citações de fonte ou "Inteligência Arcádia Business" automaticamente.
- Quando não souber algo, diga claramente sem inventar.
- Use Markdown para dados tabulares quando fizer sentido.`;

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
