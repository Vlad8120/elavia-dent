"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchClinics } from "@/app/lib/api";
import ProductCard from "@/components/ProductCard";
import ClinicCard from "@/components/ClinicCard";

export default function FavoritesPage() {
  const { favorites, clinicFavorites, navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "clinics">("products");

  useEffect(() => {
    Promise.all([fetchProducts(), fetchClinics()])
      .then(([p, c]) => {
        setProducts((p || []).filter((item: any) => favorites.includes(item.id)));
        setClinics((c || []).filter((item: any) => clinicFavorites.includes(item.id)));
      })
      .finally(() => setLoading(false));
  }, [favorites, clinicFavorites]);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Обране</h1>
          <p className="text-gray-500 text-sm">{products.length} товарів · {clinics.length} клінік</p>
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab("products")}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
              activeTab === "products" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            🛒 Товари {products.length > 0 && `(${products.length})`}
          </button>
          <button onClick={() => setActiveTab("clinics")}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
              activeTab === "clinics" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            🏥 Клініки {clinics.length > 0 && `(${clinics.length})`}
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : activeTab === "products" ? (
          products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-medium">Немає обраних товарів</p>
              <p className="text-sm mb-4">Додавайте товари натискаючи ♡</p>
              <button onClick={() => navigate("marketplace")}
                className="px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                До маркетплейсу
              </button>
            </div>
          )
        ) : (
          clinics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map((c: any) => <ClinicCard key={c.id} clinic={c} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏥</div>
              <p className="font-medium">Немає обраних клінік</p>
              <p className="text-sm mb-4">Додавайте клініки натискаючи ♡</p>
              <button onClick={() => navigate("clinics")}
                className="px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                До клінік
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}