import uuid
from datetime import datetime

from sqlalchemy import Column, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class FamilyMember(Base):
    """
    家庭成员模型
    """
    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 外键关联
    family_id = Column(UUID(as_uuid=True), ForeignKey("family.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    # 关系
    family = relationship("Family")
    user = relationship("User")
    
    # 是否管理员
    is_admin = Column(Boolean, default=False)
    
    # 时间戳
    joined_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 唯一约束：一个用户在一个家庭中只能有一条记录
    __table_args__ = (
        UniqueConstraint('family_id', 'user_id', name='uix_family_member'),
    ) 