"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchClinics, fetchServices } from "@/app/lib/api";
import ProductCard from "@/components/ProductCard";
import ClinicCard from "@/components/ClinicCard";
import { formatPrice } from "@/app/lib/utils";

export default function FavoritesPage() {
  const { favorites, clinicFavorites, serviceFavorites, toggleServiceFavorite, navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "clinics" | "services">("products");

  useEffect(() => {
    Promise.all([fetchProducts(), fetchClinics(), fetchServices()])
      .then(([p, c, s]) => {
        setProducts((p || []).filter((item: any) => favorites.includes(item.id)));
        setClinics((c || []).filter((item: any) => clinicFavorites.includes(item.id)));
        setServices((s || []).filter((item: any) => serviceFavorites.includes(item.id)));
      })
      .finally(() => setLoading(false));
  }, [favorites, clinicFavorites, serviceFavorites]);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Обране</h1>
          <p className="text-gray-500 text-sm">{products.length} товарів · {clinics.length} клінік · {services.length} послуг</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { key: "products", label: `🛒 Товари${products.length > 0 ? ` (${products.length})` : ""}` },
            { key: "clinics", label: `🏥 Клініки${clinics.length > 0 ? ` (${clinics.length})` : ""}` },
            { key: "services", label: `⚕️ Послуги${services.length > 0 ? ` (${services.length})` : ""}` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                activeTab === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              {t.label}
            </button>
          ))}
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
              <button onClick={() => navigate("marketplace")} className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">До маркетплейсу</button>
            </div>
          )
        ) : activeTab === "clinics" ? (
          clinics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.map((c: any) => <ClinicCard key={c.id} clinic={c} />)}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🏥</div>
              <p className="font-medium">Немає обраних клінік</p>
              <button onClick={() => navigate("clinics")} className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">До клінік</button>
            </div>
          )
        ) : (
          services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s: any) => (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <button onClick={() => toggleServiceFavorite(s.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                      <span className="text-red-500">♥</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{s.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-600">
                      {formatPrice(s.priceFrom)} – {formatPrice(s.priceTo)}
                    </span>
                    <span className="text-xs text-gray-400">⏱ {s.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">⚕️</div>
              <p className="font-medium">Немає обраних послуг</p>
              <button onClick={() => navigate("services")} className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">До послуг</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}