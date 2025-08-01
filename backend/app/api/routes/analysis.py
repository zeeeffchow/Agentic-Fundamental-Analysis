from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import instructor
import openai

# Model imports
from app.models.analysis import AnalysisResult
from app.models.company import Company

# Other imports
from app.database import get_db
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.analysis_service import AnalysisService
from app.config import settings

router = APIRouter()

# Initialize OpenAI client
def get_openai_client():
    return instructor.from_openai(
        openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    )

def get_analysis_service():
    return AnalysisService(get_openai_client())

@router.post("/start/{ticker}")
async def start_analysis(
    ticker: str,
    db: Session = Depends(get_db)
):
    """Start analysis for a company ticker."""
    
    # Check if we have recent analysis (optional optimization)
    analysis_service = get_analysis_service()
    existing = analysis_service.get_latest_analysis(ticker, db)
    
    if existing and existing.analysis_date:
        # If analysis is less than 24 hours old, return existing
        from datetime import datetime, timedelta
        if datetime.now() - existing.analysis_date.replace(tzinfo=None) < timedelta(hours=24):
            return {
                "message": "Recent analysis found",
                "analysis_id": existing.id,
                "status": "COMPLETED",
                "recommendation": existing.recommendation,
                "confidence": existing.confidence_score
            }
    
    try:
        # Run analysis
        analysis_result = await analysis_service.run_analysis(ticker, db)
        
        return {
            "message": "Analysis completed",
            "analysis_id": analysis_result.id,
            "status": "COMPLETED",
            "recommendation": analysis_result.recommendation,
            "confidence": analysis_result.confidence_score
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/results/{ticker}", response_model=AnalysisResponse)
def get_analysis_results(ticker: str, db: Session = Depends(get_db)):
    """Get the latest analysis results for a company."""
    
    analysis_service = get_analysis_service()
    analysis = analysis_service.get_latest_analysis(ticker, db)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this ticker")
    
    return AnalysisResponse(
        id=analysis.id,
        company={
            "id": analysis.company.id,
            "ticker": analysis.company.ticker,
            "company_name": analysis.company.company_name,
            "sector": analysis.company.sector,
            "industry": analysis.company.industry,
            "market_cap": analysis.company.market_cap
        },
        recommendation=analysis.recommendation,
        confidence_score=analysis.confidence_score,
        target_price=analysis.target_price,
        overall_score=analysis.overall_score,
        analysis_date=analysis.analysis_date,
        analysis_data=analysis.analysis_data
    )

@router.get("/results/id/{analysis_id}", response_model=AnalysisResponse)
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    """Get analysis results by ID."""
    
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return AnalysisResponse(
        id=analysis.id,
        company={
            "id": analysis.company.id,
            "ticker": analysis.company.ticker,
            "company_name": analysis.company.company_name,
            "sector": analysis.company.sector,
            "industry": analysis.company.industry,
            "market_cap": analysis.company.market_cap
        },
        recommendation=analysis.recommendation,
        confidence_score=analysis.confidence_score,
        target_price=analysis.target_price,
        overall_score=analysis.overall_score,
        analysis_date=analysis.analysis_date,
        analysis_data=analysis.analysis_data
    )

@router.get("/results/{ticker}/enhanced")
def get_enhanced_analysis_results(ticker: str, db: Session = Depends(get_db)):
    """Get enhanced analysis results with detailed breakdown."""
    analysis_service = get_analysis_service()
    analysis_result = analysis_service.get_latest_analysis(ticker, db)
    
    if not analysis_result:
        raise HTTPException(status_code=404, detail="No analysis found")
    
    # Get enhanced summary
    enhanced_summary = analysis_service.get_enhanced_analysis_summary(analysis_result)
    
    return {
        "analysis_id": analysis_result.id,
        "ticker": ticker.upper(),
        "analysis_date": analysis_result.analysis_date,
        "enhanced_summary": enhanced_summary,
        "full_data": analysis_result.analysis_data  # Complete detailed data
    }