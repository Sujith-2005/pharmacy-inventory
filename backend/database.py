"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
)

# DEBUG: Print exact DB path
if "sqlite" in settings.DATABASE_URL:
    import os
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    print(f"DEBUG: Using Database at ABSOLUTE PATH: {os.path.abspath(db_path)}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


