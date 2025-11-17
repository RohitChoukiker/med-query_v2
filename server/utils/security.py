"""
Security utilities for JWT tokens and password hashing
"""
import jwt
import bcrypt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
from functools import wraps
from flask import request, jsonify, current_app

class SecurityUtils:
    """Security utilities for authentication and authorization"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def generate_jwt_token(payload: Dict[str, Any], expires_in: int = 3600) -> str:
        """
        Generate a JWT token
        
        Args:
            payload: Data to encode in the token
            expires_in: Token expiration time in seconds (default: 1 hour)
        
        Returns:
            JWT token string
        """
        secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
        
        # Add expiration time to payload
        payload['exp'] = datetime.utcnow() + timedelta(seconds=expires_in)
        payload['iat'] = datetime.utcnow()
        
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        return token
    
    @staticmethod
    def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Decode and verify a JWT token
        
        Args:
            token: JWT token string
        
        Returns:
            Decoded payload or None if invalid
        """
        try:
            secret_key = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def generate_refresh_token(user_id: str) -> str:
        """Generate a refresh token for long-term authentication"""
        payload = {
            'user_id': user_id,
            'type': 'refresh'
        }
        # Refresh tokens expire in 7 days
        return SecurityUtils.generate_jwt_token(payload, expires_in=7*24*3600)
    
    @staticmethod
    def generate_access_token(user_id: str, role: str) -> str:
        """Generate an access token for API access"""
        payload = {
            'user_id': user_id,
            'role': role,
            'type': 'access'
        }
        # Access tokens expire in 1 hour
        return SecurityUtils.generate_jwt_token(payload, expires_in=3600)

def get_token_from_request():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Token is missing'}), 401
    return token

def token_required(f):
    """Decorator to require valid JWT token for API endpoints"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_token_from_request()
        
        if isinstance(token, tuple):  # Check if token is a Flask response tuple
            return token  # Return the JSONResponse directly if token is missing
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token[7:]
            
            data = SecurityUtils.decode_jwt_token(token)
            if not data:
                return jsonify({'message': 'Token is invalid'}), 401
            
            # Add token data to request context
            request.user = data
            
        except Exception as e:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    @token_required
    def decorated(*args, **kwargs):
        if request.user.get('role') != 'admin':
            return jsonify({'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated