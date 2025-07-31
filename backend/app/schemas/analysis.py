from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AnalysisRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)

class CompanyInfo(BaseModel):
    id: int
    ticker: str
    company_name: Optional[str] = None
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[float] = None

class AnalysisResponse(BaseModel):
    id: int
    company: CompanyInfo
    recommendation: str
    confidence_score: float
    target_price: Optional[float] = None
    overall_score: float
    analysis_date: datetime
    analysis_data: Dict[str, Any]
    
    class Config:
        from_attributes = True

class WatchlistItem(BaseModel):
    id: int
    company: CompanyInfo
    analysis: AnalysisResponse
    added_at: datetime