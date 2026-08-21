import logging
import sys

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("ForgeryDetection")


def log_event(action: str, description: str, user_email: str = "Anonymous"):
    """Helper to format standard audit/activity log events."""
    logger.info(f"[{action.upper()}] user={user_email} | {description}")
