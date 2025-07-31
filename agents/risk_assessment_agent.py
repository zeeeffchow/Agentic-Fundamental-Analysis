from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import CompanyInput, RiskAssessment

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
        return self.agent.run({"ticker": ticker})