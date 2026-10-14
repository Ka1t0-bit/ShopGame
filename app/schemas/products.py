from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str
    description: str
    image_url: str
    stock: int = Field(ge=0)
    raiting: float = Field(ge=0, le=5)
    comment: str
    supplier: str
    price: float = Field(gt=0)
    category_id: int


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    raiting: float | None = Field(default=None, ge=0, le=5)
    comment: str | None = None
    supplier: str | None = None
    price: float | None = Field(default=None, gt=0)
    category_id: int | None = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    image_url: str
    stock: int
    raiting: float
    comment: str
    supplier: str
    price: float
    category_id: int

    model_config = {"from_attributes": True}
