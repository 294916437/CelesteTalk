from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from models.Post import Post
from models.Comment import Comment
import logging
from pydantic import ValidationError
from middleware.response import CommonResponse
logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("", response_description="获取所有帖子")
async def get_posts() -> List[Post]:
    try:
        collection = Post.get_motor_collection()
        collection_exists = await collection.find_one()
        logger.debug(f"Collection check result: {collection_exists}")
        
        if not collection_exists:
            return []

        raw_results = await collection.find({}).sort("createdAt", -1).to_list(length=None)
        logger.debug(f"Raw document count: {len(raw_results)}")
        
        posts = []
        for raw_post in raw_results:
            try:
                post = Post.model_validate(raw_post)
                posts.append(post)
            except ValidationError as ve:
                logger.error(f"Validation error for post {raw_post.get('_id')}: {str(ve)}")
                continue

        return posts
    except Exception as e:
        logger.error(f"Error in get_posts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}", response_description="获取指定帖子")
async def get_post(id: str) -> Post:
    try:
        post_id = PydanticObjectId(id)
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return post
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")

@router.post("", response_description="创建新帖子")
async def create_post(post: Post) -> Post:
    now = datetime.now(timezone.utc)
    post.createdAt = now
    post.updatedAt = now
    await post.create()
    return post

@router.put("/{id}/like", response_description="点赞/取消点赞帖子")
async def toggle_like(id: str, user_id: str):
    try:
        post_id = PydanticObjectId(id)
        user_id = PydanticObjectId(user_id)
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        if user_id in post.likes:
            post.likes.remove(user_id)
        else:
            post.likes.append(user_id)
        
        post.updatedAt = datetime.now(timezone.utc)
        await post.save()
        return post
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

@router.delete("/{id}", response_description="删除帖子")
async def delete_post(id: str):
    try:
        post_id = PydanticObjectId(id)
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        await post.delete()
        return {"message": "Post deleted successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")
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
    
    
@router.post("/{post_id}/comment", response_description="创建帖子的新评论")
async def create_comment(data: dict):
    post_id = data.get("post_id")
    content = data.get("content")
    author_id=data.get("author_id")
    try:
        post_id = PydanticObjectId(post_id)
        author_id=PydanticObjectId(author_id)
        new_comment = Comment(
            postId=post_id,
            authorId=author_id,
            content=content
        )
        await new_comment.insert()
        return CommonResponse(code=200, msg="success", data={"comment": new_comment})
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))