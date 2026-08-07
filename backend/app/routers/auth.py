from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import UserRegister, UserLogin, UserOut, TokenResponse
from app.schemas.user import UserDetailOut
from app.services import auth as auth_service
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(schema: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user and create an associated empty profile."""
    return await auth_service.register_user(db, schema)

@router.post("/login", response_model=TokenResponse)
async def login(schema: UserLogin, response: Response, db: AsyncSession = Depends(get_db)):
    """Authenticate credentials and issue JWT access and refresh tokens."""
    user = await auth_service.authenticate_user(db, schema.username, schema.password)
    access_token, refresh_token = await auth_service.create_session(db, user)
    
    # Set the refresh token as an HttpOnly cookie restricted to /auth endpoints
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS)
        samesite="lax",
        path="/auth",
        max_age=7 * 24 * 60 * 60  # 7 days matching REFRESH_TOKEN_EXPIRE_DAYS
    )
    
    return TokenResponse(access_token=access_token)

@router.post("/refresh", response_model=TokenResponse)
async def refresh(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Issue a new access token and rotate the refresh token from the HttpOnly cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing from cookies"
        )
    
    access_token, new_refresh_token = await auth_service.refresh_session(db, refresh_token)
    
    # Set the new rotated refresh token
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/auth",
        max_age=7 * 24 * 60 * 60
    )
    
    return TokenResponse(access_token=access_token)

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    """Revoke the current refresh token and clear the client cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        await auth_service.revoke_session(db, refresh_token)
    
    response.delete_cookie(key="refresh_token", path="/auth")
    return {"detail": "Successfully logged out"}

@router.get("/me", response_model=UserDetailOut)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile and role details of the currently authenticated user."""
    return current_user
