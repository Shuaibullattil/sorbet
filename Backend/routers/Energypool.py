import os
from .Users import create_token, decode_token
from fastapi import APIRouter, HTTPException, status, Depends, Body
from database import db
from bson import ObjectId
from models import UserModel, UserLogin, Location, UserGrid
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError,ExpiredSignatureError
from datetime import datetime, timedelta, timezone
import pytz
import calendar


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

IST = pytz.timezone('Asia/Kolkata')

Grid_Collection = db["user_grid"]
collection = db["users"]
Transaction_Collection = db["transactions"]

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

@router.post("/buy")
async def buy_energy(
    grid_id: str = Body(...),
    units: int = Body(...),
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        buyer = collection.find_one({"email": email}, {"_id": 1})
        if not buyer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        grid = Grid_Collection.find_one({"_id": ObjectId(grid_id)})
        if not grid:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grid not found",
            )
        if grid.get("units_for_sell", 0) < units:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not enough units available for sale",
            )
        # Decrement units_for_sell
        Grid_Collection.update_one(
            {"_id": ObjectId(grid_id)},
            {"$inc": {"units_for_sell": -units}}
        )
        # Insert transaction
        transaction = {
            "buyer": buyer["_id"],
            "grid": ObjectId(grid_id),
            "units": units,
            "time": datetime.now(IST),
            "status": "completed"
        }
        Transaction_Collection.insert_one(transaction)
        return {
            "message": "Purchase successful",
            "transaction": {
                "buyer": str(buyer["_id"]),
                "grid": grid_id,
                "units": units,
                "status": "completed"
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Purchase failed: {str(e)}"
        )

@router.get("/transaction_history")
async def transaction_history(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = collection.find_one({"email": email}, {"_id": 1, "name": 1})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        # Find all grids owned by the user
        user_grids = list(Grid_Collection.find({"user": user["_id"]}))
        user_grid_ids = [g["_id"] for g in user_grids]
        # Transactions where user is buyer
        tx_buyer = list(Transaction_Collection.find({"buyer": user["_id"]}))
        # Transactions where user's grid is the seller
        tx_seller = list(Transaction_Collection.find({"grid": {"$in": user_grid_ids}}))
        result = []
        total_units = 0
        total_units_sold = 0
        for tx in tx_buyer:
            grid = Grid_Collection.find_one({"_id": tx["grid"]})
            grid_name = grid.get("grid name") if grid else None

            tx_time = tx.get("time")
            if tx_time and tx_time.tzinfo is None:
                tx_time = tx_time.replace(tzinfo=timezone.utc)
            tx_time_ist = tx_time.astimezone(IST)
            time_str = tx_time_ist.isoformat()

            result.append({
                "transaction_id": str(tx["_id"]),
                "user_name": user.get("name"),
                "grid_name": grid_name,
                "units": tx.get("units", 0),
                "time": time_str,
                "status": tx.get("status"),
                "role": "bought"
            })
            total_units += tx.get("units", 0)
        for tx in tx_seller:
            # Avoid duplicate if user bought from own grid
            if tx["buyer"] == user["_id"]:
                continue
            buyer_doc = collection.find_one({"_id": tx["buyer"]})
            buyer_name = buyer_doc.get("name") if buyer_doc else None
            grid = Grid_Collection.find_one({"_id": tx["grid"]})
            grid_name = grid.get("grid name") if grid else None
            result.append({
                "transaction_id": str(tx["_id"]),
                "user_name": buyer_name,
                "grid_name": grid_name,
                "units": tx.get("units", 0),
                "time": tx.get("time"),
                "status": tx.get("status"),
                "role": "sold"
            })
            total_units_sold += tx.get("units", 0)
        return {
            "transactions": result,
            "total_transactions": len(result),
            "total_units_bought": total_units,
            "total_units_sold": total_units_sold
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to fetch transaction history: {str(e)}"
        )
        
@router.get("/monthly_energy_summary")
async def monthly_energy_summary(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")

        user = collection.find_one({"email": email}, {"_id": 1})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user_id = user["_id"]

        # Find all grids owned by this user
        user_grids = list(Grid_Collection.find({"user": user_id}))
        user_grid_ids = [g["_id"] for g in user_grids]

        # Fetch all transactions where user is buyer or grid belongs to user (seller)
        transactions = list(Transaction_Collection.find({
            "$or": [
                {"buyer": user_id},
                {"grid": {"$in": user_grid_ids}}
            ]
        }))

        # Prepare month-wise data
        monthly_data = {month: {"bought": 0, "sold": 0} for month in range(1, 13)}

        for tx in transactions:
            tx_time = tx.get("time")
            if not tx_time:
                continue

            # Convert UTC datetime to IST
            tx_time_ist = tx_time.astimezone(datetime.now().astimezone().tzinfo)  # Converts to local system tz
            month = tx_time_ist.month

            if tx.get("buyer") == user_id:
                # User bought
                monthly_data[month]["bought"] += tx.get("units", 0)

            elif tx.get("grid") in user_grid_ids and tx.get("buyer") != user_id:
                # User sold (grid was seller)
                monthly_data[month]["sold"] += tx.get("units", 0)

        # Prepare final output list
        result = []
        for month_num in range(1, 13):
            month_name = calendar.month_abbr[month_num]
            result.append({
                "month": month_name,
                "bought": monthly_data[month_num]["bought"],
                "sold": monthly_data[month_num]["sold"]
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch monthly summary: {str(e)}")