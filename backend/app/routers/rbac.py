from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.dependencies.rbac import RoleChecker
from app.schemas.rbac import (
    RoleOut, RoleCreate, RoleUpdate, PermissionOut,
    PermissionCreate, UserRolesAssign
)
from app.services import rbac as rbac_service
from app.schemas.user import UserDetailOut

router = APIRouter(tags=["RBAC"])

# Only Admins can manage roles and permissions
admin_guard = Depends(RoleChecker(["Admin"]))

@router.get("/roles", response_model=List[RoleOut], dependencies=[admin_guard])
async def get_roles(db: AsyncSession = Depends(get_db)):
    """Retrieve all roles with their assigned permissions."""
    return await rbac_service.get_all_roles(db)

@router.post("/roles", response_model=RoleOut, status_code=status.HTTP_201_CREATED, dependencies=[admin_guard])
async def create_role(schema: RoleCreate, db: AsyncSession = Depends(get_db)):
    """Create a new role and bind list of permissions to it."""
    return await rbac_service.create_role(db, schema)

@router.put("/roles/{id}", response_model=RoleOut, dependencies=[admin_guard])
async def update_role(id: UUID, schema: RoleUpdate, db: AsyncSession = Depends(get_db)):
    """Update role details and rebuild permission mapping."""
    return await rbac_service.update_role(db, id, schema)

@router.delete("/roles/{id}", status_code=status.HTTP_200_OK, dependencies=[admin_guard])
async def delete_role(id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a role."""
    await rbac_service.delete_role(db, id)
    return {"detail": "Role deleted successfully"}

@router.get("/permissions", response_model=List[PermissionOut], dependencies=[admin_guard])
async def get_permissions(db: AsyncSession = Depends(get_db)):
    """Retrieve all system permissions."""
    return await rbac_service.get_all_permissions(db)

@router.post("/permissions", response_model=PermissionOut, status_code=status.HTTP_201_CREATED, dependencies=[admin_guard])
async def create_permission(schema: PermissionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new permission."""
    return await rbac_service.create_permission(db, schema)

@router.post("/users/{id}/roles", response_model=UserDetailOut, dependencies=[admin_guard])
async def assign_user_roles(id: UUID, schema: UserRolesAssign, db: AsyncSession = Depends(get_db)):
    """Assign roles to a specific user."""
    return await rbac_service.assign_user_roles(db, id, schema.role_names)
