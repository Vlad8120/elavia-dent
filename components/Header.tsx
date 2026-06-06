"use client";

import { useState } from "react";
import { useApp } from "@/app/lib/context";

export default function Header() {
  const { navigate, user, logout, favorites, searchQuery, setSearchQuery } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
  { label: "Товари", page: "marketplace" },
  { label: "Клініки", page: "clinics" },
  { label: "Послуги", page: "services" },
  { label: "Карта клінік", page: "clinics-map" },
  { label: "Аналітика цін", page: "analytics" },
];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Логотип */}
        <button onClick={() => navigate("home")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block">Elavia Dent</span>
        </button>

        {/* Пошук */}
        <div className="hidden md:flex flex-1 max-w-md">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && navigate("search")}
            placeholder="Пошук товарів, клінік, послуг…"
            className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>

        {/* Навігація */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <button key={l.page} onClick={() => navigate(l.page)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {l.label}
            </button>
          ))}
        </nav>

        {/* Кнопки праворуч */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <button onClick={() => navigate("new-listing")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                + Додати
              </button>
              <button onClick={() => navigate("favorites")}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <span className="text-lg">♡</span>
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100">
                  <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 text-xs font-bold">{user.name[0]}</span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-11 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    {[
                      { label: "Профіль", page: "profile" },
                      { label: "Обране", page: "favorites" },
                      { label: "Мої оголошення", page: "my-listings" },
                      { label: "Адмін-панель", page: "admin" },
                    ].map(item => (
                      <button key={item.page}
                        onClick={() => { navigate(item.page); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-100 mt-1">
                      <button onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        Вийти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => navigate("login")}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Увійти
              </button>
              <button onClick={() => navigate("register")}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Реєстрація
              </button>
            </>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200">
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Мобільне меню */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { navigate("search"); setMobileOpen(false); }}}
            placeholder="Пошук…"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none bg-gray-50"
          />
          <nav className="flex flex-col gap-1">
            {navLinks.map(l => (
              <button key={l.page}
                onClick={() => { navigate(l.page); setMobileOpen(false); }}
                className="text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                {l.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}