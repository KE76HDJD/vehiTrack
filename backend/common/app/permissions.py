"""Role-Based Access Control (RBAC) Permission System."""
from typing import List
from fastapi import Depends, HTTPException, status
from .security import get_current_user

ROLE_HIERARCHY = {
    "admin": 4,
    "manager": 3,
    "gardien": 2,
    "employe": 1,
}

PERMISSION_MATRIX = {
    "sessions": {
        "read_all": ["gardien", "manager", "admin"],
        "create": ["gardien", "admin"],
        "close": ["gardien", "admin"],
        "force_close": ["admin"],
    },
    "reservations": {
        "read_own": ["employe", "manager", "admin"],
        "read_all": ["manager", "admin"],
        "create": ["employe", "manager", "admin"],
        "cancel": ["employe", "manager", "admin"],
    },
    "analytics": {"view": ["manager", "admin"]},
    "reports": {
        "generate": ["manager", "admin"],
        "download": ["manager", "admin"],
    },
    "alerts": {
        "acknowledge": ["gardien", "manager", "admin"],
        "escalate": ["manager", "admin"],
    },
    "access_rights": {"crud": ["admin"]},
    "employees": {"crud": ["admin"]},
    "vehicles": {"crud": ["admin"]},
    "zones": {
        "read": ["gardien", "employe", "manager", "admin"],
        "crud": ["admin"],
    },
    "audit_logs": {"read": ["admin"]},
}


class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    async def __call__(self, current_user=Depends(get_current_user)):
        role_value = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
        if role_value not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{role_value}' not permitted.",
            )
        return current_user


def require_roles(*allowed_roles: str):
    return RoleChecker(list(allowed_roles))


def check_role_hierarchy(user_role: str, required_role: str) -> bool:
    user_level = ROLE_HIERARCHY.get(user_role, 0)
    required_level = ROLE_HIERARCHY.get(required_role, 0)
    return user_level >= required_level


def get_allowed_roles_for_action(resource: str, action: str) -> List[str]:
    if resource in PERMISSION_MATRIX and action in PERMISSION_MATRIX[resource]:
        return PERMISSION_MATRIX[resource][action]
    return []
