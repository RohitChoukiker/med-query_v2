"""
Role-based access control utilities
"""
from functools import wraps
from fastapi import Request
from typing import List, Optional, Dict, Any
from enum import Enum

class UserRole(Enum):
    """User roles for access control"""
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    PATIENT = "patient"
    RESEARCHER = "researcher"
    GUEST = "guest"

class Permission(Enum):
    """System permissions"""
    READ_MEDICAL_DATA = "read_medical_data"
    WRITE_MEDICAL_DATA = "write_medical_data"
    DELETE_MEDICAL_DATA = "delete_medical_data"
    MANAGE_USERS = "manage_users"
    VIEW_ANALYTICS = "view_analytics"
    EXPORT_DATA = "export_data"
    ADMIN_ACCESS = "admin_access"

class AuthGuard:
    """Role-based access control manager"""
    
    # Define role permissions
    ROLE_PERMISSIONS = {
        UserRole.ADMIN: [
            Permission.READ_MEDICAL_DATA,
            Permission.WRITE_MEDICAL_DATA,
            Permission.DELETE_MEDICAL_DATA,
            Permission.MANAGE_USERS,
            Permission.VIEW_ANALYTICS,
            Permission.EXPORT_DATA,
            Permission.ADMIN_ACCESS
        ],
        UserRole.DOCTOR: [
            Permission.READ_MEDICAL_DATA,
            Permission.WRITE_MEDICAL_DATA,
            Permission.VIEW_ANALYTICS
        ],
        UserRole.NURSE: [
            Permission.READ_MEDICAL_DATA,
            Permission.WRITE_MEDICAL_DATA
        ],
        UserRole.PATIENT: [
            Permission.READ_MEDICAL_DATA  # Only their own data
        ],
        UserRole.RESEARCHER: [
            Permission.READ_MEDICAL_DATA,
            Permission.VIEW_ANALYTICS,
            Permission.EXPORT_DATA
        ],
        UserRole.GUEST: []
    }
    
    @staticmethod
    def has_permission(user_role: str, permission: Permission) -> bool:
        """Check if a user role has a specific permission"""
        try:
            role_enum = UserRole(user_role)
            return permission in AuthGuard.ROLE_PERMISSIONS.get(role_enum, [])
        except ValueError:
            return False
    
    @staticmethod
    def has_any_permission(user_role: str, permissions: List[Permission]) -> bool:
        """Check if a user role has any of the specified permissions"""
        return any(AuthGuard.has_permission(user_role, perm) for perm in permissions)
    
    @staticmethod
    def has_all_permissions(user_role: str, permissions: List[Permission]) -> bool:
        """Check if a user role has all of the specified permissions"""
        return all(AuthGuard.has_permission(user_role, perm) for perm in permissions)
    
    @staticmethod
    def get_user_permissions(user_role: str) -> List[Permission]:
        """Get all permissions for a user role"""
        try:
            role_enum = UserRole(user_role)
            return AuthGuard.ROLE_PERMISSIONS.get(role_enum, [])
        except ValueError:
            return []

def require_permission(permission: Permission):
    """Decorator to require a specific permission"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user') or not request.current_user:
                return jsonify({'message': 'Authentication required'}), 401
            
            user_role = request.current_user.get('role')
            if not user_role:
                return jsonify({'message': 'User role not found'}), 403
            
            if not AuthGuard.has_permission(user_role, permission):
                return jsonify({
                    'message': f'Permission denied. Required: {permission.value}'
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def require_any_permission(permissions: List[Permission]):
    """Decorator to require any of the specified permissions"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user') or not request.current_user:
                return jsonify({'message': 'Authentication required'}), 401
            
            user_role = request.current_user.get('role')
            if not user_role:
                return jsonify({'message': 'User role not found'}), 403
            
            if not AuthGuard.has_any_permission(user_role, permissions):
                permission_names = [p.value for p in permissions]
                return jsonify({
                    'message': f'Permission denied. Required any of: {permission_names}'
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def require_all_permissions(permissions: List[Permission]):
    """Decorator to require all of the specified permissions"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user') or not request.current_user:
                return jsonify({'message': 'Authentication required'}), 401
            
            user_role = request.current_user.get('role')
            if not user_role:
                return jsonify({'message': 'User role not found'}), 403
            
            if not AuthGuard.has_all_permissions(user_role, permissions):
                permission_names = [p.value for p in permissions]
                return jsonify({
                    'message': f'Permission denied. Required all of: {permission_names}'
                }), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def require_role(required_roles: List[UserRole]):
    """Decorator to require specific user roles"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'current_user') or not request.current_user:
                return jsonify({'message': 'Authentication required'}), 401
            
            user_role = request.current_user.get('role')
            if not user_role:
                return jsonify({'message': 'User role not found'}), 403
            
            try:
                current_role = UserRole(user_role)
                if current_role not in required_roles:
                    role_names = [role.value for role in required_roles]
                    return jsonify({
                        'message': f'Access denied. Required roles: {role_names}'
                    }), 403
            except ValueError:
                return jsonify({'message': 'Invalid user role'}), 403
            
            return f(*args, **kwargs)
        return decorated
    return decorator

def is_owner_or_admin(resource_user_id: str) -> bool:
    """Check if current user is the owner of the resource or an admin"""
    if not hasattr(request, 'current_user') or not request.current_user:
        return False
    
    current_user_id = request.current_user.get('user_id')
    current_user_role = request.current_user.get('role')
    
    return (current_user_id == resource_user_id or 
            current_user_role == UserRole.ADMIN.value)

def require_ownership_or_admin(f):
    """Decorator to require resource ownership or admin role"""
    @wraps(f)
    def decorated(*args, **kwargs):
        # This decorator expects 'user_id' to be passed as a parameter
        resource_user_id = kwargs.get('user_id') or request.json.get('user_id')
        
        if not resource_user_id:
            return jsonify({'message': 'Resource user ID required'}), 400
        
        if not is_owner_or_admin(resource_user_id):
            return jsonify({'message': 'Access denied. Owner or admin required'}), 403
        
        return f(*args, **kwargs)
    return decorated