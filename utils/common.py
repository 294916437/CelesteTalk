from passlib.context import CryptContext
import logging
import pytz
from datetime import datetime

logger = logging.getLogger(__name__)

# 创建密码上下文，使用 bcrypt 算法
# rounds=12 表示2^12次迭代，默认值是12
# 增加 rounds 会显著增加计算时间，提高安全性
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=10  # 可以设置为 4-31 之间的值
)

def get_rounds_info():
    """
    获取当前加密轮次信息
    """
    hash_sample = pwd_context.hash("test")
    return f"Current bcrypt rounds: {pwd_context.default_rounds()}"

def hash_password(password: str) -> str:
    """
    对密码进行加盐哈希处理
    :param password: 原始密码
    :return: 加密后的密码哈希值
    """
    try:
        return pwd_context.hash(password)
    except Exception as e:
        logger.error(f"Password hashing failed: {str(e)}")
        raise Exception("Password processing failed")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码是否正确
    :param plain_password: 原始密码
    :param hashed_password: 数据库中存储的加密密码
    :return: 验证结果（布尔值）
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification failed: {str(e)}")
        return False

def format_datetime(dt: datetime) -> datetime:
    """
    格式化时间，只保留年月日时分秒
    """
    if dt.tzinfo:
        # 如果有时区信息，先转换到东八区
        dt = dt.astimezone(pytz.timezone('Asia/Shanghai'))
    return dt.replace(microsecond=0)
