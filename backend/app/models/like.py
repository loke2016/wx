import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Like(Base):
    """
    点赞模型
    """
    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 外键关联
    photo_id = Column(UUID(as_uuid=True), ForeignKey("photo.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    # 关系
    photo = relationship("Photo")
    user = relationship("User")
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 唯一约束：一个用户对一张照片只能有一条点赞记录
    __table_args__ = (
        UniqueConstraint('photo_id', 'user_id', name='uix_photo_like'),
    ) 