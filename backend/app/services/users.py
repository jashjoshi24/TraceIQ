from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc, asc
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from uuid import UUID
from app.models.user import User
from app.models.profile import UserProfile
from app.schemas.user import UserProfileUpdate, PasswordChange, UserAdminUpdate
from app.core import security

async def get_profile(db: AsyncSession, user_id: UUID) -> UserProfile:
    """Retrieve the profile corresponding to the given user ID."""
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    return profile

async def update_profile(db: AsyncSession, user_id: UUID, schema: UserProfileUpdate) -> UserProfile:
    """Update user profile fields."""
    profile = await get_profile(db, user_id)
    
    update_data = schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    await db.commit()
    await db.refresh(profile)
    return profile

async def change_password(db: AsyncSession, user: User, schema: PasswordChange):
    """Verify current password and hash/update the password to a new one."""
    if not security.verify_password(schema.current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    user.password_hash = security.get_password_hash(schema.new_password)
    await db.commit()

async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User:
    """Get a single user by ID with eager loading for relations."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.profile), selectinload(User.roles))
    )
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

async def list_users(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    search: str | None = None,
    sort_by: str = "username",
    sort_order: str = "asc"
) -> tuple[list[User], int]:
    """Retrieve a paginated, sorted, and searchable list of users."""
    query = select(User).join(User.profile, isouter=True).options(
        selectinload(User.profile),
        selectinload(User.roles)
    )
    
    # Case-insensitive search on username, email, or department
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (User.username.ilike(search_filter)) |
            (User.email.ilike(search_filter)) |
            (UserProfile.department.ilike(search_filter))
        )
        
    # Get total count of matched records
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Determine sorting column
    sort_attr = getattr(User, sort_by, None)
    if not sort_attr:
        sort_attr = getattr(UserProfile, sort_by, None)
    if not sort_attr:
        sort_attr = User.username
        
    # Apply sorting
    if sort_order == "desc":
        query = query.order_by(desc(sort_attr))
    else:
        query = query.order_by(asc(sort_attr))
        
    # Apply pagination offset/limit
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    
    result = await db.execute(query)
    users = result.scalars().all()
    return list(users), total

async def admin_update_user(db: AsyncSession, user_id: UUID, schema: UserAdminUpdate) -> User:
    """Let an administrator update a user's parameters."""
    user = await get_user_by_id(db, user_id)
    
    update_data = schema.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    await db.commit()
    await db.refresh(user)
    return user

async def deactivate_user(db: AsyncSession, user_id: UUID):
    """Soft-delete a user by marking them inactive."""
    user = await get_user_by_id(db, user_id)
    user.is_active = False
    await db.commit()
