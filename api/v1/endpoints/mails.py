from fastapi import HTTPException, APIRouter
from middleware.response import CommonResponse
from models.Mail import Mail
from models.Email import send_verify_code, generate_random_code,verify_code
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_description="获取所有验证码记录")
async def get_mails():
    try:
        mails = await Mail.find_all().to_list()
        if not mails:
            return CommonResponse(
                code=400,
                msg="没有找到验证码记录",
                data=[]
            )
        
        # 直接返回列表数据
        return CommonResponse(
            code=200,
            msg="获取验证码记录成功",
            data={
                "total": len(mails),
                "records": mails
            }
        )
        
    except Exception as e:
        logger.error(f"获取验证码记录失败: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"获取验证码记录失败: {str(e)}"
        )


@router.post("/verify", response_description="发送邮箱验证码")
async def send_email_verify_code(data: dict):
    try:
        email = data.get('email')
        type = data.get('type')
        
        # 参数验证
        if not email or not type:
            return CommonResponse(
                code=400,
                msg="邮箱和类型不能为空",
                data=None
            )
        # 生成验证码
        code = generate_random_code()
        # 创建Mail记录
        new_mail = Mail(
            email=email,
            code=code,
            type=type,
        )

        # 保存到数据库
        await new_mail.insert()
        logger.info(f"Mail record created successfully for {email}")

        # 发送邮件
        template_path = f"static/template/{type}-verify.html"
        await send_verify_code(email, code, template_path)

        return CommonResponse(
            code=200,
            msg="验证码发送成功",
            data=None
        )
            
    except Exception as e:
        logger.error(f"Error in send_email_verify_code: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send verification code: {str(e)}"
        )




