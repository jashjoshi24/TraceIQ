"""
Shared JWT verification for the sync PCAP/dashboard backend (backend/main.py,
port 8000).

This backend does not own the users table - that lives in the async auth
backend (backend/app, port 8001). Rather than duplicate a database
connection just to check who's logged in, this does a stateless check: it
verifies the same JWT the auth backend issued (same secret + algorithm,
loaded from the shared .env at the project root) and trusts its claims.

Both backends MUST share JWT_SECRET_KEY / JWT_ALGORITHM. The auth backend
reads these from backend/app/config.py (pydantic-settings); this one reads
them directly from the environment so this backend doesn't need to import
anything from the app/ package.
"""
import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

load_dotenv()

JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY", "94c8b0fb6029f636cc6b7a2d8d85fef109594f86d84a7e3d1c9ef26759c25603"
)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# tokenUrl is only used to point Swagger UI's "Authorize" button somewhere
# sensible - the actual login endpoint lives on the auth backend (port 8001).
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/auth/login", auto_error=False)


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """FastAPI dependency: verify the bearer token and return the user id (sub claim)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated. Log in via the TraceIQ auth service first.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError:
        raise credentials_exception
    if payload.get("type") != "access":
        raise credentials_exception
    user_id = payload.get("sub")
    if not user_id:
        raise credentials_exception
    return user_id
