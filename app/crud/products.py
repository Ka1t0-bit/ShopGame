from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Product


class CrudProducts:
    def get_all(self, session: Session) -> list[Product]:
        return session.execute(select(Product)).scalars().all()

    def get(self, session: Session, product_id: int) -> Product | None:
        return session.get(Product, product_id)

    def create(
        self,
        session: Session,
        name: str,
        description: str,
        image_url: str,
        stock: int,
        raiting: float,
        comment: str,
        supplier: str,
        price: float,
        category_id: int,
    ) -> Product | None:
        existing = session.scalar(
            select(Product).where(
                Product.name == name,
                Product.supplier == supplier,
            )
        )
        if existing:
            return None

        product = Product(
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
        session.add(product)
        session.commit()
        session.refresh(product)
        return product

    def update(
        self,
        session: Session,
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
    ) -> Product | None:
        product = session.get(Product, product_id)
        if product is None:
            return None

        fields = {
            "name": name,
            "description": description,
            "image_url": image_url,
            "stock": stock,
            "raiting": raiting,
            "comment": comment,
            "supplier": supplier,
            "price": price,
            "category_id": category_id,
        }
        for field, value in fields.items():
            if value is not None:
                setattr(product, field, value)

        session.commit()
        session.refresh(product)
        return product

    def delete(self, session: Session, product_id: int) -> bool:
        product = session.get(Product, product_id)
        if product:
            session.delete(product)
            session.commit()
            return True
        return False
