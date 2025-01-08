from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from models.User import User
import logging
from pydantic import ValidationError
from utils.common import hash_password, verify_password
from utils.time import format_datetime_now
from middleware.response import CommonResponse
from models.Email import verify_code
logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/test")
async def test():
    # 测试错误响应
    raise HTTPException(status_code=500, detail="Test error")

    # 测试正常响应
    # return CommonResponse(code=200, msg="success", data={"test": "test"})


@router.get("", response_description="获取所有用户列表")
async def get_users():
    try:
        # 检查集合是否存在
        collection = User.get_motor_collection()
        collection_exists = await collection.find_one()
        if not collection_exists:
            logger.warning("No documents found in users collection")
            return []
        # 直接使用Motor查询并转换为User对象
        raw_results = await collection.find({}).to_list(length=None)
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
        return CommonResponse(code=200, msg="success", data={"users": users})
    except Exception as e:
        logger.error(f"Error in get_users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register", response_description="注册新用户")
async def register_user(user_data: dict):
    try:
        # 检查用户名是否已存在
        existing_username = await User.find_one({"username": user_data["username"]})
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already exists")

        # 检查邮箱是否已存在
        existing_email = await User.find_one({"email": user_data["email"]})
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already exists")

        # 验证注册验证码
        verify_result = await verify_code(user_data["email"], user_data["code"] , "register")
        if not verify_result:
            raise HTTPException(status_code=400, detail="Invalid verification code")


        # 创建新用户实例
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            passwordHash=hash_password(user_data["password"]),  # 使用新的加密方法
        )

        # 保存到数据库
        await new_user.insert()
        return CommonResponse(code=200, msg="success", data=None)
    except Exception as e:
        logger.error(f"Error in register_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_description="用户登录")
async def login(credentials: dict):
    # credentials{"email": "EmailStr", "password": "str"}
    try:
        # 获取登录凭证
        email = credentials.get("email")
        password = credentials.get("password")

        if not email or not password:
            raise HTTPException(status_code=400, detail="Missing email or password")

        user = await User.find_one({"email": email})

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # 验证密码
        if not verify_password(password, user.passwordHash):
            raise HTTPException(status_code=401, detail="Invalid password")

        # 更新最后登录时间
        user.status.lastLoginAt = format_datetime_now()  # 注意这里要调用函数
        await user.save()

        # 返回用户信息
        return CommonResponse(
            code=200,
            msg="Login successfully",
            data={"user": user}
        )

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        logger.error(f"Error in login: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_description="获取指定用户信息")
async def get_user(id: str):
    try:
        user_id = PydanticObjectId(id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return CommonResponse(
        code=200,
        msg="success",
        data={"user": user}
    )


# 修改密码接口
@router.post("/password", response_description="修改密码")
async def change_password(data: dict):
    try:
        email = data.get("email")
        new_password = data.get("password")
        # 查找用户
        user = await User.find_one({"email": email})
        if not user:
            raise HTTPException(status_code=400, detail="User not found with provided username and email")

        # 验证重置密码验证码
        verify_result = await verify_code(email, data["code"], "reset-password")
        if not verify_result:
            raise HTTPException(status_code=400, detail="Invalid verification code")

        # 验证密码
        if not verify_password(new_password, user.passwordHash):
            raise HTTPException(status_code=401, detail="Invalid old password")

        # 更新密码
        user.passwordHash = hash_password(new_password)
        await user.save()
        return CommonResponse(
            code=200,
            msg="update password successfully",
            data={"user": None}
        )
    except Exception as e:
        logger.error(f"Error in change_password: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 更新用户信息接口
@router.put("/profile", response_description="更新用户信息")
async def update_profile(profile: dict):
    # profile{"username": "str", "new_username": "str", "new_email": "EmailStr", "new_bio": "str", "new_settings": dict}
    try:
        username = profile.get("username")
        new_username = profile.get("new_username")
        new_email = profile.get("new_email")
        new_bio = profile.get("new_bio")
        new_settings = profile.get("new_settings")
        # 查找用户
        current_user = await User.find_one({"username": username})
        if not current_user:
            raise HTTPException(status_code=400, detail="User not found with provided username")

        # 定义一个字典用于存储需要更新的字段
        update_fields = {}

        if username is not None:  # 使用is not None检查，允许username为空字符串
            update_fields['username'] = new_username
        if new_email is not None:  # 使用is not None检查
            update_fields['email'] = new_email
        if new_bio is not None:  # 使用is not None检查
            update_fields['bio'] = new_bio
        if new_settings is not None:  # 使用is not None检查
            # 添加对Settings模型的验证
            update_fields['settings'] = new_settings

        # 逐个更新字段，确保只更新提供的字段
        for key, value in update_fields.items():
            setattr(current_user, key, value)

        await current_user.save()
        return CommonResponse(
            code=200,
            msg="update profile successfully",
            data={"user": current_user}
        )
    except Exception as e:
        logger.error(f"Error in update_profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 关注用户接口
@router.post("/follow", response_description="关注用户")
async def follow_user(follow_id: str, current_id: str):
    # userId: str
    try:
        follow_id = PydanticObjectId(follow_id)
        current_id = PydanticObjectId(current_id)
        # 查找当前用户
        current_user = await User.get(current_id)
        if not current_user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        # 查找被关注的用户
        target_user = await User.get(follow_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        # 关注用户
        if follow_id in current_user.following:
            raise HTTPException(status_code=400, detail="User already followed")
        current_user.following.append(follow_id)
        await current_user.save()
        # 反向关注
        target_user.followers.append(current_id)
        await target_user.save()
        return CommonResponse(
            code=200,
            msg="follow user successfully",
            data=None
        )
    except Exception as e:
        logger.error(f"Error in follow_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 取消关注用户接口
@router.delete("/unfollow", response_description="取消关注用户")
async def unfollow_user(unfollow_id: str, current_id: str):
    # userId: str
    try:
        user_id = PydanticObjectId(unfollow_id)
        current_id = PydanticObjectId(current_id)
        # 查找当前用户
        current_user = await User.get(current_id)
        if not current_user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        # 查找被取消关注的用户
        target_user = await User.get(user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")
        # 取消关注用户
        if user_id not in current_user.following:
            raise HTTPException(status_code=400, detail="User not followed")
        current_user.following.remove(user_id)
        await current_user.save()
        # 反向取消关注
        target_user.followers.remove(current_id)
        await target_user.save()
        return CommonResponse(
            code=200,
            msg="unfollow user successfully",
            data=None
        )
    except Exception as e:
        logger.error(f"Error in unfollow_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 获取用户关注列表接口
@router.get("/following/{userId}", response_description="获取用户关注列表")
async def get_following_list(userId: str):
    # userId: str
    try:
        user_id = PydanticObjectId(userId)
        # 查找用户
        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # 获取关注列表
        following_list = []
        for following_id in user.following:
            following_user = await User.get(following_id)
            if following_user:
                following_list.append(following_user)
        return CommonResponse(
            code=200,
            msg="get following list successfully",
            data={"following_list": following_list}
        )
    except Exception as e:
        logger.error(f"Error in get_following_list: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# 获取用户粉丝列表接口
@router.get("/follower/{userId}", response_description="获取用户粉丝列表")
async def get_follower_list(userId: str):
    # userId: str
    try:
        user_id = PydanticObjectId(userId)
        # 查找用户
        user = await User.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        # 获取粉丝列表
        follower_list = []
        for follower_id in user.followers:
            follower_user = await User.get(follower_id)
            if follower_user:
                follower_list.append(follower_user)
        return CommonResponse(
            code=200,
            msg="get follower list successfully",
            data={"follower_list": follower_list}
        )
    except Exception as e:
        logger.error(f"Error in get_follower_list: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
