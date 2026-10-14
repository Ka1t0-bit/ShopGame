from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from crud.products import CrudProducts
from database import get_session
from schemas.products import ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])
crud = CrudProducts()


@router.get("/", response_model=list[ProductResponse], summary="Получить все товары")
def get_all(session: Session = Depends(get_session)):
    return crud.get_all(session)


@router.get("/{product_id}", response_model=ProductResponse, summary="Получить товар по ID")
def get(product_id: int, session: Session = Depends(get_session)):
    product = crud.get(session, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {product_id} не найден.",
        )
    return product


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Создать товар",
)
def create(
    name: str,
    description: str,
    stock: int,
    raiting: float,
    comment: str,
    supplier: str,
    price: float,
    category_id: int,
    image_url: str = "-",
    session: Session = Depends(get_session),
):
    product = crud.create(
        session,
        name=name,
        description=description,
        image_url=image_url,
        stock=stock,
        raiting=raiting,
        comment=comment,
        supplier=supplier,
        price=price,
        category_id=category_id,
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Товар с именем '{name}' от поставщика '{supplier}' уже существует.",
        )
    return product


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Обновить товар",
)
def update(
    product_id: int,
    name: str | None = None,
    description: str | None = None,
    image_url: str | None = None,
    stock: int | None = None,
    raiting: float | None = None,
    comment: str | None = None,
    supplier: str | None = None,
    price: float | None = None,
    category_id: int | None = None,
    session: Session = Depends(get_session),
):
    product = crud.update(
        session,
        product_id,
        name=name,
        description=description,
        image_url=image_url,
        stock=stock,
        raiting=raiting,
        comment=comment,
        supplier=supplier,
        price=price,
        category_id=category_id,
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {product_id} не найден.",
        )
    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Удалить товар",
)
def delete(product_id: int, session: Session = Depends(get_session)):
    deleted = crud.delete(session, product_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Товар с ID {product_id} не найден.",
        )
