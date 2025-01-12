from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Body
from models.Comment import Comment
from models.User import User
from middleware.response import CommonResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_description="获取所有评论")
async def get_comments() -> List[Comment]:
    try:
        collection = Comment.get_motor_collection()
        collection_exists = await collection.find_one()
        
        if not collection_exists:
            return []

        comments = await Comment.find_all().to_list()
        return comments
    except Exception as e:
        logger.error(f"Error in get_comments: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))




@router.put("/{id}/like", response_description="点赞/取消点赞评论")
async def toggle_comment_like(id: str, currentuser_id: str):
    try:
        comment_id = PydanticObjectId(id)
        currentuser_id = PydanticObjectId(currentuser_id)

        comment = await Comment.get(comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        user_collection = User.get_motor_collection()
        user = await user_collection.find_one({"_id": currentuser_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if currentuser_id in comment.likes:
            comment.likes.remove(currentuser_id)
        else:
            comment.likes.append(currentuser_id)

        comment.updatedAt = datetime.now(timezone.utc)
        await comment.save()
        return CommonResponse(code=200, msg="success", data={"comment": None})
    except Exception as e:
        logger.error(f"Error toggling like: {str(e)}")
        raise HTTPException(status_code=500, detail="Invalid ID format")


# 删除评论
@router.delete("/{id}", response_description="删除评论")
async def delete_comment(id: str):
    try:
        comment_id = PydanticObjectId(id)
        comment = await Comment.get(comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        await comment.delete()
        return CommonResponse(code=200, msg="Delete success", data={"comment": None})
    except Exception as e:
        logger.error(f"Error deleting comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Invalid comment ID format")
