# backend/app/services/analysis_service.py - UPDATED for Enhanced Orchestrator

import asyncio
import json
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models.company import Company
from ..models.analysis import AnalysisResult, AnalysisMetadata

# Import enhanced agents from parent directory
import sys
import os
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
sys.path.append(project_root)
from agents.orchestrator import AnalysisOrchestrator  # Now using enhanced version

class AnalysisService:
    def __init__(self, openai_client):
        self.orchestrator = AnalysisOrchestrator(openai_client)
    
    async def run_analysis(self, ticker: str, db: Session) -> AnalysisResult:
        """Run enhanced comprehensive analysis and save to database."""
        
        # Get or create company
        company = self.get_or_create_company(ticker, db)
        
        # Mark existing analyses as not latest
        db.query(AnalysisResult).filter(
            AnalysisResult.company_id == company.id,
            AnalysisResult.is_latest == True
        ).update({"is_latest": False})
        
        try:
            # Run the enhanced analysis using Atomic Agents
            analysis_data = await self.orchestrator.run_full_analysis(ticker)
            
            # Extract key data from enhanced analysis
            final_rec = analysis_data["final_recommendation"]
            
            # Create analysis result with enhanced data
            analysis_result = AnalysisResult(
                company_id=company.id,
                analysis_data=analysis_data,  # Now contains much richer detailed data
                recommendation=final_rec["recommendation"],
                confidence_score=final_rec["confidence"],
                target_price=final_rec.get("target_price"),
                overall_score=final_rec.get("overall_score", 5.0),
                is_latest=True
            )
            
            db.add(analysis_result)
            db.commit()
            db.refresh(analysis_result)
            
            # Log success with enhanced analysis type
            self.log_analysis_metadata(analysis_result.id, "ENHANCED_FULL_ANALYSIS", "SUCCESS", db)
            
            return analysis_result
            
        except Exception as e:
            # Create failed analysis record
            analysis_result = AnalysisResult(
                company_id=company.id,
                analysis_data={"error": str(e), "status": "FAILED", "analysis_type": "ENHANCED_COMPREHENSIVE"},
                recommendation="HOLD",
                confidence_score=0.0,
                is_latest=True
            )
            
            db.add(analysis_result)
            db.commit()
            db.refresh(analysis_result)
            
            self.log_analysis_metadata(analysis_result.id, "ENHANCED_FULL_ANALYSIS", "FAILED", db, str(e))
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
    
    def get_enhanced_analysis_summary(self, analysis_result: AnalysisResult) -> Dict[str, Any]:
        """Extract enhanced summary from analysis data for API responses."""
        if not analysis_result or not analysis_result.analysis_data:
            return {}
        
        data = analysis_result.analysis_data
        
        # Build enhanced summary with all available data
        summary = {
            "ticker": analysis_result.company.ticker,
            "analysis_type": data.get("analysis_type", "ENHANCED_COMPREHENSIVE"),
            "timestamp": data.get("timestamp"),
            "overall_recommendation": {
                "recommendation": analysis_result.recommendation,
                "confidence": analysis_result.confidence_score,
                "target_price": analysis_result.target_price,
                "overall_score": analysis_result.overall_score
            }
        }
        
        # Add enhanced data if available
        if "final_recommendation" in data and data["final_recommendation"]:
            final_rec = data["final_recommendation"]
            summary["enhanced_recommendation"] = {
                "conviction_level": final_rec.get("conviction_level"),
                "investment_thesis": final_rec.get("investment_thesis"),
                "price_target_range": final_rec.get("price_target_range", {}),
                "key_catalysts": final_rec.get("catalysts", [])[:3] if final_rec.get("catalysts") else [],
                "top_risks": final_rec.get("risks", [])[:3] if final_rec.get("risks") else [],
                "monitoring_metrics": final_rec.get("monitoring_metrics", [])
            }
        
        # Add financial highlights
        if "financial_data" in data and data["financial_data"]:
            fin_data = data["financial_data"]
            summary["financial_highlights"] = {
                "revenue": fin_data.get("revenue"),
                "revenue_growth_3y": fin_data.get("revenue_growth_3y"),
                "net_margin": fin_data.get("net_margin"),
                "free_cash_flow": fin_data.get("free_cash_flow"),
                "fcf_margin": fin_data.get("fcf_margin")
            }
        
        # Add business highlights
        if "business_analysis" in data and data["business_analysis"]:
            biz_data = data["business_analysis"]
            summary["business_highlights"] = {
                "moat_strength": biz_data.get("moat_strength"),
                "market_share": biz_data.get("market_share"),
                "brand_strength": biz_data.get("brand_strength"),
                "top_competitive_advantages": biz_data.get("competitive_advantages", [])[:3] if biz_data.get("competitive_advantages") else []
            }
        
        # Add valuation highlights
        if "valuation_metrics" in data and data["valuation_metrics"]:
            val_data = data["valuation_metrics"]
            summary["valuation_highlights"] = {
                "current_price": val_data.get("current_price"),
                "fair_value_estimate": val_data.get("fair_value_estimate"),
                "upside_downside": val_data.get("upside_downside"),
                "valuation_conclusion": val_data.get("valuation_conclusion"),
                "pe_ratio": val_data.get("pe_ratio")
            }
        
        # Add management highlights
        if "management_analysis" in data and data["management_analysis"]:
            mgmt_data = data["management_analysis"]
            summary["management_highlights"] = {
                "ceo_name": mgmt_data.get("ceo_name"),
                "management_quality": mgmt_data.get("management_quality"),
                "corporate_governance": mgmt_data.get("corporate_governance"),
                "track_record_summary": mgmt_data.get("track_record")
            }
        
        # Add industry context
        if "industry_analysis" in data and data["industry_analysis"]:
            ind_data = data["industry_analysis"]
            summary["industry_context"] = {
                "industry": ind_data.get("industry"),
                "industry_outlook": ind_data.get("industry_outlook"),
                "industry_growth_rate": ind_data.get("industry_growth_rate"),
                "company_industry_position": ind_data.get("company_industry_position")
            }
        
        # Add risk summary
        if "risk_assessment" in data and data["risk_assessment"]:
            risk_data = data["risk_assessment"]
            summary["risk_summary"] = {
                "overall_risk_score": risk_data.get("overall_risk_score"),
                "key_risk_factors": [
                    {"type": "Competition", "score": risk_data.get("competition_risk"), "details": risk_data.get("competition_details")},
                    {"type": "Disruption", "score": risk_data.get("disruption_risk"), "details": risk_data.get("disruption_details")},
                    {"type": "Regulatory", "score": risk_data.get("regulatory_risk"), "details": risk_data.get("regulatory_details")}
                ]
            }
        
        return summary
        