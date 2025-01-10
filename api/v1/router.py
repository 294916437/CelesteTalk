from fastapi import APIRouter
from .endpoints import users, posts, comments, medias

router = APIRouter()

router.include_router(
    users.router,
    prefix="/users",
    tags=["users"]
)

router.include_router(
    posts.router,
    prefix="/posts",
    tags=["posts"]
)

router.include_router(
    comments.router,
    prefix="/comments",
    tags=["comments"]
)
router.include_router(
    medias.router,
    prefix="/medias",
    tags=["medias"]
)
