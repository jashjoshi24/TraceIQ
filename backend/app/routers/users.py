from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.user import (
    UserProfileOut, UserProfileUpdate, PasswordChange,
    UserAdminUpdate, UserDetailOut
)
from app.services import users as users_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/profile", response_model=UserProfileOut)
async def get_own_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve the profile details of the logged-in user."""
    return await users_service.get_profile(db, current_user.id)

@router.put("/profile", response_model=UserProfileOut)
async def update_own_profile(
    schema: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update profile details for the logged-in user."""
    return await users_service.update_profile(db, current_user.id, schema)

@router.put("/change-password", status_code=status.HTTP_200_OK)
async def change_own_password(
    schema: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change the logged-in user's password after verifying their current password."""
    await users_service.change_password(db, current_user, schema)
    return {"detail": "Password updated successfully"}

@router.get("", response_model=dict)
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    sort_by: str = Query("username"),
    sort_order: str = Query("asc"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List and search users with pagination and sorting."""
    if sort_order not in ["asc", "desc"]:
        raise HTTPException(status_code=400, detail="sort_order must be 'asc' or 'desc'")
        
    users, total = await users_service.list_users(db, page, limit, search, sort_by, sort_order)
    
    # Return paginated structure
    return {
        "items": [UserDetailOut.model_validate(u) for u in users],
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{id}", response_model=UserDetailOut)
async def get_user(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get single user profile and registration details."""
    return await users_service.get_user_by_id(db, id)

@router.put("/{id}", response_model=UserDetailOut)
async def update_user(
    id: UUID,
    schema: UserAdminUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Admin endpoint to update user settings (deactivate, activate, verify)."""
    return await users_service.admin_update_user(db, id, schema)

@router.delete("/{id}", status_code=status.HTTP_200_OK)
async def delete_user(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate a user account (soft-delete)."""
    await users_service.deactivate_user(db, id)
    return {"detail": "User account deactivated successfully"}
