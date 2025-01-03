from datetime import datetime, timezone
from typing import List, Optional, Any
from pydantic import BaseModel, Field, model_validator
from beanie import Document, PydanticObjectId

class Comment(Document):
    postId: PydanticObjectId
    authorId: PydanticObjectId
    content: str
    likes: List[PydanticObjectId] = Field(default_factory=list)
    replyTo: Optional[PydanticObjectId] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 确保likes字段存在
            data.setdefault('likes', [])
            
            # 处理时间戳
            now = datetime.now(timezone.utc)
            if 'createdAt' not in data:
                data['createdAt'] = now
            if 'updatedAt' not in data:
                data['updatedAt'] = now

        return data

    class Settings:
        name = "comments"