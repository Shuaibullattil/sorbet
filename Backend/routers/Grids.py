import os
from .Users import create_token, decode_token
from fastapi import APIRouter, HTTPException, status, Depends
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

router = APIRouter(prefix="/grid", tags=["grids"])

def convert_id(doc):
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/")
async def list_grids():
    grids = Grid_Collection.find()
    grids = list(grids)
    grids = [convert_id(grid) for grid in grids]
    return grids

@router.post("/insert_new")
async def insert_new_grid(grid: UserGrid,token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    userid = collection.find_one({"email": email}, {"_id": 1, "name": 0, "email": 0, "mobile": 0, "password": 0})
    new_grid = {
        "grid name": grid.grid_name,
        "user": ObjectId(userid["_id"]),
        "location": {
            "latitude": grid.location.latitude,
            "longitude": grid.location.longitude
            },
        "units": grid.units,
        "available": grid.available
        }
    result = Grid_Collection.insert_one(new_grid)
    return {
        "message": "Grid inserted successfully",
        "grid_id": str(result.inserted_id)
    }
    
@router.get("/get_user_grid")
async def get_user_grid(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = collection.find_one({"email": email}, {"_id": 1, "name": 0, "email": 0, "mobile": 0, "password": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found")
    grid = Grid_Collection.find_one({"user": ObjectId(user["_id"])})
    if not grid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grid not found for this user"
        )
    grid["_id"] = str(grid["_id"])
    grid["user"] = str(grid["user"])
    return grid

@router.post("/update_units")
async def update_units(units: int, token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = collection.find_one({"email": email}, {"_id": 1, "name": 0, "email": 0, "mobile": 0, "password": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    grid = Grid_Collection.find_one({"user": ObjectId(user["_id"])})
    if not grid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Grid not found for this user"
        )
    Grid_Collection.update_one(
        {"_id": grid["_id"]},
        {"$set": {"units": units}})
    return {"message": "Units updated successfully", "units": units}    
    


