import subprocess
import sys
import tempfile
import os
from typing import Optional, Dict, Any

def execute_code(code: str, timeout: int = 30) -> Dict[str, Any]:
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            result = subprocess.run(
                [sys.executable, temp_file],
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=tempfile.gettempdir()
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "output": result.stdout
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr
                }
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Execução do código excedeu o tempo limite."
            }
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)
                
    except Exception as e:
        return {"success": False, "error": str(e)}
