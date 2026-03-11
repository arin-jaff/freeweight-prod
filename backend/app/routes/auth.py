from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse
from ..models import User
from ..auth import get_password_hash, verify_password, create_access_token, get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "user_type": user.user_type.value.lower(),
        "sport": user.sport,
        "team": user.team,
        "training_goals": user.training_goals,
        "injuries": user.injuries,
        "experience_level": user.experience_level,
        "onboarding_completed": user.onboarding_completed or False,
        "coaching_credentials": user.coaching_credentials,
        "bio": user.bio,
        "profile_photo_url": user.profile_photo_url
    }


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = get_password_hash(request.password)

    new_user = User(
        email=request.email,
        hashed_password=hashed_password,
        name=request.name,
        user_type=request.user_type,
        sport=request.sport,
        team=request.team,
        training_goals=request.training_goals,
        coaching_credentials=request.coaching_credentials,
        bio=request.bio
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": _user_dict(new_user)
    }

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"🔐 Login attempt for email: {form_data.username}")

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user:
        logger.warning(f"❌ User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"✅ User found: {user.email} (ID: {user.id})")
    logger.info(f"🔑 Verifying password...")

    password_valid = verify_password(form_data.password, user.hashed_password)
    logger.info(f"🔑 Password verification result: {password_valid}")

    if not password_valid:
        logger.warning(f"❌ Invalid password for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"🎫 Creating access token for user ID: {user.id}")
    access_token = create_access_token(data={"sub": user.id})

    user_dict = _user_dict(user)
    logger.info(f"📦 Response user_type: {user_dict['user_type']}")
    logger.info(f"📦 Response onboarding_completed: {user_dict['onboarding_completed']}")
    logger.info(f"✅ Login successful for: {user.email}")

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
