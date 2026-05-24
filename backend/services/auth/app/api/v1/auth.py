from fastapi import APIRouter, Depends, HTTPException, status
from typing import Any
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.common.app.database import get_db
from backend.common.app.models.employee import Employee
from backend.common.app.schemas.auth import Token, LoginRequest
from backend.common.app.schemas.common import APIResponse
from backend.common.app.security import verify_password, create_access_token, create_refresh_token, get_current_user
from datetime import timedelta

router = APIRouter()

@router.post("/login", response_model=APIResponse[Token])
async def login(
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    result = await db.execute(select(Employee).where(Employee.email == form_data.username))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        return APIResponse(
            success=False,
            error_code="INVALID_CREDENTIALS",
            message="Email ou mot de passe incorrect."
        )
        
    if not user.is_active:
        return APIResponse(
            success=False,
            error_code="USER_INACTIVE",
            message="Ce compte est désactivé."
        )

    access_token = create_access_token(subject=str(user.employee_id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.employee_id))
    
    return APIResponse(
        success=True,
        data=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )
    )

@router.get("/me", response_model=APIResponse[Any])
async def read_users_me(current_user: Employee = Depends(get_current_user)):
    return APIResponse(
        success=True,
        data={
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "role": current_user.role
        }
    )
