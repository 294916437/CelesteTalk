from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from beanie import Document, PydanticObjectId

class Comment(Document):
    postId: PydanticObjectId
    authorId: PydanticObjectId
    content: str
    likes: List[PydanticObjectId]
    replyTo: Optional[PydanticObjectId]
    createdAt: datetime
    updatedAt: datetime

    class Settings:
        collection = "comments"