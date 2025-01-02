from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from beanie import Document, PydanticObjectId

class Media(BaseModel):
    type: str
    url: str

class Post(Document):
    authorId: PydanticObjectId
    content: str
    media: List[Media]
    likes: List[PydanticObjectId]
    repostCount: int
    replyTo: Optional[PydanticObjectId]
    isRepost: bool
    originalPost: Optional[PydanticObjectId]
    createdAt: datetime
    updatedAt: datetime

    class Settings:
        collection = "posts"