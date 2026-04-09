import logging
import os
from datetime import datetime

def setup_logger(name: str = "ConnectivitySuite", log_dir: str = "logs") -> logging.Logger:
    """Configures and returns a logger instance."""
    os.makedirs(log_dir, exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)
    
    if not logger.handlers:
        # Console Handler
        ch = logging.StreamHandler()
        ch.setLevel(logging.INFO)
        
        # File Handler
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        fh = logging.FileHandler(os.path.join(log_dir, f"session_{timestamp}.log"), encoding='utf-8')
        fh.setLevel(logging.DEBUG)
        
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        ch.setFormatter(formatter)
        fh.setFormatter(formatter)
        
        logger.addHandler(ch)
        logger.addHandler(fh)
        
    return logger

logger = setup_logger()
