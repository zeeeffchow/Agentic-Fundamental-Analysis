from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import CompanyInput, IndustryAnalysis

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
        return self.agent.run({"ticker": ticker})