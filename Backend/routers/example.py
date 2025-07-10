from fastapi import APIRouter
from database import db
from bson import ObjectId

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