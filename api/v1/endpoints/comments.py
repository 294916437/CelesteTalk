from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Body
from models.Comment import Comment
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

@router.get("/post/{post_id}", response_description="获取帖子的所有评论")
async def get_post_comments(post_id: str) -> List[Comment]:
    try:
        post_id = PydanticObjectId(post_id)
        comments = await Comment.find(
            Comment.postId == post_id
        ).sort(+Comment.createdAt).to_list()
        return comments
    except Exception as e:
        logger.error(f"Error getting comments for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid post ID format")

@router.post("", response_description="创建新评论")
async def create_comment(comment: Comment) -> Comment:
    try:
        now = datetime.now(timezone.utc)
        comment.createdAt = now
        comment.updatedAt = now
        await comment.create()
        return comment
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}/like", response_description="点赞/取消点赞评论")
async def toggle_comment_like(id: str, user_id: str = Body(...)):
    try:
        comment_id = PydanticObjectId(id)
        user_id = PydanticObjectId(user_id)
        
        comment = await Comment.get(comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        if user_id in comment.likes:
            comment.likes.remove(user_id)
        else:
            comment.likes.append(user_id)
            
        comment.updatedAt = datetime.now(timezone.utc)
        await comment.save()
        return comment
    except Exception as e:
        logger.error(f"Error toggling like: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid ID format")

@router.delete("/{id}", response_description="删除评论")
async def delete_comment(id: str):
    try:
        comment_id = PydanticObjectId(id)
        comment = await Comment.get(comment_id)
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        await comment.delete()
        return {"message": "Comment deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting comment: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid comment ID format")
