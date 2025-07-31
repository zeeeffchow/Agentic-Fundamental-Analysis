from app.database import engine, SessionLocal
from app.models.company import Company
import sqlalchemy

def test_database():
    try:
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(sqlalchemy.text("SELECT 1"))
            print("✅ Database connection successful!")
        
        # Test table creation
        db = SessionLocal()
        count = db.query(Company).count()
        print(f"✅ Company table accessible. Current count: {count}")
        db.close()
        
        print("✅ Database setup complete!")
        
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_database()