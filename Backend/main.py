from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import Users, Grids, Energypool

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (use ["http://localhost:3000"] for security)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.include_router(Users.router)
app.include_router(Grids.router)
app.include_router(Energypool.router)

@app.get("/")
async def root():
    return {"message" : "Hello from the backend"}

