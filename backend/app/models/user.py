import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from app.db.base_class import Base


class User(Base):
    """
    用户模型
    """
    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 微信相关字段
    openid = Column(String, index=True, unique=True, nullable=False)
    unionid = Column(String, index=True, unique=True, nullable=True)
    
    # 用户信息
    nickname = Column(String(64), index=True)
    avatar_url = Column(String(255))
    gender = Column(String(10), nullable=True)
    country = Column(String(64), nullable=True)
    province = Column(String(64), nullable=True)
    city = Column(String(64), nullable=True)
    
    # 状态标志
    is_active = Column(Boolean, default=True)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 