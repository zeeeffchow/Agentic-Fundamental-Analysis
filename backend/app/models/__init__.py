from sqlalchemy.orm import relationship

# Import all models first
from .company import Company
from .analysis import AnalysisResult, AnalysisMetadata  
from .user import User, UserWatchlist

# Set up relationships after all models are imported
Company.analyses = relationship("AnalysisResult", back_populates="company", lazy="dynamic")