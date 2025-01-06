from datetime import datetime
from typing import List
from pydantic import Field, model_validator
from beanie import Document, PydanticObjectId
from utils.time import format_datetime_now

class Comment(Document):
    # 必填字段
    postId: PydanticObjectId = Field(..., description="帖子ID")
    authorId: PydanticObjectId = Field(..., description="评论作者ID")
    content: str = Field(..., description="评论内容")
    
    # 非必填字段，但需要有效的ObjectId
    replyTo: PydanticObjectId = Field(
        default_factory=PydanticObjectId, 
        description="回复的评论ID"
    )
    likes: List[PydanticObjectId] = Field(
        default_factory=list,
        description="点赞用户ID列表"
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
        
        # 确保replyTo始终是有效的ObjectId
        if 'replyTo' not in data or data['replyTo'] is None:
            data['replyTo'] = str(PydanticObjectId())  # 生成新的ObjectId
            
        # 其他默认值设置
        data.setdefault('likes', [])
        
        # 时间戳
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
                "replyTo": "507f1f77bcf86cd799439013",  
                "likes": []
            }
        }
    }
