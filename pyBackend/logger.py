import logging
import sys

def setup_loggers():
    logger = logging.getLogger("workflow-engine")
    
    if logger.handlers:
        return logger
    
    # starting from DEBUG level
    logger.setLevel(logging.DEBUG)
    
    #setting  format of  the logs
    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    ) 
    
    # Info+ handler
    info_handler = logging.StreamHandler(sys.stdout)
    info_handler.setFormatter(formatter)
    info_handler.setLevel(logging.INFO)
    
    # error handler
    error_handler = logging.StreamHandler(sys.stderr)
    error_handler.setFormatter(formatter)
    error_handler.setLevel(logging.ERROR)
    
    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
    
    return logger

logger = setup_loggers()