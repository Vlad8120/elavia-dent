"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

export default function ProfilePage() {
  const { user, navigate, logout } = useApp();
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [editForm, setEditForm] = useState({ name: "", city: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditForm({ name: user.name, city: user.city || "" });
    fetchProducts()
      .then(data => {
        const mine = (data || []).filter((p: any) => p.sellerId === user.id);
        setMyProducts(mine);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    navigate("login");
    return null;
  }

  const totalViews = myProducts.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
  const totalListings = myProducts.length;

  const tabs = [
    { key: "profile", label: "Профіль" },
    { key: "edit", label: "Редагувати" },
    { key: "notifications", label: `Сповіщення ${totalViews > 0 ? `(${totalViews})` : ""}` },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Профіль користувача</h1>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Профіль */}
        {activeTab === "profile" && (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-blue-700 text-2xl font-bold">{user.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {user.role === "BUYER" ? "Покупець" :
                     user.role === "SELLER" ? "Продавець" :
                     user.role === "CLINIC_OWNER" ? "Власник клініки" : "Адміністратор"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Місто", value: user.city || "Не вказано" },
                  { label: "Оголошень", value: totalListings },
                  { label: "Переглядів", value: totalViews },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className="text-sm font-bold text-blue-600">{s.value}</div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "Мої оголошення", page: "my-listings", icon: "📋" },
                { label: "Обране", page: "favorites", icon: "♡" },
                { label: "Додати оголошення", page: "new-listing", icon: "➕" },
                { label: "Аналітика цін", page: "analytics", icon: "📊" },
              ].map(item => (
                <button key={item.page} onClick={() => navigate(item.page)}
                  className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="text-xs font-medium text-gray-700">{item.label}</div>
                </button>
              ))}
            </div>

            <button onClick={() => { logout(); navigate("home"); }}
              className="w-full py-3 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
              Вийти з акаунту
            </button>
          </>
        )}

        {/* Редагувати */}
        {activeTab === "edit" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Редагувати профіль</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Ім'я</label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                <input
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Email змінити не можна</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Місто</label>
                <input
                  value={editForm.city}
                  onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))}
                  placeholder="Введіть місто"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Роль</label>
                <input
                  value={user.role === "BUYER" ? "Покупець" :
                         user.role === "SELLER" ? "Продавець" :
                         user.role === "CLINIC_OWNER" ? "Власник клініки" : "Адміністратор"}
                  disabled
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
                />
              </div>

              {saved && (
                <div className="p-3 bg-green-50 text-green-700 text-sm rounded-xl">
                  ✅ Дані збережено локально!
                </div>
              )}

              <button
                onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 text-sm">
                Зберегти зміни
              </button>
            </div>
          </div>
        )}

        {/* Сповіщення */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">📊 Статистика переглядів</h2>

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : myProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{totalViews}</div>
                    <div className="text-xs text-gray-500">Всього переглядів</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{totalListings}</div>
                    <div className="text-xs text-gray-500">Активних оголошень</div>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Перегляди по оголошеннях:</h3>
                <div className="space-y-3">
                  {[...myProducts]
                    .sort((a: any, b: any) => b.views - a.views)
                    .map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-blue-200 transition-colors">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                          {p.image?.startsWith("http") || p.image?.includes("image/upload") ? "📷" : p.image || "🦷"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                          <div className="text-xs text-gray-400">{formatPrice(p.price)} · {p.city}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-blue-600">👁 {p.views}</div>
                          <div className="text-xs text-gray-400">переглядів</div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-sm font-semibold text-amber-800 mb-1">
                    🏆 Найпопулярніше оголошення
                  </div>
                  <div className="text-sm text-amber-700">
                    {[...myProducts].sort((a: any, b: any) => b.views - a.views)[0]?.title}
                  </div>
                  <div className="text-xs text-amber-600 mt-1">
                    👁 {[...myProducts].sort((a: any, b: any) => b.views - a.views)[0]?.views} переглядів
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <div className="text-4xl mb-3">📋</div>
                <p className="font-medium">У вас ще немає оголошень</p>
                <button onClick={() => navigate("new-listing")}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  Створити оголошення
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}