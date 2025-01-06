from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException
from fastapi.responses import JSONResponse
from server.init import initiate_database
from api.v1.router import router as api_v1_router
from middleware.response import CommonResponse
app = FastAPI(
    title="Celeste Talk API",
    description="FastAPI based chat application",
    version="1.0.0"
)

# API版本路由
app.include_router(api_v1_router, prefix="/api/v1")

# HTTP异常处理
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exception: HTTPException):
    return JSONResponse(
        status_code=exception.status_code,
        content=CommonResponse(
            code=exception.status_code,
            message=str(exception.detail),
            data=None
        ).model_dump()
    )


@app.on_event("startup")
async def start_database():
    await initiate_database()



