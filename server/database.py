from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import enum
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Determine database URL; fall back to a local SQLite file for containers
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    logging.warning("DATABASE_URL not set, falling back to local SQLite database 'sqlite:///./medquery.db'")
    SQLALCHEMY_DATABASE_URL = "sqlite:///./medquery.db"

# Create SQLAlchemy engine
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class UserRole(enum.Enum):
    doctor = "doctor"
    researcher = "researcher"
    patient = "patient"
    admin = "admin"

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()