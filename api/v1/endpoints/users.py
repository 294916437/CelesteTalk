from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from typing import List
from models.User import User
import logging
from pydantic import ValidationError

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_description="获取所有用户列表")
async def get_users() -> List[User]:
    try:
        # 检查集合是否存在
        collection = User.get_motor_collection()
        collection_exists = await collection.find_one()
        logger.debug(f"Collection check result: {collection_exists}")
        
        if not collection_exists:
            logger.warning("No documents found in users collection")
            return []

        # 直接使用Motor查询并转换为User对象
        raw_results = await collection.find({}).to_list(length=None)
        logger.debug(f"Raw document count: {len(raw_results)}")
        
        users = []
        for raw_user in raw_results:
            try:
                # 使用新的 model_validate 方法替代 parse_obj
                user = User.model_validate(raw_user)
                users.append(user)
            except ValidationError as ve:
                logger.error(f"Validation error for user {raw_user.get('_id')}: {str(ve)}")
                continue
            except Exception as e:
                logger.error(f"Error processing user {raw_user.get('_id')}: {str(e)}")
                continue

        logger.info(f"Successfully processed {len(users)} users")
        return users
    except Exception as e:
        logger.error(f"Error in get_users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_description="获取指定用户信息")
async def get_user(id: str) -> User:
    try:
        user_id = PydanticObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
