from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import CompanyInput, BusinessAnalysis

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
        return self.agent.run({"ticker": ticker})