"""
Authentication router
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from models import User
from schemas import UserResponse, Token, UserCreate
from auth import verify_password, create_access_token, get_current_active_user, get_password_hash
from config import settings

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint - returns JWT token"""
    print(f"DEBUG LOGIN: Attempt for username='{form_data.username}'")
    
    # EMERGENCY HACKATHON BYPASS
    if form_data.username == "admin@pharmacy.com" and form_data.password == "admin123":
        print("EMERGENCY BYPASS: Admin login detected. Granting access directly.")
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": "admin@pharmacy.com"}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}

    user = db.query(User).filter(User.email == form_data.username).first()
    
    if user:
        print(f"DEBUG LOGIN: User found. ID={user.id}, Hash={user.hashed_password[:10]}...")
        is_valid = verify_password(form_data.password, user.hashed_password)
        print(f"DEBUG LOGIN: Password verification result: {is_valid}")
    else:
        print("DEBUG LOGIN: User NOT found in DB")

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current authenticated user information"""
    return current_user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if email already exists
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    new_user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role,
        is_active=True,
        phone=user_in.phone
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email or Phone number already registered."
        )

