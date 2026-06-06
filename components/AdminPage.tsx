"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchClinics } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

export default function AdminPage() {
  const { user, navigate } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchProducts(), fetchClinics()])
      .then(([p, c]) => {
        setProducts(p || []);
        setClinics(c || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    navigate("login");
    return null;
  }

  const tabs = [
    { key: "overview", label: "Огляд" },
    { key: "listings", label: "Оголошення" },
    { key: "clinics", label: "Клініки" },
    { key: "users", label: "Користувачі" },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Заголовок */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">⚙️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Адмін-панель</h1>
            <p className="text-gray-500 text-sm">Управління платформою Elavia Dent</p>
          </div>
        </div>

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

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Огляд */}
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "Всього оголошень", value: products.length, icon: "📋" },
                    { label: "Клінік", value: clinics.length, icon: "🏥" },
                    { label: "Користувачів", value: "4", icon: "👥" },
                    { label: "На модерації", value: "0", icon: "⏳" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Останні оголошення */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Останні оголошення</h3>
                  <div className="space-y-2">
                    {products.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                        <span className="text-xl">{p.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.seller?.name} · {p.city} · {formatPrice(p.price)}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Активне
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Оголошення */}
            {activeTab === "listings" && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Товар", "Продавець", "Місто", "Ціна", "Перегляди", "Статус"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span>{p.image}</span>
                              <span className="font-medium truncate max-w-32">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.seller?.name}</td>
                          <td className="px-4 py-3 text-gray-500">{p.city}</td>
                          <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3 text-gray-500">{p.views}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                              Активне
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Клініки */}
            {activeTab === "clinics" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {clinics.map((c: any) => (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="text-2xl">{c.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">
                        {c.city} · ★ {c.rating} · {c.doctors} лікарів
                      </div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Активна
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Користувачі */}
            {activeTab === "users" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="space-y-3">
                  {[
                    { name: "Кнюх Владислав", email: "admin@elavia-dent.ua", role: "ADMIN" },
                    { name: "МедТех Постач", email: "medtech@elavia-dent.ua", role: "SELLER" },
                    { name: "ДентаЕксперт", email: "dentexpert@elavia-dent.ua", role: "SELLER" },
                    { name: "Стома Сервіс", email: "stomaservis@elavia-dent.ua", role: "SELLER" },
                  ].map(u => (
                    <div key={u.email} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-sm font-bold">{u.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        u.role === "ADMIN"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {u.role === "ADMIN" ? "Адмін" : "Продавець"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}