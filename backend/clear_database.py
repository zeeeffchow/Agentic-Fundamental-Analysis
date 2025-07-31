from app.database import SessionLocal
from app.models.company import Company
from app.models.analysis import AnalysisResult, AnalysisMetadata
from app.models.user import UserWatchlist

def clear_database():
    db = SessionLocal()
    
    try:
        # Clear in order (respecting foreign key constraints)
        print("🗑️ Clearing user watchlists...")
        db.query(UserWatchlist).delete()
        
        print("🗑️ Clearing analysis metadata...")
        db.query(AnalysisMetadata).delete()
        
        print("🗑️ Clearing analysis results...")
        db.query(AnalysisResult).delete()
        
        print("🗑️ Clearing companies...")
        db.query(Company).delete()
        
        db.commit()
        print("✅ Database cleared successfully!")
        
        # Verify it's empty
        company_count = db.query(Company).count()
        analysis_count = db.query(AnalysisResult).count()
        print(f"📊 Remaining: {company_count} companies, {analysis_count} analyses")
        
    except Exception as e:
        print(f"❌ Error clearing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_database()