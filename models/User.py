from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field, model_validator
from beanie import Document, PydanticObjectId


class Avatar(BaseModel):
    url: str
    updatedAt: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "Avatar":
        if isinstance(data, str):
            return cls(url=data, updatedAt=datetime.utcnow())
        return cls(**data)


class Status(BaseModel):
    isActive: bool = Field(default=True)
    isBanned: bool = Field(default=False)
    lastLoginAt: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    def from_dict(cls, data: dict) -> "Status":
        if not data:
            return cls()
        return cls(**data)


class Notifications(BaseModel):
    email: bool = Field(default=True)
    push: bool = Field(default=True)


class Settings(BaseModel):
    language: str = Field(default="en")
    theme: str = Field(default="light")
    notifications: Notifications = Field(default_factory=Notifications)


class User(Document):
    username: str
    email: EmailStr
    passwordHash: str
    avatar: Optional[Avatar] = None
    bio: Optional[str] = None
    following: List[PydanticObjectId] = Field(default_factory=list)
    followers: List[PydanticObjectId] = Field(default_factory=list)
    postsCount: int = Field(default=0)
    likesCount: int = Field(default=0)
    status: Status = Field(default_factory=Status)
    settings: Settings = Field(default_factory=Settings)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 处理头像数据
            if 'avatar' in data and data['avatar']:
                data['avatar'] = Avatar.from_dict(data['avatar'])
            
            # 处理状态数据
            if 'status' in data and data['status']:
                data['status'] = Status.from_dict(data['status'])
            
            # 确保必要的列表字段存在
            data.setdefault('following', [])
            data.setdefault('followers', [])
            
            # 确保计数字段存在
            data.setdefault('postsCount', 0)
            data.setdefault('likesCount', 0)

            # 处理时间戳
            if 'createdAt' not in data:
                data['createdAt'] = datetime.utcnow()
            if 'updatedAt' not in data:
                data['updatedAt'] = datetime.utcnow()

        return data

    class Settings:
        name = "users"
