from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List

class PermissionOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class PermissionCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)

class RoleOut(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    permissions: List[PermissionOut] = []

    model_config = {
        "from_attributes": True
    }

class RoleCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    permissions: List[str] = []  # List of permission names to bind to this role

class RoleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = Field(None, max_length=200)
    permissions: Optional[List[str]] = None  # List of permission names to bind to this role

class UserRolesAssign(BaseModel):
    role_names: List[str]
