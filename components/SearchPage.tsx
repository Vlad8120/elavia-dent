"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchClinics } from "@/app/lib/api";
import ProductCard from "@/components/ProductCard";
import ClinicCard from "@/components/ClinicCard";

export default function SearchPage() {
  const { searchQuery, navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!searchQuery) return;
    setLoading(true);
    Promise.all([
      fetchProducts({ search: searchQuery }),
      fetchClinics({ search: searchQuery }),
    ]).then(([p, c]) => {
      setProducts(p || []);
      setClinics(c || []);
    }).finally(() => setLoading(false));
  }, [searchQuery]);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Результати пошуку</h1>
          <p className="text-gray-500 text-sm">
            За запитом: <span className="font-medium text-gray-700">«{searchQuery}»</span>
            {!loading && ` — знайдено ${products.length + clinics.length} результатів`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {products.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Товари ({products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {products.map((p: any) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            )}

            {clinics.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Клініки ({clinics.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clinics.map((c: any) => (
                    <ClinicCard key={c.id} clinic={c} />
                  ))}
                </div>
              </div>
            )}

            {products.length === 0 && clinics.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-medium text-lg">Нічого не знайдено</p>
                <p className="text-sm mb-4">Спробуйте інший запит</p>
                <button onClick={() => navigate("marketplace")}
                  className="px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  Переглянути всі товари
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}