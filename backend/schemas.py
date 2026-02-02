from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: str | None = None

class UserCreate(UserBase):
    password: str
    worker_number: Optional[int] = None

class User(UserBase):
    id: int
    is_active: bool
    role: str
    worker_number: Optional[int] = None

    class Config:
        from_attributes = True

class ShiftBase(BaseModel):
    description: Optional[str] = None

class ShiftCreate(ShiftBase):
    pass

class Shift(ShiftBase):
    id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    status: str

    class Config:
        from_attributes = True

class LocationCreate(BaseModel):
    latitude: float
    longitude: float

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
