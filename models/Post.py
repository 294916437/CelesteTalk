from datetime import datetime, timezone
from typing import List, Optional, Any, Literal
from pydantic import BaseModel, Field, model_validator
from beanie import Document, PydanticObjectId
import pytz
from utils.common import format_datetime

# 获取东八区时区
CST = pytz.timezone('Asia/Shanghai')

class Media(BaseModel):
    type: Literal["image", "video"]
    url: str

    @classmethod
    def from_dict(cls, data: dict) -> "Media":
        if isinstance(data, str):
            # 默认字符串视为图片链接
            return cls(type="image", url=data)
        
        # 验证媒体类型
        if data.get('type') not in ['image', 'video']:
            raise ValueError("Media type must be either 'image' or 'video']")
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
    createdAt: datetime = Field(default_factory=lambda: format_datetime(datetime.now(CST)))
    updatedAt: datetime = Field(default_factory=lambda: format_datetime(datetime.now(CST)))

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
            
            # 处理时间戳，使用东八区
            now = format_datetime(datetime.now(CST))
            if 'createdAt' not in data:
                data['createdAt'] = now
            if 'updatedAt' not in data:
                data['updatedAt'] = now

        return data

    class Settings:
        name = "posts"