"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Game {
  id: number;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  image: string | null;
  platforms: string[];
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
  stock?: number;
  description?: string;
  supplier?: string;
}

// Тип, который приходит с бэкенда (категории)
interface CategoryFromAPI {
  id: number;
  name: string;
}

// Тип, который приходит с бэкенда (товары)
interface ProductFromAPI {
  id: number;
  name: string;
  description: string;
  image_url: string;
  stock: number;
  raiting: number;
  comment: string;
  supplier: string;
  price: number;
  category_id: number;
}

// Существующий интерфейс оставь без изменений
interface Category {
  id: string;
  label: string;
  icon: string;
  count: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  "Экшн":        "⚔️",
  "RPG":         "🐉",
  "Шутеры":      "🔫",
  "Стратегии":   "🏰",
  "Приключения": "🗺️",
};

// Маппинг продукта с API на Game
// image_url "-" или пустая строка = нет фото
function mapProductToGame(p: ProductFromAPI): Game {
  const hasImage = p.image_url && p.image_url.trim() !== "" && p.image_url.trim() !== "-";
  return {
    id: p.id,
    title: p.name,
    category: String(p.category_id),
    price: p.price,
    rating: p.raiting,
    reviews: 0,
    image: hasImage ? p.image_url : null,
    platforms: [],
    stock: p.stock,
    description: p.description,
    supplier: p.supplier,
  };
}



// ─── Subcomponents ────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? "#fbbf24" : "rgba(255,255,255,0.15)"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 2 }}>
        {rating} ({rating >= 1000 ? `${(rating / 1000).toFixed(1)}k` : rating})
      </span>
    </div>
  );
}

function GameCard({ game, onClick }: { game: Game; onClick?: () => void }) {
  const [wished, setWished] = useState(false);

  return (
    <article 
      className="game-card" 
      style={{ display: "flex", flexDirection: "column", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        {game.image ? (
          <Image
            src={game.image}
            alt={game.title}
            fill
            style={{ objectFit: "cover", transition: "transform 0.5s ease" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="game-card-img"
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg, #1e1b3a 0%, #0f172a 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 48, opacity: 0.4 }}>🎮</span>
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>Нет изображения</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, rgba(8,11,20,0.85) 0%, transparent 60%)",
          }}
        />

        {/* Badges top */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            {game.isNew && (
              <span
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                  letterSpacing: "0.5px",
                }}
              >
                НОВИНКА
              </span>
            )}
            {game.isHot && (
              <span
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                  letterSpacing: "0.5px",
                }}
              >
                🔥 ХИТ
              </span>
            )}
            {game.discount && (
              <span className="discount-badge">-{game.discount}%</span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            id={`wishlist-${game.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setWished(!wished);
            }}
            style={{
              background: wished
                ? "rgba(236, 72, 153, 0.25)"
                : "rgba(0,0,0,0.4)",
              border: wished
                ? "1px solid rgba(236, 72, 153, 0.5)"
                : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backdropFilter: "blur(8px)",
            }}
            aria-label={wished ? "Убрать из избранного" : "Добавить в избранное"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={wished ? "#ec4899" : "none"}
              stroke={wished ? "#ec4899" : "white"}
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>

        {/* Platforms bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            display: "flex",
            gap: 6,
            zIndex: 2,
          }}
        >
          {game.platforms.map((p) => (
            <span key={p} className="platform-badge">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          flex: 1,
          position: "relative",
          zIndex: 2,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#f1f5f9",
            lineHeight: 1.3,
          }}
        >
          {game.title}
        </h3>

        <StarRating rating={game.rating} />

        {/* Price + Buy */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="price-tag">₽{game.price.toLocaleString()}</span>
            {game.oldPrice && (
              <span
                style={{
                  color: "#475569",
                  fontSize: 13,
                  textDecoration: "line-through",
                }}
              >
                ₽{game.oldPrice.toLocaleString()}
              </span>
            )}
          </div>
          <button
            id={`buy-${game.id}`}
            className="btn-buy"
            aria-label={`Купить ${game.title}`}
          >
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header className="navbar">
      <nav
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        {/* Logo */}
        <a
          href="/"
          id="nav-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
            }}
          >
            🎮
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
            className="text-gradient"
          >
            GameVault
          </span>
        </a>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {["Каталог", "Распродажа", "Новинки", "Топ игр"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                padding: "6px 14px",
                borderRadius: 8,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#f1f5f9";
                (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#94a3b8";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id="search-input"
              className="search-input"
              type="search"
              placeholder="Поиск игр..."
              aria-label="Поиск игр"
            />
          </div>

          {/* Cart */}
          <button
            id="cart-button"
            style={{
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: 10,
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.25)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 92, 246, 0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.15)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(139, 92, 246, 0.3)";
            }}
            aria-label="Корзина"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            {/* Badge */}
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              3
            </span>
          </button>
        </div>
      </nav>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ gamesCount, totalStock, avgRating }: { gamesCount: number, totalStock: number, avgRating: number }) {
  return (
    <section className="hero-section" aria-label="Главный баннер">
      {/* Background image */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Image
          src="/hero_banner.png"
          alt="GameVault — магазин игр"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      {/* Gradient overlay handled by ::after in CSS */}

      {/* Ambient orbs */}
      <div
        className="orb"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #8b5cf6, transparent)",
          top: -100,
          right: "10%",
          animationDelay: "0s",
        }}
      />
      <div
        className="orb"
        style={{
          width: 300,
          height: 300,
          background: "radial-gradient(circle, #3b82f6, transparent)",
          bottom: -50,
          right: "30%",
          animationDelay: "3s",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 24px",
          width: "100%",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          {/* Tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(139, 92, 246, 0.15)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 24,
              fontSize: 13,
              fontWeight: 600,
              color: "#a78bfa",
            }}
          >
            <span style={{ width: 8, height: 8, background: "#8b5cf6", borderRadius: "50%", display: "block", boxShadow: "0 0 8px #8b5cf6" }} />
            🔥 Распродажа до -70%
          </div>

          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              marginBottom: 20,
              color: "#f1f5f9",
            }}
          >
            Твой мир{" "}
            <span className="text-gradient">игровых</span>
            <br />
            приключений
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "#94a3b8",
              lineHeight: 1.7,
              marginBottom: 36,
            }}
          >
            Более <strong style={{ color: "#f1f5f9" }}>{gamesCount} игр</strong> по лучшим ценам.
            Мгновенная доставка, гарантия качества и поддержка 24/7.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <button
              id="hero-cta-catalog"
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.25s ease",
                boxShadow: "0 8px 30px rgba(139, 92, 246, 0.4)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.03)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.4)";
              }}
            >
              Смотреть каталог →
            </button>
            <button
              id="hero-cta-deals"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#f1f5f9",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 12,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.25s ease",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.25)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
              }}
            >
              Акции дня
            </button>
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 48,
              paddingTop: 32,
              borderTop: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {[
              { value: `${gamesCount}+`, label: "Игр в каталоге" },
              { value: totalStock >= 1000 ? `${(totalStock / 1000).toFixed(1)}K+` : `${totalStock}+`, label: "Товаров в наличии" },
              { value: `${avgRating.toFixed(1)}★`, label: "Средняя оценка" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    letterSpacing: "-0.5px",
                  }}
                  className="text-gradient"
                >
                  {value}
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const [categories, setCategories] = useState<Category[]>([
    { id: "all", label: "Все игры", icon: "🎮", count: 0 },
  ]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);

  const gamesCount = games.length;
  const totalStock = games.reduce((acc, game) => acc + (game.stock || 0), 0);
  const avgRating = gamesCount > 0 ? games.reduce((acc, game) => acc + game.rating, 0) / gamesCount : 0;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  // Загрузка категорий
  useEffect(() => {
    fetch(`${API_URL}/categories/`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки категорий");
        return res.json();
      })
      .then((data: CategoryFromAPI[]) => {
        // count обновим после загрузки товаров, пока 0
        const uiCategories: Category[] = [
          { id: "all", label: "Все игры", icon: "🎮", count: 0 },
          ...data.map((cat) => ({
            id: String(cat.id),
            label: cat.name,
            icon: CATEGORY_ICONS[cat.name] ?? "🎮",
            count: 0,
          })),
        ];
        setCategories(uiCategories);
      })
      .catch((err) => console.error("Не удалось загрузить категории:", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  // Загрузка товаров с бэкенда
  useEffect(() => {
    fetch(`${API_URL}/products/`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки товаров");
        return res.json();
      })
      .then((data: ProductFromAPI[]) => {
        const mapped = data.map(mapProductToGame);
        setGames(mapped);
        // Обновляем счётчики категорий
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            count:
              cat.id === "all"
                ? mapped.length
                : mapped.filter((g) => g.category === cat.id).length,
          }))
        );
      })
      .catch((err) => console.error("Не удалось загрузить товары:", err))
      .finally(() => setLoadingGames(false));
  }, []);

  const filteredGames =
    activeCategory === "all"
      ? games
      : games.filter((g) => g.category === activeCategory);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <HeroSection gamesCount={gamesCount} totalStock={totalStock} avgRating={avgRating} />

        {/* Divider */}
        <div className="section-divider" style={{ maxWidth: 1200 }} />

        {/* Catalog section */}
        <section
          id="catalog"
          aria-label="Каталог игр"
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "64px 24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 40,
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#8b5cf6",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Каталог
              </p>
              <h2
                style={{
                  fontSize: "clamp(28px, 3vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: "#f1f5f9",
                }}
              >
                Популярные игры
              </h2>
            </div>
            <a
              href="#all"
              id="view-all-link"
              style={{
                color: "#8b5cf6",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: 10,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(139, 92, 246, 0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              Все игры
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Categories filter */}
          <div
            id="categories-filter"
            role="tablist"
            aria-label="Фильтр по категориям"
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 40,
              flexWrap: "wrap",
            }}
          >
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
          </div>

          {/* Games grid */}
          {loadingGames ? (
            <div
              style={{
                textAlign: "center",
                padding: "80px 24px",
                color: "#94a3b8",
                fontSize: 16,
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <p>Загрузка товаров...</p>
            </div>
          ) : (
            <>
              <div
                id="games-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: 24,
                }}
              >
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} onClick={() => setSelectedGame(game)} />
                ))}
              </div>

              {/* Empty state */}
              {filteredGames.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 24px",
                    color: "#475569",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎮</div>
                  <p style={{ fontSize: 18, fontWeight: 600 }}>
                    Игры в этой категории скоро появятся
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Banner CTA */}
        <section
          aria-label="Специальное предложение"
          style={{
            position: "relative",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              maxWidth: 1280,
              margin: "0 auto 64px",
              borderRadius: 24,
              padding: "48px 48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 32,
              flexWrap: "wrap",
              position: "relative",
              overflow: "hidden",
              marginLeft: 24,
              marginRight: 24,
            }}
          >
            {/* Orb inside banner */}
            <div
              style={{
                position: "absolute",
                right: -60,
                top: -60,
                width: 300,
                height: 300,
                background: "radial-gradient(circle, rgba(139,92,246,0.2), transparent)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2
                style={{
                  fontSize: "clamp(22px, 3vw, 32px)",
                  fontWeight: 800,
                  color: "#f1f5f9",
                  marginBottom: 8,
                  letterSpacing: "-0.5px",
                }}
              >
                🎁 Пригласи друга — получи скидку 15%
              </h2>
              <p style={{ color: "#94a3b8", fontSize: 15 }}>
                Делись реферальной ссылкой и зарабатывай бонусы на каждую покупку
              </p>
            </div>
            <button
              id="referral-cta"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                boxShadow: "0 8px 25px rgba(139, 92, 246, 0.35)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.03)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 35px rgba(139, 92, 246, 0.5)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 25px rgba(139, 92, 246, 0.35)";
              }}
            >
              Получить ссылку
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(139, 92, 246, 0.1)",
          padding: "40px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎮</span>
            <span
              style={{ fontWeight: 800, fontSize: 18 }}
              className="text-gradient"
            >
              GameVault
            </span>
          </div>
          <p style={{ color: "#475569", fontSize: 13 }}>
            © 2024 GameVault. Все права защищены.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            {["Политика", "Условия", "Поддержка"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                style={{
                  color: "#475569",
                  textDecoration: "none",
                  fontSize: 13,
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = "#94a3b8";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = "#475569";
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* Game Modal */}
      {selectedGame && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "rgba(8, 11, 20, 0.8)",
            backdropFilter: "blur(12px)",
          }}
          onClick={() => setSelectedGame(null)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,27,58,0.95), rgba(15,23,42,0.95))",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: 24,
              width: "100%",
              maxWidth: 800,
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.25)",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div style={{ position: "relative", height: 300, width: "100%" }}>
              {selectedGame.image ? (
                <Image
                  src={selectedGame.image}
                  alt={selectedGame.title}
                  fill
                  style={{ objectFit: "cover", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                />
              ) : (
                <div style={{ height: "100%", width: "100%", background: "#1e1b3a", borderTopLeftRadius: 24, borderTopRightRadius: 24 }} />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,1) 0%, transparent 100%)" }} />
              <button
                onClick={() => setSelectedGame(null)}
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "rgba(0,0,0,0.5)",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  color: "white",
                  fontSize: 24,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(4px)",
                  zIndex: 10,
                }}
              >
                &times;
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: 32, marginTop: -60, position: "relative", zIndex: 2 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <span style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                      ID: {selectedGame.id}
                    </span>
                    {selectedGame.supplier && (
                      <span style={{ background: "rgba(59,130,246,0.2)", color: "#93c5fd", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
                        {selectedGame.supplier}
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: 36, fontWeight: 900, color: "white", margin: 0, letterSpacing: "-0.5px" }}>
                    {selectedGame.title}
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <StarRating rating={selectedGame.rating} />
                  <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 8 }}>
                    В наличии: <strong style={{ color: "white" }}>{selectedGame.stock ?? "Нет данных"}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 400px" }}>
                  <h3 style={{ fontSize: 18, color: "white", marginBottom: 12 }}>Об игре</h3>
                  <p style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: 15 }}>
                    {selectedGame.description || "Описание отсутствует."}
                  </p>
                </div>

                <div style={{ flex: "1 1 200px", display: "flex", flexDirection: "column", gap: 24 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", padding: 24, borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 8 }}>Цена</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                      <span style={{ fontSize: 32, fontWeight: 800, color: "white" }}>₽{selectedGame.price.toLocaleString()}</span>
                      {selectedGame.oldPrice && (
                        <span style={{ fontSize: 18, color: "#475569", textDecoration: "line-through" }}>₽{selectedGame.oldPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <button
                      style={{
                        width: "100%",
                        background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                        color: "white",
                        border: "none",
                        padding: "16px 24px",
                        borderRadius: 12,
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
                        transition: "transform 0.2s, box-shadow 0.2s"
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 25px rgba(139, 92, 246, 0.4)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 8px 20px rgba(139, 92, 246, 0.3)"; }}
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
