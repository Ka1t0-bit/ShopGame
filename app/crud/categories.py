from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Category


class CrudCategories:
    def get_all(self, session: Session):
        return session.execute(select(Category)).scalars().all()
    
    def get(self, session: Session, category_id: int):
        return session.get(Category, category_id)
    
    def create(self, session: Session, name: str):
        try:
            existing = session.execute(
                select(Category).where(Category.name == name)
            ).scalar_one_or_none()
            if existing:
                raise ValueError(f"Категория с именем '{name}' уже существует.")
            category = Category(name=name)
            session.add(category)
            session.commit()
            session.refresh(category)
            return category
        except ValueError:
            raise
        except Exception as e:
            session.rollback()
            raise RuntimeError(f"Ошибка при создании категории: {e}") from e
    
    def delete(self, session: Session, category_id: int):
        category = session.get(Category, category_id)
        if category:
            session.delete(category)
            session.commit()
            return True
        return False
    
    def update(self, session: Session, category_id: int, name: str):
        category = session.get(Category, category_id)
        if category:
            category.name = name
            session.commit()
            session.refresh(category)
            return category
        return False