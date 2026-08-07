from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from app.database import get_db
from app.core import security
from app.models.user import User
from app.models.rbac import Role

# OAuth2PasswordBearer extracts the token from the "Authorization: Bearer <token>" header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    payload = security.decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    user_id_str: str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # Load user with profile, roles, and role permissions eagerly to avoid lazy-loading errors in async queries
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(
            selectinload(User.profile),
            selectinload(User.roles).selectinload(Role.permissions)
        )
    )
    user = result.scalars().first()

    if not user:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    return user
