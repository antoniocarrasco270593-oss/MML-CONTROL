from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum
import datetime

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    WORKER = "worker"

class ShiftStatus(str, enum.Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="worker") # Stored as string, validated as Enum in schema
    worker_number = Column(Integer, nullable=True, unique=True) # Custom number (1-70)
    is_active = Column(Boolean, default=True)

    shifts = relationship("Shift", back_populates="worker")

class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    status = Column(String, default="active") # active, paused, completed
    total_pause_time_minutes = Column(Integer, default=0)

    worker = relationship("User", back_populates="shifts")
    locations = relationship("LocationLog", back_populates="shift")

class LocationLog(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    shift_id = Column(Integer, ForeignKey("shifts.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    shift = relationship("Shift", back_populates="locations")
