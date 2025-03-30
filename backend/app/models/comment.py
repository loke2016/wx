import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Comment(Base):
    """
    评论模型
    """
    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 外键关联
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photo.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    # 关系
    photo = relationship("Photo")
    user = relationship("User")
    
    # 评论内容
    content = Column(String(500), nullable=False)
    
    # 状态
    is_deleted = Column(String(1), default='0', nullable=False)  # 逻辑删除标志
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 