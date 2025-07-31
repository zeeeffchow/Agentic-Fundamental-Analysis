from app.database import SessionLocal
from app.models.user import User

def create_default_user():
    db = SessionLocal()
    try:
        # Check if user already exists
        user = db.query(User).filter(User.id == 1).first()
        if not user:
            # Create default user
            user = User(
                email='default@example.com',
                username='default_user'
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✅ Default user created with ID: {user.id}")
        else:
            print(f"✅ User already exists with ID: {user.id}")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_user()