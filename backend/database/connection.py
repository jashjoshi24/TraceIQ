import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load variables from a .env file (at the project root, or backend/) if one
# exists. Safe to call even if no .env is present or dotenv already loaded it
# elsewhere (e.g. main.py) - it's a no-op in that case.
load_dotenv()

# The user must provide a valid PostgreSQL connection string.
# Defaults to localhost for development if not provided.
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/traceiq")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
