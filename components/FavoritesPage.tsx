"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts } from "@/app/lib/api";
import ProductCard from "@/components/ProductCard";

export default function FavoritesPage() {
  const { favorites, navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(data => {
        const favProducts = (data || []).filter((p: any) => favorites.includes(p.id));
        setProducts(favProducts);
      })
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Обране</h1>
          <p className="text-gray-500 text-sm">{products.length} збережених товарів</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">♡</div>
            <p className="font-medium">Список обраного порожній</p>
            <p className="text-sm mb-4">
              Додавайте товари в обране натискаючи ♡ на картці
            </p>
            <button onClick={() => navigate("marketplace")}
              className="px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
              Перейти до маркетплейсу
            </button>
          </div>
        )}
      </div>
    </div>
  );
}