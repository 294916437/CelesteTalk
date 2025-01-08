from datetime import datetime, timezone
from typing import List
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, File, Form, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.openapi.models import Example
import json

from models.Post import Post, Media
from models.Comment import Comment
import logging
from pydantic import ValidationError
from middleware.response import CommonResponse
from utils.time import format_datetime_now
from utils.file_handler import save_upload_file, validate_file_type, get_media_type

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "", 
    response_description="发布帖子",
    openapi_extra={
        "requestBody": {
            "content": {
                "multipart/form-data": {
                    "schema": {
                        "type": "object",
                        "properties": {
                            "data": {
                                "type": "string",
                                "example": json.dumps({
                                    "authorId": "507f1f77bcf86cd799439011",
                                    "content": "这是一条测试帖子"
                                })
                            },
                            "files": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "format": "binary"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
)
async def create_post(
    data: str = Form(..., description="包含authorId、content等信息的JSON字符串"),
    files: List[UploadFile] = File(None, description="要上传的图片或视频文件列表")
):
    try:
        # 解析JSON字符串
        post_data = json.loads(data)
        
        # 验证必要的请求数据
        if not post_data.get("authorId") or not post_data.get("content"):
            raise HTTPException(
                status_code=400, 
                detail="Missing required fields: authorId or content"
            )

        media_list = []
        
        # 处理上传的文件
        if files:
            for file in files:
                # 自动识别并验证文件类型
                media_type = get_media_type(file.content_type)
                if not media_type:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid file type for {file.filename}"
                    )
                
                # 保存文件到静态目录
                file_path = await save_upload_file(file, media_type)
                
                # 添加到媒体列表
                media_list.append(Media(
                    type=media_type,
                    url=file_path
                ))
        
        # 创建新帖子
        new_post = Post(
            authorId=PydanticObjectId(post_data["authorId"]),
            content=post_data["content"],
            media=media_list,
            isRepost=False,
            createdAt=datetime.now(timezone.utc),
            updatedAt=datetime.now(timezone.utc)
        )
        
        # 如果是回复其他帖子
        if "replyTo" in post_data:
            new_post.replyTo = PydanticObjectId(post_data["replyTo"])
            
        # 保存到数据库
        await new_post.create()
        
        return CommonResponse(
            code=200,
            msg="success",
            data={"post": jsonable_encoder(new_post)}
        )
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format in data field")
    except ValidationError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in create_post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{postId}", response_description="获取指定帖子")
async def get_post(postId: str):
    try:
        post_id = PydanticObjectId(postId)
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return CommonResponse(code=200, msg="success", data={"post": post})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")


@router.delete("/{postId}", response_description="删除帖子")
async def delete_post(postId: str, repost_data: dict):
    try:
        post_id = PydanticObjectId(postId)
        curr_user = PydanticObjectId(repost_data["userId"])
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        # 验证当前用户是否为帖子作者
        if post.authorId != curr_user:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this post"
            )
        await post.delete()
        return CommonResponse(
            code=200,
            msg="success",
            data={"message": "Post deleted successfully"}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid post ID format")


@router.put("/{postId}/like", response_description="点赞帖子")
async def toggle_like(postId: str, repost_data: dict):
    try:
        post_id = PydanticObjectId(postId)
        user_id = PydanticObjectId(repost_data["userId"])
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if user_id in post.likes:
            return CommonResponse(code=401,msg="You have already liked this post",data={"post": post})
        else:
            post.likes.append(user_id)

        post.updatedAt = datetime.now(timezone.utc)
        await post.save()
        return CommonResponse(code=200, msg="success", data={"post": post})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
@router.delete("/{postId}/like", response_description="取消点赞")
async def toggle_like(postId: str, repost_data: dict):
    try:
        post_id = PydanticObjectId(postId)
        user_id = PydanticObjectId(repost_data["userId"])
        post = await Post.get(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if user_id in post.likes:
            post.likes.remove(user_id)
        else:
            return CommonResponse(code=401, msg="You haven't liked this post", data={"post": post})

        post.updatedAt = datetime.now(timezone.utc)
        await post.save()
        return CommonResponse(code=200, msg="success", data={"post": post})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")
    
    
@router.post("/{postId}/repost", response_description="发布转发帖子")
async def repost_post(
    postId: str,
    repost_data: dict
):
    try:
        # 验证并获取原帖
        original_post_id = PydanticObjectId(postId)
        original_post = await Post.get(original_post_id)
        if not original_post:
            raise HTTPException(status_code=404, detail="Original post not found")

        # 创建转发帖子
        repost = Post(
            authorId=PydanticObjectId(repost_data["authorId"]),
            content=repost_data["content"],
            isRepost=True,
            originalPost=original_post_id
        )
        await repost.insert()

        # 更新原帖的转发计数（修改这部分）
        original_post.repostCount += 1
        original_post.updatedAt = format_datetime_now()
        await original_post.save()

        return CommonResponse(
            code=200,
            msg="Repost created successfully",
            data={"post": repost}
        )
    except Exception as e:
        logger.error(f"Error in repost_post: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{userId}", response_description="获取用户的帖子")
async def get_user_posts(userId: str):
    try:
        # 验证用户ID格式
        user_id = PydanticObjectId(userId)
        
        # 查询该用户的所有帖子,按创建时间倒序排列
        posts = await Post.find(
            Post.authorId == user_id
        ).sort(-Post.createdAt).to_list()
        
        return CommonResponse(
            code=200,
            msg="success",
            data={
                "posts": jsonable_encoder(posts),
                "total": len(posts)
            }
        )
    except ValidationError as ve:
        logger.error(f"Validation error for user {userId}: {str(ve)}")
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        logger.error(f"Error getting posts for user {userId}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/likes/{userId}", response_description="获取用户点赞的帖子")
async def get_user_likes(userId: str):
    
    try:
        # 验证用户 ID 格式
        user_id = PydanticObjectId(userId)
        
        # 查询所有点赞用户中包含该用户 ID 的帖子
        liked_posts = await Post.find(
            {"likes": {"$in": [user_id]}}
        ).sort(-Post.createdAt).to_list()
        
        return CommonResponse(
            code=200,
            msg="success",
            data={
                "posts": jsonable_encoder(liked_posts),
                "total": len(liked_posts)
            }
        )
    except ValidationError as ve:
        logger.error(f"Validation error for user {userId}: {str(ve)}")
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    except Exception as e:
        logger.error(f"Error getting liked posts for user {userId}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/home", response_description="获取主页帖子")
async def get_home_posts():
    pass


@router.get("/search", response_description="搜索帖子")
async def search_posts(kw: str):
    try:
        # 使用正则表达式进行模糊搜索
        posts = await Post.find(
            {"content": {"$regex": kw, "$options": "i"}}
        ).sort(-Post.createdAt).to_list()
        
        return CommonResponse(
            code=200,
            msg="success",
            data={
                "posts": jsonable_encoder(posts),
                "total": len(posts)
            }
        )
    except Exception as e:
        logger.error(f"Error searching posts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/post/{post_id}", response_description="获取帖子的所有评论")
async def get_post_comments(post_id: str):
    try:
        post_id = PydanticObjectId(post_id)
        comments = await Comment.find(
            Comment.postId == post_id
        ).sort(+Comment.createdAt).to_list()
        return CommonResponse(code=200, msg="success", data={"comments": comments})
    except Exception as e:
        logger.error(f"Error getting comments for post {post_id}: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid post ID format")


@router.post("/{post_id}/comment", response_description="创建帖子的新评论")
async def create_comment(data: dict):
    post_id = data.get("post_id")
    content = data.get("content")
    author_id = data.get("author_id")
    try:
        post_id = PydanticObjectId(post_id)
        author_id = PydanticObjectId(author_id)
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

