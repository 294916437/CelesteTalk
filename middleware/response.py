from typing import TypeVar, Optional, Generic, Any
from pydantic import BaseModel, Field

T = TypeVar('T')

class CommonResponse(BaseModel, Generic[T]):
    code: int
    msg: str
    data: Optional[T] = Field(default=None)

    class Config:
        arbitrary_types_allowed = True  # 允许任意类型