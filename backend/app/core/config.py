import os
import secrets
from typing import List, Optional, Union, Dict, Any

from pydantic import BaseSettings, validator, PostgresDsn, RedisDsn


class Settings(BaseSettings):
    # 基础设置
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "家庭共享相册"
    
    # 安全设置
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7天
    CORS_ORIGINS: List[str] = ["*"]
    
    # 数据库设置
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql+asyncpg",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )
    
    # Redis设置
    REDIS_SERVER: str
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URI: Optional[RedisDsn] = None

    @validator("REDIS_URI", pre=True)
    def assemble_redis_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        password = f":{values.get('REDIS_PASSWORD')}@" if values.get("REDIS_PASSWORD") else ""
        return f"redis://{password}{values.get('REDIS_SERVER')}:{values.get('REDIS_PORT')}/{values.get('REDIS_DB')}"
    
    # MinIO设置
    MINIO_SERVER: str
    MINIO_PORT: int = 9000
    MINIO_ROOT_USER: str
    MINIO_ROOT_PASSWORD: str
    MINIO_SECURE: bool = False
    MINIO_PHOTO_BUCKET: str = "photos"
    MINIO_THUMBNAIL_BUCKET: str = "thumbnails"
    
    # 存储配置
    MAX_PHOTO_SIZE: int = 10 * 1024 * 1024  # 10MB
    THUMBNAIL_SIZE: tuple = (300, 300)
    DEFAULT_QUOTA_BYTES: int = 10 * 1024 * 1024 * 1024  # 10GB per family
    
    # 敏感图片检测设置
    ENABLE_IMAGE_SCAN: bool = False
    IMAGE_SCAN_API_KEY: Optional[str] = None
    IMAGE_SCAN_API_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings() 