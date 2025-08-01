# agents/orchestrator.py - ENHANCED VERSION for Production Integration

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from atomic_agents.agents.base_agent import BaseIOSchema, BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from pydantic import Field
from backend.app.services.logo_service import LogoDevService

# ===== ENHANCED SCHEMAS FOR DETAILED ANALYSIS =====

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

class EnhancedFinancialData(BaseIOSchema):
    """Enhanced financial statements and metrics with detailed breakdown."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Core Financial Statement Data
    revenue: float = Field(..., description="Annual revenue in millions")
    revenue_growth_1y: float = Field(..., description="1-year revenue growth (%)")
    revenue_growth_3y: float = Field(..., description="3-year CAGR revenue growth (%)")
    revenue_growth_5y: float = Field(..., description="5-year CAGR revenue growth (%)")
    quarterly_revenue_trend: List[float] = Field(..., description="Last 4 quarters revenue in millions")
    
    # Profitability Metrics
    gross_profit: float = Field(..., description="Gross profit in millions")
    gross_margin: float = Field(..., description="Gross margin (%)")
    operating_income: float = Field(..., description="Operating income in millions")
    operating_margin: float = Field(..., description="Operating margin (%)")
    net_income: float = Field(..., description="Net income in millions")
    net_margin: float = Field(..., description="Net profit margin (%)")
    
    # Cash Flow Analysis
    operating_cash_flow: float = Field(..., description="Operating cash flow in millions")
    free_cash_flow: float = Field(..., description="Free cash flow in millions")
    capex: float = Field(..., description="Capital expenditures in millions")
    fcf_margin: float = Field(..., description="Free cash flow margin (%)")
    fcf_growth_3y: float = Field(..., description="3-year FCF growth rate (%)")
    
    # Balance Sheet Strength
    total_assets: float = Field(..., description="Total assets in millions")
    total_equity: float = Field(..., description="Total shareholders equity in millions")
    total_debt: float = Field(..., description="Total debt in millions")
    cash_and_equivalents: float = Field(..., description="Cash and cash equivalents in millions")
    working_capital: float = Field(..., description="Working capital in millions")
    
    # Share Information
    shares_outstanding: float = Field(..., description="Shares outstanding in millions")
    share_buybacks_annual: float = Field(..., description="Annual share buybacks in millions")
    dividend_yield: float = Field(..., description="Dividend yield (%)")
    dividend_growth_rate: float = Field(..., description="Dividend growth rate (%)")

class EnhancedKeyRatios(BaseIOSchema):
    """Enhanced financial ratios with industry context."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Profitability Ratios
    roe: float = Field(..., description="Return on Equity (%)")
    roa: float = Field(..., description="Return on Assets (%)")
    roic: float = Field(..., description="Return on Invested Capital (%)")
    
    # Efficiency Ratios
    asset_turnover: float = Field(..., description="Asset turnover ratio")
    inventory_turnover: float = Field(..., description="Inventory turnover ratio")
    receivables_turnover: float = Field(..., description="Receivables turnover ratio")
    
    # Liquidity Ratios
    current_ratio: float = Field(..., description="Current ratio")
    quick_ratio: float = Field(..., description="Quick ratio")
    cash_ratio: float = Field(..., description="Cash ratio")
    
    # Leverage Ratios
    debt_to_equity: float = Field(..., description="Debt to equity ratio")
    debt_to_assets: float = Field(..., description="Debt to assets ratio")
    interest_coverage: float = Field(..., description="Interest coverage ratio")
    
    # Growth Metrics
    revenue_growth_consistency: str = Field(..., description="Revenue growth consistency assessment")
    earnings_growth_quality: str = Field(..., description="Earnings growth quality assessment")
    
    # Industry Comparison
    roe_vs_industry: str = Field(..., description="ROE compared to industry average")
    margins_vs_industry: str = Field(..., description="Profit margins vs industry peers")
    growth_vs_industry: str = Field(..., description="Growth rates vs industry average")

class EnhancedBusinessAnalysis(BaseIOSchema):
    """Comprehensive business analysis with competitive positioning."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Business Model Analysis
    revenue_streams: List[Dict[str, Any]] = Field(..., description="Detailed revenue streams with percentages")
    business_model_type: str = Field(..., description="Type of business model (subscription, transactional, etc.)")
    customer_segments: List[str] = Field(..., description="Key customer segments")
    geographic_exposure: Dict[str, float] = Field(..., description="Revenue by geography in percentages. Use region names as keys and percentages as values")
    
    # Products and Services
    products_services: List[Dict[str, str]] = Field(..., description="Products/services with descriptions and importance")
    product_lifecycle_stage: str = Field(..., description="Overall product lifecycle assessment")
    innovation_pipeline: List[str] = Field(..., description="New products/services in development")
    
    # Competitive Analysis
    competitive_advantages: List[Dict[str, str]] = Field(..., description="Competitive advantages with specific explanations")
    moat_strength: str = Field(..., description="Economic moat strength: Wide, Narrow, or None")
    moat_sources: List[str] = Field(..., description="Specific sources of competitive moat")
    key_competitors: List[Dict[str, Any]] = Field(..., description="Main competitors with market share data")
    market_share: float = Field(..., description="Company's market share percentage")
    
    # Growth Strategy
    growth_drivers: List[Dict[str, str]] = Field(..., description="Growth drivers with detailed explanations. Each item should be a dict with 'driver' and 'explanation' keys")
    expansion_plans: List[str] = Field(..., description="Geographic or market expansion plans")
    acquisition_strategy: str = Field(..., description="M&A strategy and recent activity")
    
    # Market Position
    market_position: str = Field(..., description="Market leadership position")
    brand_strength: int = Field(..., description="Brand strength score (1-10)", ge=1, le=10)
    customer_loyalty: str = Field(..., description="Customer loyalty and retention assessment")
    pricing_power: str = Field(..., description="Company's pricing power in the market")

class EnhancedRiskAssessment(BaseIOSchema):
    """Comprehensive risk analysis with specific examples."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Business Risks
    concentration_risk: int = Field(..., description="Customer/revenue concentration risk (1-10)", ge=1, le=10)
    concentration_details: str = Field(..., description="Specific concentration risk details")
    
    competition_risk: int = Field(..., description="Competition intensity risk (1-10)", ge=1, le=10)
    competition_details: str = Field(..., description="Specific competitive threats")
    
    disruption_risk: int = Field(..., description="Technology disruption risk (1-10)", ge=1, le=10)
    disruption_details: str = Field(..., description="Specific disruption threats and company preparedness")
    
    # External Risks
    regulatory_risk: int = Field(..., description="Regulatory risk score (1-10)", ge=1, le=10)
    regulatory_details: str = Field(..., description="Specific regulatory challenges and opportunities")
    
    cyclical_risk: int = Field(..., description="Economic cycle sensitivity (1-10)", ge=1, le=10)
    cyclical_details: str = Field(..., description="How economic cycles affect the business")
    
    # Financial Risks
    leverage_risk: int = Field(..., description="Financial leverage risk (1-10)", ge=1, le=10)
    liquidity_risk: int = Field(..., description="Liquidity risk score (1-10)", ge=1, le=10)
    
    # ESG and Operational Risks
    esg_risks: List[str] = Field(..., description="Environmental, social, governance risks")
    operational_risks: List[str] = Field(..., description="Key operational risk factors")
    
    # Overall Assessment
    overall_risk_score: float = Field(..., description="Overall risk score (1-10)", ge=1, le=10)
    risk_summary: str = Field(..., description="Executive summary of key risks")
    risk_mitigation: List[str] = Field(..., description="How company is mitigating key risks")

class EnhancedValuationMetrics(BaseIOSchema):
    """Detailed valuation analysis with multiple methodologies."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Current Market Data
    current_price: float = Field(..., description="Current stock price")
    market_cap: float = Field(..., description="Market capitalization in billions")
    enterprise_value: float = Field(..., description="Enterprise value in billions")
    
    # Traditional Multiples
    pe_ratio: float = Field(..., description="Price to earnings ratio")
    forward_pe: float = Field(..., description="Forward P/E ratio")
    peg_ratio: float = Field(..., description="PEG ratio (P/E to growth)")
    pfcf_ratio: float = Field(..., description="Price to free cash flow ratio")
    pb_ratio: float = Field(..., description="Price to book ratio")
    ps_ratio: float = Field(..., description="Price to sales ratio")
    ev_revenue: float = Field(..., description="Enterprise value to revenue ratio")
    ev_ebitda: float = Field(..., description="EV/EBITDA ratio")
    
    # Relative Valuation
    pe_vs_industry: str = Field(..., description="P/E vs industry comparison")
    ev_sales_vs_peers: str = Field(..., description="EV/Sales vs peer comparison")
    premium_discount: float = Field(..., description="Premium/discount to peers (%)")
    
    # Intrinsic Valuation
    dcf_fair_value: float = Field(..., description="DCF model fair value estimate")
    dcf_assumptions: Dict[str, float] = Field(..., description="Key DCF assumptions with assumption names as keys and values as numbers")
    sensitivity_analysis: Dict[str, float] = Field(..., description="Valuation sensitivity to key variables. Use variable names as keys and sensitivity values as numbers")
    
    # Value Assessment
    fair_value_estimate: float = Field(..., description="Consolidated fair value per share")
    upside_downside: float = Field(..., description="Upside/downside percentage")
    margin_of_safety: float = Field(..., description="Margin of safety percentage")
    valuation_conclusion: str = Field(..., description="Overvalued, Fairly Valued, or Undervalued")

class EnhancedManagementAnalysis(BaseIOSchema):
    """Detailed management and governance analysis."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Leadership Team
    ceo_name: str = Field(..., description="CEO name")
    ceo_tenure: int = Field(..., description="CEO tenure in years")
    ceo_background: str = Field(..., description="CEO's professional background and experience")
    ceo_previous_performance: str = Field(..., description="CEO's track record at previous companies")
    
    leadership_team: List[Dict[str, str]] = Field(..., description="Key executives with backgrounds. Each item should be a dict with 'name' and 'role' keys")
    management_stability: str = Field(..., description="Management team stability assessment")
    succession_planning: str = Field(..., description="Succession planning quality")
    
    # Performance Track Record
    management_quality: int = Field(..., description="Management quality score (1-10)", ge=1, le=10)
    track_record: str = Field(..., description="Detailed management execution track record")
    strategic_decisions: List[Dict[str, str]] = Field(..., description="Key strategic decisions and outcomes. Each item should be a dict with 'decision' and 'outcome' keys")
    operational_improvements: List[str] = Field(..., description="Operational improvements implemented")
    
    # Governance and Compensation
    corporate_governance: int = Field(..., description="Corporate governance score (1-10)", ge=1, le=10)
    board_independence: str = Field(..., description="Board independence assessment")
    executive_compensation: str = Field(..., description="Executive compensation alignment with performance")
    shareholder_friendliness: str = Field(..., description="Management's shareholder-friendly actions")
    
    # Communication and Transparency
    communication_quality: int = Field(..., description="Management communication quality (1-10)", ge=1, le=10)
    transparency_score: int = Field(..., description="Financial transparency score (1-10)", ge=1, le=10)
    guidance_accuracy: str = Field(..., description="Historical guidance accuracy assessment")

class EnhancedIndustryAnalysis(BaseIOSchema):
    """Comprehensive industry and market analysis."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Industry Classification
    industry: str = Field(..., description="Specific industry name")
    sub_industry: str = Field(..., description="Sub-industry classification")
    industry_size: float = Field(..., description="Total addressable market size in billions")
    
    # Growth and Trends
    industry_growth_rate: float = Field(..., description="Historical industry growth rate (%)")
    projected_growth_rate: float = Field(..., description="Projected 3-5 year growth rate (%)")
    growth_drivers: List[str] = Field(..., description="Key industry growth drivers")
    market_trends: List[Dict[str, str]] = Field(..., description="Detailed market trends with impact")
    
    # Industry Structure
    market_concentration: str = Field(..., description="Industry concentration (fragmented/concentrated)")
    barriers_to_entry: str = Field(..., description="Barriers to entry assessment")
    supplier_power: str = Field(..., description="Supplier bargaining power")
    buyer_power: str = Field(..., description="Buyer bargaining power")
    
    # Regulatory and External Factors
    regulatory_environment: str = Field(..., description="Detailed regulatory environment")
    pending_regulations: List[str] = Field(..., description="Upcoming regulatory changes")
    technology_impact: str = Field(..., description="Technology disruption impact")
    
    # Outlook and Positioning
    industry_outlook: str = Field(..., description="Growing, Stable, or Declining with reasoning")
    cyclical_nature: str = Field(..., description="Industry cyclicality assessment")
    seasonal_factors: str = Field(..., description="Seasonal business factors")
    company_industry_position: str = Field(..., description="Company's position within industry")

class EnhancedFinalRecommendation(BaseIOSchema):
    """Comprehensive investment recommendation with detailed reasoning."""
    ticker: str = Field(..., description="Stock ticker symbol")
    
    # Core Recommendation
    recommendation: str = Field(..., description="Investment recommendation: STRONG BUY, BUY, HOLD, SELL, STRONG SELL")
    confidence: float = Field(..., description="Confidence level (0.0-1.0)", ge=0.0, le=1.0)
    conviction_level: str = Field(..., description="Low, Medium, or High conviction")
    
    # Price Targets and Timeline
    target_price: float = Field(..., description="12-month target price")
    price_target_range: Optional[Dict[str, float]] = Field(None, description="Bull, base, bear case price targets")
    time_horizon: str = Field(..., description="Recommended investment time horizon")
    
    # Investment Thesis
    investment_thesis: str = Field(..., description="Detailed 2-3 paragraph investment thesis")
    key_reasons: List[Dict[str, str]] = Field(..., description="Key reasons with detailed explanations")
    catalysts: Optional[List[Dict[str, str]]] = Field(None, description="Near-term catalysts with expected impact")
    
    # Risk Analysis
    risks: List[Dict[str, str]] = Field(..., description="Key risks with detailed explanations")
    risk_mitigation: Optional[str] = Field(None, description="How to mitigate key risks")
    downside_scenario: Optional[str] = Field(None, description="Bear case scenario analysis")
    
    # Scoring and Metrics
    overall_score: float = Field(..., description="Overall investment score (1-10)", ge=1, le=10)
    quality_score: Optional[float] = Field(None, description="Business quality score (1-10)", ge=1, le=10)
    growth_score: Optional[float] = Field(None, description="Growth prospects score (1-10)", ge=1, le=10)
    valuation_score: Optional[float] = Field(None, description="Valuation attractiveness (1-10)", ge=1, le=10)
    
    # Portfolio Considerations
    portfolio_fit: Optional[str] = Field(None, description="How this fits in a diversified portfolio")
    position_sizing: Optional[str] = Field(None, description="Recommended position sizing guidance")
    monitoring_metrics: Optional[List[str]] = Field(None, description="Key metrics to monitor going forward")
    
    # Summary
    analysis_summary: str = Field(..., description="Executive summary of complete analysis")
    decision_summary: str = Field(..., description="One paragraph decision rationale")

# ===== BACKWARD COMPATIBILITY SCHEMAS =====
# Keep original schemas for any legacy code that might reference them

class FinancialData(BaseIOSchema):
    """Original financial data schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    revenue: float = Field(..., description="Annual revenue in millions")
    net_income: float = Field(..., description="Net income in millions")
    total_equity: float = Field(..., description="Total shareholders equity in millions")
    total_debt: float = Field(..., description="Total debt in millions")
    free_cash_flow: float = Field(..., description="Free cash flow in millions")
    shares_outstanding: float = Field(..., description="Shares outstanding in millions")

class KeyRatios(BaseIOSchema):
    """Original ratios schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    roe: float = Field(..., description="Return on Equity (%)")
    net_margin: float = Field(..., description="Net profit margin (%)")
    debt_to_equity: float = Field(..., description="Debt to equity ratio")
    current_ratio: float = Field(..., description="Current ratio")
    revenue_growth_3y: float = Field(..., description="3-year revenue growth rate (%)")

class BusinessAnalysis(BaseIOSchema):
    """Original business analysis schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    products_services: List[str] = Field(..., description="Key products and services")
    competitive_advantages: List[str] = Field(..., description="Competitive advantages")
    key_competitors: List[str] = Field(..., description="Main competitors")
    market_position: str = Field(..., description="Market position description")
    growth_drivers: List[str] = Field(..., description="Key growth drivers")

class RiskAssessment(BaseIOSchema):
    """Original risk assessment schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    concentration_risk: int = Field(..., description="Concentration risk score (1-10)", ge=1, le=10)
    competition_risk: int = Field(..., description="Competition risk score (1-10)", ge=1, le=10)
    disruption_risk: int = Field(..., description="Disruption risk score (1-10)", ge=1, le=10)
    regulatory_risk: int = Field(..., description="Regulatory risk score (1-10)", ge=1, le=10)
    overall_risk_score: float = Field(..., description="Overall risk score (1-10)", ge=1, le=10)
    risk_summary: str = Field(..., description="Summary of key risks")

class ValuationMetrics(BaseIOSchema):
    """Original valuation schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    current_price: float = Field(..., description="Current stock price")
    pe_ratio: float = Field(..., description="Price to earnings ratio")
    pfcf_ratio: float = Field(..., description="Price to free cash flow ratio")
    pb_ratio: float = Field(..., description="Price to book ratio")
    ev_revenue: float = Field(..., description="Enterprise value to revenue ratio")
    fair_value_estimate: float = Field(..., description="Estimated fair value per share")
    upside_downside: float = Field(..., description="Upside/downside percentage")

class ManagementAnalysis(BaseIOSchema):
    """Original management analysis schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    ceo_name: str = Field(..., description="CEO name")
    ceo_tenure: int = Field(..., description="CEO tenure in years")
    management_quality: int = Field(..., description="Management quality score (1-10)", ge=1, le=10)
    track_record: str = Field(..., description="Management track record summary")
    corporate_governance: int = Field(..., description="Corporate governance score (1-10)", ge=1, le=10)

class IndustryAnalysis(BaseIOSchema):
    """Original industry analysis schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    industry: str = Field(..., description="Industry name")
    industry_growth_rate: float = Field(..., description="Industry growth rate (%)")
    market_trends: List[str] = Field(..., description="Key market trends")
    industry_outlook: str = Field(..., description="Growing, Stable, or Declining")
    regulatory_environment: str = Field(..., description="Regulatory environment assessment")

class FinalRecommendation(BaseIOSchema):
    """Original final recommendation schema for backward compatibility."""
    ticker: str = Field(..., description="Stock ticker symbol")
    recommendation: str = Field(..., description="Investment recommendation: BUY, SELL, or HOLD")
    confidence: float = Field(..., description="Confidence level (0.0-1.0)", ge=0.0, le=1.0)
    target_price: float = Field(..., description="12-month target price")
    key_reasons: List[str] = Field(..., description="Key reasons for recommendation")
    risks: List[str] = Field(..., description="Key risks to consider")
    time_horizon: str = Field(..., description="Recommended investment time horizon")
    overall_score: float = Field(..., description="Overall investment score (1-10)", ge=1, le=10)
    analysis_summary: str = Field(..., description="Executive summary of analysis")

# ===== UTILITY SCHEMAS =====

class CompanyKnowledgeCheckOutput(BaseIOSchema):
    """Output schema for company knowledge check."""
    ticker: str = Field(..., description="Stock ticker symbol")
    is_known: bool = Field(..., description="Whether the company is already known")
    last_analysis_date: Optional[str] = Field(None, description="Date of last analysis if known")
    needs_full_analysis: bool = Field(..., description="Whether full analysis is needed")

class CompanyWebInfo(BaseIOSchema):
    """Company web presence and visual identity info."""
    ticker: str = Field(..., description="Stock ticker symbol")
    logo_url: Optional[str] = Field(None, description="Company logo URL")
    website_url: Optional[str] = Field(None, description="Company website URL")
    ceo_photo_url: Optional[str] = Field(None, description="CEO photo URL")

# ===== ENHANCED AGENT CREATION FUNCTIONS =====

def create_knowledge_agent(client, ticker: str):
    """Create a fresh knowledge checking agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are checking existing knowledge about {ticker}.",
            "You determine if comprehensive analysis is needed.",
            f"You track when {ticker} was last analyzed and what data exists."
        ],
        steps=[
            f"Check if {ticker} is in your knowledge base",
            f"Determine if {ticker} needs fresh analysis",
            f"Check recency of any existing {ticker} data"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Analyze knowledge freshness for {ticker} specifically"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=CompanyKnowledgeCheckOutput
        )
    )

def create_financial_agent(client, ticker: str):
    """Create enhanced financial analysis agent with detailed data requirements."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are conducting comprehensive financial analysis for {ticker}.",
            "You are a senior financial analyst who examines financial statements in detail.",
            f"You gather complete financial data for {ticker} including growth trends, profitability, cash flows, and balance sheet strength.",
            "You focus on multi-year trends and quarter-over-quarter changes to identify patterns."
        ],
        steps=[
            f"Gather {ticker}'s complete income statement data for 3-5 years",
            f"Analyze {ticker}'s revenue growth trends and consistency",
            f"Examine {ticker}'s profitability metrics and margin trends",
            f"Collect {ticker}'s cash flow statements and free cash flow analysis",
            f"Review {ticker}'s balance sheet strength and working capital",
            f"Calculate {ticker}'s quarterly trends and seasonality",
            f"Assess {ticker}'s capital allocation and shareholder returns"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide comprehensive financial data for {ticker} with specific numbers",
            "Include multi-year trends and growth rates with specific percentages",
            "Provide quarterly data for recent performance trends",
            "Calculate all key financial metrics with exact figures",
            "Focus on cash generation and balance sheet quality metrics",
            "Include dividend and share buyback information where applicable"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=EnhancedFinancialData
        )
    )

def create_ratio_agent(client, ticker: str):
    """Create enhanced ratio analysis agent with industry context."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are calculating comprehensive financial ratios for {ticker}.",
            "You are a quantitative analyst who computes and interprets financial ratios.",
            f"You calculate profitability, efficiency, liquidity, and leverage ratios for {ticker}.",
            f"You compare {ticker}'s ratios to industry benchmarks and peers."
        ],
        steps=[
            f"Calculate all profitability ratios for {ticker} (ROE, ROA, ROIC)",
            f"Compute efficiency ratios for {ticker} (asset, inventory, receivables turnover)",
            f"Determine liquidity ratios for {ticker} (current, quick, cash ratios)",
            f"Calculate leverage ratios for {ticker} (debt/equity, debt/assets, interest coverage)",
            f"Assess {ticker}'s growth metrics and consistency",
            f"Compare {ticker}'s ratios to industry averages",
            f"Evaluate ratio trends over time for {ticker}"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Calculate precise ratios for {ticker} using the provided financial data",
            "Include industry comparison context for each major ratio category",
            "Assess ratio quality and trends with specific explanations",
            "Highlight ratio strengths and weaknesses compared to peers",
            "Provide specific ratio calculations, not just interpretations"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=EnhancedFinancialData,
            output_schema=EnhancedKeyRatios
        )
    )

def create_business_agent(client, ticker: str):
    """Create enhanced business analysis agent with detailed competitive analysis."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are conducting comprehensive business analysis for {ticker}.",
            "You are a strategy consultant who analyzes business models and competitive positioning.",
            f"You examine {ticker}'s revenue streams, competitive advantages, and market position in detail.",
            f"You assess {ticker}'s economic moat, growth strategy, and competitive dynamics."
        ],
        steps=[
            f"Analyze {ticker}'s business model and revenue stream diversification",
            f"Identify {ticker}'s competitive advantages and economic moat sources",
            f"Map {ticker}'s competitive landscape and market share position",
            f"Evaluate {ticker}'s product portfolio and innovation pipeline",
            f"Assess {ticker}'s growth strategy and expansion plans",
            f"Examine {ticker}'s customer base and geographic exposure",
            f"Analyze {ticker}'s brand strength and pricing power"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide detailed business model analysis for {ticker} with specific revenue breakdowns",
            "Identify specific competitive advantages with concrete examples",
            "Include detailed competitor analysis with market share data where available", 
            "Explain the economic moat sources with specific supporting evidence",
            "Provide detailed growth driver analysis with realistic assessments",
            "Include specific product/service details and their market positioning",
            "Assess customer loyalty and retention with supporting data",
            "IMPORTANT: For geographic_exposure, provide a dictionary with region names as keys and percentage numbers as values",
            "IMPORTANT: For revenue_streams, provide a list of dictionaries with 'name', 'percentage', and 'description' keys",
            "IMPORTANT: For competitive_advantages, provide a list of dictionaries with 'advantage' and 'explanation' keys",
            "IMPORTANT: For growth_drivers, provide a list of dictionaries with 'driver' and 'explanation' keys"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=EnhancedBusinessAnalysis
        )
    )

def create_risk_agent(client, ticker: str):
    """Create enhanced risk assessment agent with detailed risk analysis."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are conducting comprehensive risk analysis for {ticker}.",
            "You are a risk management specialist who identifies and quantifies investment risks.",
            f"You assess business, financial, operational, and external risks facing {ticker}.",
            f"You evaluate how {ticker} is positioned to handle various risk scenarios."
        ],
        steps=[
            f"Identify {ticker}'s key business risks including concentration and competition",
            f"Assess {ticker}'s regulatory and disruption risks with specific examples",
            f"Evaluate {ticker}'s financial leverage and liquidity risks",
            f"Examine {ticker}'s cyclical and operational risk exposures",
            f"Consider {ticker}'s ESG risks and external threats",
            f"Analyze how {ticker} is mitigating identified risks",
            f"Rate overall risk profile for {ticker} compared to peers"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide specific risk examples for {ticker} with concrete details",
            "Rate each risk category on 1-10 scale with detailed justification",
            "Include specific examples of how risks could impact the business",
            "Assess company's risk mitigation strategies with specific actions taken",
            "Compare risk profile to industry peers where relevant",
            "Provide realistic assessment of risk probability and impact"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=EnhancedRiskAssessment
        )
    )

def create_valuation_agent(client, ticker: str):
    """Create enhanced valuation agent with multiple valuation methodologies."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are conducting comprehensive valuation analysis for {ticker}.",
            "You are a valuation expert who uses multiple methodologies to determine fair value.",
            f"You calculate intrinsic value for {ticker} using DCF, comparable company analysis, and other methods.",
            f"You assess whether {ticker} is undervalued, fairly valued, or overvalued."
        ],
        steps=[
            f"Calculate current valuation multiples for {ticker} (P/E, EV/Sales, etc.)",
            f"Compare {ticker}'s multiples to industry peers and historical ranges",
            f"Build DCF model for {ticker} with detailed assumptions",
            f"Perform sensitivity analysis on key valuation drivers for {ticker}",
            f"Assess {ticker}'s valuation across different methodologies",
            f"Determine {ticker}'s margin of safety and fair value range",
            f"Conclude on {ticker}'s current valuation attractiveness"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Calculate specific valuation multiples for {ticker} with exact numbers",
            "Provide detailed DCF assumptions and fair value calculation",
            "Include peer comparison analysis with specific multiples",
            "Show sensitivity analysis results for key variables",
            "Provide fair value range, not just point estimate",
            "Explain valuation methodology and key assumptions clearly",
            "Assess margin of safety and investment attractiveness",
            "IMPORTANT: For dcf_assumptions, provide a dictionary with assumption names as keys and numeric values",
            "IMPORTANT: For sensitivity_analysis, provide a dictionary with variable names as keys and single numeric sensitivity values (not lists)"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=EnhancedFinancialData,
            output_schema=EnhancedValuationMetrics
        )
    )

def create_management_agent(client, ticker: str):
    """Create enhanced management analysis agent with detailed leadership assessment."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker}'s management team comprehensively.",
            "You are an expert management analysis specialist who evaluates leadership quality in detail.",
            f"You assess {ticker}'s CEO track record, leadership team, and corporate governance practices.",
            f"You evaluate {ticker}'s management execution, strategic decisions, and shareholder alignment."
        ],
        steps=[
            f"Research {ticker}'s CEO background, experience, and detailed track record",
            f"Evaluate {ticker}'s management team composition and stability",
            f"Assess {ticker}'s strategic decision-making and execution history",
            f"Examine {ticker}'s corporate governance practices and board independence",
            f"Analyze {ticker}'s executive compensation and shareholder alignment",
            f"Evaluate {ticker}'s communication quality and transparency",
            f"Compare {ticker}'s management quality to industry peers"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide detailed background on {ticker}'s CEO and key executives",
            "Include specific examples of management decisions and their outcomes",
            "Assess governance practices with concrete examples",
            "Evaluate compensation alignment with performance using specific data",
            "Rate management quality with detailed justification for scores",
            "Provide specific examples of management's track record and achievements",
            "Include assessment of succession planning and leadership development",
            "IMPORTANT: For leadership_team, provide a list of dictionaries with 'name' and 'role' keys",
            "IMPORTANT: For strategic_decisions, provide a list of dictionaries with 'decision' and 'outcome' keys"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=EnhancedManagementAnalysis
        )
    )

def create_industry_agent(client, ticker: str):
    """Create enhanced industry analysis agent with comprehensive market analysis."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker}'s industry comprehensively.",
            "You are an industry analysis expert who evaluates sector dynamics and market structure.",
            f"You understand how {ticker}'s industry trends, competitive forces, and regulatory environment affect prospects.",
            f"You assess {ticker}'s positioning within industry growth opportunities and challenges."
        ],
        steps=[
            f"Identify {ticker}'s specific industry, sub-industry, and market size",
            f"Analyze {ticker}'s industry growth rates, trends, and key drivers",
            f"Evaluate {ticker}'s industry structure and competitive dynamics",
            f"Assess {ticker}'s regulatory environment and pending changes",
            f"Examine technology disruption impact on {ticker}'s industry",
            f"Determine {ticker}'s industry cyclical nature and seasonal factors",
            f"Evaluate {ticker}'s position within industry value chain"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide detailed industry analysis specific to {ticker}'s market segment",
            "Include specific growth rate data and market size estimates",
            "Assess industry structure using Porter's Five Forces framework",
            "Identify specific regulatory impacts and pending changes",
            "Evaluate technology disruption threats and opportunities",
            "Classify industry outlook with detailed supporting reasoning",
            "Assess company's competitive position within industry dynamics"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=EnhancedIndustryAnalysis
        )
    )

# Add a comprehensive input schema for the decision agent
class ComprehensiveAnalysisInput(BaseIOSchema):
    """Input schema for decision agent that takes all analysis results."""
    ticker: str = Field(..., description="Stock ticker symbol")
    knowledge_check: Optional[Dict[str, Any]] = Field(None, description="Knowledge check results")
    financial_data: Optional[Dict[str, Any]] = Field(None, description="Financial analysis results")
    key_ratios: Optional[Dict[str, Any]] = Field(None, description="Financial ratios analysis")
    business_analysis: Optional[Dict[str, Any]] = Field(None, description="Business analysis results")
    risk_assessment: Optional[Dict[str, Any]] = Field(None, description="Risk assessment results")
    valuation_metrics: Optional[Dict[str, Any]] = Field(None, description="Valuation analysis results")
    management_analysis: Optional[Dict[str, Any]] = Field(None, description="Management analysis results")
    industry_analysis: Optional[Dict[str, Any]] = Field(None, description="Industry analysis results")
    company_images: Optional[Dict[str, Any]] = Field(None, description="Company visual assets")

def create_decision_agent(client, ticker: str):
    """Create enhanced final decision agent with comprehensive investment recommendation."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are making the final investment decision for {ticker}.",
            "You are the chief investment analyst who synthesizes all analysis into actionable investment recommendations.",
            f"You create detailed investment thesis for {ticker} with specific reasoning and risk assessment.",
            f"You provide institutional-quality investment recommendations with price targets and conviction levels."
        ],
        steps=[
            f"Synthesize all {ticker} analysis components into coherent investment thesis",
            f"Weigh {ticker}'s strengths against risks and challenges",
            f"Determine appropriate investment recommendation for {ticker}",
            f"Calculate price targets using multiple methodologies for {ticker}",
            f"Assess conviction level and investment time horizon for {ticker}",
            f"Identify key catalysts and monitoring metrics for {ticker}",
            f"Provide portfolio positioning guidance for {ticker} investment"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide detailed investment thesis for {ticker} with specific supporting evidence",
            "REQUIRED: Include bull/base/bear case price targets with assumptions in price_target_range field",
            "REQUIRED: List specific catalysts with expected timing and impact in catalysts field",
            "REQUIRED: Provide detailed risk assessment with mitigation strategies",
            "REQUIRED: Include conviction level reasoning and recommended position sizing",
            "REQUIRED: Specify key metrics to monitor for investment thesis validation",
            "Provide executive summary suitable for investment committee presentation",
            "IMPORTANT: For key_reasons, provide list of dicts with 'reason' and 'explanation' keys",
            "IMPORTANT: For risks, provide list of dicts with 'risk' and 'explanation' keys",
            "IMPORTANT: For catalysts, provide list of dicts with 'catalyst' and 'impact' keys",
            "IMPORTANT: For price_target_range, provide dict with 'bull', 'base', and 'bear' keys and numeric values"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=ComprehensiveAnalysisInput,  # Now uses proper Pydantic schema
            output_schema=EnhancedFinalRecommendation
        )
    )

def create_company_info_agent(client, ticker: str):
    """Create company info agent for basic information."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are gathering basic company information for {ticker}.",
            "You collect fundamental company details and classification.",
            f"You provide essential company facts for {ticker} investment analysis."
        ],
        steps=[
            f"Gather {ticker}'s basic company information",
            f"Identify {ticker}'s sector and industry classification",
            f"Collect {ticker}'s market cap and business description"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide accurate basic information for {ticker}"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=CompanyInfo
        )
    )

def create_ceo_photo_agent(client, ticker: str):
    """Create CEO photo agent for visual information."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are gathering visual information for {ticker}'s leadership.",
            "You collect company logo and CEO photo information.",
            f"You provide web presence details for {ticker}."
        ],
        steps=[
            f"Find {ticker}'s company logo and website",
            f"Locate {ticker}'s CEO photo if available",
            f"Gather {ticker}'s visual brand information"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Provide visual asset information for {ticker}"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),
            input_schema=CompanyInput,
            output_schema=CompanyWebInfo
        )
    )

def generate_ceo_avatar(ceo_name: str) -> str:
    """Generate a CEO avatar URL using UI Avatars service."""
    if not ceo_name:
        ceo_name = "CEO"
    return f"https://ui-avatars.com/api/?name={ceo_name.replace(' ', '+')}&size=128&background=6366f1&color=ffffff&bold=true"

# ===== ENHANCED ORCHESTRATOR CLASS =====

class AnalysisOrchestrator:
    """Enhanced orchestrator with detailed investment-grade analysis and comprehensive schemas."""
    
    def __init__(self, openai_client):
        self.openai_client = openai_client
    
    async def run_full_analysis(self, ticker: str) -> Dict[str, Any]:
        """Run enhanced comprehensive analysis workflow with detailed schemas."""
        
        print(f"🔍 Starting ENHANCED analysis for {ticker}...")
        
        # Create completely fresh agents with enhanced schemas for this specific ticker analysis
        knowledge_agent = create_knowledge_agent(self.openai_client, ticker)
        financial_agent = create_financial_agent(self.openai_client, ticker)
        ratio_agent = create_ratio_agent(self.openai_client, ticker)
        business_agent = create_business_agent(self.openai_client, ticker)
        risk_agent = create_risk_agent(self.openai_client, ticker)
        valuation_agent = create_valuation_agent(self.openai_client, ticker)
        management_agent = create_management_agent(self.openai_client, ticker)
        industry_agent = create_industry_agent(self.openai_client, ticker)
        decision_agent = create_decision_agent(self.openai_client, ticker)
        company_info_agent = create_company_info_agent(self.openai_client, ticker)
        ceo_photo_agent = create_ceo_photo_agent(self.openai_client, ticker)
        
        # Step 1: Check existing knowledge
        print(f"🔍 Checking knowledge for {ticker}...")
        knowledge_check = knowledge_agent.run({"ticker": ticker})
        
        # Step 2: Gather enhanced financial data
        print(f"📊 Conducting comprehensive financial analysis for {ticker}...")
        financial_data = financial_agent.run({"ticker": ticker})
        
        # Step 3: Calculate enhanced ratios (depends on financial data)
        print(f"🧮 Computing detailed financial ratios and industry comparisons...")
        key_ratios = ratio_agent.run(financial_data.dict())
        
        # Step 4: Get company images (can run in parallel with other tasks)
        print(f"🖼️ Retrieving company visual assets for {ticker}...")
        company_images = None
        try:
            # Get company information first
            company_info_task = asyncio.create_task(
                asyncio.to_thread(company_info_agent.run, {"ticker": ticker})
            )
            
            # Get CEO photo info
            ceo_photo_task = asyncio.create_task(
                asyncio.to_thread(ceo_photo_agent.run, {"ticker": ticker})
            )
            
            # Wait for both tasks
            company_info, ceo_photo_info = await asyncio.gather(
                company_info_task,
                ceo_photo_task,
                return_exceptions=True
            )
            
            # Handle results
            if not isinstance(company_info, Exception):
                if not isinstance(ceo_photo_info, Exception):
                    # Try to get logo from LogoDev service
                    try:
                        logo_service = LogoDevService()
                        # Use search_company_domain method instead of search_logo
                        domain = await logo_service.search_company_domain(company_info.company_name)
                        if domain:
                            logo_url = logo_service.get_logo_url(domain)
                            company_images = {
                                "logo_url": logo_url,
                                "ceo_photo_url": ceo_photo_info.ceo_photo_url or generate_ceo_avatar(
                                    getattr(ceo_photo_info, 'ceo_name', 'CEO')
                                )
                            }
                        else:
                            # Fallback - try ticker-based logo
                            company_images = {
                                "logo_url": logo_service.get_ticker_logo_url(ticker),
                                "ceo_photo_url": ceo_photo_info.ceo_photo_url or generate_ceo_avatar(
                                    getattr(ceo_photo_info, 'ceo_name', 'CEO')
                                )
                            }
                    except Exception as e:
                        print(f"⚠️ Logo service failed: {e}")
                        # Fallback to generated avatar
                        company_images = {
                            "logo_url": None,
                            "ceo_photo_url": generate_ceo_avatar(
                                getattr(ceo_photo_info, 'ceo_name', 'CEO') if not isinstance(ceo_photo_info, Exception) else 'CEO'
                            )
                        }
        except Exception as e:
            print(f"⚠️ Image retrieval failed: {e}")
            company_images = None
        
        # Steps 5-9: Run comprehensive analysis in parallel where possible
        print(f"🏢 Conducting detailed business and competitive analysis...")
        business_analysis_task = asyncio.create_task(
            asyncio.to_thread(business_agent.run, {"ticker": ticker})
        )
        
        print(f"⚠️ Performing comprehensive risk assessment...")
        risk_analysis_task = asyncio.create_task(
            asyncio.to_thread(risk_agent.run, {"ticker": ticker})
        )
        
        print(f"👔 Analyzing management quality and governance...")
        management_analysis_task = asyncio.create_task(
            asyncio.to_thread(management_agent.run, {"ticker": ticker})
        )
        
        print(f"🏭 Evaluating industry dynamics and positioning...")
        industry_analysis_task = asyncio.create_task(
            asyncio.to_thread(industry_agent.run, {"ticker": ticker})
        )
        
        # Wait for parallel analyses to complete
        business_analysis, risk_assessment, management_analysis, industry_analysis = await asyncio.gather(
            business_analysis_task,
            risk_analysis_task,
            management_analysis_task,
            industry_analysis_task,
            return_exceptions=True
        )
        
        # Handle any exceptions in parallel tasks
        if isinstance(business_analysis, Exception):
            print(f"❌ Business analysis failed: {business_analysis}")
            business_analysis = None
        if isinstance(risk_assessment, Exception):
            print(f"❌ Risk assessment failed: {risk_assessment}")
            risk_assessment = None
        if isinstance(management_analysis, Exception):
            print(f"❌ Management analysis failed: {management_analysis}")
            management_analysis = None
        if isinstance(industry_analysis, Exception):
            print(f"❌ Industry analysis failed: {industry_analysis}")
            industry_analysis = None
        
        # Step 10: Enhanced Valuation Analysis (depends on financial data)
        print(f"💰 Conducting multi-methodology valuation analysis...")
        valuation_metrics = valuation_agent.run(financial_data.dict())
        
        # Step 11: Final Enhanced Investment Decision
        print(f"⚖️ Synthesizing comprehensive investment recommendation...")
        
        # Prepare all analysis data for final decision
        comprehensive_input = {
            "ticker": ticker,
            "knowledge_check": knowledge_check.dict() if knowledge_check else None,
            "financial_data": financial_data.dict() if financial_data else None,
            "key_ratios": key_ratios.dict() if key_ratios else None,
            "business_analysis": business_analysis.dict() if business_analysis else None,
            "risk_assessment": risk_assessment.dict() if risk_assessment else None,
            "valuation_metrics": valuation_metrics.dict() if valuation_metrics else None,
            "management_analysis": management_analysis.dict() if management_analysis else None,
            "industry_analysis": industry_analysis.dict() if industry_analysis else None,
            "company_images": company_images
        }
        
        # Final decision based on all analysis
        final_recommendation = decision_agent.run(comprehensive_input)
        
        print(f"✅ Enhanced analysis complete for {ticker}!")
        
        # Return comprehensive analysis results
        return {
            "ticker": ticker,
            "timestamp": datetime.now().isoformat(),
            "analysis_type": "ENHANCED_COMPREHENSIVE",
            "knowledge_check": knowledge_check.dict() if knowledge_check else None,
            "company_info": company_info.dict() if not isinstance(company_info, Exception) else None,
            "financial_data": financial_data.dict() if financial_data else None,
            "key_ratios": key_ratios.dict() if key_ratios else None,
            "business_analysis": business_analysis.dict() if business_analysis else None,
            "risk_assessment": risk_assessment.dict() if risk_assessment else None,
            "valuation_metrics": valuation_metrics.dict() if valuation_metrics else None,
            "management_analysis": management_analysis.dict() if management_analysis else None,
            "industry_analysis": industry_analysis.dict() if industry_analysis else None,
            "final_recommendation": final_recommendation.dict() if final_recommendation else None,
            "company_images": company_images,
            "analysis_summary": {
                "overall_score": final_recommendation.overall_score if final_recommendation else 5.0,
                "recommendation": final_recommendation.recommendation if final_recommendation else "HOLD",
                "confidence": final_recommendation.confidence if final_recommendation else 0.5,
                "target_price": final_recommendation.target_price if final_recommendation else None,
                "key_strengths": final_recommendation.key_reasons[:3] if final_recommendation and final_recommendation.key_reasons else [],
                "key_risks": final_recommendation.risks[:3] if final_recommendation and final_recommendation.risks else [],
                "investment_thesis": final_recommendation.investment_thesis if final_recommendation else "Analysis incomplete"
            }
        }