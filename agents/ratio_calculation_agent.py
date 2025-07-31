from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import FinancialData, KeyRatios


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