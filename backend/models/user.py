"""
User models for VisionPath AI
"""


from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database.config import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    full_name = Column(String)
    email = Column(String, unique=True)
    phone_number = Column(String)
    password_hash = Column(String)
    role_id = Column(Integer, ForeignKey("roles.role_id"))
    role = relationship("Role", back_populates="users")
    is_visually_impaired = Column(Boolean, default=False)
    created_at = Column(DateTime)
    last_login = Column(DateTime)
    account_status = Column(String)


    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "full_name": self.full_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role_id": self.role_id,
            "is_visually_impaired": self.is_visually_impaired,
            "created_at": self.created_at,
            "last_login": self.last_login,
            "account_status": self.account_status,
        }

class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String, nullable=False)
    description = Column(String)

    users = relationship("User", back_populates="role")

    def to_dict(self):
        return {
            "role_id": self.role_id,
            "role_name": self.role_name,
            "description": self.description,
        }       



