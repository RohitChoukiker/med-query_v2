"""
Utils package for medical query application
"""

# Flask-based modules commented out - project uses FastAPI
# from .security import SecurityUtils, token_required, admin_required
# from .auth_guard import (
#     AuthGuard, UserRole, Permission,
#     require_permission, require_any_permission, require_all_permissions,
#     require_role, require_ownership_or_admin, is_owner_or_admin
# )

# FastAPI-compatible modules
try:
    from .tagging import MedicalTagger, tag_medical_text
except ImportError:
    MedicalTagger = None
    tag_medical_text = None

try:
    from .logger import (
        MedicalLogger, logger, debug, info, warning, error, critical,
        audit, log_api_access, log_authentication, log_data_access,
        log_medical_query, LoggingMiddleware
    )
except ImportError:
    MedicalLogger = None
    logger = None

__all__ = [
    # Tagging
    'MedicalTagger', 'tag_medical_text',
    
    # Logger
    'MedicalLogger', 'logger', 'debug', 'info', 'warning', 'error', 'critical',
    'audit', 'log_api_access', 'log_authentication', 'log_data_access',
    'log_medical_query', 'LoggingMiddleware'
]