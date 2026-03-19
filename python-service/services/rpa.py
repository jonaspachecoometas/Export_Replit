from typing import Dict, Any, List, Optional
import asyncio
import json

try:
    from playwright.async_api import async_playwright, Browser, Page
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False

class RPAEngine:
    def __init__(self):
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None
        self.recordings: List[Dict[str, Any]] = []
        
    async def initialize(self, headless: bool = True):
        if not PLAYWRIGHT_AVAILABLE:
            return False
        
        try:
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(headless=headless)
            self.page = await self.browser.new_page()
            return True
        except Exception as e:
            return False
    
    async def close(self):
        if self.browser:
            await self.browser.close()
            self.browser = None
            self.page = None
    
    async def execute_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        if not self.page:
            return {"success": False, "error": "Browser não inicializado"}
        
        action_type = action.get("type")
        
        try:
            if action_type == "navigate":
                url = action.get("url")
                await self.page.goto(url, wait_until="networkidle")
                return {"success": True, "action": "navigate", "url": url}
            
            elif action_type == "click":
                selector = action.get("selector")
                await self.page.click(selector)
                return {"success": True, "action": "click", "selector": selector}
            
            elif action_type == "type":
                selector = action.get("selector")
                text = action.get("text", "")
                await self.page.fill(selector, text)
                return {"success": True, "action": "type", "selector": selector}
            
            elif action_type == "wait":
                selector = action.get("selector")
                timeout = action.get("timeout", 30000)
                await self.page.wait_for_selector(selector, timeout=timeout)
                return {"success": True, "action": "wait", "selector": selector}
            
            elif action_type == "screenshot":
                path = action.get("path", "/tmp/screenshot.png")
                await self.page.screenshot(path=path)
                return {"success": True, "action": "screenshot", "path": path}
            
            elif action_type == "extract":
                selector = action.get("selector")
                attribute = action.get("attribute", "textContent")
                element = await self.page.query_selector(selector)
                if element:
                    if attribute == "textContent":
                        value = await element.text_content()
                    else:
                        value = await element.get_attribute(attribute)
                    return {"success": True, "action": "extract", "value": value}
                return {"success": False, "error": "Elemento não encontrado"}
            
            elif action_type == "extract_table":
                selector = action.get("selector", "table")
                rows = await self.page.query_selector_all(f"{selector} tr")
                data = []
                for row in rows:
                    cells = await row.query_selector_all("td, th")
                    row_data = []
                    for cell in cells:
                        text = await cell.text_content()
                        row_data.append(text.strip() if text else "")
                    if row_data:
                        data.append(row_data)
                return {"success": True, "action": "extract_table", "data": data}
            
            elif action_type == "select":
                selector = action.get("selector")
                value = action.get("value")
                await self.page.select_option(selector, value)
                return {"success": True, "action": "select", "selector": selector, "value": value}
            
            elif action_type == "check":
                selector = action.get("selector")
                await self.page.check(selector)
                return {"success": True, "action": "check", "selector": selector}
            
            elif action_type == "uncheck":
                selector = action.get("selector")
                await self.page.uncheck(selector)
                return {"success": True, "action": "uncheck", "selector": selector}
            
            elif action_type == "press":
                key = action.get("key")
                await self.page.keyboard.press(key)
                return {"success": True, "action": "press", "key": key}
            
            elif action_type == "scroll":
                x = action.get("x", 0)
                y = action.get("y", 500)
                await self.page.evaluate(f"window.scrollBy({x}, {y})")
                return {"success": True, "action": "scroll", "x": x, "y": y}
            
            elif action_type == "wait_for_download":
                async with self.page.expect_download() as download_info:
                    if "trigger_selector" in action:
                        await self.page.click(action["trigger_selector"])
                download = await download_info.value
                path = action.get("save_path", f"/tmp/{download.suggested_filename}")
                await download.save_as(path)
                return {"success": True, "action": "download", "path": path}
            
            elif action_type == "upload":
                selector = action.get("selector")
                files = action.get("files", [])
                await self.page.set_input_files(selector, files)
                return {"success": True, "action": "upload", "files": files}
            
            elif action_type == "evaluate":
                script = action.get("script", "")
                result = await self.page.evaluate(script)
                return {"success": True, "action": "evaluate", "result": result}
            
            else:
                return {"success": False, "error": f"Ação desconhecida: {action_type}"}
                
        except Exception as e:
            return {"success": False, "error": str(e), "action": action_type}

async def execute_rpa_script(script: Dict[str, Any]) -> Dict[str, Any]:
    if not PLAYWRIGHT_AVAILABLE:
        return {
            "success": False,
            "error": "Playwright não disponível. Instale com: pip install playwright && playwright install chromium",
            "actions_executed": []
        }
    
    engine = RPAEngine()
    results = []
    extracted_data = {}
    
    try:
        headless = script.get("headless", True)
        initialized = await engine.initialize(headless=headless)
        
        if not initialized:
            return {
                "success": False,
                "error": "Falha ao inicializar navegador",
                "actions_executed": []
            }
        
        actions = script.get("actions", [])
        
        for i, action in enumerate(actions):
            result = await engine.execute_action(action)
            results.append({
                "step": i + 1,
                "action": action.get("type"),
                "result": result
            })
            
            if action.get("save_as") and result.get("success"):
                if "value" in result:
                    extracted_data[action["save_as"]] = result["value"]
                elif "data" in result:
                    extracted_data[action["save_as"]] = result["data"]
            
            if not result.get("success") and not action.get("continue_on_error"):
                break
            
            if action.get("delay"):
                await asyncio.sleep(action["delay"] / 1000)
        
        return {
            "success": all(r["result"].get("success") for r in results),
            "actions_executed": results,
            "extracted_data": extracted_data
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "actions_executed": results
        }
    finally:
        await engine.close()

async def start_recording(target_url: str) -> Dict[str, Any]:
    if not PLAYWRIGHT_AVAILABLE:
        return {
            "success": False,
            "error": "Playwright não disponível"
        }
    
    return {
        "success": True,
        "message": "Para gravar ações RPA, use o Playwright Codegen:",
        "command": f"playwright codegen {target_url}",
        "note": "Execute este comando em um terminal para abrir o gravador interativo"
    }

def create_rpa_template(template_type: str) -> Dict[str, Any]:
    templates = {
        "login": {
            "name": "Template de Login",
            "headless": False,
            "actions": [
                {"type": "navigate", "url": "https://example.com/login"},
                {"type": "type", "selector": "#username", "text": "${username}"},
                {"type": "type", "selector": "#password", "text": "${password}"},
                {"type": "click", "selector": "button[type='submit']"},
                {"type": "wait", "selector": ".dashboard", "timeout": 10000}
            ]
        },
        "scrape_table": {
            "name": "Template de Extração de Tabela",
            "headless": True,
            "actions": [
                {"type": "navigate", "url": "${target_url}"},
                {"type": "wait", "selector": "table"},
                {"type": "extract_table", "selector": "table.data", "save_as": "table_data"},
                {"type": "screenshot", "path": "/tmp/table_screenshot.png"}
            ]
        },
        "form_fill": {
            "name": "Template de Preenchimento de Formulário",
            "headless": False,
            "actions": [
                {"type": "navigate", "url": "${form_url}"},
                {"type": "type", "selector": "#name", "text": "${name}"},
                {"type": "type", "selector": "#email", "text": "${email}"},
                {"type": "type", "selector": "#phone", "text": "${phone}"},
                {"type": "select", "selector": "#category", "value": "${category}"},
                {"type": "click", "selector": "#submit"},
                {"type": "wait", "selector": ".success-message"}
            ]
        },
        "download_report": {
            "name": "Template de Download de Relatório",
            "headless": True,
            "actions": [
                {"type": "navigate", "url": "${report_url}"},
                {"type": "wait", "selector": ".report-ready"},
                {"type": "wait_for_download", "trigger_selector": ".download-btn", "save_path": "/tmp/report.pdf"}
            ]
        },
        "nfe_consulta": {
            "name": "Consulta NFe SEFAZ",
            "headless": True,
            "actions": [
                {"type": "navigate", "url": "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx"},
                {"type": "type", "selector": "#ContentPlaceHolder1_txtChaveAcesso", "text": "${chave_acesso}"},
                {"type": "click", "selector": "#ContentPlaceHolder1_btnConsultar"},
                {"type": "wait", "selector": ".resultado"},
                {"type": "extract", "selector": ".situacao", "save_as": "situacao_nfe"},
                {"type": "screenshot", "path": "/tmp/nfe_consulta.png"}
            ]
        }
    }
    
    return templates.get(template_type, templates["login"])
