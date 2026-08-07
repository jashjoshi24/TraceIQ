from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List

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

class RoleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

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
