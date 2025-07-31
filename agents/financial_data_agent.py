from atomic_agents.agents.base_agent import BaseIOSchema
from pydantic import Field
from typing import List, Dict, Any, Optional
from datetime import datetime
import instructor
import openai
from atomic_agents.agents.base_agent import BaseAgent, BaseAgentConfig
from atomic_agents.lib.components.system_prompt_generator import SystemPromptGenerator
from atomic_agents.lib.components.agent_memory import AgentMemory
from schemas import CompanyInput, FinancialData

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
        return self.agent.run({"ticker": ticker})