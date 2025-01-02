from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from beanie import Document, PydanticObjectId

class Avatar(BaseModel):
    url: str
    updatedAt: datetime

class Status(BaseModel):
    isActive: bool
    isBanned: bool
    lastLoginAt: datetime

class Notifications(BaseModel):
    email: bool
    push: bool

class Settings(BaseModel):
    language: str
    theme: str
    notifications: Notifications

class User(Document):
    username: str
    email: EmailStr
    passwordHash: str
    avatar: Optional[Avatar]
    bio: Optional[str]
    following: List[PydanticObjectId]
    followers: List[PydanticObjectId]
    postsCount: int
    likesCount: int
    status: Status
    settings: Settings
    createdAt: datetime
    updatedAt: datetime

    class Settings:
        collection = "users"