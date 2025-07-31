from app.database import SessionLocal
from app.models.company import Company
from app.models.analysis import AnalysisResult

def check_database():
    db = SessionLocal()
    
    print("=== COMPANIES ===")
    companies = db.query(Company).all()
    for company in companies:
        print(f"ID: {company.id}, Ticker: {company.ticker}, Name: {company.company_name}")
    
    print("\n=== ANALYSIS RESULTS ===")
    analyses = db.query(AnalysisResult).all()
    for analysis in analyses:
        print(f"ID: {analysis.id}, Company ID: {analysis.company_id}, Recommendation: {analysis.recommendation}")
        print(f"  Ticker from analysis_data: {analysis.analysis_data.get('ticker', 'N/A')}")
        print("---")
    
    print("\n=== JOINED DATA ===")
    results = db.query(AnalysisResult, Company).join(Company).all()
    for analysis, company in results:
        print(f"Analysis ID: {analysis.id} → Company: {company.ticker} → Recommendation: {analysis.recommendation}")
    
    db.close()

if __name__ == "__main__":
    check_database()