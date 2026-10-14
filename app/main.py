import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models import Base
from routers.categories import router as categories_router
from routers.products import router as products_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Создаём таблицы при старте
    Base.metadata.create_all(bind=engine)
    print("Таблицы успешно созданы в БД!")
    yield


app = FastAPI(
    title="ShopGame API",
    description="REST API для игрового магазина GameVault",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — читаем из env, чтобы работало и локально, и в Docker
_ORIGINS_ENV = os.getenv("CORS_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS = [o.strip() for o in _ORIGINS_ENV.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories_router)
app.include_router(products_router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "ShopGame API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)