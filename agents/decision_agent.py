from typing import List, Dict, Any, Optional
from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import FinalRecommendation

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
        
        # This agent takes multiple inputs, so we'll use a combined schema
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