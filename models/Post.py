from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, model_validator
from beanie import Document, PydanticObjectId
from utils.time import format_datetime_now

class Media(BaseModel):
    type: str = Field(
        ...,
        enum=["image", "video"],
        description="媒体类型，只能是image或video"
    )
    url: str = Field(..., description="媒体URL")

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "image",
                "url": "https://example.com/image.jpg"
            }
        }
    }

class Post(Document):
    # 必填字段
    authorId: PydanticObjectId = Field(..., description="作者ID")
    content: str = Field(..., description="帖子内容")
    isRepost: bool = Field(..., description="是否是转发")
    
    # 可选字段，带默认值
    media: List[Media] = Field(default_factory=list, description="媒体列表")
    likes: List[PydanticObjectId] = Field(default_factory=list, description="点赞用户ID列表")
    repostCount: int = Field(default=0, ge=0, description="转发数")
    originalPost: Optional[PydanticObjectId] = Field(default=None, description="原始帖子ID")
    replyTo: Optional[PydanticObjectId] = Field(default=None, description="回复的帖子ID")
    
    # 时间字段
    createdAt: datetime = Field(
        default_factory=format_datetime_now,
        description="创建时间"
    )
    updatedAt: datetime = Field(
        default_factory=format_datetime_now,
        description="更新时间"
    )

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: dict) -> dict:
        if not isinstance(data, dict):
            return data
            
        # 处理默认值
        data.setdefault('media', [])
        data.setdefault('likes', [])
        data.setdefault('repostCount', 0)
        data.setdefault('isRepost', False)
        
        # 处理时间字段
        now = format_datetime_now()
        data.setdefault('createdAt', now)
        data.setdefault('updatedAt', now)

        return data

    class Settings:
        name = "posts"
        validate_on_save = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "authorId": "507f1f77bcf86cd799439011",
                "content": "这是一条测试帖子",
                "isRepost": False,
                "media": [
                    {
                        "type": "image",
                        "url": "https://example.com/image.jpg"
                    }
                ]
            }
        }
    }