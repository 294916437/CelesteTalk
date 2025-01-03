from fastapi import FastAPI
from server.init import initiate_database
from api.v1.router import router as api_v1_router

app = FastAPI(
    title="Celeste Talk API",
    description="FastAPI based chat application",
    version="1.0.0"
)

# API版本路由
app.include_router(api_v1_router, prefix="/api/v1")

@app.on_event("startup")
async def start_database():
    await initiate_database()

@app.get("/", tags=["health"])
async def read_root():
    return {"status": "healthy", "version": "1.0.0"}


