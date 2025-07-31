from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import FinancialData, ValuationMetrics

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