from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from app.models.rbac import Role, Permission
from app.models.user import User
from app.schemas.rbac import RoleCreate, RoleUpdate, PermissionCreate
from app.services.users import get_user_by_id

async def get_all_roles(db: AsyncSession) -> list[Role]:
    """Retrieve all roles with their assigned permissions loaded."""
    result = await db.execute(select(Role).options(selectinload(Role.permissions)))
    return list(result.scalars().all())

async def get_role_by_id(db: AsyncSession, role_id: UUID) -> Role:
    """Retrieve a single role by ID."""
    result = await db.execute(
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.permissions))
    )
    role = result.scalars().first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    return role

async def create_role(db: AsyncSession, schema: RoleCreate) -> Role:
    """Create a new role and optionally associate permissions by their names."""
    result = await db.execute(select(Role).where(Role.name == schema.name))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role already exists"
        )
    
    # Resolve permissions from names
    perms = []
    if schema.permissions:
        result_perms = await db.execute(
            select(Permission).where(Permission.name.in_(schema.permissions))
        )
        perms = list(result_perms.scalars().all())
        
    role = Role(name=schema.name, description=schema.description, permissions=perms)
    db.add(role)
    await db.commit()
    await db.refresh(role)
    return role

async def update_role(db: AsyncSession, role_id: UUID, schema: RoleUpdate) -> Role:
    """Update role details and re-assign permissions."""
    role = await get_role_by_id(db, role_id)
    
    if schema.name is not None:
        role.name = schema.name
    if schema.description is not None:
        role.description = schema.description
    if schema.permissions is not None:
        # Re-resolve and replace permissions
        result_perms = await db.execute(
            select(Permission).where(Permission.name.in_(schema.permissions))
        )
        role.permissions = list(result_perms.scalars().all())
        
    await db.commit()
    await db.refresh(role)
    return role

async def delete_role(db: AsyncSession, role_id: UUID):
    """Delete a role from the database."""
    role = await get_role_by_id(db, role_id)
    await db.delete(role)
    await db.commit()

async def get_all_permissions(db: AsyncSession) -> list[Permission]:
    """Retrieve all available permissions."""
    result = await db.execute(select(Permission))
    return list(result.scalars().all())

async def create_permission(db: AsyncSession, schema: PermissionCreate) -> Permission:
    """Create a new permission in the database."""
    result = await db.execute(select(Permission).where(Permission.name == schema.name))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permission already exists"
        )
        
    permission = Permission(name=schema.name, description=schema.description)
    db.add(permission)
    await db.commit()
    await db.refresh(permission)
    return permission

async def assign_user_roles(db: AsyncSession, user_id: UUID, role_names: list[str]) -> User:
    """Assign a set of roles to a specific user, replacing any current role assignments."""
    user = await get_user_by_id(db, user_id)
    
    # Resolve roles by name
    result_roles = await db.execute(
        select(Role).where(Role.name.in_(role_names)).options(selectinload(Role.permissions))
    )
    roles = list(result_roles.scalars().all())
    
    user.roles = roles
    await db.commit()
    await db.refresh(user)
    return user
