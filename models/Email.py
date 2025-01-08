import random
import logging
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Template
from models.Mail import Mail
from server.init import settings
from utils.time import format_datetime_now
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
    MAIL_PORT=465,  #
    MAIL_SERVER="smtp.qq.com",
    MAIL_STARTTLS=False, 
    MAIL_SSL_TLS=True,  
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

def generate_random_code() -> str:
    """生成4位随机验证码"""
    return f"{random.randrange(1000, 10000)}"

async def send_verify_code(email: str, verify_code: str, template_path: str ):
    """发送验证码邮件"""
    try:
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
        await fm.send_message(message)
        logger.info(f"验证码发送成功: {email}")
    except Exception as e:
        logger.error(f"发送验证码失败: {str(e)}")
        raise e


async def verify_code(email: str, code: str, type: str) -> bool:
    """验证码校验"""
    mail_records = await Mail.find({
        "email": email,
        "type": type,
        "isUsed": False,
        "expireAt": {"$gt": format_datetime_now()}
    }).sort([("createdAt", -1)]).limit(1).to_list()  # -1 表示降序，获取最新记录

    if mail_records[0].code == code:
        # 标记验证码已使用
        mail_record = mail_records[0]
        mail_record.isUsed = True
        await mail_record.save()
        return True
    return False