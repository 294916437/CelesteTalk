from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from models.User import User
import logging
from pydantic import ValidationError
from utils.common import hash_password ,verify_password
from utils.time import format_datetime_now
from middleware.response import CommonResponse

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
        #TODO：检查邮箱验证码是否正确
        # 创建新用户实例
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            passwordHash=hash_password(user_data["password"]),  # 使用新的加密方法
        )

        # 保存到数据库
        await new_user.insert()
        return CommonResponse(code=200, msg="success", data={"user": new_user})
    except Exception as e:
        logger.error(f"Error in register_user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", response_description="用户登录")
async def login(credentials: dict):
    try:
        # 获取登录凭证
        email = credentials.get("email")
        password = credentials.get("password")

        if not email or not password:
            raise HTTPException(status_code=400, detail="Missing email or password")

        user = await User.find_one( {"email": email})

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
            msg="Login successful",
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
    return user
