import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Find the project root (.env resides in the root of the workspace)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(dotenv_path=os.path.join(PROJECT_ROOT, ".env"))

class Settings(BaseSettings):
    # NOTE: kept as a distinct env var from DATABASE_URL (used by the sync
    # PCAP/dashboard backend, backend/database/connection.py). Both backends
    # point at the same Postgres database, but this one needs the async
    # driver ("+asyncpg") while the sync backend needs the plain scheme -
    # sharing one var name would make one of the two backends fail to start.
    ASYNC_DATABASE_URL: str = "postgresql+asyncpg://postgres:postgrespassword@localhost:5432/traceiq"
    JWT_SECRET_KEY: str = "94c8b0fb6029f636cc6b7a2d8d85fef109594f86d84a7e3d1c9ef26759c25603"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    PORT: int = 8001

    def __init__(self, **values):
        super().__init__(**values)
        # Resolve SQLite relative path to absolute path relative to project root
        if "sqlite" in self.ASYNC_DATABASE_URL and "///./" in self.ASYNC_DATABASE_URL:
            db_file = self.ASYNC_DATABASE_URL.split("///./")[-1]
            abs_path = os.path.abspath(os.path.join(PROJECT_ROOT, db_file))
            abs_path = abs_path.replace("\\", "/")
            self.ASYNC_DATABASE_URL = f"sqlite+aiosqlite:///{abs_path}"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        case_sensitive = True

settings = Settings()
