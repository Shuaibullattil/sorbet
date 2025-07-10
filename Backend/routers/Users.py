from fastapi import APIRouter
from database import db
from bson import ObjectId
from models import UserModel
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(prefix="/user", tags=["users"])
collection = db["users"]

def convert_id(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def list_users():
    users = collection.find()
    users = list(users)
    users = [convert_id(user) for user in users]
    return users

def hash_password(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/add")
async def add_user(request: UserModel):
    pwd = hash_password(request.password)
    user = {
        'name' : request.name,
        'email' : request.email,
        'mobile' : request.mobile,
        'password' : pwd
    }
    collection.insert_one(user)

