from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.config import settings

# Create async engine
engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    echo=False,  # Set to True for SQL logging during debugging
    pool_pre_ping=True,
    connect_args={"timeout": 10},  # asyncpg connect timeout (seconds) - fail fast instead of
                                    # hanging forever if Postgres is unreachable/misconfigured
)

# Async session maker
SessionLocal = async_sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession,
)

# Base class for database models
Base = declarative_base()

# Async DB dependency injection
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
