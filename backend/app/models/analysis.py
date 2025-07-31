from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    analysis_data = Column(JSON, nullable=False)
    recommendation = Column(String(10))  # BUY/SELL/HOLD
    confidence_score = Column(Float)
    target_price = Column(Float)
    overall_score = Column(Float)
    analysis_date = Column(DateTime(timezone=True), server_default=func.now())
    version = Column(Integer, default=1)
    is_latest = Column(Boolean, default=True)
    
    # Relationship
    company = relationship("Company", back_populates="analyses")

class AnalysisMetadata(Base):
    __tablename__ = "analysis_metadata"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analysis_results.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    execution_time_ms = Column(Integer)
    status = Column(String(20))  # SUCCESS/FAILED/TIMEOUT
    error_message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())