import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# В Docker: DATABASE_URL задаётся через env (например, sqlite:////data/shop.db)
# Локально: файл shop.db лежит в корне проекта
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'shop.db')}"
)

engine = create_engine(
    DATABASE_URL,
    echo=False,  # отключаем verbose SQL в продакшне
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def get_session() -> Generator[Session, None, None]:
    """Зависимость FastAPI: открывает сессию и закрывает после запроса."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
