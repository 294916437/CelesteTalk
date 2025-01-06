from datetime import datetime
from typing import List, Optional
from pydantic import Field, model_validator
from beanie import Document, PydanticObjectId
from utils.time import format_datetime_now

class Comment(Document):
    # 必填字段
    postId: PydanticObjectId = Field(..., description="帖子ID")
    authorId: PydanticObjectId = Field(..., description="评论作者ID")
    content: str = Field(..., description="评论内容")
    
    # 可选字段
    likes: List[PydanticObjectId] = Field(
        default_factory=list,
        description="点赞用户ID列表"
    )
    replyTo: Optional[PydanticObjectId] = Field(
        default=None,
        description="回复的评论ID"
    )
    
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
        
        # 设置默认值
        data.setdefault('likes', [])
        
        # 设置时间戳
        now = format_datetime_now()
        data.setdefault('createdAt', now)
        data.setdefault('updatedAt', now)

        return data

    class Settings:
        name = "comments"
        validate_on_save = True

    model_config = {
        "json_schema_extra": {
            "example": {
                "postId": "507f1f77bcf86cd799439011",
                "authorId": "507f1f77bcf86cd799439012",
                "content": "这是一条测试评论",
                "likes": [],
                "replyTo": None
            }
        }
    }
