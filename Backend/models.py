from pydantic import BaseModel, EmailStr

class UserModel(BaseModel):
    name : str
    email : EmailStr
    mobile : str
    password : str

class UserLogin(BaseModel):
    email : EmailStr
    password : str