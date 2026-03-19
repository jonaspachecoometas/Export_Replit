from typing import Dict, Any, Optional, List
import re
import operator

SAFE_OPERATORS = {
    '==': operator.eq,
    '!=': operator.ne,
    '<': operator.lt,
    '<=': operator.le,
    '>': operator.gt,
    '>=': operator.ge,
    'and': lambda a, b: a and b,
    'or': lambda a, b: a or b,
    'not': lambda a: not a,
    '+': operator.add,
    '-': operator.sub,
    '*': operator.mul,
    '/': operator.truediv,
    'in': lambda a, b: a in b,
}

def safe_evaluate_condition(condition: str, context: Dict[str, Any]) -> bool:
    """
    Avalia condições de forma segura sem usar eval().
    Suporta: comparações simples, and/or, variáveis do contexto.
    Exemplos: "status == 'approved'", "value > 100", "enabled and count > 0"
    """
    try:
        condition = condition.strip()
        
        if ' and ' in condition:
            parts = condition.split(' and ', 1)
            return safe_evaluate_condition(parts[0], context) and safe_evaluate_condition(parts[1], context)
        
        if ' or ' in condition:
            parts = condition.split(' or ', 1)
            return safe_evaluate_condition(parts[0], context) or safe_evaluate_condition(parts[1], context)
        
        if condition.startswith('not '):
            return not safe_evaluate_condition(condition[4:], context)
        
        for op_str, op_func in [('==', operator.eq), ('!=', operator.ne), 
                                 ('>=', operator.ge), ('<=', operator.le),
                                 ('>', operator.gt), ('<', operator.lt),
                                 (' in ', lambda a, b: a in b)]:
            if op_str in condition:
                parts = condition.split(op_str, 1)
                left = resolve_value(parts[0].strip(), context)
                right = resolve_value(parts[1].strip(), context)
                return op_func(left, right)
        
        value = resolve_value(condition, context)
        return bool(value)
        
    except Exception:
        return False

def resolve_value(expr: str, context: Dict[str, Any]) -> Any:
    """Resolve um valor de forma segura."""
    expr = expr.strip()
    
    if expr.startswith(("'", '"')) and expr.endswith(("'", '"')):
        return expr[1:-1]
    
    if expr.lower() == 'true':
        return True
    if expr.lower() == 'false':
        return False
    if expr.lower() == 'none' or expr.lower() == 'null':
        return None
    
    try:
        if '.' in expr:
            return float(expr)
        return int(expr)
    except ValueError:
        pass
    
    if expr.startswith('[') and expr.endswith(']'):
        items = expr[1:-1].split(',')
        return [resolve_value(item.strip(), context) for item in items if item.strip()]
    
    if '.' in expr:
        parts = expr.split('.')
        value = context
        for part in parts:
            if isinstance(value, dict) and part in value:
                value = value[part]
            else:
                return None
        return value
    
    return context.get(expr)

def run_workflow(spec: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
    """Executa um workflow BPMN simplificado."""
    try:
        result = {
            "status": "completed",
            "data": data,
            "steps_executed": []
        }
        
        if "steps" in spec:
            for step in spec["steps"]:
                step_result = execute_step(step, data)
                result["steps_executed"].append({
                    "step_id": step.get("id"),
                    "type": step.get("type"),
                    "status": step_result.get("status", "completed"),
                    "output": step_result
                })
                
                if step_result.get("status") == "error":
                    result["status"] = "error"
                    result["error"] = step_result.get("error")
                    break
                    
                data.update(step_result.get("data", {}))
        
        result["data"] = data
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "data": data
        }

def execute_step(step: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Executa um passo individual do workflow."""
    step_type = step.get("type", "task")
    
    if step_type == "task":
        action = step.get("action")
        if action:
            return execute_action(action, step.get("params", {}), context)
        return {"status": "completed", "data": {}}
    
    elif step_type == "decision":
        condition = step.get("condition", "")
        result = safe_evaluate_condition(condition, context)
        
        if result and "then" in step:
            then_result = execute_step(step["then"], context)
            return {"status": "completed", "branch": "then", "result": result, "data": then_result.get("data", {})}
        elif not result and "else" in step:
            else_result = execute_step(step["else"], context)
            return {"status": "completed", "branch": "else", "result": result, "data": else_result.get("data", {})}
        
        return {"status": "completed", "result": result, "data": {}}
    
    elif step_type == "loop":
        items = step.get("items", [])
        if isinstance(items, str):
            items = context.get(items, [])
        
        results = []
        for i, item in enumerate(items):
            loop_context = {**context, "item": item, "index": i}
            for sub_step in step.get("steps", []):
                result = execute_step(sub_step, loop_context)
                results.append(result)
        
        return {"status": "completed", "iterations": len(items), "results": results, "data": {}}
    
    elif step_type == "parallel":
        results = []
        for sub_step in step.get("steps", []):
            results.append(execute_step(sub_step, context))
        return {"status": "completed", "results": results, "data": {}}
    
    elif step_type == "wait":
        return {"status": "waiting", "condition": step.get("for"), "data": {}}
    
    elif step_type == "human_approval":
        return {
            "status": "pending_approval",
            "message": step.get("message", "Aprovação necessária"),
            "approvers": step.get("approvers", []),
            "data": {}
        }
    
    return {"status": "completed", "data": {}}

def execute_action(action: str, params: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """Executa uma ação específica do workflow."""
    
    if action == "set_variable":
        name = params.get("name")
        value = params.get("value")
        if isinstance(value, str) and value.startswith("$"):
            value = context.get(value[1:])
        return {"status": "completed", "data": {name: value}}
    
    elif action == "log":
        message = params.get("message", "")
        for key, val in context.items():
            message = message.replace(f"${{{key}}}", str(val))
        return {"status": "completed", "logged": message, "data": {}}
    
    elif action == "http_request":
        return {"status": "completed", "action": "http_request", "url": params.get("url"), "data": {}}
    
    elif action == "send_notification":
        return {
            "status": "completed",
            "action": "notification_queued",
            "channel": params.get("channel", "email"),
            "data": {}
        }
    
    return {"status": "completed", "data": {}}

def validate_workflow(spec: Dict[str, Any]) -> Dict[str, Any]:
    """Valida a especificação de um workflow."""
    errors = []
    warnings = []
    
    if "steps" not in spec:
        errors.append("Workflow deve ter pelo menos um passo (steps)")
    else:
        for i, step in enumerate(spec["steps"]):
            step_errors = validate_step(step, i)
            errors.extend(step_errors)
    
    if "name" not in spec:
        warnings.append("Workflow sem nome definido")
    
    if "version" not in spec:
        warnings.append("Versão do workflow não especificada")
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }

def validate_step(step: Dict[str, Any], index: int) -> List[str]:
    """Valida um passo individual do workflow."""
    errors = []
    
    if "id" not in step:
        errors.append(f"Passo {index} deve ter um id")
    
    step_type = step.get("type", "task")
    
    if step_type == "decision" and "condition" not in step:
        errors.append(f"Passo {index} (decision) deve ter uma condição")
    
    if step_type == "loop" and "items" not in step:
        errors.append(f"Passo {index} (loop) deve ter items para iterar")
    
    if step_type == "parallel" and "steps" not in step:
        errors.append(f"Passo {index} (parallel) deve ter sub-steps")
    
    return errors

def create_workflow_template(workflow_type: str) -> Dict[str, Any]:
    """Cria um template de workflow baseado no tipo."""
    templates = {
        "approval": {
            "name": "Workflow de Aprovação",
            "version": "1.0",
            "steps": [
                {"id": "start", "type": "task", "action": "log", "params": {"message": "Iniciando processo"}},
                {"id": "check_value", "type": "decision", "condition": "value > 1000",
                 "then": {"id": "high_approval", "type": "human_approval", "message": "Valor alto requer aprovação"},
                 "else": {"id": "auto_approve", "type": "task", "action": "set_variable", "params": {"name": "approved", "value": True}}},
                {"id": "end", "type": "task", "action": "log", "params": {"message": "Processo finalizado"}}
            ]
        },
        "data_processing": {
            "name": "Workflow de Processamento de Dados",
            "version": "1.0",
            "steps": [
                {"id": "start", "type": "task", "action": "log", "params": {"message": "Iniciando processamento"}},
                {"id": "process_items", "type": "loop", "items": "records", "steps": [
                    {"id": "process_item", "type": "task", "action": "log", "params": {"message": "Processando item ${index}"}}
                ]},
                {"id": "end", "type": "task", "action": "log", "params": {"message": "Processamento concluído"}}
            ]
        },
        "notification": {
            "name": "Workflow de Notificação",
            "version": "1.0",
            "steps": [
                {"id": "notify", "type": "parallel", "steps": [
                    {"id": "email", "type": "task", "action": "send_notification", "params": {"channel": "email"}},
                    {"id": "whatsapp", "type": "task", "action": "send_notification", "params": {"channel": "whatsapp"}}
                ]}
            ]
        }
    }
    
    return templates.get(workflow_type, templates["approval"])
