from datetime import datetime
from pydantic import Field, model_validator
from beanie import Document
from utils.time import format_datetime_now, add_minutes

class Mail(Document):
    email: str = Field(
        ...,  # 必填
        pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
        description="必须是有效的邮箱格式"
    )
    code: str = Field(
        ...,  # 必填
        description="验证码必须是字符串格式"
    )
    type: str = Field(
        ...,  # 必填
        description="验证码类型(register/reset-password/update-email)"
    )
    # 以下字段是可选的，但需要在验证器中设置默认值
    isUsed: bool = Field(
        default=False,
        description="验证码是否已使用"
    )
    expireAt: datetime = Field(
        default_factory=format_datetime_now,  
        description="验证码过期时间"
    )
    createdAt: datetime = Field(
        default_factory=format_datetime_now,  
        description="验证码创建时间"
    )

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: dict) -> dict:
        if not isinstance(data, dict):
            return data
        # 只处理未设置的字段
        now = format_datetime_now()
        if data.get('isUsed') not in data:
            data['isUsed'] = False
                
        if data.get('createdAt') not in data:
            data['createdAt'] = now
                
        if data.get('expireAt') not in data:
            data['expireAt'] = add_minutes(now, 5)

        return data

    class Settings:
        name = "mails"  
        validate_on_save = True

    class Config:
        json_schema_extra = {
            "example": {
                "email": "test@example.com",
                "code": "1234",
                "type": "register"
            }
        }

