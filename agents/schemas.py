from atomic_agents.agents.base_agent import BaseIOSchema
from pydantic import Field
from typing import List, Dict, Any, Optional

# ===== SHARED INPUT/OUTPUT SCHEMAS =====

class CompanyInput(BaseIOSchema):
    """Input schema for company ticker."""
    ticker: str = Field(..., description="Company stock ticker symbol (e.g., AAPL)")
    company_name: Optional[str] = Field(None, description="Optional company name")

class CompanyInfo(BaseIOSchema):
    """Basic company information schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    company_name: str = Field(..., description="Full company name")
    sector: str = Field(..., description="Business sector")
    industry: str = Field(..., description="Industry classification")
    market_cap: Optional[float] = Field(None, description="Market capitalization in billions")
    description: str = Field(..., description="Business description")

class FinancialData(BaseIOSchema):
    """Financial statements and metrics schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    revenue: float = Field(..., description="Annual revenue in millions")
    net_income: float = Field(..., description="Net income in millions")
    total_equity: float = Field(..., description="Total shareholders equity in millions")
    total_debt: float = Field(..., description="Total debt in millions")
    free_cash_flow: float = Field(..., description="Free cash flow in millions")
    shares_outstanding: float = Field(..., description="Shares outstanding in millions")

class KeyRatios(BaseIOSchema):
    """Calculated financial ratios schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    roe: float = Field(..., description="Return on Equity (%)")
    net_margin: float = Field(..., description="Net profit margin (%)")
    debt_to_equity: float = Field(..., description="Debt to equity ratio")
    current_ratio: float = Field(..., description="Current ratio")
    revenue_growth_3y: float = Field(..., description="3-year revenue growth rate (%)")

class BusinessAnalysis(BaseIOSchema):
    """Company business analysis schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    products_services: List[str] = Field(..., description="Key products and services")
    competitive_advantages: List[str] = Field(..., description="Competitive advantages")
    key_competitors: List[str] = Field(..., description="Main competitors")
    market_position: str = Field(..., description="Market position description")
    growth_drivers: List[str] = Field(..., description="Key growth drivers")

class RiskAssessment(BaseIOSchema):
    """Risk analysis schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    concentration_risk: int = Field(..., description="Concentration risk score (1-10)", ge=1, le=10)
    competition_risk: int = Field(..., description="Competition risk score (1-10)", ge=1, le=10)
    disruption_risk: int = Field(..., description="Disruption risk score (1-10)", ge=1, le=10)
    regulatory_risk: int = Field(..., description="Regulatory risk score (1-10)", ge=1, le=10)
    overall_risk_score: float = Field(..., description="Overall risk score (1-10)", ge=1, le=10)
    risk_summary: str = Field(..., description="Summary of key risks")

class ValuationMetrics(BaseIOSchema):
    """Valuation metrics schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    current_price: float = Field(..., description="Current stock price")
    pe_ratio: float = Field(..., description="Price to earnings ratio")
    pfcf_ratio: float = Field(..., description="Price to free cash flow ratio")
    pb_ratio: float = Field(..., description="Price to book ratio")
    ev_revenue: float = Field(..., description="Enterprise value to revenue ratio")
    fair_value_estimate: float = Field(..., description="Estimated fair value per share")
    upside_downside: float = Field(..., description="Upside/downside percentage")

class ManagementAnalysis(BaseIOSchema):
    """Management team analysis schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    ceo_name: str = Field(..., description="CEO name")
    ceo_tenure: int = Field(..., description="CEO tenure in years")
    management_quality: int = Field(..., description="Management quality score (1-10)", ge=1, le=10)
    track_record: str = Field(..., description="Management track record summary")
    corporate_governance: int = Field(..., description="Corporate governance score (1-10)", ge=1, le=10)

class IndustryAnalysis(BaseIOSchema):
    """Industry trends analysis schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    industry: str = Field(..., description="Industry name")
    industry_growth_rate: float = Field(..., description="Industry growth rate (%)")
    market_trends: List[str] = Field(..., description="Key market trends")
    industry_outlook: str = Field(..., description="Growing, Stable, or Declining")
    regulatory_environment: str = Field(..., description="Regulatory environment assessment")

class FinalRecommendation(BaseIOSchema):
    """Final investment recommendation schema."""
    ticker: str = Field(..., description="Stock ticker symbol")
    recommendation: str = Field(..., description="Investment recommendation: BUY, SELL, or HOLD")
    confidence: float = Field(..., description="Confidence level (0.0-1.0)", ge=0.0, le=1.0)
    target_price: float = Field(..., description="12-month target price")
    key_reasons: List[str] = Field(..., description="Key reasons for recommendation")
    risks: List[str] = Field(..., description="Key risks to consider")
    time_horizon: str = Field(..., description="Recommended investment time horizon")
    overall_score: float = Field(..., description="Overall investment score (1-10)", ge=1, le=10)
    analysis_summary: str = Field(..., description="Executive summary of analysis")