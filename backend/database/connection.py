from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from decouple import config
import os

# Database URL - using SQLite for development, PostgreSQL for production
DATABASE_URL = config('DATABASE_URL', default='sqlite:///./evmaster.db')

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith('sqlite') else {}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    from models import Base
    Base.metadata.create_all(bind=engine)