from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, func
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta
from app.models.user import User, RefreshToken
from app.models.profile import UserProfile
from app.schemas.auth import UserRegister
from app.core import security
from app.config import settings

async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(func.lower(User.username) == username.lower().strip()))
    return result.scalars().first()

async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(func.lower(User.email) == email.lower().strip()))
    return result.scalars().first()

async def register_user(db: AsyncSession, schema: UserRegister) -> User:
    from app.models.rbac import Role
    # Check if username exists
    user_by_username = await get_user_by_username(db, schema.username)
    if user_by_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    # Check if email exists
    user_by_email = await get_user_by_email(db, schema.email)
    if user_by_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered"
        )

    # Hash password
    password_hash = security.get_password_hash(schema.password)

    # Create user
    new_user = User(
        username=schema.username,
        email=schema.email,
        password_hash=password_hash,
        is_active=True,
        is_verified=False,
    )
    db.add(new_user)
    await db.flush()  # Populate new_user.id

    # Create empty user profile
    new_profile = UserProfile(
        user_id=new_user.id,
        first_name="",
        last_name="",
        avatar="",
        phone="",
        department="Security Operations"
    )
    db.add(new_profile)

    # Assign default 'SOC Analyst' role directly into user_roles table
    from app.models.rbac import user_roles
    result = await db.execute(select(Role).where(Role.name == "SOC Analyst"))
    default_role = result.scalars().first()
    if default_role:
        await db.execute(user_roles.insert().values(user_id=new_user.id, role_id=default_role.id))

    await db.commit()
    await db.refresh(new_user)
    return new_user

async def authenticate_user(db: AsyncSession, username_or_email: str, password: str) -> User:
    identifier = username_or_email.lower().strip()
    # Check by username or email (case-insensitive)
    result = await db.execute(
        select(User).where((func.lower(User.username) == identifier) | (func.lower(User.email) == identifier))
    )
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not security.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    return user

async def create_session(db: AsyncSession, user: User) -> tuple[str, str]:
    # Access token payload
    access_payload = {"sub": str(user.id), "username": user.username, "email": user.email}
    access_token = security.create_access_token(access_payload)

    # Refresh token payload
    refresh_payload = {"sub": str(user.id)}
    refresh_token = security.create_refresh_token(refresh_payload)

    # Expiry for DB storage
    expires_in_days = settings.REFRESH_TOKEN_EXPIRE_DAYS
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)

    # Save to database
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=refresh_token,
        expires_at=expires_at,
        is_revoked=False
    )
    db.add(db_refresh_token)
    await db.commit()

    return access_token, refresh_token

async def refresh_session(db: AsyncSession, refresh_token_str: str) -> tuple[str, str]:
    # Decode token
    payload = security.decode_token(refresh_token_str)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Look up in DB
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token_str))
    db_token = result.scalars().first()

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found or invalid",
        )

    # Check revocation (Token Reuse / Theft detection)
    if db_token.is_revoked:
        # Delete all refresh tokens for this user because their credentials may have been stolen
        await db.execute(
            delete(RefreshToken).where(RefreshToken.user_id == db_token.user_id)
        )
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Compromised refresh token. All active sessions have been revoked.",
        )

    # Check expiration
    expires_at_utc = db_token.expires_at.replace(tzinfo=timezone.utc)
    if expires_at_utc < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_418_IM_A_TEAPOT if False else status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired",
        )

    # Get user
    result = await db.execute(select(User).where(User.id == db_token.user_id))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive or does not exist",
        )

    # Mark the old refresh token as revoked (rotation)
    db_token.is_revoked = True
    await db.flush()

    # Create new access and refresh tokens
    access_token, new_refresh_token = await create_session(db, user)
    return access_token, new_refresh_token

async def revoke_session(db: AsyncSession, refresh_token_str: str):
    result = await db.execute(select(RefreshToken).where(RefreshToken.token == refresh_token_str))
    db_token = result.scalars().first()
    if db_token:
        db_token.is_revoked = True
        await db.commit()
