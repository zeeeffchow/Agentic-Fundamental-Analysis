from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Model imports
from app.models.user import UserWatchlist, User
from app.models.analysis import AnalysisResult

# Other imports
from app.database import get_db
from app.schemas.analysis import WatchlistItem

router = APIRouter()

@router.post("/add")
def add_to_watchlist(
    company_id: int,
    analysis_id: int,
    user_id: int = 1,  # For now, use default user
    db: Session = Depends(get_db)
):
    """Add company analysis to user's watchlist."""
    
    # Check if already in watchlist
    existing = db.query(UserWatchlist).filter(
        UserWatchlist.user_id == user_id,
        UserWatchlist.company_id == company_id
    ).first()
    
    if existing:
        # Update with new analysis
        existing.analysis_id = analysis_id
        db.commit()
        return {"message": "Watchlist updated"}
    
    # Add new watchlist item
    watchlist_item = UserWatchlist(
        user_id=user_id,
        company_id=company_id,
        analysis_id=analysis_id
    )
    
    db.add(watchlist_item)
    db.commit()
    
    return {"message": "Added to watchlist"}

@router.get("/", response_model=List[WatchlistItem])
def get_watchlist(user_id: int = 1, db: Session = Depends(get_db)):
    """Get user's watchlist."""
    
    watchlist = db.query(UserWatchlist).filter(
        UserWatchlist.user_id == user_id
    ).all()
    
    return [
        WatchlistItem(
            id=item.id,
            company={
                "id": item.company.id,
                "ticker": item.company.ticker,
                "company_name": item.company.company_name,
                "sector": item.company.sector,
                "industry": item.company.industry,
                "market_cap": item.company.market_cap
            },
            analysis={
                "id": item.analysis.id,
                "company": {
                    "id": item.company.id,
                    "ticker": item.company.ticker,
                    "company_name": item.company.company_name,
                    "sector": item.company.sector,
                    "industry": item.company.industry,
                    "market_cap": item.company.market_cap
                },
                "recommendation": item.analysis.recommendation,
                "confidence_score": item.analysis.confidence_score,
                "target_price": item.analysis.target_price,
                "overall_score": item.analysis.overall_score,
                "analysis_date": item.analysis.analysis_date,
                "analysis_data": item.analysis.analysis_data
            },
            added_at=item.added_at
        )
        for item in watchlist
    ]

@router.delete("/{company_id}")
def remove_from_watchlist(
    company_id: int,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Remove company from watchlist."""
    
    item = db.query(UserWatchlist).filter(
        UserWatchlist.user_id == user_id,
        UserWatchlist.company_id == company_id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found in watchlist")
    
    db.delete(item)
    db.commit()
    
    return {"message": "Removed from watchlist"}