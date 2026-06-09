"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchClinics } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AdminPage() {
  const { user, navigate, token } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [editClinic, setEditClinic] = useState<any>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [blocking, setBlocking] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchClinics()]);
      setProducts(p || []);
      setClinics(c || []);

      const res = await fetch(`${API}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setUsers(data.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Видалити це оголошення?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProducts(prev => prev.filter(p => p.id !== id));
    } finally { setDeleting(null); }
  }

  async function deleteClinic(id: number) {
    if (!confirm("Видалити цю клініку?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${API}/clinics/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setClinics(prev => prev.filter(c => c.id !== id));
    } finally { setDeleting(null); }
  }

  async function saveProduct() {
    if (!editProduct) return;
    try {
      const res = await fetch(`${API}/products/${editProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editProduct.title, price: editProduct.price, city: editProduct.city }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...editProduct } : p));
        setEditProduct(null);
      }
    } catch {}
  }

  async function blockUser(id: number, blocked: boolean) {
    setBlocking(id);
    try {
      const res = await fetch(`${API}/auth/users/${id}/block`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ blocked }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked } : u));
      }
    } finally { setBlocking(null); }
  }

  if (!user) { navigate("login"); return null; }

  const tabs = [
    { key: "overview", label: "Огляд" },
    { key: "listings", label: `Оголошення (${products.length})` },
    { key: "clinics", label: `Клініки (${clinics.length})` },
    { key: "users", label: "Користувачі" },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">⚙️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Адмін-панель</h1>
            <p className="text-gray-500 text-sm">Управління платформою Elavia Dent</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
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
                    { label: "Користувачів", value: users.length || 4, icon: "👥" },
                    { label: "На модерації", value: 0, icon: "⏳" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
                  <h3 className="font-bold text-gray-900 mb-3">Останні оголошення</h3>
                  <div className="space-y-2">
                    {products.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                        <span className="text-xl">{p.image?.startsWith("http") ? "📷" : p.image || "🦷"}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.seller?.name} · {p.city} · {formatPrice(p.price)}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Активне</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Останні клініки</h3>
                  <div className="space-y-2">
                    {clinics.slice(0, 3).map((c: any) => (
                      <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                        <span className="text-xl">{c.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.city} · ★ {c.rating} · {c.doctors} лікарів</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Активна</span>
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
                        {["Товар", "Продавець", "Місто", "Ціна", "Перегляди", "Статус", "Дії"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span>{p.image?.startsWith("http") ? "📷" : p.image || "🦷"}</span>
                              <span className="font-medium truncate max-w-32">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{p.seller?.name}</td>
                          <td className="px-4 py-3 text-gray-500">{p.city}</td>
                          <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                          <td className="px-4 py-3 text-gray-500">{p.views}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Активне</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setEditProduct(p)}
                                className="px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                                ✏️
                              </button>
                              <button onClick={() => deleteProduct(p.id)}
                                disabled={deleting === p.id}
                                className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50">
                                {deleting === p.id ? "..." : "🗑️"}
                              </button>
                            </div>
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
              <div className="space-y-3">
                {clinics.map((c: any) => (
                  <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{c.image}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.city} · ★ {c.rating} · {c.doctors} лікарів</div>
                      <div className="text-xs text-gray-400">{c.address}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => setEditClinic(c)}
                        className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                        ✏️ Редагувати
                      </button>
                      <button onClick={() => deleteClinic(c.id)}
                        disabled={deleting === c.id}
                        className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50">
                        {deleting === c.id ? "..." : "🗑️ Видалити"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Користувачі */}
            {activeTab === "users" && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="space-y-3">
                  {(users.length > 0 ? users : [
                    { id: 1, name: "Кнюх Владислав", email: "admin@elavia-dent.ua", role: "ADMIN", blocked: false },
                    { id: 2, name: "МедТех Постач", email: "medtech@elavia-dent.ua", role: "SELLER", blocked: false },
                    { id: 3, name: "ДентаЕксперт", email: "dentexpert@elavia-dent.ua", role: "SELLER", blocked: false },
                    { id: 4, name: "Стома Сервіс", email: "stomaservis@elavia-dent.ua", role: "SELLER", blocked: false },
                  ]).map((u: any) => (
                    <div key={u.email} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 text-sm font-bold">{u.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{u.name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                        u.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}>
                        {u.role === "ADMIN" ? "Адмін" : "Продавець"}
                      </span>
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => blockUser(u.id, !u.blocked)}
                          disabled={blocking === u.id}
                          className={`px-3 py-1.5 text-xs rounded-lg border flex-shrink-0 transition-colors disabled:opacity-50 ${
                            u.blocked
                              ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                              : "bg-red-100 text-red-600 border-red-200 hover:bg-red-200"
                          }`}>
                          {blocking === u.id ? "..." : u.blocked ? "🔓 Розблокувати" : "🔒 Заблокувати"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Модальне вікно редагування оголошення */}
      {editProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Редагувати оголошення</h3>
              <button onClick={() => setEditProduct(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Назва</label>
                <input value={editProduct.title}
                  onChange={e => setEditProduct({ ...editProduct, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Ціна (UAH)</label>
                <input type="number" value={editProduct.price}
                  onChange={e => setEditProduct({ ...editProduct, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Місто</label>
                <input value={editProduct.city}
                  onChange={e => setEditProduct({ ...editProduct, city: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveProduct}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
                Зберегти
              </button>
              <button onClick={() => setEditProduct(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальне вікно редагування клініки */}
      {editClinic && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Редагувати клініку</h3>
              <button onClick={() => setEditClinic(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Назва</label>
                <input value={editClinic.name}
                  onChange={e => setEditClinic({ ...editClinic, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Місто</label>
                <input value={editClinic.city}
                  onChange={e => setEditClinic({ ...editClinic, city: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Адреса</label>
                <input value={editClinic.address}
                  onChange={e => setEditClinic({ ...editClinic, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Телефон</label>
                <input value={editClinic.phone}
                  onChange={e => setEditClinic({ ...editClinic, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={async () => {
                try {
                  const res = await fetch(`${API}/clinics/${editClinic.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ name: editClinic.name, city: editClinic.city, address: editClinic.address, phone: editClinic.phone }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setClinics(prev => prev.map(c => c.id === editClinic.id ? { ...c, ...editClinic } : c));
                    setEditClinic(null);
                  }
                } catch {}
              }}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
                Зберегти
              </button>
              <button onClick={() => setEditClinic(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}