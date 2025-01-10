from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from server.init import initiate_database
from api.v1.router import router as api_v1_router
from middleware.response import CommonResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="Celeste Talk API",
    description="FastAPI based chat application",
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory="static"), name="static")
# API版本路由
app.include_router(api_v1_router, prefix="/api/v1")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exception: HTTPException):
    return JSONResponse(
        status_code=exception.status_code,
        content={
            "code": exception.status_code,
            "msg": str(exception.detail),
            "data": None
        }
    )



@app.on_event("startup")
async def start_database():
    await initiate_database()



