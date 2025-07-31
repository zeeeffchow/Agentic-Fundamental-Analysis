import asyncio
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.company import Company
from ..models.analysis import AnalysisResult, AnalysisMetadata

# Import agents from parent directory
import sys
import os
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(project_root)
from agents.orchestrator import AnalysisOrchestrator
# from agents.enhanced_orchestrator import EnhancedAnalysisOrchestrator as AnalysisOrchestrator

class AnalysisService:
    def __init__(self, openai_client):
        self.orchestrator = AnalysisOrchestrator(openai_client)
    
    async def run_analysis(self, ticker: str, db: Session) -> AnalysisResult:
        """Run complete analysis and save to database."""
        
        # Get or create company
        company = self.get_or_create_company(ticker, db)
        
        # Mark existing analyses as not latest
        db.query(AnalysisResult).filter(
            AnalysisResult.company_id == company.id,
            AnalysisResult.is_latest == True
        ).update({"is_latest": False})
        
        try:
            # Run the analysis using Atomic Agents
            analysis_data = await self.orchestrator.run_full_analysis(ticker)
            
            # Extract key data
            final_rec = analysis_data["final_recommendation"]
            
            # Create analysis result
            analysis_result = AnalysisResult(
                company_id=company.id,
                analysis_data=analysis_data,
                recommendation=final_rec["recommendation"],
                confidence_score=final_rec["confidence"],
                target_price=final_rec.get("target_price"),
                overall_score=final_rec.get("overall_score", 5.0),
                is_latest=True
            )
            
            db.add(analysis_result)
            db.commit()
            db.refresh(analysis_result)
            
            # Log success
            self.log_analysis_metadata(analysis_result.id, "FULL_ANALYSIS", "SUCCESS", db)
            
            return analysis_result
            
        except Exception as e:
            # Create failed analysis record
            analysis_result = AnalysisResult(
                company_id=company.id,
                analysis_data={"error": str(e), "status": "FAILED"},
                recommendation="HOLD",
                confidence_score=0.0,
                is_latest=True
            )
            
            db.add(analysis_result)
            db.commit()
            db.refresh(analysis_result)
            
            self.log_analysis_metadata(analysis_result.id, "FULL_ANALYSIS", "FAILED", db, str(e))
            raise e
    
    def get_or_create_company(self, ticker: str, db: Session) -> Company:
        """Get existing company or create new one."""
        company = db.query(Company).filter(Company.ticker == ticker.upper()).first()
        
        if not company:
            company = Company(ticker=ticker.upper())
            db.add(company)
            db.commit()
            db.refresh(company)
        
        return company
    
    def log_analysis_metadata(self, analysis_id: int, agent_name: str, status: str, 
                            db: Session, error_message: Optional[str] = None):
        """Log metadata about analysis execution."""
        metadata = AnalysisMetadata(
            analysis_id=analysis_id,
            agent_name=agent_name,
            status=status,
            error_message=error_message
        )
        db.add(metadata)
        db.commit()
    
    def get_latest_analysis(self, ticker: str, db: Session) -> Optional[AnalysisResult]:
        """Get the latest analysis for a company."""
        company = db.query(Company).filter(Company.ticker == ticker.upper()).first()
        if not company:
            return None
        
        return db.query(AnalysisResult).filter(
            AnalysisResult.company_id == company.id,
            AnalysisResult.is_latest == True
        ).first()