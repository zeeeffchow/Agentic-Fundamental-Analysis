# agents/orchestrator.py - FIXED VERSION with Memory Isolation

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from atomic_agents.agents.base_agent import BaseIOSchema, BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from pydantic import Field

# ===== ALL SCHEMAS =====

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

class CompanyKnowledgeCheckOutput(BaseIOSchema):
    """Output schema for company knowledge check."""
    ticker: str = Field(..., description="Stock ticker symbol")
    is_known: bool = Field(..., description="Whether the company is already known")
    last_analysis_date: Optional[str] = Field(None, description="Date of last analysis if known")
    needs_full_analysis: bool = Field(..., description="Whether full analysis is needed")

# ===== AGENT FACTORY FUNCTIONS (Creates Fresh Agents Each Time) =====

def create_knowledge_agent(client, ticker: str):
    """Create a fresh knowledge agent for specific ticker analysis."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker} specifically.",
            "You are a company knowledge checker for financial analysis.",
            "Your job is to determine if we have recent analysis data for this specific company.",
            "If analysis is older than 30 days or doesn't exist, full analysis is needed."
        ],
        steps=[
            f"Check if the company ticker {ticker} is recognized",
            f"Determine if we have recent analysis for {ticker} (within 30 days)",
            f"Decide if full analysis or update is needed for {ticker}"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            "Set is_known to true only if we have comprehensive recent data",
            "Set needs_full_analysis to true if analysis is missing or outdated",
            "Include last analysis date if available"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory for each agent
            input_schema=CompanyInput,
            output_schema=CompanyKnowledgeCheckOutput
        )
    )

def create_financial_agent(client, ticker: str):
    """Create a fresh financial data agent for specific ticker analysis."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker} specifically.",
            "You are a financial data analyst specializing in extracting and processing company financial statements.",
            f"You are analyzing {ticker} company financial data only.",
            "Your goal is to extract key financial metrics accurately for this specific company."
        ],
        steps=[
            f"Extract revenue, net income, and key balance sheet items for {ticker}",
            f"Calculate important financial metrics for {ticker}",
            "Ensure data consistency and accuracy",
            "Format all numbers in millions for consistency"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Analyze {ticker} specifically, not any other company",
            "Provide all financial figures in millions (USD)",
            "Ensure calculations are accurate"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=CompanyInput,
            output_schema=FinancialData
        )
    )

def create_ratio_agent(client, ticker: str):
    """Create a fresh ratio calculation agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are calculating ratios for {ticker} specifically.",
            "You are a financial ratio calculation specialist.",
            "You calculate key financial ratios used in fundamental analysis.",
            "Your ratios help investors understand company performance and health."
        ],
        steps=[
            f"Calculate Return on Equity (ROE) for {ticker}",
            f"Calculate Net Margin for {ticker}",
            f"Calculate Debt-to-Equity for {ticker}",
            "Calculate Current Ratio and other liquidity metrics",
            "Calculate growth rates using historical data"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            "Express percentages as decimals (e.g., 15% as 15.0, not 0.15)",
            "Ensure all ratios are calculated accurately",
            "Provide meaningful context for the ratios"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=FinancialData,
            output_schema=KeyRatios
        )
    )

def create_business_agent(client, ticker: str):
    """Create a fresh business research agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker} business specifically.",
            "You are a business analyst specializing in company research and competitive analysis.",
            f"You understand {ticker}'s business model, market positioning, and competitive dynamics.",
            f"Your analysis helps investors understand what {ticker} does and how it competes."
        ],
        steps=[
            f"Research {ticker}'s main products and services",
            f"Identify {ticker}'s key competitive advantages and moats",
            f"Analyze {ticker}'s competitive landscape and main rivals",
            f"Assess {ticker}'s market position and growth opportunities",
            f"Identify {ticker}'s key growth drivers and strategic initiatives"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Analyze {ticker} specifically, not Apple, Google, or any other company",
            "Be specific about products/services, not generic",
            "Focus on sustainable competitive advantages"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=CompanyInput,
            output_schema=BusinessAnalysis
        )
    )

def create_risk_agent(client, ticker: str):
    """Create a fresh risk assessment agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are assessing risks for {ticker} specifically.",
            "You are a risk assessment specialist for investment analysis.",
            f"You evaluate {ticker}'s concentration risk, competitive threats, disruption potential, and regulatory risks.",
            f"Your risk scores help investors understand {ticker}'s potential downsides."
        ],
        steps=[
            f"Assess {ticker}'s concentration risk: customer, geographic, product concentration",
            f"Evaluate {ticker}'s competition risk: market share threats, new entrants",
            f"Analyze {ticker}'s disruption risk: technology changes, business model threats",
            f"Consider {ticker}'s regulatory risk: government policy, compliance issues",
            "Calculate overall risk score as weighted average"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Analyze {ticker} specifically, not Apple or any other company",
            "Use 1-10 scale where 1 = very low risk, 10 = very high risk",
            "Be objective and evidence-based in risk assessment"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=CompanyInput,
            output_schema=RiskAssessment
        )
    )

def create_valuation_agent(client, ticker: str):
    """Create a fresh valuation agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are valuing {ticker} specifically.",
            "You are a valuation specialist who determines if stocks are fairly priced.",
            f"You calculate {ticker}'s key valuation ratios and estimate intrinsic value.",
            f"You compare {ticker}'s current prices to fair value estimates."
        ],
        steps=[
            f"Get {ticker}'s current stock price and market data",
            f"Calculate {ticker}'s P/E ratio = Price / Earnings per Share",
            f"Calculate {ticker}'s P/FCF ratio = Market Cap / Free Cash Flow",
            f"Calculate {ticker}'s P/B ratio = Price / Book Value per Share",
            f"Estimate {ticker}'s fair value using multiple valuation methods",
            f"Calculate {ticker}'s upside/downside vs current price"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Value {ticker} specifically, not any other company",
            "Provide realistic fair value estimates",
            "Show upside as positive %, downside as negative %"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=FinancialData,
            output_schema=ValuationMetrics
        )
    )

def create_management_agent(client, ticker: str):
    """Create a fresh management analysis agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker}'s management specifically.",
            "You are a management analysis specialist who evaluates leadership teams.",
            f"You assess {ticker}'s CEO background, management track record, and corporate governance.",
            f"Strong management is crucial for {ticker}'s long-term investment success."
        ],
        steps=[
            f"Research {ticker}'s CEO background, experience, and tenure",
            f"Evaluate {ticker}'s management track record of execution",
            f"Assess {ticker}'s corporate governance practices",
            f"Consider {ticker}'s management compensation and alignment with shareholders",
            f"Evaluate {ticker}'s communication quality and transparency"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Analyze {ticker}'s management specifically, not Tim Cook or Apple",
            "Use 1-10 scale for management quality and governance scores",
            "Focus on factual track record, not speculation"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=CompanyInput,
            output_schema=ManagementAnalysis
        )
    )

def create_industry_agent(client, ticker: str):
    """Create a fresh industry analysis agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are analyzing {ticker}'s industry specifically.",
            "You are an industry analysis expert who evaluates sector trends and outlook.",
            f"You understand how {ticker}'s industry dynamics affect its prospects.",
            f"Growing industries provide tailwinds for {ticker}; declining industries create headwinds."
        ],
        steps=[
            f"Identify {ticker}'s specific industry and subsector",
            f"Analyze {ticker}'s industry growth rates and trends",
            f"Evaluate {ticker}'s market size and growth potential",
            f"Assess {ticker}'s regulatory environment and policy impacts",
            f"Determine if {ticker}'s industry is growing, stable, or declining"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Analyze {ticker}'s industry specifically",
            "Classify outlook as 'Growing', 'Stable', or 'Declining'",
            "Provide specific growth rate estimates"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o-mini",
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=CompanyInput,
            output_schema=IndustryAnalysis
        )
    )

def create_decision_agent(client, ticker: str):
    """Create a fresh decision agent."""
    system_prompt_generator = SystemPromptGenerator(
        background=[
            f"You are making investment decision for {ticker} specifically.",
            "You are the chief investment analyst who makes final investment recommendations.",
            f"You synthesize all {ticker} analysis components into a coherent investment thesis.",
            f"Your recommendations guide investment decisions for {ticker} with clear reasoning."
        ],
        steps=[
            f"Weigh {ticker}'s financial health, business quality, and valuation",
            f"Consider {ticker}'s risk factors and management quality",
            f"Evaluate {ticker}'s industry trends and competitive position",
            f"Determine if {ticker} stock is attractively priced vs intrinsic value",
            f"Make BUY/SELL/HOLD recommendation for {ticker} with confidence level",
            f"Provide clear reasoning and key risks for {ticker}"
        ],
        output_instructions=[
            f"CRITICAL: All output must have ticker field set to '{ticker}'",
            f"Recommend on {ticker} specifically, not Chipotle, Tesla, or any other company",
            "Use BUY for undervalued, high-quality companies",
            "Use SELL for overvalued or deteriorating companies",
            "Use HOLD for fairly valued or uncertain situations"
        ]
    )
    
    return BaseAgent(
        config=BaseAgentConfig(
            client=client,
            model="gpt-4o",  # Use more powerful model for final decision
            system_prompt_generator=system_prompt_generator,
            memory=AgentMemory(),  # Fresh memory
            input_schema=None,  # Will accept dict with multiple analysis results
            output_schema=FinalRecommendation
        )
    )

# ===== ORCHESTRATOR CLASS =====

class AnalysisOrchestrator:
    """Orchestrates the complete financial analysis workflow with memory isolation."""
    
    def __init__(self, openai_client):
        self.openai_client = openai_client
        # Don't initialize agents here - create fresh ones for each analysis
    
    async def run_full_analysis(self, ticker: str) -> Dict[str, Any]:
        """Run complete analysis workflow with fresh agents to prevent memory contamination."""
        
        print(f"🔍 Starting FRESH analysis for {ticker}...")
        
        # Create completely fresh agents for this specific ticker analysis
        knowledge_agent = create_knowledge_agent(self.openai_client, ticker)
        financial_agent = create_financial_agent(self.openai_client, ticker)
        ratio_agent = create_ratio_agent(self.openai_client, ticker)
        business_agent = create_business_agent(self.openai_client, ticker)
        risk_agent = create_risk_agent(self.openai_client, ticker)
        valuation_agent = create_valuation_agent(self.openai_client, ticker)
        management_agent = create_management_agent(self.openai_client, ticker)
        industry_agent = create_industry_agent(self.openai_client, ticker)
        decision_agent = create_decision_agent(self.openai_client, ticker)
        
        # Step 1: Check existing knowledge
        print(f"🔍 Checking knowledge for {ticker}...")
        knowledge_check = knowledge_agent.run({"ticker": ticker})
        
        # Step 2: Gather financial data
        print(f"📊 Gathering financial data for {ticker}...")
        financial_data = financial_agent.run({"ticker": ticker})
        
        # Step 3: Calculate ratios (depends on financial data)
        print(f"🧮 Calculating financial ratios...")
        key_ratios = ratio_agent.run(financial_data.dict())
        
        # Step 4: Run parallel analysis (can run simultaneously)
        print(f"🔬 Running parallel analysis...")
        business_task = asyncio.create_task(
            asyncio.to_thread(business_agent.run, {"ticker": ticker})
        )
        risk_task = asyncio.create_task(
            asyncio.to_thread(risk_agent.run, {"ticker": ticker})
        )
        management_task = asyncio.create_task(
            asyncio.to_thread(management_agent.run, {"ticker": ticker})
        )
        industry_task = asyncio.create_task(
            asyncio.to_thread(industry_agent.run, {"ticker": ticker})
        )
        
        # Wait for parallel tasks to complete
        business_analysis, risk_assessment, management_analysis, industry_analysis = await asyncio.gather(
            business_task, risk_task, management_task, industry_task
        )
        
        # Step 5: Valuation analysis (depends on financial data)
        print(f"💰 Calculating valuation metrics...")
        valuation_metrics = valuation_agent.run(financial_data.dict())
        
        # Step 6: Final decision synthesis
        print(f"🎯 Generating final recommendation...")
        analysis_data = {
            "ticker": ticker,
            "knowledge_check": knowledge_check.dict(),
            "financial_data": financial_data.dict(),
            "key_ratios": key_ratios.dict(),
            "business_analysis": business_analysis.dict(),
            "risk_assessment": risk_assessment.dict(),
            "valuation_metrics": valuation_metrics.dict(),
            "management_analysis": management_analysis.dict(),
            "industry_analysis": industry_analysis.dict()
        }
        
        final_recommendation = decision_agent.run(analysis_data)
        
        # Return complete analysis results
        return {
            "ticker": ticker,
            "analysis_complete": True,
            "knowledge_check": knowledge_check.dict(),
            "financial_data": financial_data.dict(),
            "key_ratios": key_ratios.dict(),
            "business_analysis": business_analysis.dict(),
            "risk_assessment": risk_assessment.dict(),
            "valuation_metrics": valuation_metrics.dict(),
            "management_analysis": management_analysis.dict(),
            "industry_analysis": industry_analysis.dict(),
            "final_recommendation": final_recommendation.dict(),
            "analysis_timestamp": datetime.now().isoformat()
        }