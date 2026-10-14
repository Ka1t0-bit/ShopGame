# 🎮 ShopGame — GameVault

> Полнофункциональный интернет-магазин игр с FastAPI-бэкендом и Next.js-фронтендом.

![Tech Stack](https://img.shields.io/badge/Backend-FastAPI%20%2B%20SQLite-009688?style=flat-square&logo=fastapi)
![Tech Stack](https://img.shields.io/badge/Frontend-Next.js%2016%20%2B%20TypeScript-000000?style=flat-square&logo=next.js)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

---

## 📐 Архитектура проекта

```
ShopGame/
├── app/                          # 🐍 FastAPI бэкенд
│   ├── main.py                   # Точка входа, CORS, lifespan
│   ├── database.py               # SQLAlchemy engine + сессия
│   ├── products.py               # (устаревший дубль, не используется)
│   ├── models/
│   │   ├── __init__.py           # Экспорт Base, Category, Product
│   │   ├── base.py               # DeclarativeBase
│   │   ├── categories.py         # ORM модель Category
│   │   └── products.py           # ORM модель Product
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── products.py           # Pydantic схемы (Create/Update/Response)
│   ├── crud/
│   │   ├── categories.py         # CRUD для категорий
│   │   └── products.py           # CRUD для товаров
│   └── routers/
│       ├── __init__.py
│       ├── categories.py         # REST роутер /categories
│       └── products.py           # REST роутер /products
├── frontend/                     # ⚛️ Next.js 16 фронтенд
│   ├── src/app/
│   │   ├── layout.tsx            # Root layout, SEO meta
│   │   ├── page.tsx              # Главная страница (каталог)
│   │   └── globals.css           # Design system, анимации
│   ├── public/
│   │   ├── hero_banner.png       # Баннер главной страницы
│   │   ├── game_action.png       # Картинки категорий
│   │   └── ...
│   ├── next.config.ts            # Next.js config (standalone output)
│   ├── .env.local                # Локальный env (не в git)
│   └── .env.docker               # Docker env пример
├── Dockerfile.backend            # 🐳 Docker образ FastAPI
├── Dockerfile.frontend           # 🐳 Docker образ Next.js (multi-stage)
├── docker-compose.yml            # 🎼 Оркестровка обоих сервисов
├── requirements.txt              # Python зависимости
├── shop.db                       # SQLite база (создаётся автоматически)
└── README.md                     # Этот файл
```

---

## 🗄️ Схема базы данных

```
┌─────────────────────┐          ┌──────────────────────────────────────┐
│     categories      │          │              products                 │
├─────────────────────┤          ├──────────────────────────────────────┤
│ id        INTEGER PK│◄────┐    │ id          INTEGER PK AUTOINCREMENT │
│ name      STRING    │     │    │ name        STRING(255) NOT NULL      │
└─────────────────────┘     │    │ description STRING NOT NULL           │
                             │    │ image_url   STRING NOT NULL           │
                             │    │ stock       INTEGER DEFAULT 0         │
                             │    │ raiting     FLOAT DEFAULT 0.0         │
                             │    │ comment     STRING DEFAULT ""         │
                             │    │ supplier    STRING(255) NOT NULL      │
                             │    │ price       FLOAT NOT NULL            │
                             └────│ category_id INTEGER FK→categories.id │
                                  └──────────────────────────────────────┘
```

**Связь:** `Category` 1 → N `Product` (CASCADE DELETE — удаление категории удаляет все её товары)

---

## 🔌 REST API

Swagger UI: **http://localhost:8000/docs**  
ReDoc: **http://localhost:8000/redoc**

### Categories `/categories`

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/categories/` | Получить все категории |
| `GET` | `/categories/{id}` | Получить категорию по ID |
| `POST` | `/categories/?name=...` | Создать категорию |
| `PATCH` | `/categories/{id}?name=...` | Обновить название |
| `DELETE` | `/categories/{id}` | Удалить категорию (и все товары) |

### Products `/products`

| Метод | URL | Описание |
|-------|-----|----------|
| `GET` | `/products/` | Получить все товары |
| `GET` | `/products/{id}` | Получить товар по ID |
| `POST` | `/products/` | Создать товар |
| `PATCH` | `/products/{id}` | Обновить поля товара |
| `DELETE` | `/products/{id}` | Удалить товар |

#### Поля товара (POST `/products/`)

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `name` | string | ✅ | Название игры |
| `description` | string | ✅ | Описание |
| `price` | float > 0 | ✅ | Цена в рублях |
| `category_id` | int | ✅ | ID категории |
| `supplier` | string | ✅ | Поставщик/издатель |
| `stock` | int ≥ 0 | ✅ | Количество на складе |
| `raiting` | float 0–5 | ✅ | Рейтинг |
| `comment` | string | ✅ | Комментарий |
| `image_url` | string | ❌ | URL изображения (дефолт: `"-"`) |

---

## 🚀 Запуск через Docker Compose (рекомендуется)

### Предварительные требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20 (входит в Docker Desktop)

### Шаги

```bash
# 1. Клонируй репозиторий
git clone https://github.com/Ka1t0-bit/ShopGame.git
cd ShopGame

# 2. Собери и запусти оба контейнера
docker compose up --build

# Или в фоновом режиме:
docker compose up --build -d
```

После запуска:

| Сервис | URL |
|--------|-----|
| 🎮 Фронтенд (GameVault) | http://localhost:3000 |
| 🔧 Бэкенд API | http://localhost:8000 |
| 📖 Swagger UI | http://localhost:8000/docs |

### Управление

```bash
# Посмотреть логи
docker compose logs -f

# Только логи бэкенда
docker compose logs -f backend

# Остановить
docker compose down

# Остановить и удалить базу данных (volume)
docker compose down -v
```

### Схема Docker Compose

```
┌─────────────────────────────────────────────────────────┐
│                   Docker Network                         │
│                  (shopgame-network)                      │
│                                                          │
│  ┌────────────────────┐    ┌───────────────────────┐    │
│  │   backend:8000     │    │   frontend:3000        │    │
│  │   (FastAPI)        │◄───│   (Next.js SSR)        │    │
│  │                    │    │                        │    │
│  │  SQLite /data/     │    │  NEXT_PUBLIC_API_URL   │    │
│  │  shop.db           │    │  = http://localhost:8000│   │
│  └────────┬───────────┘    └────────────┬───────────┘    │
│           │ volume                      │                 │
└───────────┼─────────────────────────────┼─────────────────┘
            │                             │
     ┌──────▼──────┐             ┌────────▼────────┐
     │  db_data    │             │  Host Browser   │
     │  (volume)   │             │  localhost:3000 │
     └─────────────┘             └─────────────────┘
```

> **Примечание:** `NEXT_PUBLIC_API_URL=http://localhost:8000` — это адрес,
> по которому **браузер пользователя** обращается к бэкенду, а не контейнер к контейнеру.

---

## 💻 Локальная разработка (без Docker)

### Бэкенд

```bash
# 1. Создай виртуальное окружение
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

# 2. Установи зависимости
pip install -r requirements.txt

# 3. Запусти сервер (из папки app/)
cd app
python main.py
# Или через uvicorn с hot-reload:
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Фронтенд

```bash
cd frontend

# Установи зависимости
npm install

# Создай файл переменных (если не создан)
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Запусти dev-сервер
npm run dev
```

### Добавление тестовых данных

После запуска бэкенда создай категории и товары через Swagger UI:

1. Открой **http://localhost:8000/docs**
2. Раздел **Categories** → `POST /categories/` → создай категории:
   - `Экшн`, `RPG`, `Шутеры`, `Стратегии`, `Приключения`
3. Раздел **Products** → `POST /products/` → добавь товары

---

## ⚙️ Переменные окружения

### Backend

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|----------|
| `DATABASE_URL` | `sqlite:///./shop.db` | URL подключения к БД |
| `CORS_ORIGINS` | `http://localhost:3000` | Разрешённые CORS-источники (через запятую) |

### Frontend

| Переменная | Значение по умолчанию | Описание |
|------------|----------------------|----------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL бэкенд API |

---

## 🧪 Тестирование

### Проверка бэкенда

```bash
# Health check
curl http://localhost:8000/

# Получить все категории
curl http://localhost:8000/categories/

# Получить все товары
curl http://localhost:8000/products/

# Создать категорию
curl -X POST "http://localhost:8000/categories/?name=Экшн"

# Создать товар
curl -X POST "http://localhost:8000/products/?name=Cyberpunk+2077&description=RPG+от+CD+Projekt&price=1999&category_id=1&supplier=CD+Projekt&stock=50&raiting=4.5&comment=Хит"
```

### Проверка фронтенда

1. Открой http://localhost:3000
2. Категории и карточки игр должны загрузиться из бэкенда
3. Фильтрация по категориям работает
4. Клик по карточке открывает модальное окно с деталями

---

## 🐛 Типичные проблемы

| Проблема | Причина | Решение |
|----------|---------|---------|
| `CORS error` в консоли браузера | Бэкенд не принимает запросы с фронтенда | Проверь `CORS_ORIGINS` в env |
| Белый экран / товары не загружаются | Бэкенд недоступен | Убедись что `docker compose up` запущен |
| `Port 8000 already in use` | Порт занят другим процессом | `docker compose down` или смени порт |
| `Port 3000 already in use` | Порт занят | Аналогично |
| Карточки без картинок | `image_url` не задан или `-` | Задай URL при создании товара |
| БД пустая | База создалась но данных нет | Добавь данные через Swagger |

---

## 🏗️ Стек технологий

| Слой | Технология | Версия |
|------|-----------|--------|
| Backend Framework | FastAPI | 0.115 |
| Backend Server | Uvicorn | 0.32 |
| ORM | SQLAlchemy | 2.0 |
| Validation | Pydantic | 2.10 |
| Database | SQLite | 3.x |
| Frontend Framework | Next.js | 16 |
| UI Language | TypeScript | 5.x |
| Styling | Vanilla CSS + Tailwind | 4.x |
| Containerization | Docker + Compose | 24+ |

---

## 📄 Лицензия

MIT © 2024 GameVault
