from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from app.schemas.rbac import RoleOut

class UserProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    avatar: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)

class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)

class UserAdminUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None

# NOTE: RoleOut is imported from app.schemas.rbac (single source of truth) so that
# roles returned here include their `permissions` list. A separate, incomplete
# RoleOut used to be defined locally in this file (missing `permissions`), which
# silently broke the frontend: useAuthStore.setUser() does
# `role.permissions.map(...)` for every role, and Pydantic drops fields not
# declared on the response model - so `permissions` was always undefined and
# every login/hydrate for a user with any assigned role threw a TypeError in
# the browser (which the UI then misreported as "Cannot connect to backend").
class UserDetailOut(BaseModel):
    id: UUID
    username: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    profile: Optional[UserProfileOut] = None
    roles: List[RoleOut] = []

    model_config = {
        "from_attributes": True
    }
