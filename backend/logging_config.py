"""
Advanced logging configuration for Stock Analytics API
"""

import logging
import logging.handlers
import os
import sys
from datetime import datetime
import json
from typing import Dict, Any

class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON"""
        log_entry = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)
        
        return json.dumps(log_entry, ensure_ascii=False)

class ColoredFormatter(logging.Formatter):
    """Colored formatter for console output"""
    
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'
    
    def format(self, record: logging.LogRecord) -> str:
        """Format with colors for console"""
        color = self.COLORS.get(record.levelname, self.RESET)
        record.levelname = f"{color}{record.levelname}{self.RESET}"
        return super().format(record)

def setup_advanced_logging(
    log_level: str = "INFO",
    log_dir: str = "logs",
    max_file_size: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5,
    enable_json_logging: bool = False
) -> Dict[str, logging.Logger]:
    """
    Setup advanced logging configuration
    
    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory for log files
        max_file_size: Maximum size of each log file in bytes
        backup_count: Number of backup files to keep
        enable_json_logging: Whether to use JSON formatting for file logs
    
    Returns:
        Dictionary of configured loggers
    """
    
    # Create logs directory
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Console handler with colors
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = ColoredFormatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # File handlers
    formatter_class = JSONFormatter if enable_json_logging else logging.Formatter
    file_format = '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    
    # General application log
    app_file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "app.log"),
        maxBytes=max_file_size,
        backupCount=backup_count
    )
    app_file_handler.setLevel(logging.DEBUG)
    app_file_handler.setFormatter(
        formatter_class(file_format) if not enable_json_logging 
        else formatter_class()
    )
    root_logger.addHandler(app_file_handler)
    
    # Error log
    error_file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "error.log"),
        maxBytes=max_file_size,
        backupCount=backup_count
    )
    error_file_handler.setLevel(logging.ERROR)
    error_file_handler.setFormatter(
        formatter_class(file_format) if not enable_json_logging 
        else formatter_class()
    )
    root_logger.addHandler(error_file_handler)
    
    # API requests log
    api_file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "api_requests.log"),
        maxBytes=max_file_size,
        backupCount=backup_count
    )
    api_file_handler.setLevel(logging.INFO)
    api_file_handler.setFormatter(
        formatter_class(file_format) if not enable_json_logging 
        else formatter_class()
    )
    
    # Performance log
    perf_file_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "performance.log"),
        maxBytes=max_file_size,
        backupCount=backup_count
    )
    perf_file_handler.setLevel(logging.INFO)
    perf_file_handler.setFormatter(
        formatter_class(file_format) if not enable_json_logging 
        else formatter_class()
    )
    
    # Create specific loggers
    loggers = {
        'app': logging.getLogger("stock_analytics"),
        'api': logging.getLogger("fmp_api"),
        'requests': logging.getLogger("requests"),
        'performance': logging.getLogger("performance"),
        'security': logging.getLogger("security")
    }
    
    # Configure specific loggers
    loggers['app'].setLevel(logging.INFO)
    loggers['api'].setLevel(logging.DEBUG)
    loggers['requests'].addHandler(api_file_handler)
    loggers['performance'].addHandler(perf_file_handler)
    
    # Security logger (for potential security events)
    security_handler = logging.handlers.RotatingFileHandler(
        os.path.join(log_dir, "security.log"),
        maxBytes=max_file_size,
        backupCount=backup_count
    )
    security_handler.setLevel(logging.WARNING)
    security_handler.setFormatter(
        formatter_class(file_format) if not enable_json_logging 
        else formatter_class()
    )
    loggers['security'].addHandler(security_handler)
    
    return loggers

def log_performance(logger: logging.Logger, operation: str, duration: float, **kwargs):
    """Log performance metrics"""
    extra_fields = {
        'operation': operation,
        'duration_ms': round(duration * 1000, 2),
        **kwargs
    }
    
    if hasattr(logger.handlers[0].formatter, 'format'):
        # For JSON formatter
        record = logging.LogRecord(
            name=logger.name,
            level=logging.INFO,
            pathname="",
            lineno=0,
            msg=f"Performance: {operation} completed in {duration:.3f}s",
            args=(),
            exc_info=None
        )
        record.extra_fields = extra_fields
        logger.handle(record)
    else:
        # For regular formatter
        logger.info(
            f"Performance: {operation} completed in {duration:.3f}s - {kwargs}"
        )

def log_api_call(logger: logging.Logger, endpoint: str, status_code: int, duration: float, **kwargs):
    """Log API call details"""
    extra_fields = {
        'endpoint': endpoint,
        'status_code': status_code,
        'duration_ms': round(duration * 1000, 2),
        **kwargs
    }
    
    level = logging.INFO if 200 <= status_code < 400 else logging.ERROR
    message = f"API Call: {endpoint} - Status: {status_code} - Duration: {duration:.3f}s"
    
    if hasattr(logger.handlers[0].formatter, 'format'):
        # For JSON formatter
        record = logging.LogRecord(
            name=logger.name,
            level=level,
            pathname="",
            lineno=0,
            msg=message,
            args=(),
            exc_info=None
        )
        record.extra_fields = extra_fields
        logger.handle(record)
    else:
        # For regular formatter
        logger.log(level, f"{message} - {kwargs}")
