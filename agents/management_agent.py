from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import CompanyInput, ManagementAnalysis

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
        return self.agent.run({"ticker": ticker})