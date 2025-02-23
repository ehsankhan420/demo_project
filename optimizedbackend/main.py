from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from optimizedbackend.authutils import register_biometric, verify_biometric
from optimizedbackend.ratelimiter import rate_limiter
from optimizedbackend.config import Config
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import logging

load_dotenv()

app = FastAPI(
    title=Config.API_TITLE,
    version=Config.API_VERSION,
    description=Config.API_DESCRIPTION
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
client = MongoClient(os.getenv("MONGODB_URI"))
db = client[os.getenv("DATABASE_NAME")]

# Configure logging
logging.basicConfig(level=logging.INFO)

# Pydantic models
class BiometricRequest(BaseModel):
    user_id: str
    biometric_data: str
    biometric_type: str  # e.g., "fingerprint" or "facial"

class RegisterRequest(BaseModel):
    username: str
    password: str
    biometric_data: Optional[str] = None
    biometric_type: Optional[str] = None  # e.g., "fingerprint" or "facial"
    use_otp_fallback: Optional[bool] = False

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordResetRequest(BaseModel):
    username: str
    new_password: str

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    rate_limiter.is_allowed(request)
    response = await call_next(request)
    return response

# Endpoint for an already-registered user to add biometric data
@app.post("/register_biometric", tags=["authentication"])
async def register_biometric_endpoint(request: BiometricRequest):
    if not request.user_id.strip() or not request.biometric_data.strip() or not request.biometric_type.strip():
        raise HTTPException(status_code=400, detail="User ID, biometric data, and biometric type cannot be empty")
    # Log biometric record in MongoDB (optional)
    result = db.biometric_records.insert_one({
        "user_id": request.user_id,
        "biometric_type": request.biometric_type,
        "biometric_data": request.biometric_data
    })
    register_biometric(request.user_id, request.biometric_data, request.biometric_type)
    return {"message": "Biometric registered successfully", "id": str(result.inserted_id)}

# Endpoint for biometric verification (for either fingerprint or facial)
@app.post("/verify_biometric", tags=["authentication"])
async def verify_biometric_endpoint(request: BiometricRequest):
    verify_biometric(request.user_id, request.biometric_data, request.biometric_type)
    return {"status": "success", "message": "Biometric verified successfully"}

# Registration endpoint for new users – biometric is required unless OTP fallback is chosen
@app.post("/register", tags=["authentication"])
async def register_user(request: RegisterRequest):
    logging.info(f"Received registration request: {request}")
    if db.users.find_one({"username": request.username}):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Require biometric data unless OTP fallback is explicitly selected
    if not request.biometric_data and not request.use_otp_fallback:
        raise HTTPException(status_code=400, detail="Biometric data is required for registration unless OTP fallback is selected")
    
    # Insert user credentials into MongoDB
    result = db.users.insert_one({"username": request.username, "password": request.password})
    logging.info(f"Inserted user with ID: {result.inserted_id}")
    
    # If biometric data is provided, register it on the blockchain and log it
    if request.biometric_data and request.biometric_type:
        register_biometric(request.username, request.biometric_data, request.biometric_type)
        db.biometric_records.insert_one({
            "user_id": request.username,
            "biometric_type": request.biometric_type,
            "biometric_data": request.biometric_data
        })
    
    return {"success": True, "message": "User registered successfully"}

# Standard login endpoint (username and password)
@app.post("/login", tags=["authentication"])
async def login_user(request: LoginRequest):
    user = db.users.find_one({"username": request.username})
    if not user or user["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"success": True, "message": "Login successful"}

@app.post("/reset_password", tags=["authentication"])
async def reset_password(request: PasswordResetRequest):
    user = db.users.find_one({"username": request.username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.users.update_one({"username": request.username}, {"$set": {"password": request.new_password}})
    return {"success": True, "message": "Password reset successfully"}

@app.get("/", tags=["info"])
async def root():
    return {
        "title": Config.API_TITLE,
        "version": Config.API_VERSION,
        "status": "running"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
