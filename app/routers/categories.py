from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_session
from crud.categories import CrudCategories

router = APIRouter(prefix="/categories", tags=["Categories"])
crud = CrudCategories()


@router.get("/", summary="Получить все категории")
def get_all(session: Session = Depends(get_session)):
    return crud.get_all(session)


@router.get("/{category_id}", summary="Получить категорию по ID")
def get(category_id: int, session: Session = Depends(get_session)):
    category = crud.get(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с ID {category_id} не найдена.",
        )
    return category


@router.post("/", status_code=status.HTTP_201_CREATED, summary="Создать категорию")
def create(name: str, session: Session = Depends(get_session)):
    try:
        return crud.create(session, name)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.patch("/{category_id}", summary="Обновить категорию")
def update(category_id: int, name: str, session: Session = Depends(get_session)):
    category = crud.update(session, category_id, name)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с ID {category_id} не найдена.",
        )
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Удалить категорию")
def delete(category_id: int, session: Session = Depends(get_session)):
    deleted = crud.delete(session, category_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Категория с ID {category_id} не найдена.",
        )
