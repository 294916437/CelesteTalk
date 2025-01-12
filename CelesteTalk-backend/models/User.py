from datetime import datetime
from typing import List,  Any
from pydantic import BaseModel, Field, model_validator
from beanie import Document, PydanticObjectId
from utils.time import format_datetime_now

class Status(BaseModel):
    isActive: bool = Field(..., description="用户是否活跃")  # 改为必填
    isBanned: bool = Field(..., description="用户是否被封禁")  # 改为必填
    lastLoginAt: datetime = Field(..., description="最后登录时间")  # 改为必填
    
    @classmethod
    def from_dict(cls, data: dict) -> "Status":
        if not data:
            return cls()
        return cls(**data)

class Notifications(BaseModel):
    email: bool = Field(..., description="是否启用邮件通知")  # 改为必填
    push: bool = Field(..., description="是否启用推送通知")   # 改为必填

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": True,
                "push": True
            }
        }
    }

class Settings(BaseModel):
    language: str = Field(..., description="用户界面语言")  # 改为必填
    theme: str = Field(..., description="用户界面主题")    # 改为必填
    notifications: Notifications = Field(..., description="通知设置")  # 改为必填

    model_config = {
        "json_schema_extra": {
            "example": {
                "language": "en",
                "theme": "light",
                "notifications": {
                    "email": True,
                    "push": True
                }
            }
        }
    }

class User(Document):
    # 必填字段
    username: str = Field(..., description="用户名")
    email: str = Field(
        ..., 
        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description="电子邮箱"
    )
    passwordHash: str = Field(..., description="密码哈希")
    status: Status = Field(..., description="用户状态")
    settings: Settings = Field(..., description="用户设置")
    
    # 非必填字段，但有默认值
    avatar: str = Field(default="", description="用户头像URL")
    headerImage: str = Field(default="", description="用户头部图片URL")
    bio: str = Field(default="", description="用户简介")
    following: List[PydanticObjectId] = Field(default_factory=list)
    followers: List[PydanticObjectId] = Field(default_factory=list)
    postsCount: int = Field(default=0)
    likesCount: int = Field(default=0)
    createdAt: datetime = Field(default_factory=format_datetime_now)
    updatedAt: datetime = Field(default_factory=format_datetime_now)

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 设置默认状态
            if 'status' not in data:
                data['status'] = {
                    'isActive': True,
                    'isBanned': False,
                    'lastLoginAt': format_datetime_now()
                }
            
            # 设置默认设置
            if 'settings' not in data:
                data['settings'] = {
                    'language': 'en',
                    'theme': 'light',
                    'notifications': {
                        'email': True,
                        'push': True
                    }
                }
            
            # 设置其他默认值
            data.setdefault('avatar', '')
            data.setdefault('bio', '')
            data.setdefault('following', [])
            data.setdefault('followers', [])
            data.setdefault('postsCount', 0)
            data.setdefault('likesCount', 0)
            
            # 设置时间戳
            now = format_datetime_now()
            data.setdefault('createdAt', now)
            data.setdefault('updatedAt', now)

        return data

    class Settings:
        name = "users"
        validate_on_save = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "testuser",
                "email": "test@example.com",
                "passwordHash": "hashed_password",
                "avatar": None,
                "bio": None
            }
        }
    }

