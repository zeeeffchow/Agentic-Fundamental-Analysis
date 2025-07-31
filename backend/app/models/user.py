from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    username = Column(String(100), unique=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserWatchlist(Base):
    __tablename__ = "user_watchlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("analysis_results.id"), nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    company = relationship("Company")
    analysis = relationship("AnalysisResult")
    
    # Ensure unique user-company pairs
    __table_args__ = (UniqueConstraint('user_id', 'company_id', name='unique_user_company'),)