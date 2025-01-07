from fastapi import HTTPException, APIRouter

from pydantic import EmailStr
from middleware.response import CommonResponse

from models.Email import send_verify_code, generate_unique_id, logger

# FastAPI应用
router = APIRouter()


@router.post("/register-verify", response_description="发送注册验证码")
async def send_register_verify_code(email: EmailStr):
    try:
        verify_code = generate_unique_id()
        await send_verify_code(email, verify_code, "static/template/register-verify.html")
        return CommonResponse(code=200, msg="send email verify code successful", data=None)
    except Exception as e:
        logger.error(f"Error sending registration verification code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/password-verify", response_description="发送修改密码验证码")
async def send_password_verify_code(email: EmailStr):
    try:
        verify_code = generate_unique_id()
        await send_verify_code(email, verify_code, "static/template/password-verify.html")
        return CommonResponse(code=200, msg="send email verify code successful", data=None)
    except Exception as e:
        logger.error(f"Error sending password verification code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
