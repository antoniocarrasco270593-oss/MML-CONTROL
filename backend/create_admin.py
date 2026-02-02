from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models, security

def create_admin():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin = db.query(models.User).filter(models.User.email == "admin@fichaje.com").first()
    if not admin:
        hashed_pw = security.get_password_hash("admin123")
        admin = models.User(
            email="admin@fichaje.com",
            full_name="Admin Antonio",
            hashed_password=hashed_pw,
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created: admin@fichaje.com / admin123")
    else:
        print("Admin user already exists.")
    db.close()

if __name__ == "__main__":
    create_admin()
