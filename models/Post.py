from datetime import datetime, timezone
from typing import List, Optional, Any
from pydantic import BaseModel, Field, model_validator
from beanie import Document, PydanticObjectId

class Media(BaseModel):
    type: str
    url: str

    @classmethod
    def from_dict(cls, data: dict) -> "Media":
        if isinstance(data, str):
            return cls(type="image", url=data)
        return cls(**data)

class Post(Document):
    authorId: PydanticObjectId
    content: str
    media: List[Media] = Field(default_factory=list)
    likes: List[PydanticObjectId] = Field(default_factory=list)
    repostCount: int = Field(default=0)
    replyTo: Optional[PydanticObjectId] = None
    isRepost: bool = Field(default=False)
    originalPost: Optional[PydanticObjectId] = None
    createdAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 处理媒体数据
            if 'media' in data and data['media']:
                data['media'] = [Media.from_dict(m) for m in data['media']]
            else:
                data['media'] = []
            
            # 确保likes字段存在
            data.setdefault('likes', [])
            data.setdefault('repostCount', 0)
            data.setdefault('isRepost', False)
            
            # 处理时间戳
            now = datetime.now(timezone.utc)
            if 'createdAt' not in data:
                data['createdAt'] = now
            if 'updatedAt' not in data:
                data['updatedAt'] = now

        return data

    class Settings:
        name = "posts"