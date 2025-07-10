from fastapi import FastAPI
from routers import Users

app = FastAPI()

app.include_router(Users.router)

@app.get("/")
async def root():
    return {"message" : "Hello from the backend"}

