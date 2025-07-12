from pydantic import BaseModel, EmailStr
from bson import ObjectId

class UserModel(BaseModel):
    name : str
    email : EmailStr
    mobile : str
    password : str

class UserLogin(BaseModel):
    email : EmailStr
    password : str

class Location(BaseModel):
    latitude: float
    longitude: float
    
class UserGrid(BaseModel):
    grid_name: str
    location: Location
    units : int
    available: bool = True
    units_for_sell: int = 0
    station: bool = False
    ports: list[str] = []
    

    
    