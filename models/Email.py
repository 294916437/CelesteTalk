import random
import logging

from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Template
from pydantic import BaseModel, EmailStr

from server.init import settings

# 设置日志记录
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
# 加载环境变量
load_dotenv()
# 配置邮件发送
conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL,
    MAIL_PASSWORD=settings.PASSWORD,
    MAIL_FROM=settings.EMAIL,
    MAIL_PORT=465,  # 修改为465端口
    MAIL_SERVER="smtp.qq.com",
    MAIL_STARTTLS=False,  # 关闭STARTTLS
    MAIL_SSL_TLS=True,    # 启用SSL/TLS
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


def generate_unique_id():
    return str(random.randint(1000, 9999))  # 生成4位随机验证码


async def send_verify_code(email: EmailStr, verify_code: str, template_path: str):
    with open(template_path, encoding='utf-8') as file_:
        template = Template(file_.read())
    html_content = template.render(verify_code=verify_code)
    message = MessageSchema(
        subject="验证码",
        recipients=[email],
        body=html_content,
        subtype="html"
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logger.info("验证码发送成功")
    except Exception as e:
        if "Malformed SMTP response" in str(e):
            # 如果是格式错误但邮件已发送，则忽略该错误
            logger.warning(f"邮件已发送，但出现SMTP响应格式警告: {str(e)}")
            return
        logger.error(f"发送验证码时出错: {str(e)}")
        raise e
