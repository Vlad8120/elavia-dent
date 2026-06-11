"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/app/lib/context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Suggestion = {
  type: "product" | "clinic" | "service";
  id: number;
  label: string;
  sub?: string;
};

const TYPE_ICON: Record<string, string> = {
  product: "📦",
  clinic: "🏥",
  service: "🦷",
};

const TYPE_LABEL: Record<string, string> = {
  product: "Товар",
  clinic: "Клініка",
  service: "Послуга",
};

export default function Header() {
  const { navigate, user, logout, favorites, searchQuery, setSearchQuery, token, setSelectedProduct, setSelectedClinic } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !token) return;
    loadUnread();
    const interval = setInterval(loadUnread, 10000);
    return () => clearInterval(interval);
  }, [user, token]);

  async function loadUnread() {
    try {
      const res = await fetch(`${API}/chats`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const total = (data.data || []).reduce((sum: number, c: any) => sum + c.unread, 0);
        setUnreadCount(total);
      }
    } catch {}
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearchChange(value: string) {
    setSearchQuery(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API}/search/autocomplete?q=${encodeURIComponent(value.trim())}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data || []);
          setShowDropdown((data.data || []).length > 0);
        }
      } catch {
        setSuggestions([]); setShowDropdown(false);
      } finally { setIsLoading(false); }
    }, 250);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        selectSuggestion(suggestions[activeIndex]);
      } else {
        setShowDropdown(false);
        navigate("search");
      }
      return;
    }
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === "Escape") { setShowDropdown(false); setActiveIndex(-1); }
  }

  async function selectSuggestion(s: Suggestion) {
    setSearchQuery(s.label);
    setShowDropdown(false);
    setActiveIndex(-1);

    try {
      if (s.type === "product") {
        const res = await fetch(`${API}/products/${s.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedProduct(data.data);
          navigate("product-detail");
          return;
        }
      } else if (s.type === "clinic") {
        const res = await fetch(`${API}/clinics/${s.id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSelectedClinic(data.data);
          navigate("clinic-detail");
          return;
        }
      }
    } catch {}

    // fallback
    navigate(s.type === "product" ? "marketplace" : s.type === "clinic" ? "clinics" : "services");
  }

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

        <button onClick={() => navigate("home")} className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-gray-900 hidden sm:block">Elavia Dent</span>
        </button>

        <div className="hidden md:flex flex-1 max-w-md" ref={wrapperRef}>
          <div className="relative w-full">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-gray-400 text-sm pointer-events-none">🔍</span>
              <input
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="Пошук товарів, клінік, послуг…"
                className="w-full pl-9 pr-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                autoComplete="off"
              />
              {isLoading && <span className="absolute right-3 text-gray-300 text-xs animate-pulse">●</span>}
            </div>

            {showDropdown && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map((s, i) => (
                  <button key={`${s.type}-${s.id}`}
                    onMouseDown={() => selectSuggestion(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === activeIndex ? "bg-blue-50" : "hover:bg-gray-50"} ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <span className="text-base flex-shrink-0">{TYPE_ICON[s.type]}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-900 font-medium truncate block">{s.label}</span>
                      {s.sub && <span className="text-xs text-gray-400">{s.sub}</span>}
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                      {TYPE_LABEL[s.type]}
                    </span>
                  </button>
                ))}
                <button onMouseDown={() => { setShowDropdown(false); navigate("search"); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 font-medium">
                  <span>🔍</span>
                  <span>Всі результати для «{searchQuery}»</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(l => (
            <button key={l.page} onClick={() => navigate(l.page)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              {l.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <button onClick={() => navigate("new-listing")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50">
                + Додати
              </button>
              <button onClick={() => navigate("messages")}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <span className="text-lg">💬</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
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
                      { label: "Повідомлення", page: "messages" },
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

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3">
          <input
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { navigate("search"); setMobileOpen(false); } }}
            placeholder="Пошук…"
            className="w-full px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg mb-3 focus:outline-none bg-white"
          />
          <nav className="flex flex-col gap-1">
            {navLinks.map(l => (
              <button key={l.page} onClick={() => { navigate(l.page); setMobileOpen(false); }}
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