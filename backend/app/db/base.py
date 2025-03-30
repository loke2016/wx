# 导入所有数据模型，确保Alembic能够检测到它们
from app.db.base_class import Base
from app.models.user import User
from app.models.family import Family
from app.models.family_member import FamilyMember
from app.models.photo import Photo
from app.models.comment import Comment
from app.models.like import Like 