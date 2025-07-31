from atomic_agents.agents.base_agent import BaseIOSchema
from pydantic import Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import instructor
import openai
from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import CompanyInput

class CompanyKnowledgeCheckOutput(BaseIOSchema):
    """Output schema for company knowledge check."""
    ticker: str = Field(..., description="Stock ticker symbol")
    is_known: bool = Field(..., description="Whether the company is already known")
    last_analysis_date: Optional[str] = Field(None, description="Date of last analysis if known")
    needs_full_analysis: bool = Field(..., description="Whether full analysis is needed")

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
        return self.agent.run({"ticker": ticker})