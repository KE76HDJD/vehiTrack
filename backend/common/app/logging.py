"""
Structured Logging Configuration

JSON-based logging for ELK stack integration:
- All logs output as JSON for parsing
- Includes service metadata, request context, timing
- Integrates with FastAPI's logging
- Production-ready with different levels per environment
"""

import logging
import json
import sys
from typing import Optional, Any, Dict
from datetime import datetime
from logging.handlers import RotatingFileHandler
import os

# Try to use pythonjsonlogger if available, otherwise basic JSON
try:
    from pythonjsonlogger import jsonlogger
    HAS_JSON_LOGGER = True
except ImportError:
    HAS_JSON_LOGGER = False


class JSONFormatter(logging.Formatter):
    """Custom JSON formatter for structured logging when pythonjsonlogger unavailable"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Convert log record to JSON string"""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields if present
        if hasattr(record, "service_name"):
            log_data["service"] = record.service_name
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "duration_ms"):
            log_data["duration_ms"] = record.duration_ms
        
        return json.dumps(log_data)


class LoggerConfig:
    """Logging configuration management"""
    
    _loggers: Dict[str, logging.Logger] = {}
    _service_name: str = "vehitrack"
    _environment: str = "development"
    _log_level: str = "INFO"
    _log_dir: str = "./logs"
    
    @classmethod
    def configure(
        cls,
        service_name: str = "vehitrack",
        environment: str = "development",
        log_level: str = "INFO",
        log_dir: str = "./logs"
    ) -> None:
        """
        Configure logging for the application.
        
        Args:
            service_name: Service identifier for all logs
            environment: Environment (development/staging/production)
            log_level: Logging level (DEBUG/INFO/WARNING/ERROR/CRITICAL)
            log_dir: Directory for log files
        """
        cls._service_name = service_name
        cls._environment = environment
        cls._log_level = log_level
        cls._log_dir = log_dir
        
        # Create logs directory if needed
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(getattr(logging, log_level))
        
        # Remove existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Console handler (stdout)
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, log_level))
        
        if HAS_JSON_LOGGER:
            console_formatter = jsonlogger.JsonFormatter(
                fmt='%(timestamp)s %(level)s %(logger)s %(message)s'
            )
        else:
            console_formatter = JSONFormatter()
        
        console_handler.setFormatter(console_formatter)
        root_logger.addHandler(console_handler)
        
        # File handler (rotating)
        log_file = os.path.join(log_dir, f"{service_name}.log")
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=10_485_760,  # 10MB
            backupCount=10
        )
        file_handler.setLevel(getattr(logging, log_level))
        file_handler.setFormatter(console_formatter)
        root_logger.addHandler(file_handler)
        
        # Error log file
        error_log_file = os.path.join(log_dir, f"{service_name}_error.log")
        error_handler = RotatingFileHandler(
            error_log_file,
            maxBytes=10_485_760,  # 10MB
            backupCount=10
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(console_formatter)
        root_logger.addHandler(error_handler)
    
    @classmethod
    def get_logger(cls, name: str) -> logging.Logger:
        """Get or create a logger with service context"""
        if name not in cls._loggers:
            logger = logging.getLogger(name)
            # Store service name in logger for use in formatter
            logger.service_name = cls._service_name
            cls._loggers[name] = logger
        
        return cls._loggers[name]


# Convenience functions
def get_logger(name: str) -> logging.Logger:
    """Get logger with given name"""
    return LoggerConfig.get_logger(name)


def log_with_context(
    logger: logging.Logger,
    level: str,
    message: str,
    **context: Any
) -> None:
    """
    Log with additional context fields.
    
    Example:
        log_with_context(
            logger, "info", "Vehicle entry recorded",
            vehicle_id="V123",
            zone_id="Z456",
            duration_ms=245
        )
    """
    # Create logger context by temporarily adding attributes
    for key, value in context.items():
        setattr(logger, key, value)
    
    log_func = getattr(logger, level.lower())
    log_func(message)
    
    # Clean up context
    for key in context.keys():
        if hasattr(logger, key):
            delattr(logger, key)


class RequestContextFilter(logging.Filter):
    """Filter to add request context to logs (for FastAPI middleware)"""
    
    def __init__(self, request_context: Optional[Dict[str, Any]] = None):
        super().__init__()
        self.request_context = request_context or {}
    
    def filter(self, record: logging.LogRecord) -> bool:
        """Add request context to log record"""
        if self.request_context:
            record.request_id = self.request_context.get("request_id")
            record.user_id = self.request_context.get("user_id")
            record.endpoint = self.request_context.get("endpoint")
            record.method = self.request_context.get("method")
        return True


# Pre-configured loggers for common modules
logger_auth = get_logger("vehitrack.auth")
logger_vehicle = get_logger("vehitrack.vehicle")
logger_access = get_logger("vehitrack.access")
logger_session = get_logger("vehitrack.session")
logger_analytics = get_logger("vehitrack.analytics")
logger_notification = get_logger("vehitrack.notification")
logger_report = get_logger("vehitrack.report")
logger_ocr = get_logger("vehitrack.ocr")
logger_iot = get_logger("vehitrack.iot")
logger_security = get_logger("vehitrack.security")
logger_database = get_logger("vehitrack.database")
logger_websocket = get_logger("vehitrack.websocket")


# Audit logger for security events
class AuditLogger:
    """Specialized logger for audit trail and security events"""
    
    def __init__(self, logger: logging.Logger = None):
        self.logger = logger or get_logger("vehitrack.audit")
    
    def log_access_change(
        self,
        actor_id: str,
        resource_type: str,
        resource_id: str,
        action: str,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> None:
        """Log access right changes for compliance"""
        log_data = {
            "event_type": "access_change",
            "actor_id": actor_id,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "action": action,
            "old_value": old_value,
            "new_value": new_value,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(log_data))
    
    def log_authentication(
        self,
        user_id: str,
        success: bool,
        ip_address: Optional[str] = None,
        reason: Optional[str] = None
    ) -> None:
        """Log authentication attempts"""
        log_data = {
            "event_type": "authentication",
            "user_id": user_id,
            "success": success,
            "ip_address": ip_address,
            "reason": reason,
            "timestamp": datetime.utcnow().isoformat()
        }
        level = "info" if success else "warning"
        getattr(self.logger, level)(json.dumps(log_data))
    
    def log_permission_check(
        self,
        user_id: str,
        resource: str,
        action: str,
        allowed: bool,
        ip_address: Optional[str] = None
    ) -> None:
        """Log permission checks"""
        log_data = {
            "event_type": "permission_check",
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "allowed": allowed,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.info(json.dumps(log_data))
    
    def log_error(
        self,
        error_type: str,
        message: str,
        context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log critical errors"""
        log_data = {
            "event_type": "error",
            "error_type": error_type,
            "message": message,
            "context": context or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        self.logger.error(json.dumps(log_data))


# Global audit logger instance
audit_logger = AuditLogger()


# Initialize logging on module import with defaults
# Services should call LoggerConfig.configure() with their own settings
LoggerConfig.configure(
    service_name=os.getenv("SERVICE_NAME", "vehitrack"),
    environment=os.getenv("ENVIRONMENT", "development"),
    log_level=os.getenv("LOG_LEVEL", "INFO"),
    log_dir=os.getenv("LOG_DIR", "./logs")
)
