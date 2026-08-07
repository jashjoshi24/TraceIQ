from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.rbac import router as rbac_router

app = FastAPI(
    title="TraceIQ Security API",
    description="Identity Access and Role-Based Access Control Operations",
    version="1.0.0"
)

# Configure CORS Middleware
# allow_credentials=True is required to allow cookies (refresh tokens) to be sent across origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register endpoints
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(rbac_router)

@app.get("/")
async def root():
    return {
        "status": "active",
        "app": "TraceIQ Security IAM Backend",
        "version": "1.0.0"
    }
