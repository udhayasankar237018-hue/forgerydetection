# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.logger import logger
from app.database.base import Base

# Attempt MySQL connection first; fallback to SQLite if MySQL is unavailable
engine = None
try:
    if settings.DATABASE_URL.startswith("mysql"):
        try:
            # Test quick connect to MySQL
            test_engine = create_engine(
                settings.DATABASE_URL,
                pool_pre_ping=True,
                pool_recycle=3600,
                connect_args={"connect_timeout": 3}
            )
            with test_engine.connect():
                pass
            engine = test_engine
            logger.info(f"Connected to MySQL Database: {settings.DATABASE_URL.split('@')[-1]}")
        except Exception as mysql_err:
            logger.warning(f"MySQL unavailable ({mysql_err}). Falling back to SQLite database: {settings.SQLITE_FALLBACK_URL}")
            engine = create_engine(
                settings.SQLITE_FALLBACK_URL,
                connect_args={"check_same_thread": False}
            )
    else:
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
        )
except Exception as e:
    logger.error(f"Error creating database engine: {e}. Defaulting to SQLite.")
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Create all tables in the database and auto-seed initial user accounts."""
    try:
        # Import models so Base registers them
        import app.models  # noqa
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")

        # Auto-seed standard accounts if missing
        from app.models.user import User
        from app.core.security import get_password_hash
        
        db = SessionLocal()
        try:
            # Seed Admin
            admin = db.query(User).filter(User.email == "admin@forgeryguard.ai").first()
            if not admin:
                admin = User(
                    name="Chief Forensic Officer",
                    email="admin@forgeryguard.ai",
                    password_hash=get_password_hash("Admin@123456"),
                    role="admin"
                )
                db.add(admin)
                logger.info("Auto-seeded administrator: admin@forgeryguard.ai")
            
            # Seed User
            user = db.query(User).filter(User.email == "user@forgeryguard.ai").first()
            if not user:
                user = User(
                    name="Forensic Analyst",
                    email="user@forgeryguard.ai",
                    password_hash=get_password_hash("User@123456"),
                    role="user"
                )
                db.add(user)
                logger.info("Auto-seeded forensic analyst: user@forgeryguard.ai")
                
            db.commit()
        except Exception as seed_err:
            db.rollback()
            logger.warning(f"Database auto-seed check: {seed_err}")
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"Failed to initialize database schema: {e}")
        raise e


def get_db():
    """FastAPI Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
