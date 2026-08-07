from fastapi import Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.user import User

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        user_role_names = [role.name for role in current_user.roles]
        
        # User must possess at least one of the allowed roles
        if not any(role in self.allowed_roles for role in user_role_names):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Required role not found. Allowed: {', '.join(self.allowed_roles)}"
            )
        return current_user

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        # Resolve the union of all permissions granted across all roles assigned to the user
        user_permissions = set()
        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.name)
                
        if self.required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: Required permission '{self.required_permission}' missing."
            )
        return current_user

def require_role(role_name: str):
    """Helper dependency constructor to restrict an endpoint to a single role."""
    return RoleChecker([role_name])

def require_permission(permission_name: str):
    """Helper dependency constructor to restrict an endpoint to a single permission."""
    return PermissionChecker(permission_name)
