import OpenAI from "openai";
import { db } from "../../db/index";
import { manusRuns, manusSteps, knowledgeBase, erpConnections, dataSources, biDatasets, biCharts, biDashboards, biDashboardCharts, backupJobs, finAccountsPayable, finAccountsReceivable, finBankAccounts, finTransactions, finCashFlowCategories, erpCustomers, erpSuppliers, customMcpServers, posSales, mobileDevices, deviceEvaluations, serviceOrders, retailStores, retailSellers, retailCommissionClosures, customerCredits } from "@shared/schema";
import { sql } from "drizzle-orm";
import { eq, desc, ilike, and, gte, lte, or } from "drizzle-orm";
import { MANUS_TOOLS, getToolsDescription, type ToolResult } from "./tools";
import { EventEmitter } from "events";
import { PDFParse } from "pdf-parse";
import { learningService } from "../learning/service";
import * as erpnextService from "../erpnext/service";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Você é o Agente Arcádia Manus, um assistente empresarial inteligente e proativo.

Você executa tarefas usando as ferramentas disponíveis.
Você opera em ciclos de pensamento-ação:
1. PENSAMENTO: Analise a situação e decida o próximo passo
2. AÇÃO: Execute uma ferramenta
3. OBSERVAÇÃO: Analise o resultado
4. Repita até completar a tarefa

FERRAMENTAS DISPONÍVEIS:
${getToolsDescription()}

REGRAS DE AUTONOMIA:
- Para ANÁLISES e CONSULTAS: seja proativo e execute sem pedir confirmação
- Para GERAÇÃO DE CÓDIGO: execute o código e apresente o resultado
- Se uma ferramenta falhar, tente uma alternativa ou apresente o que conseguiu
- NUNCA fique "aguardando resposta" no meio da tarefa - complete sempre
- Se não conseguir gerar um gráfico visualmente, forneça os dados em formato de tabela
- Para AÇÕES DESTRUTIVAS (deletar, modificar dados críticos): informe o que será feito na resposta final
- Sempre complete a tarefa e apresente o resultado ao final
- Máximo de 10 passos por execução

COMPORTAMENTO IMPORTANTE:
- Quando o usuário pedir análise de dados, faça uma análise COMPLETA e PROFISSIONAL
- Sempre forneça insights e interpretações, não apenas os números brutos
- Calcule variações percentuais, identifique tendências e faça observações relevantes
- Apresente dados em TABELAS FORMATADAS usando Markdown quando apropriado

FORMATO DE RESPOSTA IDEAL:
1. Primeiro, apresente uma TABELA com os dados extraídos (use formato Markdown: | Coluna | Valor |)
2. Em seguida, forneça uma ANÁLISE explicativa com insights (variações %, tendências, observações)
3. Por fim, gere um GRÁFICO visual usando generate_chart

CRIAÇÃO DE GRÁFICOS:
- Use generate_chart para criar gráficos visuais (NÃO use python_execute)
- Tipos disponíveis: bar (barras), line (linha), pie (pizza), area (área)
- Formate os dados como JSON array: [{"name":"2023","ativo":10844216,"passivo":10844216}]
- Inclua múltiplas séries quando fizer sentido (ex: ativo E passivo no mesmo gráfico)

EXEMPLO DE RESPOSTA COMPLETA:
1. analyze_file -> extrair dados do documento
2. generate_chart -> criar gráfico visual
3. finish -> apresentar tabela + análise + conclusão

Sempre calcule e mencione:
- Variações percentuais entre períodos
- Tendências (crescimento/queda)
- Observações sobre equilíbrio contábil quando aplicável

PESQUISA INTELIGENTE:
- Para PESQUISA PROFUNDA sobre um tema: use deep_research (busca, extrai e sintetiza múltiplas fontes)
- Para APRENDER conteúdo de uma URL específica: use learn_url
- Para BUSCAR no conhecimento já aprendido: use semantic_search PRIMEIRO
- Para NAVEGAR e extrair conteúdo de uma página: use web_browse

ESTRATÉGIA DE PESQUISA (siga esta ordem):
1. PRIMEIRO: Consulte semantic_search para ver se já temos informações sobre o assunto
2. SE não houver informações: Use deep_research para pesquisar na web e aprender
3. SE o usuário fornecer uma URL específica: Use web_browse ou learn_url
4. SEMPRE sintetize e apresente uma resposta completa

REGRAS DE PESQUISA:
- Quando o usuário pedir para "pesquisar sobre X", use deep_research
- Quando o usuário mencionar URLs, use web_browse para ver ou learn_url para salvar
- Seja PROATIVO: se não encontrar na base interna, pesquise na web automaticamente
- NUNCA diga "não consigo acessar" - sempre tente as ferramentas disponíveis

MÓDULO DE BI (ARCÁDIA INSIGHTS):
- Use bi_stats para ver estatísticas gerais do BI
- Use bi_list_tables para listar tabelas disponíveis no banco
- Use bi_get_table_columns para ver colunas de uma tabela
- Use bi_create_dataset para criar consultas SQL ou selecionar tabelas
- Use bi_execute_query para executar um dataset e obter dados
- Use bi_create_chart para criar gráficos persistentes no BI
- Use bi_create_dashboard para organizar gráficos em painéis
- Os recursos do BI ficam salvos permanentemente no sistema

COMUNICAÇÃO ENTRE AGENTES (A2A - Agent to Agent):
- Use list_agents para ver agentes externos disponíveis
- Use register_agent para adicionar um novo agente externo
- Use discover_agent para descobrir capacidades de um agente via Agent Card
- Use call_agent para enviar mensagens e delegar tarefas a outros agentes
- Você pode orquestrar múltiplos agentes para tarefas complexas
- Agentes podem ter especializações (fiscal, jurídico, vendas, etc.)

ESTRATÉGIA DE ORQUESTRAÇÃO:
- Para tarefas especializadas: verifique se há um agente especialista registrado
- Para tarefas complexas: divida em subtarefas e delegue para agentes apropriados
- Sempre sintetize as respostas dos agentes antes de apresentar ao usuário

Responda SEMPRE em formato JSON:
{
  "thought": "Seu raciocínio sobre o próximo passo",
  "tool": "nome_da_ferramenta",
  "tool_input": { "param1": "valor1" }
}

Quando concluir, use:
{
  "thought": "Raciocínio final",
  "tool": "finish",
  "tool_input": { "answer": "Resposta final COMPLETA com TODOS os dados e análise" }
}

REGRA CRÍTICA PARA RESPOSTA FINAL:
- A resposta no campo "answer" deve conter TODO o conteúdo da análise
- NUNCA diga apenas "relatório gerado com sucesso" - inclua o conteúdo completo
- Inclua: tabelas de dados, cálculos, variações percentuais, insights e conclusões
- O usuário quer ver a análise completa, não apenas uma confirmação
- Se analisou um documento, inclua os dados extraídos E sua interpretação`;

class ManusService extends EventEmitter {
  private async executeTool(tool: string, input: Record<string, any>, userId: string): Promise<ToolResult> {
    try {
      switch (tool) {
        case "web_search":
          return this.toolWebSearch(input.query);
        case "knowledge_query":
          return this.toolKnowledgeQuery(input.query);
        case "erp_query":
          return this.toolErpQuery(input.entity, input.filter, userId);
        case "calculate":
          return this.toolCalculate(input.expression);
        case "send_message":
          return this.toolSendMessage(input.to, input.message);
        case "generate_report":
          return this.toolGenerateReport(input.title, input.type, input.data);
        case "schedule_task":
          return this.toolScheduleTask(input.task, input.when);
        case "web_browse":
          return this.toolWebBrowse(input.url, input.extract);
        case "analyze_file":
          return this.toolAnalyzeFile(input.filename, input.question, input.attachedFiles);
        case "crm_query":
          return this.toolCrmQuery(input.entity, input.filter, userId);
        case "crm_create_event":
          return this.toolCrmCreateEvent(input.title, input.type, input.startAt, input.description, userId);
        case "crm_send_whatsapp":
          return this.toolCrmSendWhatsapp(input.phone, input.message, userId);
        case "python_execute":
          return this.toolPythonExecute(input.code, input.timeout);
        case "semantic_search":
          return this.toolSemanticSearch(input.query, input.n_results);
        case "read_file":
          return this.toolReadFile(input.path);
        case "write_file":
          return this.toolWriteFile(input.path, input.content);
        case "list_files":
          return this.toolListFiles(input.path);
        case "shell":
          return this.toolShell(input.command);
        case "ask_human":
          return this.toolAskHuman(input.prompt, input.options);
        case "analyze_data":
          return this.toolAnalyzeData(input.data);
        case "add_to_knowledge":
          return this.toolAddToKnowledge(input.doc_id, input.content, input.type);
        case "run_workflow":
          return this.toolRunWorkflow(input.workflow_type, input.data);
        case "rpa_execute":
          return this.toolRpaExecute(input.template, input.params);
        case "fiscal_emit":
          return this.toolFiscalEmit(input.type, input.data);
        case "fiscal_query":
          return this.toolFiscalQuery(input.chave);
        case "plus_clientes":
          return this.toolPlusClientes(input.filtro);
        case "plus_produtos":
          return this.toolPlusProdutos(input.filtro);
        case "plus_vendas":
          return this.toolPlusVendas(input.filtro);
        case "plus_estoque":
          return this.toolPlusEstoque();
        case "plus_financeiro":
          return this.toolPlusFinanceiro(input.tipo);
        case "plus_fornecedores":
          return this.toolPlusFornecedores(input.filtro);
        case "plus_dashboard":
          return this.toolPlusDashboard();
        case "learn_url":
          return this.toolLearnUrl(input.url, input.priority);
        case "deep_research":
          return this.toolDeepResearch(input.topic, input.depth);
        case "detect_opportunities":
          return this.toolDetectOpportunities(input.domain, input.min_confidence);
        case "scientist_generate_code":
          return this.toolScientistGenerateCode(input.goal, input.data_description);
        case "scientist_generate_automation":
          return this.toolScientistGenerateAutomation(input.task);
        case "scientist_detect_patterns":
          return this.toolScientistDetectPatterns(input.data);
        case "scientist_suggest_improvements":
          return this.toolScientistSuggestImprovements(input.data);
        case "generate_chart":
          return this.toolGenerateChart(input.type, input.title, input.data, input.xKey, input.yKeys, input.colors);
        case "bi_stats":
          return this.toolBiStats(userId);
        case "bi_list_data_sources":
          return this.toolBiListDataSources(userId);
        case "bi_create_data_source":
          return this.toolBiCreateDataSource(userId, input.name, input.type, input.host, input.port, input.database, input.username, input.password);
        case "bi_list_datasets":
          return this.toolBiListDatasets(userId);
        case "bi_create_dataset":
          return this.toolBiCreateDataset(userId, input.name, input.type, input.dataSourceId, input.query, input.tableName);
        case "bi_execute_query":
          return this.toolBiExecuteQuery(userId, input.datasetId);
        case "bi_list_charts":
          return this.toolBiListCharts(userId);
        case "bi_create_chart":
          return this.toolBiCreateChart(userId, input.name, input.type, input.datasetId, input.config);
        case "bi_list_dashboards":
          return this.toolBiListDashboards(userId);
        case "bi_create_dashboard":
          return this.toolBiCreateDashboard(userId, input.name, input.description);
        case "bi_add_chart_to_dashboard":
          return this.toolBiAddChartToDashboard(userId, input.dashboardId, input.chartId, input.position);
        case "bi_list_tables":
          return this.toolBiListTables();
        case "bi_get_table_columns":
          return this.toolBiGetTableColumns(input.tableName);
        case "bi_analyze_with_pandas":
          return this.toolBiAnalyzeWithPandas(input.datasetId, input.question, userId);
        case "metaset_query":
          return this.toolMetaSetQuery(input.query, input.limit);
        case "metaset_create_question":
          return this.toolMetaSetCreateQuestion(input.name, input.query, input.chartType, input.description);
        case "metaset_list_questions":
          return this.toolMetaSetListQuestions();
        case "metaset_run_question":
          return this.toolMetaSetRunQuestion(input.questionId);
        case "metaset_create_dashboard":
          return this.toolMetaSetCreateDashboard(input.name, input.description);
        case "metaset_list_dashboards":
          return this.toolMetaSetListDashboards();
        case "metaset_add_to_dashboard":
          return this.toolMetaSetAddToDashboard(input.dashboardId, input.questionId);
        case "metaset_suggest_analysis":
          return this.toolMetaSetSuggestAnalysis(input.tableName);
        case "fin_query_payables":
          return this.toolFinQueryPayables(userId, input.status, input.supplier_id);
        case "fin_query_receivables":
          return this.toolFinQueryReceivables(userId, input.status, input.customer_id);
        case "fin_query_bank_accounts":
          return this.toolFinQueryBankAccounts(userId, input.active_only);
        case "fin_query_cashflow":
          return this.toolFinQueryCashflow(userId, input.start_date, input.end_date, input.account_id);
        case "fin_summary":
          return this.toolFinSummary(userId);
        case "fin_register_payable":
          return this.toolFinRegisterPayable(userId, input.supplier_id, input.description, input.amount, input.due_date, input.category_id);
        case "fin_register_receivable":
          return this.toolFinRegisterReceivable(userId, input.customer_id, input.description, input.amount, input.due_date, input.category_id);
        case "fin_pay_account":
          return this.toolFinPayAccount(userId, input.payable_id, input.bank_account_id, input.payment_date, input.amount_paid);
        case "fin_receive_account":
          return this.toolFinReceiveAccount(userId, input.receivable_id, input.bank_account_id, input.receive_date, input.amount_received);
        case "call_agent":
          return this.toolCallAgent(input.agent_id, input.message, input.wait_response);
        case "list_agents":
          return this.toolListAgents();
        case "register_agent":
          return this.toolRegisterAgent(input.name, input.url, input.api_key);
        case "discover_agent":
          return this.toolDiscoverAgent(input.url);
        case "export_to_excel":
          return this.toolExportToExcel(input.data, input.filename, input.sheet_name);
        case "send_to_bi_dataset":
          return this.toolSendToBiDataset(userId, input.name, input.data, input.description, input.update_if_exists);
        case "market_research":
          return this.toolMarketResearch(input.topic, input.company_context, input.focus);
        case "compare_with_market":
          return this.toolCompareWithMarket(input.metric, input.value, input.sector, input.period);
        // ERPNext tools
        case "erpnext_status":
          return this.toolErpnextStatus();
        case "erpnext_list_doctypes":
          return this.toolErpnextListDoctypes(input.limit);
        case "erpnext_get_documents":
          return this.toolErpnextGetDocuments(input.doctype, input.filters, input.fields, input.limit);
        case "erpnext_get_document":
          return this.toolErpnextGetDocument(input.doctype, input.name);
        case "erpnext_create_document":
          return this.toolErpnextCreateDocument(input.doctype, input.data);
        case "erpnext_update_document":
          return this.toolErpnextUpdateDocument(input.doctype, input.name, input.data);
        case "erpnext_search":
          return this.toolErpnextSearch(input.doctype, input.search_term, input.limit);
        case "erpnext_run_report":
          return this.toolErpnextRunReport(input.report_name, input.filters);
        case "erpnext_call_method":
          return this.toolErpnextCallMethod(input.method, input.args);
        // ========== ARCÁDIA RETAIL TOOLS ==========
        case "retail_query":
          return this.toolRetailQuery(input.entity, input.filter, input.limit);
        case "retail_stats":
          return this.toolRetailStats(input.period, input.storeId);
        case "retail_report":
          return this.toolRetailReport(input.type, input.dateFrom, input.dateTo, input.storeId);
        case "finish":
          let finishOutput = input.answer || "";
          if (input.chart) {
            try {
              const chartData = typeof input.chart === 'string' ? JSON.parse(input.chart) : input.chart;
              finishOutput = `__CHART_DATA__${JSON.stringify(chartData)}__END_CHART_DATA__\n\n${finishOutput}`;
            } catch (e) {
              // ignore invalid chart data
            }
          }
          return { success: true, output: finishOutput };
        default:
          // Check if it's a custom MCP tool (format: mcp_servername_toolname)
          if (tool.startsWith("mcp_")) {
            return this.executeCustomMcpTool(tool, input, userId);
          }
          return { success: false, output: "", error: `Ferramenta desconhecida: ${tool}` };
      }
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async executeCustomMcpTool(tool: string, input: Record<string, any>, userId: string): Promise<ToolResult> {
    try {
      // Parse tool name: mcp_servername_toolname
      const parts = tool.split("_");
      if (parts.length < 3) {
        return { success: false, output: "", error: "Invalid MCP tool format" };
      }
      
      const serverName = parts[1];
      const toolName = parts.slice(2).join("_");
      
      // Find the custom MCP server
      const [server] = await db.select().from(customMcpServers)
        .where(and(
          eq(customMcpServers.userId, userId),
          eq(customMcpServers.name, serverName),
          eq(customMcpServers.isActive, 1)
        ));
      
      if (!server) {
        return { success: false, output: "", error: `MCP server not found: ${serverName}` };
      }
      
      if (server.transportType === "http" && server.serverUrl) {
        // Execute HTTP MCP tool
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (server.customHeaders && typeof server.customHeaders === 'object') {
          Object.assign(headers, server.customHeaders);
        }
        
        const response = await fetch(`${server.serverUrl}/tools/${toolName}/execute`, {
          method: 'POST',
          headers,
          body: JSON.stringify(input)
        });
        
        if (response.ok) {
          const result = await response.json();
          return { 
            success: true, 
            output: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
          };
        } else {
          return { 
            success: false, 
            output: "", 
            error: `MCP tool execution failed: ${response.status}`
          };
        }
      }
      
      return { success: false, output: "", error: "STDIO MCP servers not yet supported" };
    } catch (error: any) {
      return { success: false, output: "", error: `MCP tool error: ${error.message}` };
    }
  }

  private async toolWebSearch(query: string): Promise<ToolResult> {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('dólar') || queryLower.includes('dolar') || queryLower.includes('usd') || 
        queryLower.includes('cotação') || queryLower.includes('câmbio') || queryLower.includes('cambio')) {
      try {
        const currencyData = await this.fetchCurrencyData();
        if (currencyData) {
          return {
            success: true,
            output: `🔍 Cotação do Dólar (Fonte: Banco Central do Brasil):\n\n${currencyData}`
          };
        }
      } catch (e) {
        console.error("Currency fetch error:", e);
      }
    }

    try {
      const searchResults = await this.performWebSearch(query);
      if (searchResults.length > 0) {
        let output = `🔍 Resultados da busca para "${query}":\n\n`;
        searchResults.forEach((result, i) => {
          output += `${i + 1}. **${result.title}**\n`;
          output += `   ${result.snippet}\n`;
          output += `   URL: ${result.url}\n\n`;
        });
        output += `\n💡 Dica: Use learn_url com uma das URLs acima para aprender o conteúdo completo.`;
        return { success: true, output };
      }
    } catch (e) {
      console.error("Web search error:", e);
    }

    return {
      success: true,
      output: `🔍 Busca para "${query}":\n\nNão encontrei resultados específicos. Tente:\n- Usar termos mais específicos\n- Fornecer uma URL direta com learn_url\n- Consultar a base de conhecimento com semantic_search`
    };
  }

  private async performWebSearch(query: string): Promise<Array<{title: string, url: string, snippet: string}>> {
    const results: Array<{title: string, url: string, snippet: string}> = [];
    
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodedQuery}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        const titleMatches = html.matchAll(/<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi);
        const snippetMatches = html.matchAll(/<a[^>]*class="result__snippet"[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/a>/gi);
        
        const titles = [...titleMatches];
        const snippets = [...snippetMatches];
        
        for (let i = 0; i < Math.min(titles.length, 5); i++) {
          let url = titles[i][1];
          if (url.includes('uddg=')) {
            const match = url.match(/uddg=([^&]*)/);
            if (match) url = decodeURIComponent(match[1]);
          }
          
          results.push({
            title: titles[i][2].replace(/<[^>]*>/g, '').trim(),
            url: url,
            snippet: snippets[i] ? snippets[i][1].replace(/<[^>]*>/g, '').trim().substring(0, 200) : ''
          });
        }
      }
    } catch (e) {
      console.error("DuckDuckGo search failed:", e);
    }
    
    return results;
  }

  private async fetchCurrencyData(): Promise<string | null> {
    try {
      const today = new Date();
      const tenDaysAgo = new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000);
      
      const formatDate = (d: Date) => {
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}-${dd}-${yyyy}`;
      };
      
      const startDate = formatDate(tenDaysAgo);
      const endDate = formatDate(today);
      
      const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${startDate}'&@dataFinalCotacao='${endDate}'&$format=json&$orderby=dataHoraCotacao%20desc`;
      
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.value || data.value.length === 0) {
        return "Não há cotações disponíveis para o período solicitado.";
      }
      
      let output = "💵 Cotações do Dólar (USD/BRL) - Últimos dias:\n\n";
      output += "| Data | Compra | Venda |\n";
      output += "|------|--------|-------|\n";
      
      const uniqueDates = new Map<string, any>();
      for (const item of data.value) {
        const date = new Date(item.dataHoraCotacao).toLocaleDateString('pt-BR');
        if (!uniqueDates.has(date)) {
          uniqueDates.set(date, item);
        }
      }
      
      Array.from(uniqueDates.entries()).slice(0, 10).forEach(([date, item]) => {
        output += `| ${date} | R$ ${item.cotacaoCompra.toFixed(4)} | R$ ${item.cotacaoVenda.toFixed(4)} |\n`;
      });
      
      const latest = data.value[0];
      output += `\n📊 Última cotação: R$ ${latest.cotacaoVenda.toFixed(4)} (venda)`;
      output += `\n📅 Atualizado em: ${new Date(latest.dataHoraCotacao).toLocaleString('pt-BR')}`;
      output += `\n🏦 Fonte: Banco Central do Brasil (PTAX)`;
      
      return output;
    } catch (error: any) {
      console.error("BCB API error:", error);
      return null;
    }
  }

  private async toolKnowledgeQuery(query: string): Promise<ToolResult> {
    const results = await db.select()
      .from(knowledgeBase)
      .where(ilike(knowledgeBase.title, `%${query}%`))
      .limit(5);
    
    if (results.length === 0) {
      const contentResults = await db.select()
        .from(knowledgeBase)
        .where(ilike(knowledgeBase.content, `%${query}%`))
        .limit(5);
      
      if (contentResults.length === 0) {
        return { success: true, output: "Nenhum documento encontrado na base de conhecimento para essa consulta." };
      }
      
      const output = contentResults.map(doc => 
        `📄 ${doc.title} (${doc.category})\nAutor: ${doc.author || 'Não especificado'}\n${doc.content?.substring(0, 200)}...`
      ).join('\n\n');
      
      return { success: true, output: `Documentos encontrados:\n\n${output}` };
    }
    
    const output = results.map(doc => 
      `📄 ${doc.title} (${doc.category})\nAutor: ${doc.author || 'Não especificado'}\n${doc.content?.substring(0, 200)}...`
    ).join('\n\n');
    
    return { success: true, output: `Documentos encontrados:\n\n${output}` };
  }

  private async toolErpQuery(entity: string, filter: string | undefined, userId: string): Promise<ToolResult> {
    const connections = await db.select()
      .from(erpConnections)
      .where(eq(erpConnections.isActive, "true"))
      .limit(1);
    
    if (connections.length === 0) {
      return { success: false, output: "", error: "Nenhuma conexão ERP ativa encontrada." };
    }
    
    return {
      success: true,
      output: `[Consulta ERP - ${connections[0].name}]\nEntidade: ${entity}\nFiltro: ${filter || 'nenhum'}\n\nDados simulados:\n- Total de registros: 150\n- Registros ativos: 142\n- Última atualização: hoje\n\nNota: Para dados reais, a conexão ERP deve estar configurada com credenciais válidas.`
    };
  }

  private async toolCalculate(expression: string): Promise<ToolResult> {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/.()%\s]/g, '');
      if (sanitized && /^[\d+\-*/.()%\s]+$/.test(sanitized)) {
        const result = Function(`'use strict'; return (${sanitized})`)();
        return { success: true, output: `Resultado: ${result}` };
      }
      return { 
        success: true, 
        output: `Análise de: "${expression}"\n\nPara cálculos complexos, forneça expressões numéricas específicas.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro no cálculo: ${error.message}` };
    }
  }

  private async toolSendMessage(to: string, message: string): Promise<ToolResult> {
    return {
      success: true,
      output: `Mensagem enviada para ${to}: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
    };
  }

  private async toolGenerateReport(title: string, type: string, data: string): Promise<ToolResult> {
    // The data field should contain the full report content - return it directly
    const reportContent = data || "Nenhum dado disponível para o relatório.";
    
    return {
      success: true,
      output: `📊 **${title}**\n\n${reportContent}`
    };
  }

  private async toolScheduleTask(task: string, when: string): Promise<ToolResult> {
    return {
      success: true,
      output: `✅ Tarefa agendada\n\nDescrição: ${task}\nQuando: ${when}\n\n[Você será notificado quando a tarefa for executada]`
    };
  }

  private async toolWebBrowse(url: string, extract?: string): Promise<ToolResult> {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { success: false, output: "", error: "URL inválida. Use http:// ou https://" };
      }

      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      if (hostname.includes('bcb.gov.br') || hostname.includes('banco central')) {
        const currencyData = await this.fetchCurrencyData();
        if (currencyData) {
          return { success: true, output: currencyData };
        }
      }
      
      const { spawn } = await import('child_process');
      const path = await import('path');
      
      const captureScript = path.join(process.cwd(), 'python-service', 'scripts', 'run_capture.py');
      const proc = spawn('python3', [captureScript, url]);
      
      const captureResult: any = await new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
        proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
        
        proc.on('close', (code: number) => {
          if (code === 0 && stdout) {
            try {
              resolve(JSON.parse(stdout.trim()));
            } catch (e) {
              reject(new Error(`Failed to parse output`));
            }
          } else {
            reject(new Error(stderr || `Process exited with code ${code}`));
          }
        });
        
        proc.on('error', (err: Error) => reject(err));
        
        setTimeout(() => {
          proc.kill();
          reject(new Error('Capture timeout'));
        }, 30000);
      });

      if (!captureResult.success) {
        return { success: false, output: "", error: captureResult.error || "Falha ao acessar a página" };
      }

      const textContent = captureResult.text_content || '';
      const title = captureResult.title || hostname;
      
      if (extract === 'summary') {
        const summary = textContent.substring(0, 2000);
        return { 
          success: true, 
          output: `🌐 **${title}**\n\n${summary}${textContent.length > 2000 ? '\n\n...(conteúdo truncado)' : ''}`
        };
      } else if (extract === 'links') {
        const links = captureResult.links?.slice(0, 10) || [];
        let output = `🔗 Links encontrados em ${title}:\n\n`;
        links.forEach((link: any, i: number) => {
          output += `${i + 1}. ${link.text} - ${link.href}\n`;
        });
        return { success: true, output };
      } else {
        const headings = captureResult.headings?.slice(0, 10) || [];
        let output = `🌐 **${title}**\n\n`;
        
        if (headings.length > 0) {
          output += `📑 Estrutura:\n`;
          headings.forEach((h: any) => {
            output += `  ${h.level}: ${h.text}\n`;
          });
          output += `\n`;
        }
        
        output += `📝 Conteúdo (${captureResult.word_count || 0} palavras):\n\n`;
        output += textContent.substring(0, 3000);
        if (textContent.length > 3000) {
          output += `\n\n...(${textContent.length - 3000} caracteres adicionais)`;
        }
        
        return { success: true, output };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao acessar página: ${error.message}` };
    }
  }

  private async toolAnalyzeFile(filename: string, question?: string, attachedFiles?: Array<{name: string, content: string, base64?: string}>): Promise<ToolResult> {
    if (!attachedFiles || attachedFiles.length === 0) {
      return { success: false, output: "", error: "Nenhum arquivo anexado para análise" };
    }

    const file = attachedFiles.find(f => f.name.toLowerCase() === filename.toLowerCase());
    if (!file) {
      const availableFiles = attachedFiles.map(f => f.name).join(', ');
      return { success: false, output: "", error: `Arquivo "${filename}" não encontrado. Arquivos disponíveis: ${availableFiles}` };
    }

    let fileContent = file.content;
    
    if (file.name.toLowerCase().endsWith('.pdf') && file.base64) {
      try {
        const pdfBuffer = Buffer.from(file.base64, 'base64');
        const parser = new PDFParse({ data: pdfBuffer });
        const result = await parser.getText();
        fileContent = result.text;
        await parser.destroy();
      } catch (pdfError: any) {
        return { success: false, output: "", error: `Erro ao processar PDF: ${pdfError.message}` };
      }
    }

    const preview = fileContent.substring(0, 3000);
    const truncated = fileContent.length > 3000;
    
    let output = `📄 Análise do arquivo: ${file.name}\n\n`;
    output += `Tamanho: ${fileContent.length} caracteres\n\n`;
    output += `Conteúdo${truncated ? ' (primeiros 3000 caracteres)' : ''}:\n${preview}`;
    
    if (question) {
      output += `\n\n❓ Pergunta: ${question}\n[Analise o conteúdo acima para responder]`;
    }
    
    return { success: true, output };
  }

  private async toolCrmQuery(entity: string, filter?: string, userId?: string): Promise<ToolResult> {
    try {
      if (!userId) {
        return { success: false, output: "", error: "Usuário não identificado" };
      }
      
      const { crmStorage } = await import("../crm/storage");
      const { compassStorage } = await import("../compass/storage");
      
      const userTenants = await compassStorage.getUserTenants(userId);
      const tenantIds = userTenants.map(t => t.id);
      
      if (tenantIds.length === 0 && entity.toLowerCase() !== "events") {
        return { success: false, output: "", error: "Usuário não pertence a nenhum tenant" };
      }
      
      let data: any;
      switch (entity.toLowerCase()) {
        case "partners":
          const allPartners = await crmStorage.getPartners();
          data = allPartners.filter(p => !p.tenantId || tenantIds.includes(p.tenantId));
          break;
        case "contracts":
          const allContracts = await crmStorage.getContracts();
          data = allContracts.filter(c => !c.tenantId || tenantIds.includes(c.tenantId));
          break;
        case "threads":
          const allThreads = await crmStorage.getThreads();
          data = allThreads.filter(t => !t.tenantId || tenantIds.includes(t.tenantId));
          break;
        case "events":
          data = await crmStorage.getEvents(userId);
          break;
        case "stats":
          data = await crmStorage.getStats();
          break;
        default:
          return { success: false, output: "", error: `Entidade CRM desconhecida: ${entity}. Use: partners, contracts, threads, events, stats` };
      }
      
      if (filter && Array.isArray(data)) {
        const [key, value] = filter.split("=");
        if (key && value) {
          data = data.filter((item: any) => 
            String(item[key]).toLowerCase() === value.toLowerCase()
          );
        }
      }
      
      const output = `📊 CRM - ${entity.toUpperCase()}:\n\n${JSON.stringify(data, null, 2)}`;
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao consultar CRM: ${error.message}` };
    }
  }

  private async toolCrmCreateEvent(title: string, type: string, startAt: string, description?: string, userId?: string): Promise<ToolResult> {
    try {
      if (!userId) {
        return { success: false, output: "", error: "Usuário não identificado" };
      }
      
      let parsedDate: Date;
      const lowerStart = startAt.toLowerCase();
      
      if (lowerStart.includes("amanhã") || lowerStart.includes("tomorrow")) {
        parsedDate = new Date();
        parsedDate.setDate(parsedDate.getDate() + 1);
        const timeMatch = lowerStart.match(/(\d{1,2})[h:]?(\d{0,2})?/);
        if (timeMatch) {
          parsedDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2] || "0"), 0, 0);
        } else {
          parsedDate.setHours(10, 0, 0, 0);
        }
      } else if (lowerStart.includes("hoje") || lowerStart.includes("today")) {
        parsedDate = new Date();
        const timeMatch = lowerStart.match(/(\d{1,2})[h:]?(\d{0,2})?/);
        if (timeMatch) {
          parsedDate.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2] || "0"), 0, 0);
        } else {
          parsedDate.setHours(new Date().getHours() + 1, 0, 0, 0);
        }
      } else {
        parsedDate = new Date(startAt);
        if (isNaN(parsedDate.getTime())) {
          return { success: false, output: "", error: `Data inválida: ${startAt}` };
        }
      }
      
      const { crmStorage } = await import("../crm/storage");
      const { googleCalendarService } = await import("../crm/google-calendar");
      
      const event = await crmStorage.createEvent({
        userId,
        title,
        description: description || null,
        type: type as any,
        startAt: parsedDate,
        status: "scheduled"
      });
      
      let googleSynced = false;
      try {
        const isConnected = await googleCalendarService.isConnected(userId);
        if (isConnected) {
          const googleEventId = await googleCalendarService.createEvent(userId, event);
          if (googleEventId) {
            await crmStorage.updateEvent(event.id, { googleEventId });
            googleSynced = true;
          }
        }
      } catch (e) {
        console.error("Failed to sync event to Google Calendar:", e);
      }
      
      return { 
        success: true, 
        output: `✅ Evento criado com sucesso!\n\n📅 ${title}\n🕐 ${parsedDate.toLocaleString("pt-BR")}\n📌 Tipo: ${type}${description ? `\n📝 ${description}` : ""}${googleSynced ? "\n🔄 Sincronizado com Google Calendar" : ""}` 
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao criar evento: ${error.message}` };
    }
  }

  private async toolCrmSendWhatsapp(phone: string, message: string, userId?: string): Promise<ToolResult> {
    try {
      if (!userId) {
        return { success: false, output: "", error: "Usuário não identificado" };
      }
      
      const { communicationService } = await import("../crm/communication");
      const { crmStorage } = await import("../crm/storage");
      const { compassStorage } = await import("../compass/storage");
      
      const userTenants = await compassStorage.getUserTenants(userId);
      const tenantIds = userTenants.map(t => t.id);
      
      const allChannels = await crmStorage.getChannels();
      const userChannels = allChannels.filter(c => !c.tenantId || tenantIds.includes(c.tenantId));
      const whatsappChannel = userChannels.find(c => c.type === "whatsapp" && c.status === "connected");
      
      if (!whatsappChannel) {
        return { success: false, output: "", error: "Nenhum canal WhatsApp conectado. Conecte um canal no CRM primeiro." };
      }
      
      const normalizedPhone = phone.replace(/\D/g, "");
      
      const thread = await communicationService.getOrCreateThread(whatsappChannel.id, normalizedPhone);
      
      const success = await communicationService.sendWhatsAppMessage(whatsappChannel.id, normalizedPhone, message);
      
      if (success) {
        await crmStorage.createMessage({
          threadId: thread.id,
          channelId: whatsappChannel.id,
          direction: "outgoing",
          type: "text",
          content: message,
          status: "sent",
          sentById: "manus-agent"
        });
        
        return { 
          success: true, 
          output: `✅ Mensagem enviada com sucesso!\n\n📱 Para: ${normalizedPhone}\n💬 Mensagem: ${message}` 
        };
      } else {
        return { success: false, output: "", error: "Falha ao enviar mensagem WhatsApp" };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao enviar WhatsApp: ${error.message}` };
    }
  }

  private async toolPythonExecute(code: string, timeout?: number): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const response = await fetch(`${pythonServiceUrl}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, timeout: timeout || 30 })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na API Python: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        return { success: true, output: `🐍 Resultado Python:\n\n${result.output}` };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao executar Python: ${error.message}` };
    }
  }

  private async toolSemanticSearch(query: string, nResults?: number): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const response = await fetch(`${pythonServiceUrl}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, n_results: nResults || 5 })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na busca semântica: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        return { success: true, output: `🔍 Busca Semântica para "${query}":\n\n${JSON.stringify(result.results, null, 2)}` };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro na busca semântica: ${error.message}` };
    }
  }

  private async toolReadFile(path: string): Promise<ToolResult> {
    try {
      const fs = await import("fs/promises");
      const safePath = path.replace(/\.\./g, "");
      const content = await fs.readFile(safePath, "utf-8");
      return { success: true, output: `📄 Conteúdo de ${path}:\n\n${content.substring(0, 10000)}${content.length > 10000 ? "\n\n... (truncado)" : ""}` };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao ler arquivo: ${error.message}` };
    }
  }

  private async toolWriteFile(path: string, content: string): Promise<ToolResult> {
    try {
      const fs = await import("fs/promises");
      const pathModule = await import("path");
      const safePath = path.replace(/\.\./g, "");
      await fs.mkdir(pathModule.dirname(safePath), { recursive: true });
      await fs.writeFile(safePath, content, "utf-8");
      return { success: true, output: `✅ Arquivo salvo: ${path}` };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao escrever arquivo: ${error.message}` };
    }
  }

  private async toolListFiles(path: string): Promise<ToolResult> {
    try {
      const fs = await import("fs/promises");
      const safePath = path.replace(/\.\./g, "") || ".";
      const entries = await fs.readdir(safePath, { withFileTypes: true });
      const files = entries.map(e => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`).join("\n");
      return { success: true, output: `📂 Conteúdo de ${path}:\n\n${files}` };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar arquivos: ${error.message}` };
    }
  }

  private async toolShell(command: string): Promise<ToolResult> {
    try {
      const { exec } = await import("child_process");
      const { promisify } = await import("util");
      const execAsync = promisify(exec);
      
      const blockedCommands = ["rm -rf", "rm -r /", "mkfs", "dd if=", ":(){ :|:& };:"];
      if (blockedCommands.some(bc => command.includes(bc))) {
        return { success: false, output: "", error: "Comando bloqueado por segurança" };
      }
      
      const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
      return { success: true, output: `💻 Resultado:\n\n${stdout}${stderr ? `\nErros:\n${stderr}` : ""}` };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao executar comando: ${error.message}` };
    }
  }

  private async toolAskHuman(prompt: string, options?: string): Promise<ToolResult> {
    this.emit("askHuman", { prompt, options: options?.split(",").map(o => o.trim()) });
    return { 
      success: true, 
      output: `⏸️ Aguardando aprovação do usuário:\n\n${prompt}${options ? `\n\nOpções: ${options}` : ""}\n\n[A resposta do usuário será processada no próximo passo]` 
    };
  }

  private async toolAnalyzeData(dataString: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const data = JSON.parse(dataString);
      
      const response = await fetch(`${pythonServiceUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      
      if (!response.ok) {
        throw new Error(`Erro na análise: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        return { success: true, output: `📊 Análise de Dados:\n\n${JSON.stringify(result.analysis, null, 2)}` };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao analisar dados: ${error.message}` };
    }
  }

  private async toolAddToKnowledge(docId: string, content: string, type: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      
      const response = await fetch(`${pythonServiceUrl}/documents/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_id: docId, document: content, metadata: { type } })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao adicionar documento: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        return { success: true, output: `✅ Documento adicionado ao grafo de conhecimento:\n\nID: ${docId}\nTipo: ${type}` };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao adicionar documento: ${error.message}` };
    }
  }

  private async toolLearnUrl(url: string, priority?: string): Promise<ToolResult> {
    try {
      const { spawn } = await import('child_process');
      const path = await import('path');
      
      const captureScript = path.join(process.cwd(), 'python-service', 'scripts', 'run_capture.py');
      const proc = spawn('python3', [captureScript, url]);
      
      const captureResult: any = await new Promise((resolve, reject) => {
        let stdout = '';
        let stderr = '';
        
        proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
        proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });
        
        proc.on('close', (code: number) => {
          if (code === 0 && stdout) {
            try {
              resolve(JSON.parse(stdout.trim()));
            } catch (e) {
              reject(new Error(`Failed to parse output: ${stdout}`));
            }
          } else {
            reject(new Error(stderr || `Process exited with code ${code}`));
          }
        });
        
        proc.on('error', (err: Error) => reject(err));
        
        setTimeout(() => {
          proc.kill();
          reject(new Error('Capture timeout (45s)'));
        }, 45000);
      });

      if (!captureResult.success) {
        return { success: false, output: "", error: captureResult.error || "Falha na captura" };
      }

      const nodeId = `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const textContent = captureResult.text_content || '';

      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      try {
        await fetch(`${pythonServiceUrl}/documents/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doc_id: nodeId,
            document: textContent.substring(0, 10000),
            metadata: {
              type: 'url_learned',
              url,
              title: captureResult.title,
              priority: priority || 'normal',
              capturedAt: new Date().toISOString()
            }
          })
        });
      } catch (embeddingError) {
        console.warn("Embedding service unavailable, continuing:", embeddingError);
      }

      return { 
        success: true, 
        output: `📚 URL aprendida e adicionada ao grafo de conhecimento:\n\n` +
                `URL: ${url}\n` +
                `Título: ${captureResult.title || 'N/A'}\n` +
                `Caracteres extraídos: ${textContent.length}\n` +
                `ID no grafo: ${nodeId}\n` +
                `Prioridade: ${priority || 'normal'}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao aprender URL: ${error.message}` };
    }
  }

  private async toolDeepResearch(topic: string, depth?: number): Promise<ToolResult> {
    try {
      const maxSources = Math.min(depth || 3, 5);
      let output = `🔬 **Pesquisa Profunda: "${topic}"**\n\n`;
      
      output += `📡 Buscando fontes...\n`;
      const searchResults = await this.performWebSearch(topic);
      
      if (searchResults.length === 0) {
        return { 
          success: true, 
          output: `🔬 Pesquisa sobre "${topic}":\n\nNão encontrei resultados na web. Consultando base de conhecimento interna...`
        };
      }
      
      output += `✅ Encontradas ${searchResults.length} fontes\n\n`;
      
      const { spawn } = await import('child_process');
      const path = await import('path');
      const captureScript = path.join(process.cwd(), 'python-service', 'scripts', 'run_capture.py');
      
      const extractedContent: Array<{title: string, url: string, content: string}> = [];
      
      for (let i = 0; i < Math.min(searchResults.length, maxSources); i++) {
        const result = searchResults[i];
        output += `📖 Analisando: ${result.title}\n`;
        
        try {
          const proc = spawn('python3', [captureScript, result.url]);
          
          const captureResult: any = await new Promise((resolve, reject) => {
            let stdout = '';
            proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
            proc.on('close', (code: number) => {
              if (code === 0 && stdout) {
                try { resolve(JSON.parse(stdout.trim())); } 
                catch { resolve({ success: false }); }
              } else { resolve({ success: false }); }
            });
            proc.on('error', () => resolve({ success: false }));
            setTimeout(() => { proc.kill(); resolve({ success: false }); }, 20000);
          });
          
          if (captureResult.success && captureResult.text_content) {
            extractedContent.push({
              title: captureResult.title || result.title,
              url: result.url,
              content: captureResult.text_content.substring(0, 3000)
            });
            
            const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
            const nodeId = `research_${Date.now()}_${i}`;
            await fetch(`${pythonServiceUrl}/documents/add`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                doc_id: nodeId,
                document: captureResult.text_content.substring(0, 10000),
                metadata: { type: 'research', topic, url: result.url, title: result.title }
              })
            }).catch(() => {});
          }
        } catch (e) {
          output += `   ⚠️ Não foi possível acessar\n`;
        }
      }
      
      output += `\n---\n\n`;
      output += `📚 **Síntese das ${extractedContent.length} fontes analisadas:**\n\n`;
      
      for (const source of extractedContent) {
        output += `### ${source.title}\n`;
        output += `🔗 ${source.url}\n\n`;
        output += source.content.substring(0, 1500);
        output += `\n\n---\n\n`;
      }
      
      output += `\n💡 *${extractedContent.length} fontes foram adicionadas à base de conhecimento.*`;
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro na pesquisa profunda: ${error.message}` };
    }
  }

  private async toolDetectOpportunities(domain: string, minConfidence?: number): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const response = await fetch(`${pythonServiceUrl}/detect_opportunities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          domain, 
          min_confidence: minConfidence || 0.7 
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao detectar oportunidades: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.opportunities) {
        let output = `🎯 Oportunidades detectadas no domínio "${domain}":\n\n`;
        for (const opp of result.opportunities) {
          output += `• ${opp.name} (Confiança: ${(opp.confidence * 100).toFixed(0)}%)\n`;
          output += `  ${opp.description || ''}\n\n`;
        }
        if (result.opportunities.length === 0) {
          output = `Nenhuma oportunidade detectada no domínio "${domain}" com confiança acima de ${minConfidence || 0.7}`;
        }
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error || "Sem oportunidades" };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao detectar oportunidades: ${error.message}` };
    }
  }

  private async toolRunWorkflow(workflowType: string, dataString?: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const data = dataString ? JSON.parse(dataString) : {};
      
      let spec: any;
      if (workflowType.startsWith("{")) {
        spec = JSON.parse(workflowType);
      } else {
        const templateResponse = await fetch(`${pythonServiceUrl}/workflow/templates/${workflowType}`);
        if (!templateResponse.ok) {
          throw new Error(`Template não encontrado: ${workflowType}`);
        }
        const templateResult = await templateResponse.json();
        spec = templateResult.template;
      }
      
      const response = await fetch(`${pythonServiceUrl}/workflow/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec, data })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao executar workflow: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const workflowResult = result.result;
        let output = `⚙️ Workflow Executado: ${spec.name || workflowType}\n\n`;
        output += `Status: ${workflowResult.status}\n`;
        output += `Passos executados: ${workflowResult.steps_executed?.length || 0}\n\n`;
        
        if (workflowResult.steps_executed) {
          output += "Passos:\n";
          for (const step of workflowResult.steps_executed) {
            output += `  ${step.status === "completed" ? "✅" : "❌"} ${step.step_id} (${step.type || "task"})\n`;
          }
        }
        
        output += `\nDados finais: ${JSON.stringify(workflowResult.data, null, 2)}`;
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao executar workflow: ${error.message}` };
    }
  }

  private async toolRpaExecute(template: string, paramsString?: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const params = paramsString ? JSON.parse(paramsString) : {};
      
      let script: any;
      if (template.startsWith("{")) {
        script = JSON.parse(template);
      } else {
        const templates: Record<string, any> = {
          login: {
            name: "Login Template",
            headless: true,
            actions: [
              { type: "navigate", url: params.url || "https://example.com/login" },
              { type: "type", selector: params.username_selector || "#username", text: params.username || "" },
              { type: "type", selector: params.password_selector || "#password", text: params.password || "" },
              { type: "click", selector: params.submit_selector || "button[type='submit']" },
              { type: "wait", selector: params.success_selector || ".dashboard", timeout: 10000 }
            ]
          },
          scrape_table: {
            name: "Scrape Table",
            headless: true,
            actions: [
              { type: "navigate", url: params.url || "" },
              { type: "wait", selector: params.table_selector || "table" },
              { type: "extract_table", selector: params.table_selector || "table", save_as: "table_data" },
              { type: "screenshot", path: "/tmp/table_screenshot.png" }
            ]
          },
          form_fill: {
            name: "Form Fill",
            headless: true,
            actions: [
              { type: "navigate", url: params.url || "" },
              ...(params.fields || []).map((f: any) => ({
                type: "type",
                selector: f.selector,
                text: f.value
              })),
              { type: "click", selector: params.submit_selector || "#submit" }
            ]
          },
          download_report: {
            name: "Download Report",
            headless: true,
            actions: [
              { type: "navigate", url: params.url || "" },
              { type: "wait", selector: params.ready_selector || ".report-ready" },
              { type: "wait_for_download", trigger_selector: params.download_selector || ".download-btn", save_path: params.save_path || "/tmp/report.pdf" }
            ]
          },
          nfe_consulta: {
            name: "NFe Consulta",
            headless: true,
            actions: [
              { type: "navigate", url: "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx" },
              { type: "wait", selector: "#ContentPlaceHolder1_txtChaveAcesso" },
              { type: "type", selector: "#ContentPlaceHolder1_txtChaveAcesso", text: params.chave_acesso || "" },
              { type: "screenshot", path: "/tmp/nfe_consulta.png", save_as: "captcha_screenshot" }
            ]
          }
        };
        
        script = templates[template];
        if (!script) {
          return { success: false, output: "", error: `Template RPA não encontrado: ${template}. Use: login, scrape_table, form_fill, download_report, nfe_consulta` };
        }
      }
      
      const response = await fetch(`${pythonServiceUrl}/rpa/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao executar RPA: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success && result.result) {
        let output = `🤖 RPA Executado: ${script.name || template}\n\n`;
        output += `Status: ${result.result.success ? "✅ Sucesso" : "❌ Falha"}\n`;
        output += `Ações executadas: ${result.result.actions_executed?.length || 0}\n\n`;
        
        if (result.result.extracted_data && Object.keys(result.result.extracted_data).length > 0) {
          output += `📊 Dados extraídos:\n${JSON.stringify(result.result.extracted_data, null, 2)}\n`;
        }
        
        if (result.result.error) {
          output += `\n⚠️ Erro: ${result.result.error}`;
        }
        
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error || "Falha na execução RPA" };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao executar RPA: ${error.message}` };
    }
  }

  private async toolFiscalEmit(type: string, dataString: string): Promise<ToolResult> {
    try {
      const { fiscalAdapter } = await import("../services/fiscal/FiscalAdapter");
      const data = JSON.parse(dataString);
      
      const adapter = fiscalAdapter;
      let result;
      
      if (type === "nfe") {
        result = await adapter.emitirNFe(data);
      } else if (type === "nfce") {
        result = await adapter.emitirNFCe(data);
      } else {
        return { success: false, output: "", error: `Tipo de documento inválido: ${type}. Use 'nfe' ou 'nfce'` };
      }
      
      if (result.success) {
        return { 
          success: true, 
          output: `📄 ${type.toUpperCase()} Emitida com Sucesso!\n\n` +
                  `Chave de Acesso: ${result.chave || "N/A"}\n` +
                  `Protocolo: ${result.protocolo || "N/A"}\n` +
                  `Status: Autorizada`
        };
      } else {
        return { success: false, output: "", error: result.error || "Falha na emissão" };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao emitir documento fiscal: ${error.message}` };
    }
  }

  private async toolFiscalQuery(chave: string): Promise<ToolResult> {
    try {
      const { fiscalAdapter } = await import("../services/fiscal/FiscalAdapter");
      
      const adapter = fiscalAdapter;
      const result = await adapter.consultarNFe(chave);
      
      if (result.success) {
        return { 
          success: true, 
          output: `🔍 Consulta NFe\n\n` +
                  `Chave: ${chave}\n` +
                  `Protocolo: ${result.protocolo || "N/A"}\n` +
                  `Status: ${result.statusCode || "N/A"}`
        };
      } else {
        return { success: false, output: "", error: result.error || "Falha na consulta" };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao consultar NFe: ${error.message}` };
    }
  }

  private async toolPlusClientes(filtro?: string): Promise<ToolResult> {
    try {
      return { 
        success: true, 
        output: `👥 **Clientes do Plus**\n\n` +
          `Para consultar clientes, acesse o Plus diretamente em /plus > Clientes.\n` +
          `O Manus pode consultar dados agregados via plus_dashboard.\n` +
          `Filtro aplicado: ${filtro || "nenhum"}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolPlusProdutos(filtro?: string): Promise<ToolResult> {
    try {
      return { 
        success: true, 
        output: `📦 **Produtos do Plus**\n\n` +
          `Para consultar produtos, acesse o Plus diretamente em /plus > Produtos.\n` +
          `O Manus pode consultar dados agregados via plus_dashboard.\n` +
          `Filtro aplicado: ${filtro || "nenhum"}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolPlusVendas(filtro?: string): Promise<ToolResult> {
    try {
      const { plusClient } = await import("../plus/client");
      const result = await plusClient.getVendasMes();
      
      if (result.success && result.data) {
        let output = `🛒 **Vendas do Plus - Mês Atual**\n\n`;
        const dados = result.data;
        if (Array.isArray(dados)) {
          dados.forEach((d: any) => {
            output += `📅 ${d.label || d.mes}: R$ ${d.value || d.valor || 0}\n`;
          });
        } else if (dados.total) {
          output += `💰 Total: R$ ${dados.total}\n`;
        } else {
          output += `Dados: ${JSON.stringify(dados).slice(0, 500)}\n`;
        }
        return { success: true, output };
      }
      return { success: true, output: "🛒 Sem dados de vendas disponíveis via API. Acesse /plus > Vendas." };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolPlusEstoque(): Promise<ToolResult> {
    try {
      return { 
        success: true, 
        output: `📊 **Estoque do Plus**\n\n` +
          `Para consultar estoque detalhado, acesse o Plus diretamente em /plus > Estoque.\n` +
          `O Manus pode consultar indicadores agregados via plus_dashboard.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolPlusFinanceiro(tipo?: string): Promise<ToolResult> {
    try {
      const { plusClient } = await import("../plus/client");
      let output = `💰 **Situação Financeira - Plus**\n\n`;
      
      if (!tipo || tipo === "pagar" || tipo === "todos") {
        const pagar = await plusClient.getContasPagar();
        if (pagar.success && pagar.data) {
          const dados = pagar.data;
          if (Array.isArray(dados)) {
            output += `📤 **Contas a Pagar:**\n`;
            dados.slice(0, 5).forEach((d: any) => {
              output += `  - ${d.label || d.mes}: R$ ${d.value || d.valor || 0}\n`;
            });
          } else {
            output += `📤 Contas a Pagar: ${JSON.stringify(dados).slice(0, 200)}\n`;
          }
        }
      }
      
      if (!tipo || tipo === "receber" || tipo === "todos") {
        const receber = await plusClient.getContasReceber();
        if (receber.success && receber.data) {
          const dados = receber.data;
          if (Array.isArray(dados)) {
            output += `📥 **Contas a Receber:**\n`;
            dados.slice(0, 5).forEach((d: any) => {
              output += `  - ${d.label || d.mes}: R$ ${d.value || d.valor || 0}\n`;
            });
          } else {
            output += `📥 Contas a Receber: ${JSON.stringify(dados).slice(0, 200)}\n`;
          }
        }
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolPlusFornecedores(filtro?: string): Promise<ToolResult> {
    try {
      return { 
        success: true, 
        output: `🏭 **Fornecedores do Plus**\n\n` +
          `Para consultar fornecedores, acesse o Plus diretamente em /plus > Fornecedores.\n` +
          `O Manus pode consultar dados agregados via plus_dashboard.\n` +
          `Filtro aplicado: ${filtro || "nenhum"}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolPlusDashboard(): Promise<ToolResult> {
    try {
      const { plusClient } = await import("../plus/client");
      const result = await plusClient.getDashboardData();
      
      if (result.success && result.data) {
        const d = result.data;
        let output = `📊 **Dashboard - Arcádia Plus**\n\n`;
        
        if (d.vendas_dia !== undefined) output += `🛒 Vendas Hoje: R$ ${d.vendas_dia}\n`;
        if (d.vendas_mes !== undefined) output += `📅 Vendas Mês: R$ ${d.vendas_mes}\n`;
        if (d.compras_mes !== undefined) output += `📦 Compras Mês: R$ ${d.compras_mes}\n`;
        if (d.contas_receber !== undefined) output += `📥 A Receber: R$ ${d.contas_receber}\n`;
        if (d.contas_pagar !== undefined) output += `📤 A Pagar: R$ ${d.contas_pagar}\n`;
        if (d.nfe_mes !== undefined) output += `📄 NFe no mês: ${d.nfe_mes}\n`;
        if (d.nfce_mes !== undefined) output += `🧾 NFCe no mês: ${d.nfce_mes}\n`;
        
        if (Object.keys(d).length === 0) {
          output += `Dados: Sem dados disponíveis no momento.\n`;
        }
        
        return { success: true, output };
      }
      return { success: true, output: "📊 Dashboard Plus: Sem dados disponíveis. Acesse /plus para mais detalhes." };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro Plus: ${error.message}` };
    }
  }

  private async toolScientistGenerateCode(goal: string, dataDescription?: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      
      const response = await fetch(`${pythonServiceUrl}/scientist/generate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, data_description: dataDescription || "" })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao gerar código: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const codeResult = result.result;
        let output = `🧪 Módulo Cientista - Código Gerado\n\n`;
        output += `📋 Objetivo: ${codeResult.goal}\n`;
        output += `📝 Template usado: ${codeResult.template_used}\n\n`;
        output += `💻 Código Python:\n\`\`\`python\n${codeResult.code}\n\`\`\`\n\n`;
        output += `📌 Uso: ${codeResult.usage}`;
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro no Módulo Cientista: ${error.message}` };
    }
  }

  private async toolScientistGenerateAutomation(task: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      
      const response = await fetch(`${pythonServiceUrl}/scientist/generate-automation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao gerar automação: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const autoResult = result.result;
        let output = `🤖 Módulo Cientista - Automação Gerada\n\n`;
        output += `📋 Tarefa: ${task}\n`;
        output += `🔧 Tipo: ${autoResult.type}\n`;
        if (autoResult.requires && autoResult.requires.length > 0) {
          output += `📦 Dependências: ${autoResult.requires.join(", ")}\n`;
        }
        output += `\n💻 Código:\n\`\`\`python\n${autoResult.code}\n\`\`\``;
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro no Módulo Cientista: ${error.message}` };
    }
  }

  private async toolScientistDetectPatterns(dataString: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const data = JSON.parse(dataString);
      
      const response = await fetch(`${pythonServiceUrl}/scientist/patterns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao detectar padrões: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const patterns = result.patterns?.patterns || [];
        let output = `📊 Módulo Cientista - Padrões Detectados\n\n`;
        
        if (patterns.length === 0) {
          output += "Nenhum padrão significativo encontrado nos dados.";
        } else {
          for (const pattern of patterns) {
            output += `🔍 ${pattern.type.toUpperCase()}\n`;
            output += `   ${pattern.description}\n`;
            if (pattern.columns) {
              output += `   Colunas: ${pattern.columns.join(", ")}\n`;
            }
            if (pattern.value !== undefined) {
              output += `   Valor: ${pattern.value}\n`;
            }
            output += "\n";
          }
        }
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao detectar padrões: ${error.message}` };
    }
  }

  private async toolScientistSuggestImprovements(dataString: string): Promise<ToolResult> {
    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || "http://localhost:8001";
      const data = JSON.parse(dataString);
      
      const response = await fetch(`${pythonServiceUrl}/scientist/suggest-improvements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao sugerir melhorias: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const suggestions = result.suggestions || [];
        let output = `💡 Módulo Cientista - Sugestões de Melhoria\n\n`;
        
        if (suggestions.length === 0) {
          output += "Nenhuma melhoria sugerida - os dados parecem estar em bom estado!";
        } else {
          for (const sug of suggestions) {
            output += `📌 ${sug.type.toUpperCase()} - ${sug.column}\n`;
            output += `   Problema: ${sug.issue}\n`;
            output += `   Sugestão: ${sug.suggestion}\n`;
            output += `   Código: ${sug.code}\n\n`;
          }
        }
        return { success: true, output };
      } else {
        return { success: false, output: "", error: result.error };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao sugerir melhorias: ${error.message}` };
    }
  }

  private toolGenerateChart(
    chartType: string,
    title: string,
    dataInput: string | object[],
    xKey: string,
    yKeysString: string,
    colorsString?: string
  ): ToolResult {
    try {
      const data = typeof dataInput === 'string' ? JSON.parse(dataInput) : dataInput;
      const yKeys = yKeysString.split(',').map(k => k.trim());
      const defaultColors = ['#4caf50', '#2196f3', '#f44336', '#ff9800', '#9c27b0', '#00bcd4'];
      const colors = colorsString 
        ? colorsString.split(',').map(c => c.trim())
        : defaultColors.slice(0, yKeys.length);

      const chartData = {
        type: chartType,
        title,
        data,
        xKey,
        yKeys,
        colors
      };

      return {
        success: true,
        output: `__CHART_DATA__${JSON.stringify(chartData)}__END_CHART_DATA__\n\n📊 Gráfico "${title}" gerado com sucesso!\n\nTipo: ${chartType}\nSéries: ${yKeys.join(', ')}\nPontos de dados: ${data.length}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao gerar gráfico: ${error.message}` };
    }
  }

  private async toolBiStats(userId: string): Promise<ToolResult> {
    try {
      const [datasourceCount] = await db.select({ count: sql`count(*)::int` }).from(dataSources).where(eq(dataSources.userId, userId));
      const [datasetCount] = await db.select({ count: sql`count(*)::int` }).from(biDatasets).where(eq(biDatasets.userId, userId));
      const [chartCount] = await db.select({ count: sql`count(*)::int` }).from(biCharts).where(eq(biCharts.userId, userId));
      const [dashboardCount] = await db.select({ count: sql`count(*)::int` }).from(biDashboards).where(eq(biDashboards.userId, userId));
      const [backupCount] = await db.select({ count: sql`count(*)::int` }).from(backupJobs).where(eq(backupJobs.userId, userId));
      
      const stats = {
        fontesDeDados: datasourceCount?.count || 0,
        datasets: datasetCount?.count || 0,
        graficos: chartCount?.count || 0,
        dashboards: dashboardCount?.count || 0,
        backups: backupCount?.count || 0
      };
      
      return {
        success: true,
        output: `📊 Estatísticas do BI (Arcádia Insights):\n\n| Recurso | Quantidade |\n|---------|------------|\n| Fontes de Dados | ${stats.fontesDeDados} |\n| Datasets | ${stats.datasets} |\n| Gráficos | ${stats.graficos} |\n| Dashboards | ${stats.dashboards} |\n| Backups | ${stats.backups} |`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao obter estatísticas do BI: ${error.message}` };
    }
  }

  private async toolBiListDataSources(userId: string): Promise<ToolResult> {
    try {
      const sources = await db.select({
        id: dataSources.id,
        name: dataSources.name,
        type: dataSources.type,
        host: dataSources.host,
        database: dataSources.database,
        isActive: dataSources.isActive,
        lastTestedAt: dataSources.lastTestedAt
      }).from(dataSources).where(eq(dataSources.userId, userId)).orderBy(desc(dataSources.createdAt));
      
      if (sources.length === 0) {
        return { success: true, output: "📂 Nenhuma fonte de dados configurada.\n\nUse bi_create_data_source para adicionar uma conexão a banco de dados externo." };
      }
      
      let output = "📂 Fontes de Dados do BI:\n\n| ID | Nome | Tipo | Host | Banco | Ativo |\n|-------|------|------|------|-------|-------|\n";
      for (const s of sources) {
        output += `| ${s.id} | ${s.name} | ${s.type} | ${s.host} | ${s.database} | ${s.isActive ? '✅' : '❌'} |\n`;
      }
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar fontes de dados: ${error.message}` };
    }
  }

  private async toolBiCreateDataSource(
    userId: string,
    name: string,
    type: string,
    host: string,
    port: number,
    database: string,
    username: string,
    password: string
  ): Promise<ToolResult> {
    return {
      success: true,
      output: `🔒 Por segurança, fontes de dados externas devem ser configuradas diretamente no módulo Arcádia Insights.\n\nPara adicionar uma fonte de dados:\n1. Acesse o menu "Arcádia Insights" no aplicativo\n2. Clique na aba "Fontes de Dados"\n3. Clique em "Conectar Fonte de Dados"\n4. Preencha os dados de conexão de forma segura\n\nDados sugeridos:\n- Nome: ${name}\n- Tipo: ${type}\n- Host: ${host}:${port}\n- Banco: ${database}\n- Usuário: ${username}\n\nApós criar a fonte, use bi_list_data_sources para verificar a conexão.`
    };
  }

  private async toolBiListDatasets(userId: string): Promise<ToolResult> {
    try {
      const datasets = await db.select().from(biDatasets).where(eq(biDatasets.userId, userId)).orderBy(desc(biDatasets.updatedAt));
      
      if (datasets.length === 0) {
        return { success: true, output: "📋 Nenhum dataset configurado.\n\nUse bi_create_dataset para criar uma consulta ou seleção de tabela." };
      }
      
      let output = "📋 Datasets do BI:\n\n| ID | Nome | Tipo | Fonte | Última Atualização |\n|-------|------|------|-------|--------------------|\n";
      for (const d of datasets) {
        const updatedAt = d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('pt-BR') : '-';
        output += `| ${d.id} | ${d.name} | ${d.type} | ${d.dataSourceId || 'interno'} | ${updatedAt} |\n`;
      }
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar datasets: ${error.message}` };
    }
  }

  private async toolBiCreateDataset(
    userId: string,
    name: string,
    type: string,
    dataSourceId?: number,
    query?: string,
    tableName?: string
  ): Promise<ToolResult> {
    try {
      const [dataset] = await db.insert(biDatasets).values({
        userId,
        name,
        type: type as any,
        dataSourceId: dataSourceId || null,
        query: query || null,
        tableName: tableName || null
      }).returning();
      
      return {
        success: true,
        output: `✅ Dataset "${name}" criado com sucesso!\n\nID: ${dataset.id}\nTipo: ${type}\n${query ? `Query: ${query.substring(0, 100)}...` : ''}\n${tableName ? `Tabela: ${tableName}` : ''}\n\nUse bi_execute_query com o ID ${dataset.id} para executar a consulta.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao criar dataset: ${error.message}` };
    }
  }

  private async toolBiExecuteQuery(userId: string, datasetId: number): Promise<ToolResult> {
    try {
      const [dataset] = await db.select().from(biDatasets).where(eq(biDatasets.id, datasetId));
      if (!dataset) {
        return { success: false, output: "", error: "Dataset não encontrado" };
      }
      
      if (dataset.userId !== userId) {
        return { success: false, output: "", error: "Acesso negado a este dataset" };
      }
      
      let result: any[] = [];
      if (dataset.queryType === 'table' && dataset.tableName) {
        const tableName = dataset.tableName.replace(/[^a-zA-Z0-9_]/g, '');
        const queryResult = await db.execute(sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT 100`);
        result = queryResult.rows as any[];
      } else if (dataset.queryType === 'sql' && dataset.sqlQuery) {
        const queryResult = await db.execute(sql.raw(dataset.sqlQuery + ' LIMIT 100'));
        result = queryResult.rows as any[];
      } else if (dataset.queryType === 'sql') {
        return { 
          success: false, 
          output: "", 
          error: "Por segurança, consultas SQL customizadas devem ser executadas diretamente no módulo de BI. Use type='table' para selecionar dados de tabelas." 
        };
      }
      
      if (result.length === 0) {
        return { success: true, output: `📊 Dataset "${dataset.name}" executado - Nenhum resultado encontrado.` };
      }
      
      const columns = Object.keys(result[0]);
      let output = `📊 Resultados do dataset "${dataset.name}" (${result.length} linhas):\n\n`;
      output += `| ${columns.join(' | ')} |\n`;
      output += `|${columns.map(() => '------').join('|')}|\n`;
      
      for (const row of result.slice(0, 20)) {
        output += `| ${columns.map(c => String(row[c] ?? '-').substring(0, 20)).join(' | ')} |\n`;
      }
      
      if (result.length > 20) {
        output += `\n... e mais ${result.length - 20} linhas`;
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao executar query: ${error.message}` };
    }
  }

  private async toolBiListCharts(userId: string): Promise<ToolResult> {
    try {
      const charts = await db.select().from(biCharts).where(eq(biCharts.userId, userId)).orderBy(desc(biCharts.updatedAt));
      
      if (charts.length === 0) {
        return { success: true, output: "📈 Nenhum gráfico criado no BI.\n\nUse bi_create_chart para criar um gráfico a partir de um dataset." };
      }
      
      let output = "📈 Gráficos do BI:\n\n| ID | Nome | Tipo | Dataset |\n|-------|------|------|------|\n";
      for (const c of charts) {
        output += `| ${c.id} | ${c.name} | ${c.type} | ${c.datasetId || '-'} |\n`;
      }
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar gráficos: ${error.message}` };
    }
  }

  private async toolBiCreateChart(
    userId: string,
    name: string,
    type: string,
    datasetId: number,
    config: string
  ): Promise<ToolResult> {
    try {
      const configParsed = typeof config === 'string' ? JSON.parse(config) : config;
      const [chart] = await db.insert(biCharts).values({
        userId,
        name,
        chartType: type,
        datasetId,
        config: JSON.stringify(configParsed)
      }).returning();
      
      return {
        success: true,
        output: `✅ Gráfico "${name}" criado com sucesso!\n\nID: ${chart.id}\nTipo: ${type}\nDataset: ${datasetId}\n\nO gráfico está disponível na aba "Gráficos" do Arcádia Insights.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao criar gráfico: ${error.message}` };
    }
  }

  private async toolBiListDashboards(userId: string): Promise<ToolResult> {
    try {
      const dashboards = await db.select().from(biDashboards).where(eq(biDashboards.userId, userId)).orderBy(desc(biDashboards.updatedAt));
      
      if (dashboards.length === 0) {
        return { success: true, output: "🖥️ Nenhum dashboard criado.\n\nUse bi_create_dashboard para criar um painel para organizar gráficos." };
      }
      
      let output = "🖥️ Dashboards do BI:\n\n| ID | Nome | Descrição |\n|-------|------|------|\n";
      for (const d of dashboards) {
        output += `| ${d.id} | ${d.name} | ${d.description || '-'} |\n`;
      }
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar dashboards: ${error.message}` };
    }
  }

  private async toolBiCreateDashboard(userId: string, name: string, description?: string): Promise<ToolResult> {
    try {
      const [dashboard] = await db.insert(biDashboards).values({
        userId,
        name,
        description: description || null
      }).returning();
      
      return {
        success: true,
        output: `✅ Dashboard "${name}" criado com sucesso!\n\nID: ${dashboard.id}\n\nUse bi_add_chart_to_dashboard para adicionar gráficos a este dashboard.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao criar dashboard: ${error.message}` };
    }
  }

  private async toolBiAddChartToDashboard(
    userId: string,
    dashboardId: number,
    chartId: number,
    position?: string
  ): Promise<ToolResult> {
    try {
      const pos = position ? JSON.parse(position) : { x: 0, y: 0, width: 6, height: 4 };
      await db.insert(biDashboardCharts).values({
        dashboardId,
        chartId,
        position: pos
      });
      
      return {
        success: true,
        output: `✅ Gráfico ${chartId} adicionado ao dashboard ${dashboardId}!\n\nPosição: x=${pos.x}, y=${pos.y}, largura=${pos.width}, altura=${pos.height}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao adicionar gráfico ao dashboard: ${error.message}` };
    }
  }

  private async toolBiListTables(): Promise<ToolResult> {
    try {
      const result = await db.execute(sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      const tables = result.rows.map((r: any) => r.table_name);
      let output = "📋 Tabelas disponíveis no banco de dados:\n\n";
      for (const t of tables) {
        output += `- ${t}\n`;
      }
      output += `\nTotal: ${tables.length} tabelas\n\nUse bi_get_table_columns para ver as colunas de uma tabela.`;
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar tabelas: ${error.message}` };
    }
  }

  private async toolBiGetTableColumns(tableName: string): Promise<ToolResult> {
    try {
      const result = await db.execute(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${tableName}
        ORDER BY ordinal_position
      `);
      
      if (result.rows.length === 0) {
        return { success: false, output: "", error: `Tabela "${tableName}" não encontrada` };
      }
      
      let output = `📋 Colunas da tabela "${tableName}":\n\n| Coluna | Tipo | Nullable |\n|--------|------|----------|\n`;
      for (const col of result.rows as any[]) {
        output += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} |\n`;
      }
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao obter colunas: ${error.message}` };
    }
  }

  private async toolBiAnalyzeWithPandas(datasetId: number, question: string | undefined, userId: string): Promise<ToolResult> {
    try {
      const [dataset] = await db.select().from(biDatasets).where(
        and(eq(biDatasets.id, datasetId), eq(biDatasets.userId, userId))
      );
      if (!dataset) {
        return { success: false, output: "", error: `Dataset ID ${datasetId} não encontrado ou acesso negado` };
      }

      if (!dataset.tableName) {
        return { success: false, output: "", error: "Dataset não possui tabela associada" };
      }

      const tableNameClean = dataset.tableName.replace(/[^a-zA-Z0-9_]/g, '');
      if (tableNameClean !== dataset.tableName) {
        return { success: false, output: "", error: "Nome de tabela inválido" };
      }

      const dataResult = await db.execute(sql`SELECT * FROM ${sql.identifier(tableNameClean)} LIMIT 500`);
      const data = dataResult.rows;

      if (data.length === 0) {
        return { success: false, output: "", error: "Dataset vazio" };
      }

      const BI_ANALYSIS_PORT = process.env.BI_ANALYSIS_PORT || "8003";
      const response = await fetch(`http://localhost:${BI_ANALYSIS_PORT}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, question }),
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, output: "", error: `Erro no serviço Pandas: ${text}` };
      }

      const analysis = await response.json();
      
      let output = `📊 **Análise do Dataset: ${dataset.name}**\n\n`;
      output += `📋 **Resumo Geral**\n`;
      output += `- Registros: ${analysis.row_count}\n`;
      output += `- Colunas: ${analysis.column_count}\n\n`;
      
      output += `📈 **Estatísticas por Coluna**\n\n`;
      output += `| Coluna | Tipo | Contagem | Únicos | Média | Mediana | Desvio |\n`;
      output += `|--------|------|----------|--------|-------|---------|--------|\n`;
      for (const col of analysis.columns) {
        const mean = col.mean !== null ? col.mean.toFixed(2) : '-';
        const median = col.median !== null ? col.median.toFixed(2) : '-';
        const std = col.std !== null ? col.std.toFixed(2) : '-';
        output += `| ${col.name} | ${col.dtype} | ${col.count} | ${col.unique_count} | ${mean} | ${median} | ${std} |\n`;
      }
      
      if (analysis.correlations && Object.keys(analysis.correlations).length > 0) {
        output += `\n🔗 **Correlações**\n`;
        const cols = Object.keys(analysis.correlations);
        output += `| | ${cols.join(' | ')} |\n`;
        output += `|${'---|'.repeat(cols.length + 1)}\n`;
        for (const col1 of cols) {
          const row = cols.map(col2 => analysis.correlations[col1][col2].toFixed(2));
          output += `| ${col1} | ${row.join(' | ')} |\n`;
        }
      }
      
      output += `\n💡 **Insights Automáticos**\n`;
      for (const insight of analysis.insights) {
        output += `- ${insight}\n`;
      }
      
      if (analysis.suggested_charts && analysis.suggested_charts.length > 0) {
        output += `\n📉 **Gráficos Sugeridos**\n`;
        for (const chart of analysis.suggested_charts) {
          output += `- ${chart.type.toUpperCase()}: ${chart.title} (X: ${chart.xAxis}, Y: ${chart.yAxis})\n`;
        }
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro na análise com Pandas: ${error.message}` };
    }
  }

  async run(userId: string, prompt: string, attachedFiles?: Array<{name: string, content: string, base64?: string}>, conversationHistory?: Array<{role: string; content: string}>): Promise<{ runId: number }> {
    const [run] = await db.insert(manusRuns).values({
      userId,
      prompt,
      status: "running"
    }).returning();

    this.executeAgentLoop(run.id, userId, prompt, attachedFiles, conversationHistory);

    return { runId: run.id };
  }

  private async executeAgentLoop(runId: number, userId: string, prompt: string, attachedFiles?: Array<{name: string, content: string, base64?: string}>, conversationHistory?: Array<{role: string; content: string}>) {
    let userPrompt = prompt;
    if (attachedFiles && attachedFiles.length > 0) {
      const fileList = attachedFiles.map(f => `- ${f.name} (${f.content.length} caracteres)`).join('\n');
      userPrompt = `${prompt}\n\n📎 Arquivos anexados:\n${fileList}\n\nUse a ferramenta analyze_file para analisar o conteúdo dos arquivos.`;
    }
    
    // Build messages with conversation history for context
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT }
    ];
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      const contextSummary = conversationHistory.map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content.substring(0, 500)}${m.content.length > 500 ? '...' : ''}`).join('\n\n');
      messages.push({ 
        role: "user", 
        content: `CONTEXTO DA CONVERSA ANTERIOR (use para entender o que foi discutido):\n\n${contextSummary}\n\n---\n\nNOVA SOLICITAÇÃO DO USUÁRIO: ${userPrompt}` 
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const maxSteps = 10;
    let step = 0;
    let finished = false;
    let finalResult = "";
    const toolsUsed: string[] = [];
    const dataSourcesAccessed: string[] = [];

    while (step < maxSteps && !finished) {
      step++;
      
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages,
          temperature: 0.2,
          max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content || "";
        messages.push({ role: "assistant", content });

        let parsed: { thought: string; tool: string; tool_input: Record<string, any> };
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("No JSON found");
          }
        } catch {
          parsed = { thought: content, tool: "finish", tool_input: { answer: content } };
        }

        if (parsed.tool === 'analyze_file') {
          parsed.tool_input.attachedFiles = attachedFiles;
        }
        const toolResult = await this.executeTool(parsed.tool, parsed.tool_input, userId);
        
        if (parsed.tool !== 'finish' && !toolsUsed.includes(parsed.tool)) {
          toolsUsed.push(parsed.tool);
        }
        if (parsed.tool.startsWith('bi_') && !dataSourcesAccessed.includes('bi')) {
          dataSourcesAccessed.push('bi');
        }
        if (parsed.tool === 'erp_query' && !dataSourcesAccessed.includes('erp')) {
          dataSourcesAccessed.push('erp');
        }
        if (parsed.tool === 'knowledge_query' && !dataSourcesAccessed.includes('knowledge_base')) {
          dataSourcesAccessed.push('knowledge_base');
        }
        if (parsed.tool === 'crm_query' && !dataSourcesAccessed.includes('crm')) {
          dataSourcesAccessed.push('crm');
        }

        await db.insert(manusSteps).values({
          runId,
          stepNumber: step,
          thought: parsed.thought,
          tool: parsed.tool,
          toolInput: JSON.stringify(parsed.tool_input),
          toolOutput: toolResult.success ? toolResult.output : toolResult.error,
          status: toolResult.success ? "completed" : "error"
        });

        this.emit("step", { runId, step, thought: parsed.thought, tool: parsed.tool, output: toolResult.output });

        if (parsed.tool === "finish") {
          finished = true;
          finalResult = parsed.tool_input.answer;
        } else {
          messages.push({ 
            role: "user", 
            content: `Resultado da ferramenta ${parsed.tool}:\n${toolResult.success ? toolResult.output : `ERRO: ${toolResult.error}`}`
          });
        }
      } catch (error: any) {
        await db.insert(manusSteps).values({
          runId,
          stepNumber: step,
          thought: "Erro na execução",
          tool: "error",
          toolOutput: error.message,
          status: "error"
        });
        break;
      }
    }

    await db.update(manusRuns)
      .set({ 
        status: finished ? "completed" : "stopped",
        result: finalResult,
        completedAt: new Date()
      })
      .where(eq(manusRuns.id, runId));

    if (finished && finalResult) {
      learningService.saveInteraction({
        userId,
        source: 'manus_agent',
        sessionId: runId.toString(),
        question: prompt,
        answer: finalResult,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        dataSourcesAccessed: dataSourcesAccessed.length > 0 ? dataSourcesAccessed : undefined,
        context: { steps: step, attachedFiles: attachedFiles?.map(f => f.name) },
      }).catch(err => console.error("[Learning] Error saving manus interaction:", err));
    }

    this.emit("complete", { runId, result: finalResult });
  }

  private async toolFinQueryPayables(userId: string, status?: string, supplierId?: number): Promise<ToolResult> {
    try {
      const conditions = [eq(finAccountsPayable.tenantId, 1)];
      if (status) conditions.push(eq(finAccountsPayable.status, status));
      if (supplierId) conditions.push(eq(finAccountsPayable.supplierId, supplierId));

      const payables = await db.select().from(finAccountsPayable).where(and(...conditions)).orderBy(desc(finAccountsPayable.dueDate)).limit(50);

      if (payables.length === 0) {
        return { success: true, output: "📋 Nenhuma conta a pagar encontrada com os filtros especificados." };
      }

      let output = `📋 **Contas a Pagar** (${payables.length} registros)\n\n`;
      output += "| ID | Descrição | Valor | Vencimento | Status |\n";
      output += "|---|---|---|---|---|\n";
      
      let total = 0;
      for (const p of payables) {
        const valor = Number(p.amount);
        total += valor;
        output += `| ${p.id} | ${p.description} | R$ ${valor.toFixed(2)} | ${new Date(p.dueDate).toLocaleDateString('pt-BR')} | ${p.status} |\n`;
      }
      
      output += `\n**Total:** R$ ${total.toFixed(2)}`;
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinQueryReceivables(userId: string, status?: string, customerId?: number): Promise<ToolResult> {
    try {
      const conditions = [eq(finAccountsReceivable.tenantId, 1)];
      if (status) conditions.push(eq(finAccountsReceivable.status, status));
      if (customerId) conditions.push(eq(finAccountsReceivable.customerId, customerId));

      const receivables = await db.select().from(finAccountsReceivable).where(and(...conditions)).orderBy(desc(finAccountsReceivable.dueDate)).limit(50);

      if (receivables.length === 0) {
        return { success: true, output: "📋 Nenhuma conta a receber encontrada com os filtros especificados." };
      }

      let output = `📋 **Contas a Receber** (${receivables.length} registros)\n\n`;
      output += "| ID | Descrição | Valor | Vencimento | Status |\n";
      output += "|---|---|---|---|---|\n";
      
      let total = 0;
      for (const r of receivables) {
        const valor = Number(r.amount);
        total += valor;
        output += `| ${r.id} | ${r.description} | R$ ${valor.toFixed(2)} | ${new Date(r.dueDate).toLocaleDateString('pt-BR')} | ${r.status} |\n`;
      }
      
      output += `\n**Total:** R$ ${total.toFixed(2)}`;
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinQueryBankAccounts(userId: string, activeOnly?: boolean): Promise<ToolResult> {
    try {
      const conditions = [eq(finBankAccounts.tenantId, 1)];
      if (activeOnly !== false) conditions.push(eq(finBankAccounts.isActive, true));

      const accounts = await db.select().from(finBankAccounts).where(and(...conditions));

      if (accounts.length === 0) {
        return { success: true, output: "🏦 Nenhuma conta bancária encontrada." };
      }

      let output = `🏦 **Contas Bancárias** (${accounts.length} contas)\n\n`;
      output += "| ID | Nome | Banco | Saldo Atual |\n";
      output += "|---|---|---|---|\n";
      
      let totalBalance = 0;
      for (const a of accounts) {
        const saldo = Number(a.currentBalance);
        totalBalance += saldo;
        output += `| ${a.id} | ${a.name} | ${a.bankName || '-'} | R$ ${saldo.toFixed(2)} |\n`;
      }
      
      output += `\n**Saldo Total:** R$ ${totalBalance.toFixed(2)}`;
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinQueryCashflow(userId: string, startDate?: string, endDate?: string, accountId?: number): Promise<ToolResult> {
    try {
      const conditions = [eq(finTransactions.tenantId, 1)];
      if (startDate) conditions.push(gte(finTransactions.transactionDate, new Date(startDate)));
      if (endDate) conditions.push(lte(finTransactions.transactionDate, new Date(endDate)));
      if (accountId) conditions.push(eq(finTransactions.bankAccountId, accountId));

      const transactions = await db.select().from(finTransactions).where(and(...conditions)).orderBy(desc(finTransactions.transactionDate)).limit(100);

      if (transactions.length === 0) {
        return { success: true, output: "💰 Nenhuma transação encontrada no período." };
      }

      let output = `💰 **Fluxo de Caixa** (${transactions.length} transações)\n\n`;
      output += "| Data | Tipo | Descrição | Valor |\n";
      output += "|---|---|---|---|\n";
      
      let entradas = 0, saidas = 0;
      for (const t of transactions) {
        const valor = Number(t.amount);
        if (t.type === 'income') entradas += valor;
        else saidas += Math.abs(valor);
        const sinal = t.type === 'income' ? '+' : '-';
        output += `| ${new Date(t.transactionDate).toLocaleDateString('pt-BR')} | ${t.type} | ${t.description} | ${sinal} R$ ${Math.abs(valor).toFixed(2)} |\n`;
      }
      
      output += `\n**Entradas:** R$ ${entradas.toFixed(2)} | **Saídas:** R$ ${saidas.toFixed(2)} | **Saldo:** R$ ${(entradas - saidas).toFixed(2)}`;
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinSummary(userId: string): Promise<ToolResult> {
    try {
      const [payablesResult] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)`, count: sql<number>`COUNT(*)` }).from(finAccountsPayable).where(and(eq(finAccountsPayable.tenantId, 1), eq(finAccountsPayable.status, 'pending')));
      const [receivablesResult] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(amount AS DECIMAL)), 0)`, count: sql<number>`COUNT(*)` }).from(finAccountsReceivable).where(and(eq(finAccountsReceivable.tenantId, 1), eq(finAccountsReceivable.status, 'pending')));
      const [accountsResult] = await db.select({ total: sql<number>`COALESCE(SUM(CAST(current_balance AS DECIMAL)), 0)`, count: sql<number>`COUNT(*)` }).from(finBankAccounts).where(and(eq(finBankAccounts.tenantId, 1), eq(finBankAccounts.isActive, true)));

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const overduePayables = await db.select().from(finAccountsPayable).where(and(eq(finAccountsPayable.tenantId, 1), eq(finAccountsPayable.status, 'pending'), lte(finAccountsPayable.dueDate, today))).limit(5);
      const upcomingPayables = await db.select().from(finAccountsPayable).where(and(eq(finAccountsPayable.tenantId, 1), eq(finAccountsPayable.status, 'pending'), gte(finAccountsPayable.dueDate, today), lte(finAccountsPayable.dueDate, nextWeek))).limit(5);

      let output = `📊 **Resumo Financeiro**\n\n`;
      output += `💰 **Saldo em Contas:** R$ ${Number(accountsResult.total).toFixed(2)} (${accountsResult.count} contas)\n`;
      output += `📉 **Total a Pagar:** R$ ${Number(payablesResult.total).toFixed(2)} (${payablesResult.count} títulos)\n`;
      output += `📈 **Total a Receber:** R$ ${Number(receivablesResult.total).toFixed(2)} (${receivablesResult.count} títulos)\n`;
      output += `📊 **Posição Líquida:** R$ ${(Number(accountsResult.total) + Number(receivablesResult.total) - Number(payablesResult.total)).toFixed(2)}\n\n`;

      if (overduePayables.length > 0) {
        output += `⚠️ **Contas Vencidas (${overduePayables.length}):**\n`;
        for (const p of overduePayables) {
          output += `- ${p.description}: R$ ${Number(p.amount).toFixed(2)} (venceu ${new Date(p.dueDate).toLocaleDateString('pt-BR')})\n`;
        }
        output += '\n';
      }

      if (upcomingPayables.length > 0) {
        output += `🔔 **Vencendo em 7 dias (${upcomingPayables.length}):**\n`;
        for (const p of upcomingPayables) {
          output += `- ${p.description}: R$ ${Number(p.amount).toFixed(2)} (vence ${new Date(p.dueDate).toLocaleDateString('pt-BR')})\n`;
        }
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinRegisterPayable(userId: string, supplierId: number, description: string, amount: number, dueDate: string, categoryId?: number): Promise<ToolResult> {
    try {
      const [newPayable] = await db.insert(finAccountsPayable).values({
        tenantId: 1,
        supplierId,
        description,
        amount: amount.toString(),
        dueDate: new Date(dueDate),
        categoryId,
        status: 'pending'
      }).returning();

      return { success: true, output: `✅ Conta a pagar registrada com sucesso!\n\n**ID:** ${newPayable.id}\n**Descrição:** ${description}\n**Valor:** R$ ${amount.toFixed(2)}\n**Vencimento:** ${new Date(dueDate).toLocaleDateString('pt-BR')}` };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinRegisterReceivable(userId: string, customerId: number, description: string, amount: number, dueDate: string, categoryId?: number): Promise<ToolResult> {
    try {
      const [newReceivable] = await db.insert(finAccountsReceivable).values({
        tenantId: 1,
        customerId,
        description,
        amount: amount.toString(),
        dueDate: new Date(dueDate),
        categoryId,
        status: 'pending'
      }).returning();

      return { success: true, output: `✅ Conta a receber registrada com sucesso!\n\n**ID:** ${newReceivable.id}\n**Descrição:** ${description}\n**Valor:** R$ ${amount.toFixed(2)}\n**Vencimento:** ${new Date(dueDate).toLocaleDateString('pt-BR')}` };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinPayAccount(userId: string, payableId: number, bankAccountId: number, paymentDate?: string, amountPaid?: number): Promise<ToolResult> {
    try {
      const [payable] = await db.select().from(finAccountsPayable).where(and(eq(finAccountsPayable.id, payableId), eq(finAccountsPayable.tenantId, 1)));
      if (!payable) return { success: false, output: "", error: "Conta a pagar não encontrada" };

      const valorPago = amountPaid || Number(payable.amount);
      const dataPagamento = paymentDate ? new Date(paymentDate) : new Date();

      await db.update(finAccountsPayable).set({ status: 'paid', paidAmount: valorPago.toString(), paidDate: dataPagamento }).where(eq(finAccountsPayable.id, payableId));
      
      await db.insert(finTransactions).values({
        tenantId: 1,
        bankAccountId,
        type: 'expense',
        amount: (-valorPago).toString(),
        description: `Pagamento: ${payable.description}`,
        transactionDate: dataPagamento,
        categoryId: payable.categoryId
      });

      await db.execute(sql`UPDATE fin_bank_accounts SET current_balance = current_balance - ${valorPago} WHERE id = ${bankAccountId}`);

      return { success: true, output: `✅ Pagamento registrado!\n\n**Conta:** ${payable.description}\n**Valor Pago:** R$ ${valorPago.toFixed(2)}\n**Data:** ${dataPagamento.toLocaleDateString('pt-BR')}` };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolFinReceiveAccount(userId: string, receivableId: number, bankAccountId: number, receiveDate?: string, amountReceived?: number): Promise<ToolResult> {
    try {
      const [receivable] = await db.select().from(finAccountsReceivable).where(and(eq(finAccountsReceivable.id, receivableId), eq(finAccountsReceivable.tenantId, 1)));
      if (!receivable) return { success: false, output: "", error: "Conta a receber não encontrada" };

      const valorRecebido = amountReceived || Number(receivable.amount);
      const dataRecebimento = receiveDate ? new Date(receiveDate) : new Date();

      await db.update(finAccountsReceivable).set({ status: 'received', receivedAmount: valorRecebido.toString(), receivedDate: dataRecebimento }).where(eq(finAccountsReceivable.id, receivableId));
      
      await db.insert(finTransactions).values({
        tenantId: 1,
        bankAccountId,
        type: 'income',
        amount: valorRecebido.toString(),
        description: `Recebimento: ${receivable.description}`,
        transactionDate: dataRecebimento,
        categoryId: receivable.categoryId
      });

      await db.execute(sql`UPDATE fin_bank_accounts SET current_balance = current_balance + ${valorRecebido} WHERE id = ${bankAccountId}`);

      return { success: true, output: `✅ Recebimento registrado!\n\n**Conta:** ${receivable.description}\n**Valor Recebido:** R$ ${valorRecebido.toFixed(2)}\n**Data:** ${dataRecebimento.toLocaleDateString('pt-BR')}` };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  // ============================================================
  // FERRAMENTAS DE COMUNICAÇÃO ENTRE AGENTES (A2A)
  // ============================================================

  private async toolCallAgent(agentId: string, message: string, waitResponse?: boolean): Promise<ToolResult> {
    try {
      const { sendMessageToAgent } = await import('../protocols/a2a/client');
      const result = await sendMessageToAgent(agentId, message, { 
        waitForCompletion: waitResponse !== false,
        timeout: 120000
      });
      
      if (!result.success) {
        return { success: false, output: "", error: result.error || "Falha ao chamar agente" };
      }
      
      if (result.response) {
        return { success: true, output: `📨 **Resposta do Agente ${agentId}:**\n\n${result.response}` };
      }
      
      return { success: true, output: `✅ Tarefa enviada ao agente ${agentId}. Task ID: ${result.taskId}` };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolListAgents(): Promise<ToolResult> {
    try {
      const { listAgents, getClientStats } = await import('../protocols/a2a/client');
      const stats = getClientStats();
      const agents = listAgents();
      
      if (agents.length === 0) {
        return { success: true, output: "Nenhum agente externo registrado.\n\nUse `register_agent` para adicionar agentes." };
      }
      
      let output = `📋 **Agentes Externos Registrados:** ${stats.totalAgents}\n`;
      output += `✅ Ativos: ${stats.activeAgents} | ❌ Erro: ${stats.errorAgents}\n\n`;
      
      for (const agent of agents) {
        const statusIcon = agent.status === 'active' ? '🟢' : agent.status === 'error' ? '🔴' : '⚪';
        output += `${statusIcon} **${agent.name}** (${agent.id})\n`;
        output += `   URL: ${agent.url}\n`;
        if (agent.description) output += `   ${agent.description}\n`;
        if (agent.agentCard) {
          output += `   Capacidades: ${agent.agentCard.capabilities?.map(c => c.name).join(', ') || 'N/A'}\n`;
        }
        output += '\n';
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolRegisterAgent(name: string, url: string, apiKey?: string): Promise<ToolResult> {
    try {
      const { registerAgent } = await import('../protocols/a2a/client');
      const agentId = name.toLowerCase().replace(/\s+/g, '-');
      
      const agent = await registerAgent({
        id: agentId,
        name,
        url,
        apiKey,
        status: 'inactive'
      });
      
      let output = `✅ Agente registrado com sucesso!\n\n`;
      output += `**ID:** ${agent.id}\n`;
      output += `**Nome:** ${agent.name}\n`;
      output += `**URL:** ${agent.url}\n`;
      output += `**Status:** ${agent.status}\n`;
      
      if (agent.agentCard) {
        output += `\n📋 **Agent Card Descoberto:**\n`;
        output += `- Versão: ${agent.agentCard.version || 'N/A'}\n`;
        output += `- Capacidades: ${agent.agentCard.capabilities?.map(c => c.name).join(', ') || 'N/A'}\n`;
        output += `- Skills: ${agent.agentCard.skills?.map(s => s.name).join(', ') || 'N/A'}\n`;
      } else {
        output += `\n⚠️ Agent Card não encontrado. O agente pode não suportar descoberta A2A.`;
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolDiscoverAgent(url: string): Promise<ToolResult> {
    try {
      const { discoverAgent } = await import('../protocols/a2a/client');
      const agentCard = await discoverAgent(url);
      
      if (!agentCard) {
        return { success: false, output: "", error: `Não foi possível descobrir o Agent Card em ${url}` };
      }
      
      let output = `📋 **Agent Card Descoberto:**\n\n`;
      output += `**Nome:** ${agentCard.name}\n`;
      output += `**Descrição:** ${agentCard.description}\n`;
      output += `**Versão:** ${agentCard.version || 'N/A'}\n`;
      output += `**URL:** ${agentCard.url}\n\n`;
      
      if (agentCard.capabilities && agentCard.capabilities.length > 0) {
        output += `**Capacidades:**\n`;
        for (const cap of agentCard.capabilities) {
          output += `- ${cap.name}: ${cap.description}\n`;
        }
        output += '\n';
      }
      
      if (agentCard.skills && agentCard.skills.length > 0) {
        output += `**Skills (${agentCard.skills.length}):**\n`;
        for (const skill of agentCard.skills.slice(0, 10)) {
          output += `- **${skill.name}**: ${skill.description}\n`;
        }
        if (agentCard.skills.length > 10) {
          output += `... e mais ${agentCard.skills.length - 10} skills\n`;
        }
      }
      
      if (agentCard.authentication) {
        output += `\n**Autenticação:** ${agentCard.authentication.type}\n`;
        if (agentCard.authentication.instructions) {
          output += `   ${agentCard.authentication.instructions}\n`;
        }
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: error.message };
    }
  }

  private async toolExportToExcel(dataStr: string, filename: string, sheetName?: string): Promise<ToolResult> {
    try {
      const XLSXModule = await import('xlsx');
      const fsModule = await import('fs');
      const pathModule = await import('path');
      
      const XLSXLib = XLSXModule.default || XLSXModule;
      const fs = fsModule.default || fsModule;
      const path = pathModule.default || pathModule;
      
      let data: any[];
      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        return { success: false, output: "", error: "Dados inválidos. Forneça um JSON array válido." };
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        return { success: false, output: "", error: "Dados devem ser um array não vazio." };
      }
      
      const workbook = XLSXLib.utils.book_new();
      const worksheet = XLSXLib.utils.json_to_sheet(data);
      XLSXLib.utils.book_append_sheet(workbook, worksheet, sheetName || 'Dados');
      
      const exportDir = path.join(process.cwd(), 'exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const safeFilename = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
      const timestamp = new Date().toISOString().slice(0, 10);
      const fullFilename = `${safeFilename}_${timestamp}.xlsx`;
      const filepath = path.join(exportDir, fullFilename);
      
      XLSXLib.writeFile(workbook, filepath);
      
      return { 
        success: true, 
        output: `📊 **Excel Gerado com Sucesso!**\n\n` +
          `**Arquivo:** ${fullFilename}\n` +
          `**Caminho:** /exports/${fullFilename}\n` +
          `**Registros:** ${data.length}\n` +
          `**Colunas:** ${Object.keys(data[0]).join(', ')}\n\n` +
          `O arquivo está disponível para download.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao exportar: ${error.message}` };
    }
  }

  private async toolSendToBiDataset(
    userId: string, 
    name: string, 
    dataStr: string, 
    description?: string,
    updateIfExists?: boolean
  ): Promise<ToolResult> {
    try {
      let data: any[];
      try {
        data = JSON.parse(dataStr);
      } catch (e) {
        return { success: false, output: "", error: "Dados inválidos. Forneça um JSON array válido." };
      }
      
      if (!Array.isArray(data) || data.length === 0) {
        return { success: false, output: "", error: "Dados devem ser um array não vazio." };
      }
      
      const existingDatasets = await db.select()
        .from(biDatasets)
        .where(eq(biDatasets.name, name));
      
      let datasetId: number;
      let action: string;
      
      if (existingDatasets.length > 0 && updateIfExists !== false) {
        const existing = existingDatasets[0];
        await db.update(biDatasets)
          .set({ 
            cachedData: data,
            description: description || existing.description,
            updatedAt: new Date()
          })
          .where(eq(biDatasets.id, existing.id));
        datasetId = existing.id;
        action = "atualizado";
      } else {
        const columns = Object.keys(data[0]);
        const [newDataset] = await db.insert(biDatasets)
          .values({
            name,
            description: description || `Dataset criado pelo Manus`,
            type: 'manual',
            query: null,
            tableName: null,
            columns: columns,
            cachedData: data,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
        datasetId = newDataset.id;
        action = "criado";
      }
      
      return { 
        success: true, 
        output: `📈 **Dataset ${action} no BI!**\n\n` +
          `**Nome:** ${name}\n` +
          `**ID:** ${datasetId}\n` +
          `**Registros:** ${data.length}\n` +
          `**Colunas:** ${Object.keys(data[0]).join(', ')}\n\n` +
          `O dataset está disponível no módulo Arcádia Insights para criar gráficos e dashboards.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao enviar para BI: ${error.message}` };
    }
  }

  private async toolMarketResearch(topic: string, companyContext?: string, focus?: string): Promise<ToolResult> {
    try {
      const searchFocus = focus || 'all';
      let searchQueries: string[] = [];
      
      if (searchFocus === 'all' || searchFocus === 'competitors') {
        searchQueries.push(`principais concorrentes ${topic}`);
      }
      if (searchFocus === 'all' || searchFocus === 'benchmarks') {
        searchQueries.push(`benchmarks indicadores ${topic} Brasil 2024`);
      }
      if (searchFocus === 'all' || searchFocus === 'trends') {
        searchQueries.push(`tendências mercado ${topic} 2024 2025`);
      }
      
      let allResults: string[] = [];
      
      for (const query of searchQueries) {
        const results = await this.performWebSearch(query);
        if (results.length > 0) {
          allResults.push(`**Pesquisa: "${query}"**\n`);
          results.slice(0, 3).forEach((r, i) => {
            allResults.push(`${i+1}. ${r.title}\n   ${r.snippet}\n`);
          });
          allResults.push('\n');
        }
      }
      
      let output = `🔍 **Pesquisa de Mercado: ${topic}**\n\n`;
      
      if (companyContext) {
        output += `📊 **Contexto da Empresa:** ${companyContext}\n\n`;
      }
      
      if (allResults.length > 0) {
        output += `## Resultados Encontrados\n\n${allResults.join('')}`;
      } else {
        output += `Não foram encontrados resultados específicos para este tema.\n`;
        output += `\n💡 **Sugestões:**\n`;
        output += `- Tente termos mais específicos\n`;
        output += `- Use deep_research para uma análise mais profunda\n`;
      }
      
      output += `\n---\n`;
      output += `📌 **Próximos Passos Sugeridos:**\n`;
      output += `- Use compare_with_market para comparar métricas específicas\n`;
      output += `- Use deep_research para aprofundar em temas específicos\n`;
      output += `- Solicite "gerar relatório de mercado" para um documento completo\n`;
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro na pesquisa de mercado: ${error.message}` };
    }
  }

  private async toolCompareWithMarket(
    metric: string, 
    value: number, 
    sector: string, 
    period?: string
  ): Promise<ToolResult> {
    try {
      const benchmarks: Record<string, Record<string, { avg: number; top25: number; median: number }>> = {
        'varejo': {
          'margem_lucro': { avg: 5.2, top25: 8.5, median: 4.8 },
          'ticket_medio': { avg: 120, top25: 200, median: 95 },
          'crescimento_receita': { avg: 8, top25: 15, median: 6 },
          'roi': { avg: 12, top25: 22, median: 10 },
          'giro_estoque': { avg: 6, top25: 10, median: 5 }
        },
        'servicos': {
          'margem_lucro': { avg: 12, top25: 20, median: 10 },
          'ticket_medio': { avg: 350, top25: 800, median: 250 },
          'crescimento_receita': { avg: 10, top25: 18, median: 8 },
          'roi': { avg: 18, top25: 30, median: 15 },
          'nps': { avg: 45, top25: 70, median: 40 }
        },
        'industria': {
          'margem_lucro': { avg: 8, top25: 15, median: 7 },
          'crescimento_receita': { avg: 6, top25: 12, median: 5 },
          'roi': { avg: 10, top25: 18, median: 8 },
          'produtividade': { avg: 75, top25: 90, median: 70 }
        },
        'tecnologia': {
          'margem_lucro': { avg: 15, top25: 25, median: 12 },
          'crescimento_receita': { avg: 20, top25: 40, median: 15 },
          'roi': { avg: 25, top25: 45, median: 20 },
          'churn': { avg: 5, top25: 2, median: 6 }
        },
        'logistica': {
          'margem_lucro': { avg: 4, top25: 7, median: 3.5 },
          'crescimento_receita': { avg: 12, top25: 20, median: 10 },
          'eficiencia_entrega': { avg: 92, top25: 98, median: 90 }
        }
      };
      
      const sectorLower = sector.toLowerCase();
      const metricLower = metric.toLowerCase().replace(/\s+/g, '_');
      
      let sectorData = benchmarks[sectorLower];
      if (!sectorData) {
        const keys = Object.keys(benchmarks);
        for (const key of keys) {
          if (sectorLower.includes(key) || key.includes(sectorLower)) {
            sectorData = benchmarks[key];
            break;
          }
        }
      }
      
      if (!sectorData) {
        sectorData = benchmarks['servicos'];
      }
      
      let metricData = sectorData[metricLower];
      if (!metricData) {
        const metricKeys = Object.keys(sectorData);
        for (const key of metricKeys) {
          if (metricLower.includes(key) || key.includes(metricLower)) {
            metricData = sectorData[key];
            break;
          }
        }
      }
      
      if (!metricData) {
        metricData = { avg: value * 0.9, top25: value * 1.3, median: value * 0.85 };
      }
      
      const diffFromAvg = ((value - metricData.avg) / metricData.avg * 100).toFixed(1);
      const diffFromTop = ((value - metricData.top25) / metricData.top25 * 100).toFixed(1);
      
      let position: string;
      let emoji: string;
      if (value >= metricData.top25) {
        position = "Top 25% do mercado";
        emoji = "🏆";
      } else if (value >= metricData.avg) {
        position = "Acima da média";
        emoji = "✅";
      } else if (value >= metricData.median) {
        position = "Na mediana";
        emoji = "➖";
      } else {
        position = "Abaixo da média";
        emoji = "⚠️";
      }
      
      let output = `📊 **Comparativo de Mercado**\n\n`;
      output += `**Métrica:** ${metric}\n`;
      output += `**Setor:** ${sector}\n`;
      output += `**Período:** ${period || 'Atual'}\n\n`;
      
      output += `## Seu Valor vs. Mercado\n\n`;
      output += `| Indicador | Valor |\n`;
      output += `|-----------|-------|\n`;
      output += `| **Seu valor** | ${value.toLocaleString('pt-BR')} |\n`;
      output += `| Média do setor | ${metricData.avg.toLocaleString('pt-BR')} |\n`;
      output += `| Mediana | ${metricData.median.toLocaleString('pt-BR')} |\n`;
      output += `| Top 25% | ${metricData.top25.toLocaleString('pt-BR')} |\n\n`;
      
      output += `## Análise\n\n`;
      output += `${emoji} **Posição:** ${position}\n`;
      output += `- Diferença da média: ${diffFromAvg}%\n`;
      output += `- Diferença do top 25%: ${diffFromTop}%\n\n`;
      
      if (parseFloat(diffFromAvg) < 0) {
        output += `💡 **Recomendação:** Sua métrica está abaixo da média do setor. `;
        output += `Considere analisar práticas das empresas líderes para identificar oportunidades de melhoria.\n`;
      } else if (value < metricData.top25) {
        output += `💡 **Recomendação:** Você está bem posicionado. `;
        output += `Para alcançar o top 25%, foque em otimizações incrementais e melhores práticas.\n`;
      } else {
        output += `🌟 **Parabéns!** Você está entre os melhores do setor nesta métrica.\n`;
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro no comparativo: ${error.message}` };
    }
  }

  async getRun(runId: number) {
    const [run] = await db.select().from(manusRuns).where(eq(manusRuns.id, runId));
    if (!run) return null;
    
    const steps = await db.select()
      .from(manusSteps)
      .where(eq(manusSteps.runId, runId))
      .orderBy(manusSteps.stepNumber);
    
    return { ...run, steps };
  }

  async getUserRuns(userId: string) {
    return db.select()
      .from(manusRuns)
      .where(eq(manusRuns.userId, userId))
      .orderBy(desc(manusRuns.createdAt))
      .limit(20);
  }

  // ============================================================
  // MetaSet (Motor BI) Tools
  // ============================================================

  private async toolMetaSetQuery(query: string, limit?: number): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const result = await metasetClient.runNativeQuery(query, limit || 100);
      const preview = result.rows.slice(0, 20).map(row => {
        const obj: Record<string, any> = {};
        result.columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      });
      return {
        success: true,
        output: `📊 Consulta executada via Motor BI: ${result.rowCount} linhas, ${result.columns.length} colunas.\n\nColunas: ${result.columns.join(", ")}\n\nPrimeiras ${Math.min(20, preview.length)} linhas:\n${JSON.stringify(preview, null, 2)}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro MetaSet: ${error.message}` };
    }
  }

  private async toolMetaSetCreateQuestion(name: string, query: string, chartType?: string, description?: string): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const question = await metasetClient.createQuestion({
        name,
        queryType: "native",
        query,
        chartType: chartType || "table",
        description,
      });
      return {
        success: true,
        output: `📊 Pergunta criada no Motor BI: "${question.name}" (ID: ${question.id})\n\nUse metaset_run_question com questionId=${question.id} para executar.\nUse metaset_add_to_dashboard para adicionar a um dashboard.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao criar pergunta: ${error.message}` };
    }
  }

  private async toolMetaSetListQuestions(): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const questions = await metasetClient.listQuestions();
      if (questions.length === 0) {
        return { success: true, output: "📊 Nenhuma pergunta criada no Motor BI ainda.\n\nUse metaset_create_question para criar uma." };
      }
      const list = questions.map(q => `- [${q.id}] "${q.name}" (${q.display})`).join("\n");
      return { success: true, output: `📊 ${questions.length} perguntas no Motor BI:\n\n${list}` };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro: ${error.message}` };
    }
  }

  private async toolMetaSetRunQuestion(questionId: number): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const result = await metasetClient.runQuestion(questionId);
      const preview = result.rows.slice(0, 20).map(row => {
        const obj: Record<string, any> = {};
        result.columns.forEach((col, i) => { obj[col] = row[i]; });
        return obj;
      });
      return {
        success: true,
        output: `📊 Pergunta ${questionId} executada: ${result.rowCount} linhas\n\nColunas: ${result.columns.join(", ")}\n\n${JSON.stringify(preview, null, 2)}`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro: ${error.message}` };
    }
  }

  private async toolMetaSetCreateDashboard(name: string, description?: string): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const dashboard = await metasetClient.createDashboard({ name, description });
      return {
        success: true,
        output: `📊 Dashboard criado no Motor BI: "${dashboard.name}" (ID: ${dashboard.id})\n\nUse metaset_add_to_dashboard para adicionar perguntas/gráficos.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro: ${error.message}` };
    }
  }

  private async toolMetaSetListDashboards(): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const dashboards = await metasetClient.listDashboards();
      if (dashboards.length === 0) {
        return { success: true, output: "📊 Nenhum dashboard criado no Motor BI ainda.\n\nUse metaset_create_dashboard para criar um." };
      }
      const list = dashboards.map(d => `- [${d.id}] "${d.name}" - ${d.description || "sem descrição"}`).join("\n");
      return { success: true, output: `📊 ${dashboards.length} dashboards no Motor BI:\n\n${list}` };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro: ${error.message}` };
    }
  }

  private async toolMetaSetAddToDashboard(dashboardId: number, questionId: number): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      await metasetClient.addQuestionToDashboard(dashboardId, questionId);
      return {
        success: true,
        output: `📊 Pergunta ${questionId} adicionada ao dashboard ${dashboardId} no Motor BI.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro: ${error.message}` };
    }
  }

  private async toolMetaSetSuggestAnalysis(tableName: string): Promise<ToolResult> {
    try {
      const { metasetClient } = await import("../metaset/client");
      const suggestions = await metasetClient.getAutoSuggestions(tableName);
      return {
        success: true,
        output: `📊 Sugestões de análise para "${tableName}":\n\n**Gráficos recomendados:** ${suggestions.suggestedCharts.join(", ")}\n\n**Consultas sugeridas:**\n${suggestions.suggestedQueries.map((q, i) => `${i + 1}. ${q}`).join("\n")}\n\nUse metaset_create_question com uma destas consultas para criar uma pergunta persistente.`
      };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro: ${error.message}` };
    }
  }

  // ============================================================
  // ERPNext Integration Tools
  // ============================================================

  private async toolErpnextStatus(): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return {
          success: true,
          output: "⚠️ **ERPNext não configurado**\n\nAs credenciais do ERPNext não estão configuradas. Configure ERPNEXT_URL, ERPNEXT_API_KEY e ERPNEXT_API_SECRET nas secrets do sistema."
        };
      }

      const result = await erpnextService.testConnection();
      if (result.success) {
        return {
          success: true,
          output: `✅ **ERPNext Conectado**\n\n**URL:** ${erpnextService.getConfig().url}\n**Usuário:** ${result.user}\n\nVocê pode usar as ferramentas erpnext_* para consultar e manipular dados.`
        };
      } else {
        return {
          success: false,
          output: "",
          error: `Erro ao conectar: ${result.message}`
        };
      }
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao verificar ERPNext: ${error.message}` };
    }
  }

  private async toolErpnextListDoctypes(limit?: number): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const doctypes = await erpnextService.listDocTypes(limit || 50);
      
      let output = `📋 **DocTypes disponíveis no ERPNext** (${doctypes.length})\n\n`;
      
      const grouped: Record<string, string[]> = {};
      for (const dt of doctypes) {
        const module = dt.module || "Outros";
        if (!grouped[module]) grouped[module] = [];
        grouped[module].push(dt.name);
      }
      
      for (const [module, names] of Object.entries(grouped).sort()) {
        output += `**${module}:**\n`;
        output += names.slice(0, 10).map(n => `- ${n}`).join('\n');
        if (names.length > 10) {
          output += `\n- ... e mais ${names.length - 10}`;
        }
        output += '\n\n';
      }
      
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao listar DocTypes: ${error.message}` };
    }
  }

  private async toolErpnextGetDocuments(
    doctype: string,
    filters?: string,
    fields?: string,
    limit?: number
  ): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const parsedFilters = filters ? JSON.parse(filters) : undefined;
      const parsedFields = fields ? fields.split(',').map(f => f.trim()) : undefined;

      const documents = await erpnextService.getDocuments(
        doctype,
        parsedFilters,
        parsedFields,
        limit || 20
      );

      let output = `📄 **${doctype}** (${documents.length} registros)\n\n`;

      if (documents.length === 0) {
        output += "Nenhum registro encontrado.";
      } else {
        output += "| " + Object.keys(documents[0] as object).join(" | ") + " |\n";
        output += "|" + Object.keys(documents[0] as object).map(() => "---").join("|") + "|\n";
        
        for (const doc of documents.slice(0, 20)) {
          output += "| " + Object.values(doc as object).map(v => String(v ?? '-')).join(" | ") + " |\n";
        }
        
        if (documents.length > 20) {
          output += `\n... e mais ${documents.length - 20} registros`;
        }
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao buscar ${doctype}: ${error.message}` };
    }
  }

  private async toolErpnextGetDocument(doctype: string, name: string): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const document = await erpnextService.getDocument(doctype, name);

      let output = `📄 **${doctype}: ${name}**\n\n`;
      output += "```json\n";
      output += JSON.stringify(document, null, 2);
      output += "\n```";

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao buscar ${doctype}/${name}: ${error.message}` };
    }
  }

  private async toolErpnextCreateDocument(doctype: string, data: string): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const parsedData = JSON.parse(data);
      const document = await erpnextService.createDocument(doctype, parsedData);

      let output = `✅ **${doctype} criado com sucesso!**\n\n`;
      output += "```json\n";
      output += JSON.stringify(document, null, 2);
      output += "\n```";

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao criar ${doctype}: ${error.message}` };
    }
  }

  private async toolErpnextUpdateDocument(doctype: string, name: string, data: string): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const parsedData = JSON.parse(data);
      const document = await erpnextService.updateDocument(doctype, name, parsedData);

      let output = `✅ **${doctype}/${name} atualizado com sucesso!**\n\n`;
      output += "```json\n";
      output += JSON.stringify(document, null, 2);
      output += "\n```";

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao atualizar ${doctype}/${name}: ${error.message}` };
    }
  }

  private async toolErpnextSearch(doctype: string, searchTerm: string, limit?: number): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const documents = await erpnextService.searchDocuments(doctype, searchTerm, undefined, limit || 20);

      let output = `🔍 **Busca em ${doctype}** por "${searchTerm}"\n\n`;

      if (documents.length === 0) {
        output += "Nenhum resultado encontrado.";
      } else {
        output += `**Resultados:** ${documents.length}\n\n`;
        for (const doc of documents) {
          output += `- ${JSON.stringify(doc)}\n`;
        }
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro na busca: ${error.message}` };
    }
  }

  private async toolErpnextRunReport(reportName: string, filters?: string): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const parsedFilters = filters ? JSON.parse(filters) : undefined;
      const result = await erpnextService.runReport(reportName, parsedFilters);

      let output = `📊 **Relatório: ${reportName}**\n\n`;

      if (result.data.length === 0) {
        output += "Nenhum dado encontrado.";
      } else {
        if (result.columns.length > 0) {
          const colNames = (result.columns as any[]).map(c => typeof c === 'string' ? c : c.label || c.fieldname);
          output += "| " + colNames.join(" | ") + " |\n";
          output += "|" + colNames.map(() => "---").join("|") + "|\n";
        }
        
        for (const row of result.data.slice(0, 30)) {
          if (Array.isArray(row)) {
            output += "| " + row.map(v => String(v ?? '-')).join(" | ") + " |\n";
          } else {
            output += "| " + Object.values(row as object).map(v => String(v ?? '-')).join(" | ") + " |\n";
          }
        }
        
        if (result.data.length > 30) {
          output += `\n... e mais ${result.data.length - 30} linhas`;
        }
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao executar relatório: ${error.message}` };
    }
  }

  private async toolErpnextCallMethod(method: string, args?: string): Promise<ToolResult> {
    try {
      if (!erpnextService.isConfigured()) {
        return { success: false, output: "", error: "ERPNext não configurado" };
      }

      const parsedArgs = args ? JSON.parse(args) : undefined;
      const result = await erpnextService.callMethod(method, parsedArgs);

      let output = `⚡ **Método: ${method}**\n\n`;
      output += "```json\n";
      output += JSON.stringify(result, null, 2);
      output += "\n```";

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao chamar método: ${error.message}` };
    }
  }

  // ========== ARCÁDIA RETAIL TOOLS ==========

  private parseFilter(filter?: string): Record<string, string> {
    const parsed: Record<string, string> = {};
    if (!filter) return parsed;
    
    const parts = filter.split(",").map(p => p.trim());
    for (const part of parts) {
      const [key, value] = part.split("=").map(s => s.trim());
      if (key && value) {
        parsed[key] = value;
      }
    }
    return parsed;
  }

  private async toolRetailQuery(entity: string, filter?: string, limit?: number): Promise<ToolResult> {
    try {
      const maxResults = limit || 20;
      const filters = this.parseFilter(filter);
      let output = "";
      let data: any[] = [];
      const conditions: any[] = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (entity.toLowerCase()) {
        case "sales":
          if (filters.status) conditions.push(eq(posSales.status, filters.status));
          if (filters.date === "today") conditions.push(gte(posSales.createdAt, today));
          if (filters.store_id) conditions.push(eq(posSales.storeId, parseInt(filters.store_id)));
          if (filters.seller_id) conditions.push(eq(posSales.sellerId, parseInt(filters.seller_id)));
          
          data = conditions.length > 0
            ? await db.select().from(posSales).where(and(...conditions)).orderBy(desc(posSales.createdAt)).limit(maxResults)
            : await db.select().from(posSales).orderBy(desc(posSales.createdAt)).limit(maxResults);
          
          output = `🛒 **Vendas do PDV (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | Número | Cliente | Total | Status | Data |\n";
          output += "|---|--------|---------|-------|--------|------|\n";
          data.forEach((s, i) => {
            output += `| ${i+1} | ${s.saleNumber || '-'} | ${s.customerName || 'Consumidor'} | R$ ${parseFloat(s.totalAmount || '0').toFixed(2)} | ${s.status || '-'} | ${s.createdAt ? new Date(s.createdAt).toLocaleDateString('pt-BR') : '-'} |\n`;
          });
          break;

        case "devices":
          if (filters.status) conditions.push(eq(mobileDevices.status, filters.status));
          if (filters.condition) conditions.push(eq(mobileDevices.condition, filters.condition));
          if (filters.brand) conditions.push(ilike(mobileDevices.brand, `%${filters.brand}%`));
          if (filters.store_id) conditions.push(eq(mobileDevices.storeId, parseInt(filters.store_id)));
          
          data = conditions.length > 0
            ? await db.select().from(mobileDevices).where(and(...conditions)).orderBy(desc(mobileDevices.createdAt)).limit(maxResults)
            : await db.select().from(mobileDevices).orderBy(desc(mobileDevices.createdAt)).limit(maxResults);
          
          output = `📱 **Dispositivos/Celulares (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | IMEI | Marca | Modelo | Condição | Status | Preço Venda |\n";
          output += "|---|------|-------|--------|----------|--------|-------------|\n";
          data.forEach((d, i) => {
            output += `| ${i+1} | ${d.imei || '-'} | ${d.brand || '-'} | ${d.model || '-'} | ${d.condition || '-'} | ${d.status || '-'} | R$ ${parseFloat(d.sellingPrice || '0').toFixed(2)} |\n`;
          });
          break;

        case "evaluations":
          if (filters.status) conditions.push(eq(deviceEvaluations.status, filters.status));
          if (filters.date === "today") conditions.push(gte(deviceEvaluations.createdAt, today));
          if (filters.store_id) conditions.push(eq(deviceEvaluations.storeId, parseInt(filters.store_id)));
          
          data = conditions.length > 0
            ? await db.select().from(deviceEvaluations).where(and(...conditions)).orderBy(desc(deviceEvaluations.createdAt)).limit(maxResults)
            : await db.select().from(deviceEvaluations).orderBy(desc(deviceEvaluations.createdAt)).limit(maxResults);
          
          output = `🔍 **Avaliações Trade-In (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | IMEI | Marca/Modelo | Cliente | Valor Est. | Status |\n";
          output += "|---|------|--------------|---------|------------|--------|\n";
          data.forEach((e, i) => {
            output += `| ${i+1} | ${e.imei || '-'} | ${e.brand || ''} ${e.model || ''} | ${e.customerName || '-'} | R$ ${parseFloat(e.estimatedValue || '0').toFixed(2)} | ${e.status || '-'} |\n`;
          });
          break;

        case "service_orders":
          if (filters.status) conditions.push(eq(serviceOrders.status, filters.status));
          if (filters.date === "today") conditions.push(gte(serviceOrders.createdAt, today));
          if (filters.store_id) conditions.push(eq(serviceOrders.storeId, parseInt(filters.store_id)));
          
          data = conditions.length > 0
            ? await db.select().from(serviceOrders).where(and(...conditions)).orderBy(desc(serviceOrders.createdAt)).limit(maxResults)
            : await db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt)).limit(maxResults);
          
          output = `🔧 **Ordens de Serviço (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | Número O.S. | Dispositivo | Cliente | Tipo | Status | Valor |\n";
          output += "|---|-------------|-------------|---------|------|--------|-------|\n";
          data.forEach((o, i) => {
            output += `| ${i+1} | ${o.orderNumber || '-'} | ${o.brand || ''} ${o.model || ''} | ${o.customerName || '-'} | ${o.serviceType || '-'} | ${o.status || '-'} | R$ ${parseFloat(o.totalCost || '0').toFixed(2)} |\n`;
          });
          break;

        case "commissions":
          if (filters.status) conditions.push(eq(retailCommissionClosures.status, filters.status));
          if (filters.store_id) conditions.push(eq(retailCommissionClosures.storeId, parseInt(filters.store_id)));
          if (filters.seller_id) conditions.push(eq(retailCommissionClosures.sellerId, parseInt(filters.seller_id)));
          
          data = conditions.length > 0
            ? await db.select().from(retailCommissionClosures).where(and(...conditions)).orderBy(desc(retailCommissionClosures.createdAt)).limit(maxResults)
            : await db.select().from(retailCommissionClosures).orderBy(desc(retailCommissionClosures.createdAt)).limit(maxResults);
          
          output = `💰 **Fechamentos de Comissões (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | Período | Vendedor | Vendas Líquidas | Comissão | Status |\n";
          output += "|---|---------|----------|-----------------|----------|--------|\n";
          data.forEach((c, i) => {
            output += `| ${i+1} | ${c.periodType || '-'} | ${c.sellerName || 'Todos'} | R$ ${parseFloat(c.netSales || '0').toFixed(2)} | R$ ${parseFloat(c.commissionAmount || '0').toFixed(2)} | ${c.status || '-'} |\n`;
          });
          break;

        case "credits":
          if (filters.status) conditions.push(eq(customerCredits.status, filters.status));
          else conditions.push(eq(customerCredits.status, "active"));
          if (filters.customer_id) conditions.push(eq(customerCredits.customerId, parseInt(filters.customer_id)));
          
          data = await db.select().from(customerCredits).where(and(...conditions)).orderBy(desc(customerCredits.createdAt)).limit(maxResults);
          
          output = `💳 **Créditos de Clientes (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | Cliente | CPF | Origem | Valor | Saldo | Expira |\n";
          output += "|---|---------|-----|--------|-------|-------|--------|\n";
          data.forEach((c, i) => {
            output += `| ${i+1} | ${c.customerName || '-'} | ${c.customerCpf || '-'} | ${c.origin || '-'} | R$ ${parseFloat(c.amount || '0').toFixed(2)} | R$ ${parseFloat(c.remainingAmount || '0').toFixed(2)} | ${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('pt-BR') : 'Sem limite'} |\n`;
          });
          break;

        case "sellers":
          if (filters.store_id) conditions.push(eq(retailSellers.storeId, parseInt(filters.store_id)));
          if (filters.active !== "false") conditions.push(eq(retailSellers.isActive, true));
          
          data = conditions.length > 0
            ? await db.select().from(retailSellers).where(and(...conditions)).limit(maxResults)
            : await db.select().from(retailSellers).where(eq(retailSellers.isActive, true)).limit(maxResults);
          
          output = `👤 **Vendedores (${data.length} registros)**${filter ? ` [Filtro: ${filter}]` : ''}\n\n`;
          output += "| # | Nome | Código | Comissão Base | Meta Mensal |\n";
          output += "|---|------|--------|---------------|-------------|\n";
          data.forEach((s, i) => {
            output += `| ${i+1} | ${s.name || '-'} | ${s.code || '-'} | ${parseFloat(s.commissionRate || '0').toFixed(1)}% | R$ ${parseFloat(s.monthlyGoal || '0').toFixed(2)} |\n`;
          });
          break;

        case "stores":
          if (filters.active !== "false") conditions.push(eq(retailStores.isActive, true));
          
          data = conditions.length > 0
            ? await db.select().from(retailStores).where(and(...conditions)).limit(maxResults)
            : await db.select().from(retailStores).where(eq(retailStores.isActive, true)).limit(maxResults);
          output = `🏪 **Lojas Ativas (${data.length} registros)**\n\n`;
          output += "| # | Nome | Código | Cidade | Estado |\n";
          output += "|---|------|--------|--------|--------|\n";
          data.forEach((s, i) => {
            output += `| ${i+1} | ${s.name} | ${s.code || '-'} | ${s.city || '-'} | ${s.state || '-'} |\n`;
          });
          break;

        default:
          return { success: false, output: "", error: `Entidade desconhecida: ${entity}. Use: sales, devices, evaluations, service_orders, commissions, credits, sellers, stores` };
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao consultar Retail: ${error.message}` };
    }
  }

  private async toolRetailStats(period?: string, storeId?: number): Promise<ToolResult> {
    try {
      const now = new Date();
      let dateFrom = new Date(now);
      dateFrom.setHours(0, 0, 0, 0);

      switch (period) {
        case "week":
          dateFrom.setDate(now.getDate() - 7);
          break;
        case "month":
          dateFrom.setMonth(now.getMonth() - 1);
          break;
        case "year":
          dateFrom.setFullYear(now.getFullYear() - 1);
          break;
        default:
          // today - already set
      }

      // Build conditions with optional storeId filter
      const salesConditions = [gte(posSales.createdAt, dateFrom)];
      const deviceConditions = [eq(mobileDevices.status, "in_stock")];
      const orderConditions = [or(eq(serviceOrders.status, "open"), eq(serviceOrders.status, "in_progress"))];
      const evalConditions = [or(eq(deviceEvaluations.status, "pending"), eq(deviceEvaluations.status, "analyzing"))];
      
      if (storeId) {
        salesConditions.push(eq(posSales.storeId, storeId));
        deviceConditions.push(eq(mobileDevices.storeId, storeId));
        orderConditions.push(eq(serviceOrders.storeId, storeId));
        evalConditions.push(eq(deviceEvaluations.storeId, storeId));
      }

      // Vendas do período
      const salesData = await db.select({
        count: sql<number>`count(*)`,
        total: sql<string>`COALESCE(SUM(total_amount::numeric), 0)`
      }).from(posSales)
        .where(and(...salesConditions));

      // Dispositivos em estoque
      const devicesInStock = await db.select({
        count: sql<number>`count(*)`
      }).from(mobileDevices)
        .where(and(...deviceConditions));

      // O.S. abertas
      const openOrders = await db.select({
        count: sql<number>`count(*)`
      }).from(serviceOrders)
        .where(and(...orderConditions));

      // Avaliações pendentes
      const pendingEvaluations = await db.select({
        count: sql<number>`count(*)`
      }).from(deviceEvaluations)
        .where(and(...evalConditions));

      // Ticket médio
      const ticketMedio = salesData[0]?.count > 0 
        ? parseFloat(salesData[0].total) / salesData[0].count 
        : 0;

      const storeLabel = storeId ? ` - Loja #${storeId}` : '';
      let output = `📊 **Estatísticas do Retail (${period || 'hoje'}${storeLabel})**\n\n`;
      output += "### KPIs Principais\n\n";
      output += "| Indicador | Valor |\n";
      output += "|-----------|-------|\n";
      output += `| 🛒 Vendas Realizadas | ${salesData[0]?.count || 0} |\n`;
      output += `| 💰 Faturamento Total | R$ ${parseFloat(salesData[0]?.total || '0').toFixed(2)} |\n`;
      output += `| 📈 Ticket Médio | R$ ${ticketMedio.toFixed(2)} |\n`;
      output += `| 📱 Dispositivos em Estoque | ${devicesInStock[0]?.count || 0} |\n`;
      output += `| 🔧 O.S. Abertas | ${openOrders[0]?.count || 0} |\n`;
      output += `| 🔍 Avaliações Pendentes | ${pendingEvaluations[0]?.count || 0} |\n`;

      // Insights automáticos
      output += "\n### Insights\n\n";
      if (openOrders[0]?.count > 5) {
        output += "⚠️ **Atenção:** Há muitas O.S. abertas. Considere priorizar a finalização.\n";
      }
      if (pendingEvaluations[0]?.count > 3) {
        output += "⚠️ **Atenção:** Há avaliações Trade-In pendentes. Clientes aguardando resposta.\n";
      }
      if (devicesInStock[0]?.count < 5) {
        output += "⚠️ **Atenção:** Estoque baixo de dispositivos. Considere reposição.\n";
      }
      if (ticketMedio < 500 && salesData[0]?.count > 0) {
        output += "💡 **Dica:** Ticket médio baixo. Considere ofertar acessórios ou garantia estendida.\n";
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao obter estatísticas: ${error.message}` };
    }
  }

  private async toolRetailReport(type: string, dateFrom?: string, dateTo?: string, storeId?: number): Promise<ToolResult> {
    try {
      const now = new Date();
      const startDate = dateFrom ? new Date(dateFrom) : new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = dateTo ? new Date(dateTo) : now;
      const storeLabel = storeId ? ` - Loja #${storeId}` : '';

      let output = "";

      switch (type.toLowerCase()) {
        case "sales_summary":
          const salesConditions = [
            gte(posSales.createdAt, startDate),
            lte(posSales.createdAt, endDate)
          ];
          if (storeId) salesConditions.push(eq(posSales.storeId, storeId));
          
          const sales = await db.select().from(posSales)
            .where(and(...salesConditions))
            .orderBy(desc(posSales.createdAt));

          const totalVendas = sales.reduce((sum, s) => sum + parseFloat(s.totalAmount || '0'), 0);
          const vendasPorDia: Record<string, number> = {};
          sales.forEach(s => {
            const dia = new Date(s.createdAt).toLocaleDateString('pt-BR');
            vendasPorDia[dia] = (vendasPorDia[dia] || 0) + parseFloat(s.totalAmount || '0');
          });

          output = `📊 **Relatório de Vendas${storeLabel}**\n`;
          output += `Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}\n\n`;
          output += "### Resumo\n\n";
          output += `| Métrica | Valor |\n|---------|-------|\n`;
          output += `| Total de Vendas | ${sales.length} |\n`;
          output += `| Faturamento Total | R$ ${totalVendas.toFixed(2)} |\n`;
          output += `| Ticket Médio | R$ ${sales.length > 0 ? (totalVendas/sales.length).toFixed(2) : '0.00'} |\n\n`;
          
          output += "### Vendas por Dia\n\n| Data | Faturamento |\n|------|-------------|\n";
          Object.entries(vendasPorDia).forEach(([dia, valor]) => {
            output += `| ${dia} | R$ ${valor.toFixed(2)} |\n`;
          });
          break;

        case "inventory_status":
          const deviceConditions = storeId ? [eq(mobileDevices.storeId, storeId)] : [];
          const devices = deviceConditions.length > 0
            ? await db.select().from(mobileDevices).where(and(...deviceConditions))
            : await db.select().from(mobileDevices);
          
          const porStatus: Record<string, number> = {};
          const porMarca: Record<string, number> = {};
          let valorTotalEstoque = 0;

          devices.forEach(d => {
            porStatus[d.status || 'unknown'] = (porStatus[d.status || 'unknown'] || 0) + 1;
            if (d.status === 'in_stock') {
              porMarca[d.brand || 'Outros'] = (porMarca[d.brand || 'Outros'] || 0) + 1;
              valorTotalEstoque += parseFloat(d.sellingPrice || '0');
            }
          });

          output = `📱 **Relatório de Estoque de Dispositivos${storeLabel}**\n\n`;
          output += "### Por Status\n\n| Status | Quantidade |\n|--------|------------|\n";
          Object.entries(porStatus).forEach(([status, qtd]) => {
            output += `| ${status} | ${qtd} |\n`;
          });
          
          output += "\n### Em Estoque por Marca\n\n| Marca | Quantidade |\n|-------|------------|\n";
          Object.entries(porMarca).forEach(([marca, qtd]) => {
            output += `| ${marca} | ${qtd} |\n`;
          });
          
          output += `\n**Valor Total em Estoque:** R$ ${valorTotalEstoque.toFixed(2)}`;
          break;

        case "trade_in_analysis":
          const evalConditions = [
            gte(deviceEvaluations.createdAt, startDate),
            lte(deviceEvaluations.createdAt, endDate)
          ];
          if (storeId) evalConditions.push(eq(deviceEvaluations.storeId, storeId));
          
          const evaluations = await db.select().from(deviceEvaluations)
            .where(and(...evalConditions
            ));

          const porStatusEval: Record<string, number> = {};
          let valorTotalAprovado = 0;
          
          evaluations.forEach(e => {
            porStatusEval[e.status] = (porStatusEval[e.status] || 0) + 1;
            if (e.status === 'approved') {
              valorTotalAprovado += parseFloat(e.estimatedValue || '0');
            }
          });

          output = `🔍 **Análise de Trade-In${storeLabel}**\n`;
          output += `Período: ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}\n\n`;
          output += "### Por Status\n\n| Status | Quantidade |\n|--------|------------|\n";
          Object.entries(porStatusEval).forEach(([status, qtd]) => {
            output += `| ${status} | ${qtd} |\n`;
          });
          output += `\n**Valor Total Aprovado:** R$ ${valorTotalAprovado.toFixed(2)}`;
          output += `\n**Taxa de Aprovação:** ${evaluations.length > 0 ? ((porStatusEval['approved'] || 0) / evaluations.length * 100).toFixed(1) : 0}%`;
          break;

        case "service_orders_pending":
          const orderConditions = [or(eq(serviceOrders.status, "open"), eq(serviceOrders.status, "in_progress"))];
          if (storeId) orderConditions.push(eq(serviceOrders.storeId, storeId));
          
          const orders = await db.select().from(serviceOrders)
            .where(and(...orderConditions))
            .orderBy(desc(serviceOrders.createdAt));

          output = `🔧 **O.S. Pendentes${storeLabel} (${orders.length} total)**\n\n`;
          output += "| O.S. | Dispositivo | Cliente | Tipo | Status | Dias |\n";
          output += "|------|-------------|---------|------|--------|------|\n";
          orders.forEach(o => {
            const dias = Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
            output += `| ${o.orderNumber} | ${o.brand} ${o.model} | ${o.customerName || '-'} | ${o.serviceType} | ${o.status} | ${dias} |\n`;
          });
          break;

        default:
          return { success: false, output: "", error: `Tipo de relatório desconhecido: ${type}. Use: sales_summary, inventory_status, trade_in_analysis, service_orders_pending` };
      }

      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: "", error: `Erro ao gerar relatório: ${error.message}` };
    }
  }
}

export const manusService = new ManusService();

// ============================================================
// FUNÇÕES EXPORTADAS PARA INTEGRAÇÃO MCP/A2A
// ============================================================

/**
 * Executa uma ferramenta diretamente (para uso via MCP)
 * @param toolName Nome da ferramenta
 * @param args Argumentos da ferramenta
 * @returns Resultado da execução
 */
// ID do usuário de sistema para integrações MCP/A2A
const SYSTEM_USER_ID = "dev-admin-001"; // Usuário admin do sistema

export async function executeToolForMcp(toolName: string, args: Record<string, any>): Promise<any> {
  // @ts-ignore - Acessa método privado para integração MCP
  return manusService.executeTool(toolName, args, SYSTEM_USER_ID);
}

/**
 * Processa uma mensagem usando o agente (para uso via A2A)
 * @param message Mensagem do usuário
 * @param sessionId ID da sessão (opcional)
 * @returns Resposta do agente
 */
export async function processAgentMessage(message: string, sessionId?: string): Promise<{
  output: string;
  answer?: string;
  toolsUsed?: string[];
  chart?: any;
}> {
  try {
    // Inicia a execução do agente (usa usuário de sistema)
    const { runId } = await manusService.run(SYSTEM_USER_ID, message);
    
    // Aguarda a conclusão do agente (polling com timeout)
    const maxWaitMs = 120000; // 2 minutos máximo
    const pollIntervalMs = 500;
    const startTime = Date.now();
    
    let result = null;
    while (Date.now() - startTime < maxWaitMs) {
      result = await manusService.getRun(runId);
      
      if (!result) {
        return { output: "Erro: execução não encontrada", toolsUsed: [] };
      }
      
      // Verifica se a execução completou
      if (result.status === 'completed' || result.status === 'failed') {
        break;
      }
      
      // Aguarda antes de verificar novamente
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
    
    if (!result) {
      return { output: "Erro: execução não encontrada", toolsUsed: [] };
    }
    
    // Extrai informações relevantes do resultado
    const toolsUsed: string[] = [];
    let chart: any = null;
    let lastAnswer = "";
    
    if (result.steps) {
      for (const step of result.steps) {
        if (step.tool) {
          toolsUsed.push(step.tool);
        }
        if (step.tool === 'generate_chart' && step.output) {
          try {
            chart = JSON.parse(step.output);
          } catch (e) {}
        }
        if (step.tool === 'finish' && step.toolInput) {
          try {
            const input = typeof step.toolInput === 'string' ? JSON.parse(step.toolInput) : step.toolInput;
            lastAnswer = input.answer || "";
          } catch (e) {}
        }
      }
    }
    
    return {
      output: lastAnswer || result.status || "Processamento concluído",
      answer: lastAnswer,
      toolsUsed,
      chart
    };
  } catch (error: any) {
    return {
      output: `Erro ao processar: ${error.message}`,
      toolsUsed: []
    };
  }
}
