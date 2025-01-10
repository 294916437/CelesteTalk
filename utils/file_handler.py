import os
import uuid
from pathlib import Path
from fastapi import UploadFile
import aiofiles

UPLOAD_DIR = "static/uploads"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"}
ALLOWED_VIDEO_TYPES = {"video/mp4"}

async def save_upload_file(file: UploadFile, file_type: str) -> str:
    # 确保上传目录存在
    upload_dir = Path(UPLOAD_DIR) / file_type
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # 生成唯一文件名
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = upload_dir / unique_filename
    
    # 保存文件
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return str(file_path)

def get_media_type(content_type: str) -> str:
    """根据MIME类型返回媒体类型"""
    if content_type in ALLOWED_IMAGE_TYPES:
        return "image"
    elif content_type in ALLOWED_VIDEO_TYPES:
        return "video"
    return None

def validate_file_type(file: UploadFile) -> bool:
    """验证文件类型是否合法"""
    return (file.content_type in ALLOWED_IMAGE_TYPES or 
            file.content_type in ALLOWED_VIDEO_TYPES)
