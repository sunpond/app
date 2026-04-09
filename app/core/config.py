import yaml
import os
from typing import Dict, Any

class ConfigManager:
    """Manages application configuration loaded from YAML."""
    
    def __init__(self, config_path: str = "config/config.yaml"):
        self.config_path = config_path
        self.config: Dict[str, Any] = {}
        self.load_config()

    def load_config(self):
        if not os.path.exists(self.config_path):
            raise FileNotFoundError(f"Configuration file not found: {self.config_path}")
        with open(self.config_path, 'r', encoding='utf-8') as f:
            self.config = yaml.safe_load(f)

    def get(self, key: str, default: Any = None) -> Any:
        keys = key.split('.')
        val = self.config
        for k in keys:
            if isinstance(val, dict) and k in val:
                val = val[k]
            else:
                return default
        return val
