import bcrypt
import logging

logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    """
    对密码进行加密
    """
    try:
        # 将密码转换为bytes类型
        password_bytes = password.encode('utf-8')
        # 生成salt并加密
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        # 返回加密后的密码字符串
        return hashed.decode('utf-8')
    except Exception as e:
        logger.error(f"Password hashing error: {str(e)}")
        raise

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码
    """
    try:
        # 将密码和哈希值转换为bytes类型
        plain_password_bytes = plain_password.encode('utf-8')
        hashed_password_bytes = hashed_password.encode('utf-8')
        # 验证密码
        return bcrypt.checkpw(plain_password_bytes, hashed_password_bytes)
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

