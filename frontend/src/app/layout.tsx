import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GameVault — Магазин игр | Лучшие цены",
  description:
    "Покупай игры для PC, PlayStation и Xbox по лучшим ценам. Огромный каталог игр: экшн, RPG, шутеры, стратегии и многое другое.",
  keywords: "купить игры, игровой магазин, PC игры, PlayStation, Xbox, дешёвые игры",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
