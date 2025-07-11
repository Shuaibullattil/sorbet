import os
from .Users import create_token, decode_token
from fastapi import APIRouter, HTTPException, status, Depends, Body
from database import db
from bson import ObjectId
from models import UserModel, UserLogin, Location, UserGrid
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError,ExpiredSignatureError
from datetime import datetime, timedelta

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

Grid_Collection = db["user_grid"]
collection = db["users"]

router = APIRouter(prefix="/energypool", tags=["energypool"])

def convert_id(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def get_available_units(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = collection.find_one({"email": email}, {"_id": 1})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user_id = user["_id"]
        grids = Grid_Collection.find({"units_for_sell": {"$gt": 0}, "user": {"$ne": user_id}})
        result = []
        for grid in grids:
            grid_data = convert_id(grid)
            user_id_grid = grid_data.get("user")
            user_name = None
            if user_id_grid:
                user_doc = collection.find_one({"_id": ObjectId(user_id_grid)})
                if user_doc:
                    user_name = user_doc.get("name")
            result.append({
                "grid_id": grid_data["_id"],
                "grid_name": grid_data.get("grid name"),
                "location": grid_data.get("location"),
                "units_for_sell": grid_data.get("units_for_sell", 0),
                "user": str(user_id_grid),
                "user_name": user_name,
            })
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authorization failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )