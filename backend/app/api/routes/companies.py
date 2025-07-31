from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Model imports
from app.models.company import Company

# Other imports
from app.database import get_db
from app.schemas.analysis import CompanyInfo

router = APIRouter()

@router.get("/search", response_model=List[CompanyInfo])
def search_companies(q: str = "", db: Session = Depends(get_db)):
    """Search companies by ticker or name."""
    
    query = db.query(Company)
    
    if q:
        query = query.filter(
            (Company.ticker.ilike(f"%{q}%")) |
            (Company.company_name.ilike(f"%{q}%"))
        )
    
    companies = query.limit(10).all()
    
    return [
        CompanyInfo(
            id=company.id,
            ticker=company.ticker,
            company_name=company.company_name,
            sector=company.sector,
            industry=company.industry,
            market_cap=company.market_cap
        )
        for company in companies
    ]

@router.get("/{ticker}", response_model=CompanyInfo)
def get_company(ticker: str, db: Session = Depends(get_db)):
    """Get company by ticker."""
    
    company = db.query(Company).filter(Company.ticker == ticker.upper()).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return CompanyInfo(
        id=company.id,
        ticker=company.ticker,
        company_name=company.company_name,
        sector=company.sector,
        industry=company.industry,
        market_cap=company.market_cap
    )