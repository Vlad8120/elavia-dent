"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

export default function MyListingsPage() {
  const { user, navigate, token } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function loadProducts() {
    if (!user) return;
    fetchProducts()
      .then(data => {
        const myProducts = (data || []).filter((p: any) => p.sellerId === user.id);
        setProducts(myProducts);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, [user]);

  async function handleDelete(id: number) {
    if (!confirm("Видалити це оголошення?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProducts(prev => prev.filter((p: any) => p.id !== id));
      }
    } catch {
      alert("Помилка видалення");
    } finally {
      setDeleting(null);
    }
  }

  if (!user) {
    navigate("login");
    return null;
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Мої оголошення</h1>
            <p className="text-gray-500 text-sm">{products.length} активних оголошень</p>
          </div>
          <button onClick={() => navigate("new-listing")}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
            + Нове оголошення
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-3">
            {products.map((p: any) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {p.image?.startsWith("http") ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                  ) : p.image?.includes("image/upload") ? (
                    <img src={`https://res.cloudinary.com/dcpksxngc/${p.image}`} alt={p.title} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <span>{p.image || "🦷"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">{p.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="font-medium text-blue-600">{formatPrice(p.price)}</span>
                    <span>📍 {p.city}</span>
                    <span>👁 {p.views}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Активне
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {deleting === p.id ? "..." : "Видалити"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium">У вас ще немає оголошень</p>
            <p className="text-sm mb-4">Створіть перше оголошення прямо зараз</p>
            <button onClick={() => navigate("new-listing")}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
              Створити оголошення
            </button>
          </div>
        )}
      </div>
    </div>
  );
}