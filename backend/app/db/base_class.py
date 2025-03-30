from typing import Any

from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    """
    SQLAlchemy 声明性基类
    """
    id: Any
    __name__: str

    # 自动生成表名
    @declared_attr
    def __tablename__(cls) -> str:
        # 将驼峰命名转换为蛇形命名
        return cls.__name__.lower() 