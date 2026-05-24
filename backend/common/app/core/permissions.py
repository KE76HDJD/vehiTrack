from fastapi import Depends, HTTPException, status
from .security import get_current_user
from ..models.employee import Employee, EmployeeRole

def require_roles(*roles: str):
    async def role_checker(current_user: Employee = Depends(get_current_user)):
        if current_user.role.value not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions"
            )
        return current_user
    return role_checker
