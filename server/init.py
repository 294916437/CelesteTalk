from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings
from models.User import User
from models.Post import Post
from models.Comment import Comment
from models.Mail import Mail
import logging

# 设置日志
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # 数据库配置 - 对应环境变量名称为 DATABASE_URL 和 DATABASE_NAME
    DATABASE_URL: str
    DATABASE_NAME: str

    # JWT配置 - 对应环境变量名称为 SECRET_KEY 和 ALGORITHM
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    # 邮件配置 - 对应环境变量名称为 EMAIL 和 PASSWORD
    EMAIL: str
    PASSWORD: str


    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False  # 环境变量名称大小写不敏感


settings = Settings()


async def initiate_database():
    try:
        client = AsyncIOMotorClient(settings.DATABASE_URL)
        # 验证连接
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB: {settings.DATABASE_NAME}")

        # 检查数据库中的集合
        db = client[settings.DATABASE_NAME]
        collections = await db.list_collection_names()
        logger.info(f"Available collections: {collections}")

        await init_beanie(
            database=client[settings.DATABASE_NAME],
            document_models=[User, Post, Comment,Mail]
        )
        logger.info("Beanie initialization completed")
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise
