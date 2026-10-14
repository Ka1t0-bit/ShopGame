# 🔌 Подключение бэкенда к фронтенду — ShopGame

> **Цель:** Заменить статический массив `CATEGORIES` в `page.tsx` на живые данные из твоей FastAPI базы данных.

---

## 📋 Что уже есть

| Компонент | Файл | Описание |
|-----------|------|----------|
| **API эндпоинт** | `app/routers/categories.py` | `GET /categories/` — возвращает все категории |
| **CRUD** | `app/crud/categories.py` | Работает с БД через SQLAlchemy |
| **БД** | `shop.db` | SQLite, путь прописан в `database.py` |
| **Фронтенд** | `frontend/src/app/page.tsx` | Сейчас данные захардкожены в `CATEGORIES[]` |

---

## ⚙️ Шаг 1 — Включи CORS в FastAPI

Без этого браузер заблокирует запросы с `localhost:3000` на `localhost:8000`.

Открой `app/main.py` и добавь middleware:

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware   # добавь этот импорт

from database import engine
from models import Base
from routers import categories_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("Таблицы успешно созданы в БД!")
    yield


app = FastAPI(title="ShopGame API", lifespan=lifespan)

# Добавь этот блок ДО include_router
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # адрес Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(categories_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

> ⚠️ Перезапусти бэкенд после сохранения (`Ctrl+C` → `python main.py`).

---

## 🧪 Шаг 2 — Проверь, что API отдаёт данные

Открой браузер и перейди по адресу:

```
http://localhost:8000/categories/
```

Ты должен увидеть JSON-массив вида:

```json
[
  { "id": 1, "name": "Экшн" },
  { "id": 2, "name": "RPG" }
]
```

> ⚠️ Если массив **пустой `[]`** — добавь категории через Swagger UI:
> `http://localhost:8000/docs` → раздел **Categories** → `POST /categories/`

---

## 💻 Шаг 3 — Обнови `frontend/src/app/page.tsx`

### 3.1 — Добавь импорт `useEffect`

Найди строку в начале файла:
```typescript
import { useState } from "react";
```
Замени на:
```typescript
import { useState, useEffect } from "react";
```

---

### 3.2 — Добавь тип `CategoryFromAPI`

Найди существующий интерфейс `Category` и добавь ПЕРЕД ним новый:

```typescript
// Тип, который приходит с бэкенда
interface CategoryFromAPI {
  id: number;
  name: string;
}

// Существующий интерфейс оставь без изменений
interface Category {
  id: string;
  label: string;
  icon: string;
  count: number;
}
```

---

### 3.3 — Удали статический массив `CATEGORIES`

Найди и **полностью удали** этот блок:
```typescript
const CATEGORIES: Category[] = [
  { id: "all", label: "Все игры", icon: "🎮", count: 248 },
  { id: "action", label: "Экшн", icon: "⚔️", count: 64 },
  { id: "rpg", label: "RPG", icon: "🐉", count: 48 },
  { id: "shooter", label: "Шутеры", icon: "🔫", count: 52 },
  { id: "strategy", label: "Стратегии", icon: "🏰", count: 37 },
  { id: "adventure", label: "Приключения", icon: "🗺️", count: 47 },
];
```

---

### 3.4 — Добавь словарь иконок

Сразу на место удалённого массива вставь:
```typescript
const CATEGORY_ICONS: Record<string, string> = {
  "Экшн":        "⚔️",
  "RPG":         "🐉",
  "Шутеры":      "🔫",
  "Стратегии":   "🏰",
  "Приключения": "🗺️",
};
```

---

### 3.5 — Обнови функцию `HomePage` — добавь загрузку данных

Найди начало функции `HomePage` (строка ~696):

**Было:**
```typescript
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredGames = ...
```

**Стало:**
```typescript
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  // --- новые состояния ---
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", label: "Все игры", icon: "🎮", count: 0 },
  ]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/categories/")
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки категорий");
        return res.json();
      })
      .then((data: CategoryFromAPI[]) => {
        const uiCategories: Category[] = [
          { id: "all", label: "Все игры", icon: "🎮", count: GAMES.length },
          ...data.map((cat) => ({
            id: String(cat.id),
            label: cat.name,
            icon: CATEGORY_ICONS[cat.name] ?? "🎮",
            count: GAMES.filter((g) => g.category === String(cat.id)).length,
          })),
        ];
        setCategories(uiCategories);
      })
      .catch((err) => console.error("Не удалось загрузить категории:", err))
      .finally(() => setLoadingCategories(false));
  }, []);
  // --- конец нового блока ---

  const filteredGames =
    activeCategory === "all"
      ? GAMES
      : GAMES.filter((g) => g.category === activeCategory);

  // ... return без изменений
```

---

### 3.6 — Обнови рендер фильтра категорий

Найди блок `{/* Categories filter */}` (строка ~792).

**Было:**
```tsx
{CATEGORIES.map((cat) => (
  <button
    key={cat.id}
    id={`category-${cat.id}`}
    role="tab"
    aria-selected={activeCategory === cat.id}
    onClick={() => setActiveCategory(cat.id)}
    className={`category-badge ${activeCategory === cat.id ? "active" : ""}`}
  >
    <span>{cat.icon}</span>
    <span>{cat.label}</span>
    <span style={{ ... }}>{cat.count}</span>
  </button>
))}
```

**Стало:**
```tsx
{loadingCategories ? (
  <span style={{ color: "#94a3b8", fontSize: 14 }}>
    Загрузка категорий...
  </span>
) : (
  categories.map((cat) => (
    <button
      key={cat.id}
      id={`category-${cat.id}`}
      role="tab"
      aria-selected={activeCategory === cat.id}
      onClick={() => setActiveCategory(cat.id)}
      className={`category-badge ${activeCategory === cat.id ? "active" : ""}`}
    >
      <span>{cat.icon}</span>
      <span>{cat.label}</span>
      <span
        style={{
          background:
            activeCategory === cat.id
              ? "rgba(255,255,255,0.2)"
              : "rgba(255,255,255,0.07)",
          borderRadius: 100,
          padding: "1px 7px",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {cat.count}
      </span>
    </button>
  ))
)}
```

---

## ✅ Итоговый чеклист изменений

```
ShopGame/
├── app/
│   └── main.py
│       [+] import CORSMiddleware
│       [+] app.add_middleware(CORSMiddleware, ...)
│
└── frontend/src/app/
    └── page.tsx
        [+] import useEffect
        [+] interface CategoryFromAPI
        [-] const CATEGORIES = [...]   ← удалить
        [+] const CATEGORY_ICONS = {...}
        HomePage()
          [+] useState: categories
          [+] useState: loadingCategories
          [+] useEffect → fetch("http://localhost:8000/categories/")
          [~] categories-filter рендерит categories из state
```

---

## 🚀 Финальная проверка

После всех изменений убедись что:

1. **Бэкенд запущен:** `python main.py` в папке `app/` → `http://localhost:8000`
2. **Фронтенд запущен:** `npm run dev` в папке `frontend/` → `http://localhost:3000`
3. **В БД есть категории:** `http://localhost:8000/categories/` не пустой
4. **Нет CORS-ошибок:** DevTools (F12) → Console — нет красных `CORS`
5. **Категории видны** на странице в блоке фильтрации

---

## 🐛 Частые проблемы

| Проблема | Причина | Решение |
|----------|---------|---------|
| `CORS error` в консоли браузера | Нет CORSMiddleware | Повтори Шаг 1 и перезапусти бэкенд |
| Категории не загружаются | БД пустая | Добавь через `http://localhost:8000/docs` |
| `useEffect is not defined` | Не добавлен в импорт | Шаг 3.1 |
| `fetch` возвращает 500 | Ошибка в Python | Смотри логи терминала бэкенда |
| Фильтр не работает после загрузки | Неверный `id` категории | Убедись, что `g.category === String(cat.id)` |

---

> 💡 **Следующий шаг:** Аналогично подключи `/products/` — тогда карточки игр (`GAMES`) тоже будут браться из БД, а не из захардкоженного массива.
