from datetime import datetime
import pytz
from typing import List, Optional, Any
from pydantic import  Field, model_validator
from beanie import Document, PydanticObjectId
from utils.common import format_datetime

# 获取东八区时区
CST = pytz.timezone('Asia/Shanghai')

class Comment(Document):
    postId: PydanticObjectId
    authorId: PydanticObjectId
    content: str
    likes: List[PydanticObjectId] = Field(default_factory=list)
    replyTo: Optional[PydanticObjectId] = None
    createdAt: datetime = Field(default_factory=lambda: format_datetime(datetime.now(CST)))
    updatedAt: datetime = Field(default_factory=lambda: format_datetime(datetime.now(CST)))

    @model_validator(mode='before')
    @classmethod
    def validate_data(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # 确保likes字段存在
            data.setdefault('likes', [])
            
            # 处理时间戳，使用东八区
            now = format_datetime(datetime.now(CST))
            if 'createdAt' not in data:
                data['createdAt'] = now
            if 'updatedAt' not in data:
                data['updatedAt'] = now

        return data

    class Settings:
        name = "comments"