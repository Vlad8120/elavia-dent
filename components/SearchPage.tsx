"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/app/lib/context";
import { formatPrice } from "@/app/lib/utils";
import ProductCard from "@/components/ProductCard";
import ClinicCard from "@/components/ClinicCard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function SearchPage() {
  const { searchQuery, navigate, setSearchQuery } = useApp();
  const [results, setResults] = useState<any>({ products: [], clinics: [], services: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "products" | "clinics" | "services">("all");
  const [inputValue, setInputValue] = useState(searchQuery);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}&type=${activeTab}`);
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch {}
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery) {
      setInputValue(searchQuery);
      search(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery) search(searchQuery);
  }, [activeTab]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue);
      search(inputValue);
    }
  }

  const totalProducts = results.products?.length || 0;
  const totalClinics = results.clinics?.length || 0;
  const totalServices = results.services?.length || 0;

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Пошуковий рядок */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Пошук товарів, клінік, послуг…"
              className="flex-1 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
            <button type="submit"
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              🔍 Знайти
            </button>
          </form>

          {searchQuery && !loading && (
            <div className="flex items-center gap-2">
              <p className="text-gray-500 text-sm">
                За запитом <span className="font-semibold text-gray-900">«{searchQuery}»</span> знайдено{" "}
                <span className="text-blue-600 font-bold">{results.total}</span> результатів
              </p>
              {results.total > 0 && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  🧠 Інтелектуальний пошук
                </span>
              )}
            </div>
          )}
        </div>

        {/* Вкладки фільтру */}
        {searchQuery && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {[
              { key: "all", label: `Всі (${results.total})` },
              { key: "products", label: `🛒 Товари (${totalProducts})` },
              { key: "clinics", label: `🏥 Клініки (${totalClinics})` },
              { key: "services", label: `⚕️ Послуги (${totalServices})` },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className={`px-4 py-2 text-sm font-medium rounded-xl border whitespace-nowrap transition-all ${
                  activeTab === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : searchQuery ? (
          <>
            {/* Товари */}
            {(activeTab === "all" || activeTab === "products") && totalProducts > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">🛒 Товари</h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{totalProducts} результатів</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {results.products.map((p: any) => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {/* Клініки */}
            {(activeTab === "all" || activeTab === "clinics") && totalClinics > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">🏥 Клініки</h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{totalClinics} результатів</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.clinics.map((c: any) => <ClinicCard key={c.id} clinic={c} />)}
                </div>
              </div>
            )}

            {/* Послуги */}
            {(activeTab === "all" || activeTab === "services") && totalServices > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">⚕️ Послуги</h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{totalServices} результатів</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {results.services.map((s: any) => (
                    <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{s.name}</h3>
                        {s.rank > 0 && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                            ★ {(s.rank * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{s.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-blue-600">
                          {formatPrice(s.priceFrom)} – {formatPrice(s.priceTo)}
                        </span>
                        <span className="text-xs text-gray-400">⏱ {s.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.total === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-medium text-lg">Нічого не знайдено</p>
                <p className="text-sm mb-2">За запитом «{searchQuery}» немає результатів</p>
                <p className="text-xs text-gray-400 mb-4">Спробуйте інші слова або перевірте правопис</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {["стоматологія", "імплант", "брекети", "відбілювання"].map(s => (
                    <button key={s} onClick={() => { setInputValue(s); setSearchQuery(s); search(s); }}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-6xl mb-4">🔍</div>
            <p className="font-medium text-lg text-gray-700">Інтелектуальний пошук</p>
            <p className="text-sm mt-2 mb-6">Шукайте товари, клініки та послуги по всій Україні</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {["турбінний наконечник", "імплантація", "брекети", "відбілювання зубів", "автоклав"].map(s => (
                <button key={s} onClick={() => { setInputValue(s); setSearchQuery(s); search(s); }}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}