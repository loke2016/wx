import uuid
from datetime import datetime

from sqlalchemy import Column, String, BigInteger, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Family(Base):
    """
    家庭模型
    """
    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 家庭名称
    name = Column(String(100), nullable=False)
    
    # 创建者ID
    creator_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    creator = relationship("User", foreign_keys=[creator_id])
    
    # 存储配额（字节）
    quota_bytes = Column(BigInteger, nullable=False)
    
    # 已使用存储空间（字节）
    used_bytes = Column(BigInteger, default=0, nullable=False)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 