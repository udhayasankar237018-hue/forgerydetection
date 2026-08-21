import os
import sys

# Ensure app path in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal, init_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.core.security import get_password_hash
from app.core.logger import logger


def seed_database():
    """Seed default administrator and demo user accounts."""
    init_db()
    db = SessionLocal()
    try:
        # 1. Seed Admin
        admin = db.query(User).filter(User.email == "admin@forgeryguard.ai").first()
        if not admin:
            admin = User(
                name="Chief Forensic Officer",
                email="admin@forgeryguard.ai",
                password_hash=get_password_hash("Admin@123456"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            logger.info("Created Seed Administrator: admin@forgeryguard.ai (Password: Admin@123456)")
        else:
            logger.info("Admin user admin@forgeryguard.ai already exists.")

        # 2. Seed Standard User
        user = db.query(User).filter(User.email == "user@forgeryguard.ai").first()
        if not user:
            user = User(
                name="Forensic Analyst",
                email="user@forgeryguard.ai",
                password_hash=get_password_hash("User@123456"),
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info("Created Seed User: user@forgeryguard.ai (Password: User@123456)")
        else:
            logger.info("Demo user user@forgeryguard.ai already exists.")

        # 3. Seed Initial Activity Log
        log = ActivityLog(
            user_id=admin.id,
            action="SYSTEM_INIT",
            description="Database schema initialized and seed administrator provisioned."
        )
        db.add(log)
        db.commit()

        logger.info("Database seeding completed successfully!")

    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
