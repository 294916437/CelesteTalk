from pydantic import BaseModel

class CommonResponse(BaseModel):
    code: int
    msg: str
    data: dict