from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Form, UploadFile
import json
import logging
from pydantic import ValidationError
from middleware.response import CommonResponse
from utils.file_handler import save_upload_file, get_media_type
from models.User import User

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("", response_description="发布帖子")
async def create_post(
    file: UploadFile  = None,
    data: str = Form(..., description="包含authorId、content等信息的JSON字符串")
):
    try:
        data = json.loads(data)
        # 自动识别并验证文件类型
        media_type = get_media_type(file.content_type)
        if not media_type:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type for {file.filename}"
            )
        
        # 保存文件到静态目录
        file_path = await save_upload_file(file, media_type)
        
        user_id = data["userId"]
        type = data["type"]
        
        user = await User.get(PydanticObjectId(user_id))
        
        if type == "avatar":
            user.avatar = file_path
        elif type == "header":
            user.headerImage = file_path
        
        # 保存到数据库
        await user.save()
        
        return CommonResponse(
            code=200,
            msg="success",
            data={"url": file_path}
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in data field")
    except ValidationError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in create_post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))