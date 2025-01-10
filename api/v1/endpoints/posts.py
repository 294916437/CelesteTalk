from pydantic import ValidationError, BaseModel
from datetime import datetime, timezone
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException,  Form, UploadFile
from fastapi.encoders import jsonable_encoder
import json
from models.Post import Post, Media
from models.Comment import Comment
from models.User import User
import logging
from pydantic import ValidationError
from middleware.response import CommonResponse
from utils.time import format_datetime_now
from utils.file_handler import save_upload_file, validate_file_type, get_media_type

logger = logging.getLogger(__name__)
router = APIRouter()

# 添加请求体模型
class RepostRequest(BaseModel):
    authorId: str
    content: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "authorId": "507f1f77bcf86cd799439011",
                "content": "转发内容"
            }
        }
    }


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

@router.post("", response_description="发布帖子",)
async def create_post(
    files: list[UploadFile] = [],
    data: str = Form(..., description="包含authorId、content等信息的JSON字符串")
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
                if file.filename:  # 确保文件名存在
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
            createdAt=format_datetime_now(),
            updatedAt=format_datetime_now()
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

@router.post("/{postId}/repost", response_description="发布转发帖子")
async def repost_post(
    postId: str,
    repost_data: RepostRequest
):
    try:
        # 验证并获取原帖
        original_post_id = PydanticObjectId(postId)
        original_post = await Post.get(original_post_id)
        if not original_post:
            raise HTTPException(status_code=404, detail="Original post not found")

        # 创建转发帖子
        repost = Post(
            authorId=PydanticObjectId(repost_data.authorId),
            content=repost_data.content,
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
@router.get("/{post_id}/comments", response_description="获取帖子的所有评论")
async def get_post_comments(post_id: str) :
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
    author_id = data.get("author_id")
    try:
        post_id = PydanticObjectId(post_id)
        author_id = PydanticObjectId(author_id)
        postcollection = Post.get_motor_collection()
        authorcollection = User.get_motor_collection()
        post_doc = await postcollection.find_one({"_id": post_id})
        author_doc = await authorcollection.find_one({"_id": author_id})
        if not post_doc or not author_doc or not content:
            raise HTTPException(status_code=400, detail="Invalid data")

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