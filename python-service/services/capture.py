import base64
import os
import json
from datetime import datetime
from typing import Dict, Any
import httpx
from bs4 import BeautifulSoup

async def capture_url(url: str, wait_time: int = 3000) -> Dict[str, Any]:
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
        }
        
        async with httpx.AsyncClient(follow_redirects=True, timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            html = response.text
        
        soup = BeautifulSoup(html, 'lxml')
        
        for tag in soup(['script', 'style', 'noscript', 'header', 'footer', 'nav', 'aside']):
            tag.decompose()
        
        title = soup.title.string.strip() if soup.title and soup.title.string else url
        
        text_parts = []
        for text in soup.stripped_strings:
            if len(text) > 2:
                text_parts.append(text)
        text_content = '\n'.join(text_parts)
        
        headings = []
        for tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            for h in soup.find_all(tag):
                if h.get_text(strip=True):
                    headings.append({
                        "level": tag.upper(),
                        "text": h.get_text(strip=True)[:200]
                    })
        
        links = []
        for a in soup.find_all('a', href=True):
            text = a.get_text(strip=True)
            if text and len(text) > 2:
                href = a['href']
                if href.startswith('/'):
                    from urllib.parse import urljoin
                    href = urljoin(url, href)
                links.append({
                    "text": text[:100],
                    "href": href
                })
            if len(links) >= 50:
                break
        
        images = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            if src.startswith('/'):
                from urllib.parse import urljoin
                src = urljoin(url, src)
            images.append({
                "src": src,
                "alt": img.get('alt', '')[:100]
            })
            if len(images) >= 20:
                break
        
        meta = {}
        for m in soup.find_all('meta'):
            name = m.get('name') or m.get('property')
            content = m.get('content')
            if name and content:
                meta[name] = content[:500]
        
        return {
            "success": True,
            "url": url,
            "title": title,
            "text_content": text_content[:50000],
            "headings": headings[:30],
            "links": links,
            "images": images,
            "meta": meta,
            "screenshot_base64": None,
            "captured_at": datetime.now().isoformat(),
            "word_count": len(text_content.split())
        }
        
    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "url": url,
            "error": f"HTTP error: {e.response.status_code}",
            "captured_at": datetime.now().isoformat()
        }
    except httpx.RequestError as e:
        return {
            "success": False,
            "url": url,
            "error": f"Request failed: {str(e)}",
            "captured_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "success": False,
            "url": url,
            "error": str(e),
            "captured_at": datetime.now().isoformat()
        }

async def extract_requirements(content: str, context: str = "") -> Dict[str, Any]:
    openai_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
    if not openai_key:
        return {"success": False, "error": "OpenAI API key not configured"}
    
    prompt = f"""Analise o seguinte conteúdo de uma página web e extraia informações estruturadas:

CONTEÚDO:
{content[:15000]}

CONTEXTO ADICIONAL:
{context}

Por favor, extraia:
1. RESUMO: Um resumo conciso do conteúdo (2-3 parágrafos)
2. FUNCIONALIDADES: Liste as principais funcionalidades ou recursos mencionados
3. REQUISITOS: Se houver menção a requisitos de sistema, liste-os
4. ENTIDADES: Identifique entidades principais (pessoas, empresas, produtos, tecnologias)
5. TERMOS_CHAVE: Liste os 10 termos ou conceitos mais importantes
6. INSIGHTS: Observações ou insights relevantes para análise de negócios

Responda em formato JSON válido."""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {openai_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "Você é um analista de sistemas especializado em extrair requisitos e informações estruturadas de conteúdo web."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000
                },
                timeout=60.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content_response = data["choices"][0]["message"]["content"]
                
                try:
                    if "```json" in content_response:
                        content_response = content_response.split("```json")[1].split("```")[0]
                    elif "```" in content_response:
                        content_response = content_response.split("```")[1].split("```")[0]
                    
                    extracted = json.loads(content_response.strip())
                    return {"success": True, "extraction": extracted}
                except json.JSONDecodeError:
                    return {"success": True, "extraction": {"raw_response": content_response}}
            else:
                return {"success": False, "error": f"OpenAI API error: {response.status_code}"}
                
    except Exception as e:
        return {"success": False, "error": str(e)}
