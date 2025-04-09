# main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from bson import ObjectId
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel
import re
import logging
import os  # Added for environment variables
from dotenv import load_dotenv  # Added for loading .env file

# Load environment variables from .env file
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB setup
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = client["esocietydb"]
users_collection = db["users"]
complaints_collection = db["complaints"]
bookings_collection = db["bookings"]
visitors_collection = db["visitors"]
facilities_collection = db["facilities"]

# JWT setup
SECRET_KEY = os.getenv("SECRET_KEY", "1710")  # Use environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 setup
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Pydantic models
class RegisterUser(BaseModel):
    email: str
    password: str
    role: str
    name: str
    phone: str
    address: str

class FacilityCreate(BaseModel):
    name: str
    available_slots: List[str]

class ComplaintCreate(BaseModel):
    title: str
    description: str

class BookingCreate(BaseModel):
    facility_id: str
    slot: str

class VisitorCreate(BaseModel):  # Added for input validation
    name: str
    purpose: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        logger.info(f"Decoded JWT token with user_id: {user_id}")
        if user_id is None:
            logger.error("No user_id in JWT token")
            raise credentials_exception
    except JWTError as e:
        logger.error(f"JWT decoding failed: {str(e)}")
        raise credentials_exception
    
    # Validate user_id format
    if not re.match(r"^[0-9a-fA-F]{24}$", user_id):
        logger.error(f"Invalid user_id format: {user_id}")
        raise HTTPException(status_code=400, detail="User ID must be a 24-character hexadecimal string")
    
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user is None:
            logger.error(f"User not found for user_id: {user_id}")
            raise credentials_exception
        logger.info(f"User found: {user['email']}")
    except Exception as e:
        logger.error(f"Error querying user with user_id {user_id}: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    return user

# Endpoints
@app.post("/register")
async def register_user(user: RegisterUser, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can register new users")
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    # Password validation
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
    if not re.search(r"[A-Za-z]", user.password) or not re.search(r"\d", user.password):
        raise HTTPException(status_code=400, detail="Password must contain both letters and numbers")
    hashed_password = get_password_hash(user.password)
    user_data = {
        "email": user.email,
        "hashed_password": hashed_password,
        "role": user.role,
        "name": user.name,
        "phone": user.phone,
        "address": user.address,
    }
    result = users_collection.insert_one(user_data)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}

@app.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for email: {form_data.username}")
    user = users_collection.find_one({"email": form_data.username})
    if not user:
        logger.error(f"User not found for email: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    logger.info(f"User found: {user['email']}, verifying password")
    if not verify_password(form_data.password, user["hashed_password"]):
        logger.error(f"Password verification failed for email: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    logger.info(f"Password verified for email: {form_data.username}")
    access_token = create_access_token(data={"sub": str(user["_id"])})
    logger.info(f"Generated access token for user_id: {str(user['_id'])}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
async def get_current_user_data(current_user: dict = Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    return current_user

# Complaints
@app.post("/api/complaints")
async def create_complaint(
    complaint: ComplaintCreate,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "resident":
        raise HTTPException(status_code=403, detail="Only residents can create complaints")
    complaint_data = {
        "title": complaint.title,
        "description": complaint.description,
        "resident_id": str(current_user["_id"]),
        "status": "pending",
        "created_at": datetime.utcnow(),
    }
    result = complaints_collection.insert_one(complaint_data)
    return {"complaint_id": str(result.inserted_id)}

@app.get("/api/complaints")
async def get_complaints(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "resident":
        raise HTTPException(status_code=403, detail="Only residents can view their complaints")
    complaints = list(complaints_collection.find({"resident_id": str(current_user["_id"])}))
    for complaint in complaints:
        complaint["_id"] = str(complaint["_id"])
    return complaints

@app.get("/api/admin/complaints")
async def get_all_complaints(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all complaints")
    complaints = list(complaints_collection.find())
    for complaint in complaints:
        complaint["_id"] = str(complaint["_id"])
        complaint["resident_id"] = str(complaint["resident_id"])
    return complaints

@app.post("/api/admin/complaints/{complaint_id}/resolve")
async def resolve_complaint(complaint_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can resolve complaints")
    try:
        complaint = complaints_collection.find_one({"_id": ObjectId(complaint_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid complaint ID")
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaints_collection.update_one(
        {"_id": ObjectId(complaint_id)},
        {"$set": {"status": "resolved", "resolved_at": datetime.utcnow()}}
    )
    return {"message": "Complaint resolved"}

# Facilities
@app.get("/api/facilities")
async def get_facilities():
    facilities = list(facilities_collection.find())
    for facility in facilities:
        facility["_id"] = str(facility["_id"])
    return facilities

@app.post("/api/admin/facilities")
async def add_facility(
    facility: FacilityCreate,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add facilities")
    facility_data = {
        "name": facility.name,
        "available_slots": facility.available_slots,
    }
    result = facilities_collection.insert_one(facility_data)
    return {"facility_id": str(result.inserted_id)}

@app.put("/api/admin/facilities/{facility_id}")
async def update_facility(
    facility_id: str,
    facility: FacilityCreate,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update facilities")
    
    # Validate facility_id format
    if not re.match(r"^[0-9a-fA-F]{24}$", facility_id):
        raise HTTPException(status_code=400, detail="Facility ID must be a 24-character hexadecimal string")
    
    try:
        existing_facility = facilities_collection.find_one({"_id": ObjectId(facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    if not existing_facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    facilities_collection.update_one(
        {"_id": ObjectId(facility_id)},
        {"$set": {"name": facility.name, "available_slots": facility.available_slots}}
    )
    return {"message": "Facility updated"}

@app.delete("/api/admin/facilities/{facility_id}")
async def delete_facility(facility_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete facilities")
    
    # Validate facility_id format
    if not re.match(r"^[0-9a-fA-F]{24}$", facility_id):
        raise HTTPException(status_code=400, detail="Facility ID must be a 24-character hexadecimal string")
    
    try:
        facility = facilities_collection.find_one({"_id": ObjectId(facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    facilities_collection.delete_one({"_id": ObjectId(facility_id)})
    return {"message": "Facility deleted"}

# Bookings
@app.post("/api/bookings")
async def create_booking(
    booking: BookingCreate,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "resident":
        raise HTTPException(status_code=403, detail="Only residents can create bookings")
    
    # Validate facility_id format
    if not re.match(r"^[0-9a-fA-F]{24}$", booking.facility_id):
        raise HTTPException(status_code=400, detail="Facility ID must be a 24-character hexadecimal string")
    
    try:
        facility = facilities_collection.find_one({"_id": ObjectId(booking.facility_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format")
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    if booking.slot not in facility["available_slots"]:
        raise HTTPException(status_code=400, detail="Slot not available")
    booking_data = {
        "facility_id": booking.facility_id,
        "facility_name": facility["name"],
        "slot": booking.slot,
        "resident_id": str(current_user["_id"]),
        "booked_at": datetime.utcnow().isoformat().split("T")[0],
    }
    result = bookings_collection.insert_one(booking_data)
    facilities_collection.update_one(
        {"_id": ObjectId(booking.facility_id)},
        {"$pull": {"available_slots": booking.slot}}
    )
    return {"booking_id": str(result.inserted_id)}

@app.get("/api/bookings")
async def get_bookings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "resident":
        raise HTTPException(status_code=403, detail="Only residents can view their bookings")
    bookings = list(bookings_collection.find({"resident_id": str(current_user["_id"])}))
    for booking in bookings:
        booking["_id"] = str(booking["_id"])
    return bookings

@app.get("/api/admin/bookings")
async def get_all_bookings(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all bookings")
    bookings = list(bookings_collection.find())
    for booking in bookings:
        booking["_id"] = str(booking["_id"])
        booking["resident_id"] = str(booking["resident_id"])
    return bookings

@app.delete("/api/admin/bookings/{booking_id}")
async def cancel_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can cancel bookings")
    
    # Validate booking_id format
    if not re.match(r"^[0-9a-fA-F]{24}$", booking_id):
        raise HTTPException(status_code=400, detail="Booking ID must be a 24-character hexadecimal string")
    
    try:
        booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid booking ID format")
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Validate facility_id in the booking
    if not isinstance(booking.get("facility_id"), str) or not re.match(r"^[0-9a-fA-F]{24}$", booking["facility_id"]):
        raise HTTPException(status_code=400, detail="Invalid facility ID in booking: must be a 24-character hexadecimal string")
    
    try:
        facility = facilities_collection.find_one({"_id": ObjectId(booking["facility_id"])})
    except:
        raise HTTPException(status_code=400, detail="Invalid facility ID format in booking")
    if not facility:
        raise HTTPException(status_code=404, detail="Facility not found")
    
    facilities_collection.update_one(
        {"_id": ObjectId(booking["facility_id"])},
        {"$push": {"available_slots": booking["slot"]}}
    )
    bookings_collection.delete_one({"_id": ObjectId(booking_id)})
    return JSONResponse(
        content={"message": "Booking canceled"},
        headers={"Access-Control-Allow-Origin": "http://localhost:5173"}
    )

# Visitors
@app.get("/api/visitors/pending")
async def get_pending_visitors(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "resident":
        raise HTTPException(status_code=403, detail="Only residents can view pending visitors")
    visitors = list(visitors_collection.find({"status": "pending"}))
    for visitor in visitors:
        visitor["_id"] = str(visitor["_id"])
    return visitors

@app.post("/api/visitors/{visitor_id}/{decision}")
async def handle_visitor(
    visitor_id: str,
    decision: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "resident":
        raise HTTPException(status_code=403, detail="Only residents can handle visitors")
    if decision not in ["approve", "deny"]:
        raise HTTPException(status_code=400, detail="Invalid decision")
    try:
        visitor = visitors_collection.find_one({"_id": ObjectId(visitor_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid visitor ID")
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitors_collection.update_one(
        {"_id": ObjectId(visitor_id)},
        {"$set": {"status": decision, "handled_at": datetime.utcnow()}}
    )
    return {"message": f"Visitor {decision}ed"}

@app.get("/api/admin/visitors")
async def get_all_visitors(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all visitors")
    visitors = list(visitors_collection.find())
    for visitor in visitors:
        visitor["_id"] = str(visitor["_id"])
    return visitors

@app.post("/api/admin/visitors/{visitor_id}/{decision}")
async def admin_handle_visitor(
    visitor_id: str,
    decision: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admins can handle visitors")
    if decision not in ["approve", "deny"]:
        raise HTTPException(status_code=400, detail="Invalid decision")
    try:
        visitor = visitors_collection.find_one({"_id": ObjectId(visitor_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid visitor ID")
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitors_collection.update_one(
        {"_id": ObjectId(visitor_id)},
        {"$set": {"status": decision, "handled_at": datetime.utcnow()}}
    )
    return {"message": f"Visitor {decision}ed by admin"}

# Security Endpoints
@app.get("/api/security/visitors")
async def get_all_visitors_for_security(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "security":
        raise HTTPException(status_code=403, detail="Only security personnel can view visitors")
    visitors = list(visitors_collection.find())
    for visitor in visitors:
        visitor["_id"] = str(visitor["_id"])
    return visitors

@app.post("/api/security/visitors")
async def add_visitor(
    visitor: VisitorCreate,  # Updated to use Pydantic model
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "security":
        raise HTTPException(status_code=403, detail="Only security personnel can add visitors")
    visitor_data = {
        "name": visitor.name,
        "purpose": visitor.purpose,
        "status": "pending",
        "created_at": datetime.utcnow(),
    }
    result = visitors_collection.insert_one(visitor_data)
    return {"visitor_id": str(result.inserted_id)}

@app.post("/api/security/visitors/{visitor_id}/update-status")
async def update_visitor_status(
    visitor_id: str,
    status: str,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "security":
        raise HTTPException(status_code=403, detail="Only security personnel can update visitor status")
    if status not in ["entered", "exited"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    try:
        visitor = visitors_collection.find_one({"_id": ObjectId(visitor_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid visitor ID")
    if not visitor:
        raise HTTPException(status_code=404, detail="Visitor not found")
    visitors_collection.update_one(
        {"_id": ObjectId(visitor_id)},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )
    return {"message": f"Visitor status updated to {status}"}