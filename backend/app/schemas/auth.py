from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    username: str  # Supports logging in with username or email
    password: str

class UserOut(BaseModel):
    id: UUID
    username: str
    email: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
