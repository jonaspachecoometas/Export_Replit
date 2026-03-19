import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional
import json
import re

def analyze_data(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Análise estatística completa de dados."""
    if not data:
        return {"error": "Dados vazios"}
    
    df = pd.DataFrame(data)
    
    analysis = {
        "shape": {"rows": len(df), "columns": len(df.columns)},
        "columns": list(df.columns),
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "missing_values": df.isnull().sum().to_dict(),
        "statistics": {},
        "sample": df.head(5).to_dict(orient="records") if len(df) > 0 else []
    }
    
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        analysis["statistics"] = df[numeric_cols].describe().to_dict()
    
    return analysis

def detect_patterns(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Detecta padrões e correlações nos dados."""
    if not data:
        return {"patterns": []}
    
    df = pd.DataFrame(data)
    patterns = []
    
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    if len(numeric_cols) >= 2:
        corr_matrix = df[numeric_cols].corr()
        for i, col1 in enumerate(numeric_cols):
            for col2 in numeric_cols[i+1:]:
                corr = corr_matrix.loc[col1, col2]
                if abs(corr) > 0.7:
                    patterns.append({
                        "type": "correlation",
                        "columns": [col1, col2],
                        "value": round(corr, 3),
                        "description": f"Forte correlação entre {col1} e {col2}"
                    })
    
    for col in numeric_cols:
        if len(df[col].dropna()) > 10:
            values = df[col].dropna().values
            if len(values) > 2:
                trend = np.polyfit(range(len(values)), values, 1)[0]
                if abs(trend) > (values.std() * 0.1):
                    direction = "crescente" if trend > 0 else "decrescente"
                    patterns.append({
                        "type": "trend",
                        "column": col,
                        "direction": direction,
                        "slope": round(trend, 4),
                        "description": f"Tendência {direction} detectada em {col}"
                    })
    
    return {"patterns": patterns}

def generate_insights(data: List[Dict[str, Any]]) -> List[str]:
    """Gera insights automáticos sobre os dados."""
    if not data:
        return []
    
    df = pd.DataFrame(data)
    insights = []
    
    missing = df.isnull().sum()
    cols_with_missing = missing[missing > 0]
    if len(cols_with_missing) > 0:
        for col, count in cols_with_missing.items():
            pct = (count / len(df)) * 100
            insights.append(f"Coluna '{col}' tem {count} valores ausentes ({pct:.1f}%)")
    
    numeric_cols = df.select_dtypes(include=['number']).columns
    for col in numeric_cols:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        outliers = ((df[col] < (q1 - 1.5 * iqr)) | (df[col] > (q3 + 1.5 * iqr))).sum()
        if outliers > 0:
            insights.append(f"Coluna '{col}' contém {outliers} possíveis outliers")
    
    for col in df.select_dtypes(include=['object']).columns:
        value_counts = df[col].value_counts()
        if len(value_counts) > 0:
            top_value = value_counts.index[0]
            top_count = value_counts.iloc[0]
            if top_count > len(df) * 0.5:
                insights.append(f"Coluna '{col}' tem valor dominante: '{top_value}' ({top_count/len(df)*100:.1f}%)")
    
    return insights


class ScientistModule:
    """Módulo Cientista para auto-programação e aprendizado."""
    
    def __init__(self):
        self.learned_patterns: Dict[str, Any] = {}
        self.generated_functions: Dict[str, str] = {}
        self.execution_history: List[Dict[str, Any]] = []
    
    def generate_analysis_code(self, data_description: str, goal: str) -> Dict[str, Any]:
        """Gera código Python para análise baseado na descrição dos dados e objetivo."""
        
        templates = {
            "aggregate": '''
import pandas as pd

def aggregate_data(df, group_col, value_col):
    """Agregação de dados por coluna de agrupamento.
    
    Args:
        df: DataFrame com os dados
        group_col: Nome da coluna para agrupar
        value_col: Nome da coluna para agregar
    
    Returns:
        DataFrame com total, média e contagem por grupo
    """
    result = df.groupby(group_col).agg({
        value_col: ["sum", "mean", "count"]
    }).reset_index()
    result.columns = [group_col, "total", "media", "quantidade"]
    return result

# Exemplo de uso:
# result = aggregate_data(df, "categoria", "valor")
''',
            "filter": '''
import pandas as pd

def filter_data(df, column, condition, value):
    """Filtra dados baseado em condição.
    
    Args:
        df: DataFrame com os dados
        column: Nome da coluna a filtrar
        condition: Tipo de condição: "equals", "greater", "less", "contains"
        value: Valor para comparação
    
    Returns:
        DataFrame filtrado
    """
    if condition == "equals":
        return df[df[column] == value]
    elif condition == "greater":
        return df[df[column] > value]
    elif condition == "less":
        return df[df[column] < value]
    elif condition == "contains":
        return df[df[column].str.contains(str(value), na=False)]
    return df

# Exemplo de uso:
# result = filter_data(df, "status", "equals", "ativo")
''',
            "transform": '''
import pandas as pd
import numpy as np

def transform_data(df, transformations):
    """Aplica transformações aos dados.
    
    Args:
        df: DataFrame com os dados
        transformations: Dict com coluna -> tipo de transformação
            Tipos: "normalize", "log", "categorical"
    
    Returns:
        DataFrame transformado
    """
    result = df.copy()
    for col, func in transformations.items():
        if func == "normalize":
            min_val = result[col].min()
            max_val = result[col].max()
            result[col] = (result[col] - min_val) / (max_val - min_val)
        elif func == "log":
            result[col] = np.log1p(result[col])
        elif func == "categorical":
            result[col] = result[col].astype("category").cat.codes
    return result

# Exemplo de uso:
# result = transform_data(df, {"valor": "normalize", "categoria": "categorical"})
''',
            "predict": '''
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split

def simple_predict(df, target_col, feature_cols):
    """Predição simples usando regressão linear.
    
    Args:
        df: DataFrame com os dados
        target_col: Nome da coluna alvo (Y)
        feature_cols: Lista de colunas de features (X)
    
    Returns:
        Dict com score, coeficientes e predições de exemplo
    """
    X = df[feature_cols].dropna()
    y = df.loc[X.index, target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    predictions = model.predict(X_test)
    
    return {
        "score": score,
        "coefficients": dict(zip(feature_cols, model.coef_)),
        "intercept": model.intercept_,
        "sample_predictions": predictions[:5].tolist()
    }

# Exemplo de uso:
# result = simple_predict(df, "preco", ["area", "quartos", "idade"])
''',
            "report": '''
import pandas as pd

def generate_report(df):
    """Gera relatório completo dos dados.
    
    Args:
        df: DataFrame para analisar
    
    Returns:
        Dict com resumo, estatísticas e qualidade dos dados
    """
    report = {
        "resumo": {
            "total_registros": len(df),
            "total_colunas": len(df.columns),
            "memoria_mb": round(df.memory_usage(deep=True).sum() / 1024 / 1024, 2)
        },
        "estatisticas": {},
        "qualidade": {}
    }
    
    for col in df.select_dtypes(include=["number"]).columns:
        report["estatisticas"][col] = {
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "media": float(df[col].mean()),
            "mediana": float(df[col].median()),
            "desvio": float(df[col].std())
        }
    
    for col in df.columns:
        report["qualidade"][col] = {
            "nulos": int(df[col].isnull().sum()),
            "unicos": int(df[col].nunique()),
            "tipo": str(df[col].dtype)
        }
    
    return report

# Exemplo de uso:
# report = generate_report(pd.DataFrame(your_data))
'''
        }
        
        goal_lower = goal.lower()
        code = ""
        template_used = ""
        
        if any(kw in goal_lower for kw in ["agregar", "agrupar", "somar", "total"]):
            code = templates["aggregate"]
            template_used = "aggregate"
        elif any(kw in goal_lower for kw in ["filtrar", "selecionar", "encontrar"]):
            code = templates["filter"]
            template_used = "filter"
        elif any(kw in goal_lower for kw in ["transformar", "normalizar", "converter"]):
            code = templates["transform"]
            template_used = "transform"
        elif any(kw in goal_lower for kw in ["prever", "predizer", "estimar", "modelo"]):
            code = templates["predict"]
            template_used = "predict"
        else:
            code = templates["report"]
            template_used = "report"
        
        self.generated_functions[goal] = code
        
        function_names = {
            "aggregate": "aggregate_data(df, group_col, value_col)",
            "filter": "filter_data(df, column, condition, value)",
            "transform": "transform_data(df, transformations)",
            "predict": "simple_predict(df, target_col, feature_cols)",
            "report": "generate_report(df)"
        }
        
        return {
            "code": code,
            "template_used": template_used,
            "goal": goal,
            "description": f"Código gerado para: {goal}",
            "usage": f"Copie o código e execute: {function_names.get(template_used, 'função(df)')}"
        }
    
    def generate_automation_code(self, task_description: str) -> Dict[str, Any]:
        """Gera código de automação baseado na descrição da tarefa."""
        
        task_lower = task_description.lower()
        
        if any(kw in task_lower for kw in ["email", "enviar", "notificar"]):
            code = '''
async def send_notification(recipient: str, subject: str, body: str):
    """Envia notificação por email"""
    import smtplib
    from email.mime.text import MIMEText
    
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["To"] = recipient
    
    # Configurar SMTP
    # server = smtplib.SMTP("smtp.example.com", 587)
    # server.send_message(msg)
    
    return {"status": "sent", "recipient": recipient}
'''
            return {"code": code, "type": "notification", "requires": ["smtplib"]}
        
        elif any(kw in task_lower for kw in ["api", "requisição", "http", "fetch"]):
            code = '''
async def api_request(url: str, method: str = "GET", data: dict = None):
    """Faz requisição HTTP"""
    import httpx
    
    async with httpx.AsyncClient() as client:
        if method.upper() == "GET":
            response = await client.get(url)
        elif method.upper() == "POST":
            response = await client.post(url, json=data)
        elif method.upper() == "PUT":
            response = await client.put(url, json=data)
        elif method.upper() == "DELETE":
            response = await client.delete(url)
        else:
            raise ValueError(f"Método não suportado: {method}")
        
        return {
            "status_code": response.status_code,
            "data": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
        }
'''
            return {"code": code, "type": "api_integration", "requires": ["httpx"]}
        
        elif any(kw in task_lower for kw in ["arquivo", "csv", "excel", "importar", "exportar"]):
            code = '''
def process_file(file_path: str, output_format: str = "csv"):
    """Processa arquivo de dados"""
    import pandas as pd
    
    # Detectar formato de entrada
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    elif file_path.endswith((".xlsx", ".xls")):
        df = pd.read_excel(file_path)
    elif file_path.endswith(".json"):
        df = pd.read_json(file_path)
    else:
        raise ValueError(f"Formato não suportado: {file_path}")
    
    # Processar dados
    df = df.dropna(how="all")  # Remove linhas vazias
    
    # Exportar
    output_path = file_path.rsplit(".", 1)[0] + "_processed"
    if output_format == "csv":
        output_path += ".csv"
        df.to_csv(output_path, index=False)
    elif output_format == "excel":
        output_path += ".xlsx"
        df.to_excel(output_path, index=False)
    elif output_format == "json":
        output_path += ".json"
        df.to_json(output_path, orient="records")
    
    return {"output_path": output_path, "rows_processed": len(df)}
'''
            return {"code": code, "type": "file_processing", "requires": ["pandas", "openpyxl"]}
        
        elif any(kw in task_lower for kw in ["schedule", "agendar", "cron", "periódico"]):
            code = '''
import asyncio
from datetime import datetime, timedelta

class TaskScheduler:
    """Agendador de tarefas simples"""
    
    def __init__(self):
        self.tasks = []
        self.running = False
    
    def schedule(self, func, interval_seconds: int, name: str = None):
        """Agenda uma tarefa para execução periódica"""
        self.tasks.append({
            "func": func,
            "interval": interval_seconds,
            "name": name or func.__name__,
            "last_run": None,
            "next_run": datetime.now()
        })
    
    async def run(self):
        """Inicia o loop de execução"""
        self.running = True
        while self.running:
            now = datetime.now()
            for task in self.tasks:
                if now >= task["next_run"]:
                    try:
                        if asyncio.iscoroutinefunction(task["func"]):
                            await task["func"]()
                        else:
                            task["func"]()
                        task["last_run"] = now
                        task["next_run"] = now + timedelta(seconds=task["interval"])
                    except Exception as e:
                        print(f"Erro em {task['name']}: {e}")
            await asyncio.sleep(1)
    
    def stop(self):
        """Para o agendador"""
        self.running = False
'''
            return {"code": code, "type": "scheduler", "requires": ["asyncio"]}
        
        code = '''
from datetime import datetime

def custom_automation(input_data):
    """Automação customizada.
    
    Args:
        input_data: Dados de entrada para processar
    
    Returns:
        Dict com status do processamento
    """
    result = {
        "input_received": input_data,
        "status": "processed",
        "timestamp": datetime.now().isoformat()
    }
    return result
'''
        return {"code": code, "type": "custom", "requires": ["datetime"]}
    
    def learn_from_execution(self, task: str, code: str, result: Any, success: bool):
        """Aprende com execuções anteriores para melhorar futuras gerações."""
        execution = {
            "task": task,
            "code_hash": hash(code),
            "success": success,
            "result_type": type(result).__name__,
            "timestamp": pd.Timestamp.now().isoformat()
        }
        self.execution_history.append(execution)
        
        if success:
            keywords = set(task.lower().split())
            for kw in keywords:
                if kw not in self.learned_patterns:
                    self.learned_patterns[kw] = {"success_count": 0, "fail_count": 0}
                self.learned_patterns[kw]["success_count"] += 1
        else:
            keywords = set(task.lower().split())
            for kw in keywords:
                if kw not in self.learned_patterns:
                    self.learned_patterns[kw] = {"success_count": 0, "fail_count": 0}
                self.learned_patterns[kw]["fail_count"] += 1
        
        return execution
    
    def suggest_improvements(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sugere melhorias baseado na análise dos dados."""
        suggestions = []
        
        if not data:
            return suggestions
        
        df = pd.DataFrame(data)
        
        for col in df.columns:
            null_pct = df[col].isnull().sum() / len(df) * 100
            if null_pct > 0 and null_pct < 50:
                if df[col].dtype in ['int64', 'float64']:
                    suggestions.append({
                        "type": "data_quality",
                        "column": col,
                        "issue": f"{null_pct:.1f}% valores ausentes",
                        "suggestion": "Preencher com média ou mediana",
                        "code": f"df['{col}'].fillna(df['{col}'].median(), inplace=True)"
                    })
                else:
                    suggestions.append({
                        "type": "data_quality",
                        "column": col,
                        "issue": f"{null_pct:.1f}% valores ausentes",
                        "suggestion": "Preencher com valor mais frequente",
                        "code": f"df['{col}'].fillna(df['{col}'].mode()[0], inplace=True)"
                    })
        
        date_patterns = ['date', 'data', 'dt', 'time', 'created', 'updated']
        for col in df.columns:
            if any(p in col.lower() for p in date_patterns) and df[col].dtype == 'object':
                suggestions.append({
                    "type": "optimization",
                    "column": col,
                    "issue": "Coluna de data como texto",
                    "suggestion": "Converter para datetime",
                    "code": f"df['{col}'] = pd.to_datetime(df['{col}'])"
                })
        
        object_cols = df.select_dtypes(include=['object']).columns
        for col in object_cols:
            unique_ratio = df[col].nunique() / len(df)
            if unique_ratio < 0.05 and df[col].nunique() < 50:
                suggestions.append({
                    "type": "optimization",
                    "column": col,
                    "issue": f"Coluna com apenas {df[col].nunique()} valores únicos",
                    "suggestion": "Converter para categoria para economizar memória",
                    "code": f"df['{col}'] = df['{col}'].astype('category')"
                })
        
        return suggestions
    
    def get_status(self) -> Dict[str, Any]:
        """Retorna o status atual do módulo cientista."""
        return {
            "learned_patterns": len(self.learned_patterns),
            "generated_functions": len(self.generated_functions),
            "executions_total": len(self.execution_history),
            "executions_successful": sum(1 for e in self.execution_history if e.get("success")),
            "top_patterns": sorted(
                self.learned_patterns.items(),
                key=lambda x: x[1].get("success_count", 0),
                reverse=True
            )[:10]
        }


scientist = ScientistModule()

def get_scientist() -> ScientistModule:
    """Retorna a instância global do módulo cientista."""
    return scientist
