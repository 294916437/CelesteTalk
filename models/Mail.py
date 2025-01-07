from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field, model_validator
from beanie import Document
from utils.time import format_datetime_now

class Mail(Document):
    email: str = Field(
        ..., 
        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description="电子邮箱地址"
    )
    code: str = Field(..., description="验证码")
    type: str = Field(..., description="验证码类型(register/reset-password)")
    isUsed: bool = Field(default=False, description="验证码是否已使用")
    expireAt: datetime = Field(..., description="验证码过期时间")
    createdAt: datetime = Field(default_factory=format_datetime_now)

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 设置默认值
            data.setdefault('isUsed', False)
            data.setdefault('createdAt', format_datetime_now())
            
            # 如果没有设置过期时间，默认5分钟后过期
            if 'expireAt' not in data:
                now = format_datetime_now()
                data['expireAt'] = now.replace(minute=now.minute + 5)

        return data

    class Settings:
        name = "mails"  # 对应MongoDB中的集合名
        validate_on_save = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "email": "test@example.com",
                "code": "1234",
                "type": "register",
                "isUsed": False,
                "expireAt": "2024-03-19T10:30:00",
                "createdAt": "2024-03-19T10:15:00"
            }
        }
    }
