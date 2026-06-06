"use client";

import { useState, useEffect } from "react";
import { fetchProducts, fetchCategories } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

export default function AnalyticsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([p, c]) => {
        setProducts(p || []);
        setCategories(c || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter((p: any) => p.categoryId === Number(selectedCategory));

  const prices = filteredProducts.map((p: any) => p.price);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;

  const categoryStats = categories.map((cat: any) => {
    const catProducts = products.filter((p: any) => p.categoryId === cat.id);
    const catPrices = catProducts.map((p: any) => p.price);
    const avg = catPrices.length ? Math.round(catPrices.reduce((a: number, b: number) => a + b, 0) / catPrices.length) : 0;
    return { ...cat, avg, count: catProducts.length };
  }).filter((c: any) => c.count > 0).sort((a: any, b: any) => b.avg - a.avg);

  const maxAvg = categoryStats.length ? Math.max(...categoryStats.map((c: any) => c.avg)) : 1;

  const CITIES = ["Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Запоріжжя", "Полтава"];
  const cityStats = CITIES.map(city => {
    const cityProducts = filteredProducts.filter((p: any) => p.city === city);
    const cityPrices = cityProducts.map((p: any) => p.price);
    const avg = cityPrices.length ? Math.round(cityPrices.reduce((a: number, b: number) => a + b, 0) / cityPrices.length) : 0;
    return { city, avg, count: cityProducts.length };
  }).filter(c => c.count > 0);

  const selectedCategoryName = selectedCategory === "all"
    ? "Всі категорії"
    : categories.find((c: any) => c.id === Number(selectedCategory))?.name || "";

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Аналітика цін</h1>
          <p className="text-gray-500 text-sm">Аналіз ринку стоматологічних товарів України</p>
        </div>

        {/* Фільтр категорій */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Оберіть категорію для аналізу:</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 text-sm rounded-xl border transition-all ${
                selectedCategory === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              🔍 Всі категорії
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(String(cat.id))}
                className={`px-4 py-2 text-sm rounded-xl border transition-all ${
                  selectedCategory === String(cat.id)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Заголовок обраної категорії */}
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm text-gray-500">Показано аналітику для:</span>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedCategoryName} ({filteredProducts.length} товарів)
              </span>
            </div>

            {/* Загальна статистика */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Товарів", value: filteredProducts.length },
                { label: "Мін. ціна", value: formatPrice(minPrice) },
                { label: "Макс. ціна", value: formatPrice(maxPrice) },
                { label: "Середня ціна", value: formatPrice(avgPrice) },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                  <div className="text-lg font-bold text-gray-900">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Список товарів у категорії */}
            {selectedCategory !== "all" && filteredProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                <h2 className="font-bold text-gray-900 mb-4">Товари в категорії</h2>
                <div className="space-y-2">
                  {filteredProducts.sort((a: any, b: any) => a.price - b.price).map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <span className="text-xl">{p.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                        <div className="text-xs text-gray-400">📍 {p.city}</div>
                      </div>
                      <div className="text-sm font-bold text-blue-600">{formatPrice(p.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Середня ціна за категорією */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <h2 className="font-bold text-gray-900 mb-4">Середня ціна за категорією</h2>
              <div className="space-y-3">
                {categoryStats.map((cat: any) => (
                  <div key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${
                      selectedCategory === String(cat.id) ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}>
                    <span className="text-lg w-7">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 truncate">{cat.name}</span>
                        <span className="text-xs font-bold text-blue-600 ml-2">{formatPrice(cat.avg)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${Math.round((cat.avg / maxAvg) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-14 text-right">{cat.count} тов.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ціни по містах */}
            {cityStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-bold text-gray-900 mb-4">
                  Середня ціна по містах
                  {selectedCategory !== "all" && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({selectedCategoryName})
                    </span>
                  )}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cityStats.map(c => (
                    <div key={c.city} className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-sm font-bold text-gray-900">{c.city}</div>
                      <div className="text-xs text-blue-600 font-bold mt-1">{formatPrice(c.avg)}</div>
                      <div className="text-xs text-gray-400">{c.count} товарів</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">📊</div>
                <p className="font-medium">Немає даних для цієї категорії</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}