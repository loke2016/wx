import uuid
from datetime import datetime

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, BigInteger, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Photo(Base):
    """
    照片模型
    """
    # 主键
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # 外键关联
    family_id = Column(UUID(as_uuid=True), ForeignKey("family.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    # 关系
    family = relationship("Family")
    user = relationship("User")
    
    # 照片数据
    filename = Column(String(255), nullable=False)
    original_key = Column(String(255), nullable=False)  # 原图在MinIO中的键
    thumbnail_key = Column(String(255), nullable=False)  # 缩略图在MinIO中的键
    file_size = Column(BigInteger, nullable=False)  # 文件大小（字节）
    
    # 图像信息
    width = Column(Integer, nullable=True)  # 宽度（像素）
    height = Column(Integer, nullable=True)  # 高度（像素）
    exif = Column(JSON, nullable=True)  # EXIF信息
    
    # 描述
    description = Column(String(1000), nullable=True)
    
    # 状态
    is_deleted = Column(String(1), default='0', nullable=False)  # 逻辑删除标志
    
    # 评论和点赞计数
    comment_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    
    # 时间戳
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 