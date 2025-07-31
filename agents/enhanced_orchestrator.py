import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime
from atomic_agents.agents.base_agent import BaseIOSchema, BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from pydantic import Field
import os
import sys

# Add the backend path to access financial data service
project_root = os.path.dirname(os.path.dirname(__file__))
backend_path = os.path.join(project_root, 'backend')
sys.path.append(backend_path)

try:
    from .financial_data_service import FinancialDataService
except ImportError:
    # Fallback if import fails
    FinancialDataService = None

from atomic_agents.agents.base_agent import BaseIOSchema, BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory

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


# ===== ALL AGENT CLASSES =====

class CompanyKnowledgeAgent:
    """Agent to check if we have existing knowledge about a company."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a company knowledge checker for financial analysis.",
                "Your job is to determine if we have recent analysis data for a company.",
                "If analysis is older than 30 days or doesn't exist, full analysis is needed."
            ],
            steps=[
                "Check if the company ticker is recognized",
                "Determine if we have recent analysis (within 30 days)",
                "Decide if full analysis or update is needed"
            ],
            output_instructions=[
                "Set is_known to true only if we have comprehensive recent data",
                "Set needs_full_analysis to true if analysis is missing or outdated",
                "Include last analysis date if available"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=CompanyInput,
                output_schema=CompanyKnowledgeCheckOutput
            )
        )
    
    def run(self, ticker: str) -> CompanyKnowledgeCheckOutput:
        self.agent.config.memory = AgentMemory()
        return self.agent.run({"ticker": ticker})

class FinancialDataAgent:
    """Agent to collect and process financial statements."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a financial data analyst specializing in extracting and processing company financial statements.",
                "You work with income statements, balance sheets, and cash flow statements.",
                "Your goal is to extract key financial metrics accurately."
            ],
            steps=[
                "Extract revenue, net income, and key balance sheet items",
                "Calculate important financial metrics",
                "Ensure data consistency and accuracy",
                "Format all numbers in millions for consistency"
            ],
            output_instructions=[
                "Provide all financial figures in millions (USD)",
                "Ensure calculations are accurate",
                "Use the most recent annual data available"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=CompanyInput,
                output_schema=FinancialData
            )
        )
    
    def run(self, ticker: str) -> FinancialData:
        self.agent.config.memory = AgentMemory()
        return self.agent.run({"ticker": ticker})

class RatioCalculationAgent:
    """Agent to calculate key financial ratios."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a financial ratio calculation specialist.",
                "You calculate key financial ratios used in fundamental analysis.",
                "Your ratios help investors understand company performance and health."
            ],
            steps=[
                "Calculate Return on Equity (ROE) = Net Income / Shareholders Equity",
                "Calculate Net Margin = Net Income / Revenue * 100",
                "Calculate Debt-to-Equity = Total Debt / Total Equity",
                "Calculate Current Ratio and other liquidity metrics",
                "Calculate growth rates using historical data"
            ],
            output_instructions=[
                "Express percentages as decimals (e.g., 15% as 15.0, not 0.15)",
                "Ensure all ratios are calculated accurately",
                "Provide meaningful context for the ratios"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=FinancialData,
                output_schema=KeyRatios
            )
        )
    
    def run(self, financial_data: FinancialData) -> KeyRatios:
        return self.agent.run(financial_data.dict())

class BusinessResearchAgent:
    """Agent to research company business model and competitive position."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a business analyst specializing in company research and competitive analysis.",
                "You understand business models, market positioning, and competitive dynamics.",
                "Your analysis helps investors understand what the company does and how it competes."
            ],
            steps=[
                "Research the company's main products and services",
                "Identify key competitive advantages and moats",
                "Analyze the competitive landscape and main rivals",
                "Assess market position and growth opportunities",
                "Identify key growth drivers and strategic initiatives"
            ],
            output_instructions=[
                "Be specific about products/services, not generic",
                "Focus on sustainable competitive advantages",
                "Include both established and emerging competitors",
                "Provide actionable insights about growth potential"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=CompanyInput,
                output_schema=BusinessAnalysis
            )
        )
    
    def run(self, ticker: str) -> BusinessAnalysis:
        self.agent.config.memory = AgentMemory()
        return self.agent.run({"ticker": ticker})

class RiskAssessmentAgent:
    """Agent to assess various business and investment risks."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a risk assessment specialist for investment analysis.",
                "You evaluate concentration risk, competitive threats, disruption potential, and regulatory risks.",
                "Your risk scores help investors understand potential downsides."
            ],
            steps=[
                "Assess concentration risk: customer, geographic, product concentration",
                "Evaluate competition risk: market share threats, new entrants",
                "Analyze disruption risk: technology changes, business model threats",
                "Consider regulatory risk: government policy, compliance issues",
                "Calculate overall risk score as weighted average"
            ],
            output_instructions=[
                "Use 1-10 scale where 1 = very low risk, 10 = very high risk",
                "Be objective and evidence-based in risk assessment",
                "Provide clear reasoning for risk scores",
                "Consider both current and emerging risks"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=CompanyInput,
                output_schema=RiskAssessment
            )
        )
    
    def run(self, ticker: str) -> RiskAssessment:
        self.agent.config.memory = AgentMemory()
        return self.agent.run({"ticker": ticker})

class ValuationAgent:
    """Agent to calculate valuation metrics and fair value estimates."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a valuation specialist who determines if stocks are fairly priced.",
                "You calculate key valuation ratios and estimate intrinsic value.",
                "You compare current prices to fair value estimates."
            ],
            steps=[
                "Get current stock price and market data",
                "Calculate P/E ratio = Price / Earnings per Share",
                "Calculate P/FCF ratio = Market Cap / Free Cash Flow",
                "Calculate P/B ratio = Price / Book Value per Share",
                "Estimate fair value using multiple valuation methods",
                "Calculate upside/downside vs current price"
            ],
            output_instructions=[
                "Provide realistic fair value estimates",
                "Show upside as positive %, downside as negative %",
                "Use conservative assumptions in valuations",
                "Consider industry-appropriate valuation multiples"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=FinancialData,
                output_schema=ValuationMetrics
            )
        )
    
    def run(self, financial_data: FinancialData) -> ValuationMetrics:
        return self.agent.run(financial_data.dict())

class ManagementAnalysisAgent:
    """Agent to analyze management team quality and corporate governance."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a management analysis specialist who evaluates leadership teams.",
                "You assess CEO background, management track record, and corporate governance.",
                "Strong management is crucial for long-term investment success."
            ],
            steps=[
                "Research CEO background, experience, and tenure",
                "Evaluate management's track record of execution",
                "Assess corporate governance practices",
                "Consider management compensation and alignment with shareholders",
                "Evaluate communication quality and transparency"
            ],
            output_instructions=[
                "Use 1-10 scale for management quality and governance scores",
                "Focus on factual track record, not speculation",
                "Consider both positive and negative aspects",
                "Evaluate alignment with shareholder interests"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=CompanyInput,
                output_schema=ManagementAnalysis
            )
        )
    
    def run(self, ticker: str) -> ManagementAnalysis:
        self.agent.config.memory = AgentMemory()
        return self.agent.run({"ticker": ticker})

class IndustryAnalysisAgent:
    """Agent to analyze industry trends and outlook."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are an industry analysis expert who evaluates sector trends and outlook.",
                "You understand how industry dynamics affect individual company prospects.",
                "Growing industries provide tailwinds; declining industries create headwinds."
            ],
            steps=[
                "Identify the specific industry and subsector",
                "Analyze industry growth rates and trends",
                "Evaluate market size and growth potential",
                "Assess regulatory environment and policy impacts",
                "Determine if industry is growing, stable, or declining"
            ],
            output_instructions=[
                "Classify outlook as 'Growing', 'Stable', or 'Declining'",
                "Provide specific growth rate estimates",
                "Focus on trends that will impact the next 3-5 years",
                "Consider both cyclical and structural factors"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=CompanyInput,
                output_schema=IndustryAnalysis
            )
        )
    
    def run(self, ticker: str) -> IndustryAnalysis:
        self.agent.config.memory = AgentMemory()
        return self.agent.run({"ticker": ticker})

class DecisionAgent:
    """Final decision agent that synthesizes all analysis into investment recommendation."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are the chief investment analyst who makes final investment recommendations.",
                "You synthesize all analysis components into a coherent investment thesis.",
                "Your recommendations guide investment decisions with clear reasoning."
            ],
            steps=[
                "Weigh financial health, business quality, and valuation",
                "Consider risk factors and management quality",
                "Evaluate industry trends and competitive position",
                "Determine if stock is attractively priced vs intrinsic value",
                "Make BUY/SELL/HOLD recommendation with confidence level",
                "Provide clear reasoning and key risks"
            ],
            output_instructions=[
                "Use BUY for undervalued, high-quality companies",
                "Use SELL for overvalued or deteriorating companies", 
                "Use HOLD for fairly valued or uncertain situations",
                "Confidence should reflect conviction level (0.0-1.0)",
                "Provide actionable insights and clear reasoning"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o",  # Use more powerful model for final decision
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=None,  # Will accept dict with multiple analysis results
                output_schema=FinalRecommendation
            )
        )
    
    def run(self, analysis_data: Dict[str, Any]) -> FinalRecommendation:
        return self.agent.run(analysis_data)
    
class EnhancedFinancialDataAgent:
    """Enhanced agent that uses real financial data."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a financial data analyst who processes real company financial data.",
                "You receive actual financial metrics and format them for analysis.",
                "Your job is to ensure data consistency and provide context."
            ],
            steps=[
                "Review the provided real financial data",
                "Ensure all figures are properly formatted in millions",
                "Validate the data makes logical sense",
                "Return the formatted financial data"
            ],
            output_instructions=[
                "Use the exact ticker provided",
                "Ensure all financial figures are in millions (USD)",
                "Maintain data accuracy and consistency"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=None,  # Will accept the real data
                output_schema=FinancialData
            )
        )
    
    def run(self, ticker: str) -> FinancialData:
        self.agent.config.memory = AgentMemory()
        # Get real financial data
        if FinancialDataService:
            real_data = FinancialDataService.get_financial_data(ticker)
            
            # Have the AI agent process and validate the real data
            prompt = f"""
            Process this real financial data for {ticker}:
            {real_data}
            
            Format it according to the output schema, ensuring:
            - Ticker is exactly "{ticker}"
            - All numbers are in millions
            - Data is consistent and logical
            """
            
            result = self.agent.run(prompt)
            
            # Ensure ticker is correct
            result.ticker = ticker.upper()
            return result
        else:
            # Fallback to placeholder if service unavailable
            return FinancialData(
                ticker=ticker.upper(),
                revenue=10000.0,
                net_income=1000.0,
                total_equity=5000.0,
                total_debt=2000.0,
                free_cash_flow=800.0,
                shares_outstanding=100.0
            )

class EnhancedBusinessResearchAgent:
    """Enhanced agent that uses real company information."""
    
    def __init__(self, client):
        system_prompt_generator = SystemPromptGenerator(
            background=[
                "You are a business analyst who researches real companies using available information.",
                "You analyze actual company data to understand business models and competitive position.",
                "You provide specific, factual analysis based on real company information."
            ],
            steps=[
                "Analyze the provided company information and sector data",
                "Research the company's actual products and services",
                "Identify real competitive advantages and market position",
                "Assess actual competitors in the industry",
                "Provide specific growth drivers based on company reality"
            ],
            output_instructions=[
                "Use specific, factual information about the company",
                "Base analysis on real industry and sector data",
                "Provide actionable insights about actual competitive position",
                "Ensure ticker field matches the requested company"
            ]
        )
        
        self.agent = BaseAgent(
            config=BaseAgentConfig(
                client=client,
                model="gpt-4o-mini",
                system_prompt_generator=system_prompt_generator,
                memory=AgentMemory(),
                input_schema=None,
                output_schema=BusinessAnalysis
            )
        )
    
    def run(self, ticker: str) -> BusinessAnalysis:
        self.agent.config.memory = AgentMemory()
        # Get real company data
        if FinancialDataService:
            company_info = FinancialDataService.get_company_info(ticker)
            
            prompt = f"""
            Analyze this real company: {ticker}
            
            Company Information:
            {company_info}
            
            Provide a comprehensive business analysis including:
            - Specific products/services this company actually offers
            - Real competitive advantages in their industry
            - Actual key competitors
            - Market position based on their sector and industry
            - Realistic growth drivers for this specific company
            
            Ensure the ticker field is exactly "{ticker}".
            """
            
            result = self.agent.run(prompt)
            result.ticker = ticker.upper()
            return result
        else:
            # Fallback
            return BusinessAnalysis(
                ticker=ticker.upper(),
                products_services=[f"{ticker} Products", f"{ticker} Services"],
                competitive_advantages=[f"{ticker} advantage 1", f"{ticker} advantage 2"],
                key_competitors=["Competitor 1", "Competitor 2"],
                market_position=f"{ticker} market position",
                growth_drivers=[f"{ticker} growth driver 1", f"{ticker} growth driver 2"]
            )
        
# ===== ORCHESTRATOR CLASS =====

class AnalysisOrchestrator:
    """Orchestrates the complete financial analysis workflow."""
    
    def __init__(self, openai_client):
        # Initialize all agents
        self.knowledge_agent = CompanyKnowledgeAgent(openai_client)
        self.financial_agent = FinancialDataAgent(openai_client)
        self.ratio_agent = RatioCalculationAgent(openai_client)
        self.business_agent = BusinessResearchAgent(openai_client)
        self.risk_agent = RiskAssessmentAgent(openai_client)
        self.valuation_agent = ValuationAgent(openai_client)
        self.management_agent = ManagementAnalysisAgent(openai_client)
        self.industry_agent = IndustryAnalysisAgent(openai_client)
        self.decision_agent = DecisionAgent(openai_client)
    
    async def run_full_analysis(self, ticker: str) -> Dict[str, Any]:
        """Run complete analysis workflow for a company."""
        
        # Step 1: Check existing knowledge
        print(f"🔍 Checking knowledge for {ticker}...")
        knowledge_check = self.knowledge_agent.run(ticker)
        knowledge_check.ticker = ticker

        
        # Step 2: Gather financial data
        print(f"📊 Gathering financial data for {ticker}...")
        financial_data = self.financial_agent.run(ticker)
        financial_data.ticker = ticker

        
        # Step 3: Calculate ratios (depends on financial data)
        print(f"🧮 Calculating financial ratios...")
        key_ratios = self.ratio_agent.run(financial_data)
        key_ratios.ticker = ticker

        
        # Step 4: Run parallel analysis (can run simultaneously)
        print(f"🔬 Running parallel analysis...")
        business_task = asyncio.create_task(
            asyncio.to_thread(self.business_agent.run, ticker)
        )
        risk_task = asyncio.create_task(
            asyncio.to_thread(self.risk_agent.run, ticker)
        )
        management_task = asyncio.create_task(
            asyncio.to_thread(self.management_agent.run, ticker)
        )
        industry_task = asyncio.create_task(
            asyncio.to_thread(self.industry_agent.run, ticker)
        )
        
        # Wait for parallel tasks to complete
        business_analysis, risk_assessment, management_analysis, industry_analysis = await asyncio.gather(
            business_task, risk_task, management_task, industry_task
        )

        business_analysis.ticker = ticker
        risk_assessment.ticker = ticker
        management_analysis.ticker = ticker
        industry_analysis.ticker = ticker
        
        # Step 5: Valuation analysis (depends on financial data)
        print(f"💰 Calculating valuation metrics...")
        valuation_metrics = self.valuation_agent.run(financial_data)
        valuation_metrics.ticker = ticker
        
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
        
        final_recommendation = self.decision_agent.run(analysis_data)
        final_recommendation.ticker = ticker
        
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
    

class EnhancedAnalysisOrchestrator:
    """Enhanced orchestrator that uses real financial data."""
    
    def __init__(self, openai_client):
        # Initialize enhanced agents that use real data
        # self.financial_agent = EnhancedFinancialDataAgent(openai_client)
        # self.business_agent = EnhancedBusinessResearchAgent(openai_client)
        self.openai_client = openai_client

        
    def _create_fresh_agents(self):
        """Create fresh agents with no memory contamination."""
        # Import your agent classes
        from .orchestrator import (
            CompanyKnowledgeAgent, RatioCalculationAgent, RiskAssessmentAgent,
            ValuationAgent, ManagementAnalysisAgent, IndustryAnalysisAgent, DecisionAgent
        )
    
        # Create fresh agents with new memory
        return {
            'knowledge': CompanyKnowledgeAgent(self.openai_client),
            'financial': EnhancedFinancialDataAgent(self.openai_client),
            'ratio': RatioCalculationAgent(self.openai_client),
            'business': EnhancedBusinessResearchAgent(self.openai_client),
            'risk': RiskAssessmentAgent(self.openai_client),
            'valuation': ValuationAgent(self.openai_client),
            'management': ManagementAnalysisAgent(self.openai_client),
            'industry': IndustryAnalysisAgent(self.openai_client),
            'decision': DecisionAgent(self.openai_client)
        }
    
    async def run_full_analysis(self, ticker: str) -> Dict[str, Any]:
        """Run complete analysis workflow with fresh agents."""
        
        print(f"🔍 Starting FRESH analysis for {ticker}...")
        
        # Create completely fresh agents for this analysis
        agents = self._create_fresh_agents()
        
        # Continue with your analysis using agents['knowledge'], agents['financial'], etc.
        knowledge_check = agents['knowledge'].run(ticker)
        
        # Step 2: Check existing knowledge
        # knowledge_check = self.knowledge_agent.run(ticker)
        knowledge_check.ticker = ticker.upper()
        
        # Step 3: Get real financial data
        print(f"📊 Gathering REAL financial data for {ticker}...")
        financial_data = self.financial_agent.run(ticker)
        
        # Step 4: Calculate ratios based on real data
        print(f"🧮 Calculating financial ratios...")
        key_ratios = self.ratio_agent.run(financial_data)
        key_ratios.ticker = ticker.upper()
        
        # Step 5: Enhanced business analysis with real data
        print(f"🏢 Analyzing REAL business data for {ticker}...")
        business_analysis = self.business_agent.run(ticker)
        
        # Step 6: Run other analysis in parallel
        print(f"🔬 Running parallel analysis...")
        risk_task = asyncio.create_task(
            asyncio.to_thread(self.risk_agent.run, ticker)
        )
        management_task = asyncio.create_task(
            asyncio.to_thread(self.management_agent.run, ticker)
        )
        industry_task = asyncio.create_task(
            asyncio.to_thread(self.industry_agent.run, ticker)
        )
        
        risk_assessment, management_analysis, industry_analysis = await asyncio.gather(
            risk_task, management_task, industry_task
        )
        
        # Fix tickers
        risk_assessment.ticker = ticker.upper()
        management_analysis.ticker = ticker.upper()
        industry_analysis.ticker = ticker.upper()
        
        # Step 7: Valuation with real data
        print(f"💰 Calculating valuation metrics...")
        valuation_metrics = self.valuation_agent.run(financial_data)
        valuation_metrics.ticker = ticker.upper()
        
        # Step 8: Final decision
        print(f"🎯 Generating final recommendation...")
        analysis_data = {
            "ticker": ticker.upper(),
            "knowledge_check": knowledge_check.dict(),
            "financial_data": financial_data.dict(),
            "key_ratios": key_ratios.dict(),
            "business_analysis": business_analysis.dict(),
            "risk_assessment": risk_assessment.dict(),
            "valuation_metrics": valuation_metrics.dict(),
            "management_analysis": management_analysis.dict(),
            "industry_analysis": industry_analysis.dict()
        }
        
        final_recommendation = self.decision_agent.run(analysis_data)
        final_recommendation.ticker = ticker.upper()
        
        return {
            "ticker": ticker.upper(),
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