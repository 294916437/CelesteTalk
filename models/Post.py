from datetime import datetime
from typing import List
from pydantic import BaseModel, Field, model_validator
from beanie import Document, PydanticObjectId
from utils.time import format_datetime_now


class Media(BaseModel):
    type: str = Field(
        ...,  # 必填
        enum=["image", "video"],
        description="媒体类型，只能是image或video"
    )
    url: str = Field(..., description="媒体URL")


class Post(Document):
    # MongoDB要求的必填字段
    authorId: PydanticObjectId = Field(..., description="作者ID")
    content: str = Field(..., description="帖子内容")
    createdAt: datetime = Field(..., description="创建时间")
    isRepost: bool = Field(..., description="是否是转发")

    # 可选字段，但必须符合类型要求
    media: List[Media] = Field(default_factory=list, description="媒体列表")
    likes: List[PydanticObjectId] = Field(default_factory=list, description="点赞用户ID列表")
    repostCount: int = Field(default=0, description="转发数")
    originalPost: PydanticObjectId = Field(default_factory=PydanticObjectId, description="原始帖子ID")
    replyTo: PydanticObjectId = Field(default_factory=PydanticObjectId, description="回复的帖子ID")
    updatedAt: datetime = Field(default_factory=format_datetime_now, description="更新时间")

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: dict) -> dict:
        if not isinstance(data, dict):
            return data

        # 设置必填字段的默认值
        now = format_datetime_now()
        if 'createdAt' not in data:
            data['createdAt'] = now
        if 'isRepost' not in data:
            data['isRepost'] = False

        # 设置其他字段的默认值
        data.setdefault('media', [])
        data.setdefault('likes', [])
        data.setdefault('repostCount', 0)
        data.setdefault('originalPost', str(PydanticObjectId()))
        data.setdefault('replyTo', str(PydanticObjectId()))
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