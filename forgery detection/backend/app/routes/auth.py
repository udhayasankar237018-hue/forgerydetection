from datetime import timedelta
import random
import time
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.user import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    ForgotPasswordRequest,
    VerifyResetCodeRequest,
    ResetPasswordRequest,
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_token,
    oauth2_scheme,
)
from app.core.logger import log_event
from app.services.email_service import send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory storage for active password reset OTP codes: { email: { "code": str, "expires": float, "user_id": int, "token": str } }
_RESET_CODES: Dict[str, Dict[str, Any]] = {}


def get_current_user(
    header_token: Optional[str] = Depends(oauth2_scheme),
    query_token: Optional[str] = Query(None, alias="token"),
    db: Session = Depends(get_db)
) -> User:
    """
    Extract and validate authenticated user from either:
    1. HTTP Authorization Bearer Header
    2. URL query parameter ?token=... (for <img>, <a>, and file downloads)
    """
    token = header_token or query_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token payload",
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists",
        )
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency: Ensure authenticated user possesses administrator role."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges required for this operation",
        )
    return current_user


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists",
        )
    
    user_count = db.query(User).count()
    role = "admin" if user_count == 0 else "user"

    new_user = User(
        name=user_in.name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=get_password_hash(user_in.password),
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    log = ActivityLog(
        user_id=new_user.id,
        action="USER_REGISTER",
        description=f"New user registered: {new_user.email} (Role: {new_user.role})"
    )
    db.add(log)
    db.commit()

    log_event("REGISTER", f"Registered {new_user.email}", new_user.email)

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }


@router.post("/login", response_model=Token)
def login_user(user_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive JWT token."""
    clean_email = user_in.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    
    # Auto-provision standard demo accounts if missing upon first login attempt
    if not user:
        if clean_email == "admin@forgeryguard.ai" and user_in.password == "Admin@123456":
            user = User(
                name="Chief Forensic Officer",
                email="admin@forgeryguard.ai",
                password_hash=get_password_hash("Admin@123456"),
                role="admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif clean_email == "user@forgeryguard.ai" and user_in.password == "User@123456":
            user = User(
                name="Forensic Analyst",
                email="user@forgeryguard.ai",
                password_hash=get_password_hash("User@123456"),
                role="user"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    if not user or not verify_password(user_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials or use Quick Demo Access.",
        )

    log = ActivityLog(
        user_id=user.id,
        action="USER_LOGIN",
        description=f"User logged in: {user.email}"
    )
    db.add(log)
    db.commit()

    log_event("LOGIN", f"Logged in {user.email}", user.email)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/demo-login", response_model=Token)
def demo_login(role: str = Query("user", description="admin, user, or guest"), db: Session = Depends(get_db)):
    """Instant one-click demo login for fast analyst & admin access without password friction."""
    target_role = "admin" if role.lower() == "admin" else "user"
    target_email = "admin@forgeryguard.ai" if target_role == "admin" else ("guest_analyst@forgeryguard.ai" if role.lower() == "guest" else "user@forgeryguard.ai")
    default_name = "Chief Forensic Officer" if target_role == "admin" else ("Guest Forensic Analyst" if role.lower() == "guest" else "Forensic Analyst")
    default_pwd = "Admin@123456" if target_role == "admin" else "User@123456"

    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        user = User(
            name=default_name,
            email=target_email,
            password_hash=get_password_hash(default_pwd),
            role=target_role
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    log = ActivityLog(
        user_id=user.id,
        action="DEMO_LOGIN",
        description=f"Quick demo login: {user.email} (Role: {user.role})"
    )
    db.add(log)
    db.commit()

    log_event("DEMO_LOGIN", f"Demo login as {user.email}", user.email)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user


@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Generates a 6-digit verification code and security token,
    dispatches an email to the analyst's address, and stores the active code.
    """
    clean_email = req.email.lower().strip()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No analyst account found with email address: {clean_email}"
        )

    # Generate 6-digit OTP code
    otp_code = str(random.randint(100000, 999999))
    # Generate signed JWT reset token (15-minute validity)
    reset_token = create_access_token(
        subject=user.id,
        role="password_reset",
        expires_delta=timedelta(minutes=15)
    )

    # Store OTP in active reset codes cache (15-minute expiration)
    _RESET_CODES[clean_email] = {
        "code": otp_code,
        "token": reset_token,
        "user_id": user.id,
        "expires": time.time() + 900
    }

    # Dispatch email
    email_result = send_password_reset_email(
        to_email=user.email,
        recipient_name=user.name,
        reset_code=otp_code,
        reset_token=reset_token
    )

    # Audit log
    log = ActivityLog(
        user_id=user.id,
        action="FORGOT_PASSWORD_REQUEST",
        description=f"Password reset verification code requested for {user.email}"
    )
    db.add(log)
    db.commit()

    log_event("FORGOT_PWD", f"Reset code generated for {user.email}", user.email)

    return {
        "success": True,
        "message": f"A 6-digit verification code has been dispatched to {user.email}. Please check your email inbox and enter the code below to update your password.",
        "email": user.email,
        "delivery_method": email_result.get("delivery_method")
    }


@router.post("/verify-reset-code")
def verify_reset_code(req: VerifyResetCodeRequest):
    """
    Validates the 6-digit OTP verification code for the given email address.
    """
    clean_email = req.email.lower().strip()
    clean_code = req.code.strip()

    record = _RESET_CODES.get(clean_email)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active password reset request found for this email. Please request a new code."
        )

    if time.time() > record["expires"]:
        _RESET_CODES.pop(clean_email, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The verification code has expired. Please request a fresh code."
        )

    if record["code"] != clean_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please check your email and try again."
        )

    return {
        "success": True,
        "message": "Verification code validated successfully",
        "email": clean_email,
        "reset_token": record["token"]
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Resets the user's password using either the 6-digit OTP code or the JWT reset token.
    """
    clean_email = req.email.lower().strip()
    token_or_code = req.token_or_code.strip()
    new_password = req.new_password

    if len(new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters in length."
        )

    user = db.query(User).filter(User.email == clean_email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User account not found."
        )

    is_valid = False

    # Check 1: In-memory OTP code match
    record = _RESET_CODES.get(clean_email)
    if record and (record["code"] == token_or_code or record["token"] == token_or_code):
        if time.time() <= record["expires"]:
            is_valid = True
            _RESET_CODES.pop(clean_email, None)

    # Check 2: Signed JWT Token validation
    if not is_valid:
        try:
            payload = decode_token(token_or_code)
            if payload.get("sub") == str(user.id) and payload.get("role") == "password_reset":
                is_valid = True
        except Exception:
            pass

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token/code. Please request a new password reset."
        )

    # Update password hash
    user.password_hash = get_password_hash(new_password)
    db.commit()
    db.refresh(user)

    # Audit log
    log = ActivityLog(
        user_id=user.id,
        action="PASSWORD_RESET_SUCCESS",
        description=f"Password successfully reset for account: {user.email}"
    )
    db.add(log)
    db.commit()

    log_event("PWD_RESET", f"Password successfully updated for {user.email}", user.email)

    return {
        "success": True,
        "message": f"Password updated successfully for {user.email}. You can now sign in with your new credentials."
    }

