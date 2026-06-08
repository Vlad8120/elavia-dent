"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchCategories } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AnalyticsPage() {
  const { navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tracking, setTracking] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCategories()])
      .then(([p, c]) => {
        setProducts(p || []);
        setCategories(c || []);
      })
      .finally(() => setLoading(false));

    const saved = localStorage.getItem("tracking");
    if (saved) setTracking(JSON.parse(saved));
  }, []);

  async function loadHistory(productId: number) {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API}/price-history/${productId}`);
      const data = await res.json();
      if (data.success) setPriceHistory(data.data || []);
    } catch {}
    finally { setHistoryLoading(false); }
  }

  async function trackProduct(product: any) {
    const newTracking = tracking.includes(product.id)
      ? tracking.filter(id => id !== product.id)
      : [...tracking, product.id];
    setTracking(newTracking);
    localStorage.setItem("tracking", JSON.stringify(newTracking));

    if (!tracking.includes(product.id)) {
      await fetch(`${API}/price-history/${product.id}`, { method: "POST" });
    }
  }

  function selectProduct(product: any) {
    setSelectedProduct(product);
    loadHistory(product.id);
  }

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

  const trackedProducts = products.filter((p: any) => tracking.includes(p.id));

  // Формуємо графік з реальних даних + поточна ціна
  function buildChartData(product: any, history: any[]) {
    const points = [...history.map(h => ({ date: new Date(h.createdAt), price: h.price }))];
    points.push({ date: new Date(), price: product.price });
    return points;
  }

  const chartData = selectedProduct ? buildChartData(selectedProduct, priceHistory) : [];
  const chartMin = chartData.length ? Math.min(...chartData.map(p => p.price)) : 0;
  const chartMax = chartData.length ? Math.max(...chartData.map(p => p.price)) : 1;
  const chartAvg = chartData.length ? Math.round(chartData.reduce((s, p) => s + p.price, 0) / chartData.length) : 0;

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Аналітика цін</h1>
          <p className="text-gray-500 text-sm">Аналіз ринку стоматологічних товарів України</p>
        </div>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setSelectedProduct(null)}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
              !selectedProduct ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            📊 Загальна аналітика
          </button>
          <button onClick={() => setSelectedProduct(selectedProduct || trackedProducts[0] || null)}
            className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
              selectedProduct ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            📈 Відстеження цін
            {tracking.length > 0 && (
              <span className="ml-1.5 w-4 h-4 bg-white text-blue-600 text-xs rounded-full inline-flex items-center justify-center font-bold">
                {tracking.length}
              </span>
            )}
          </button>
        </div>

        {/* Відстеження конкретного товару */}
        {selectedProduct ? (
          <div className="space-y-4">
            <button onClick={() => setSelectedProduct(null)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              ← Назад до аналітики
            </button>

            {/* Картка товару */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedProduct.title}</h2>
                  <div className="text-sm text-gray-500 mt-1">📍 {selectedProduct.city} · {selectedProduct.category?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{formatPrice(selectedProduct.price)}</div>
                  <div className="text-xs text-gray-400">Поточна ціна</div>
                </div>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Мін. ціна</div>
                  <div className="text-sm font-bold text-green-600">{formatPrice(chartMin)}</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Середня</div>
                  <div className="text-sm font-bold text-blue-600">{formatPrice(chartAvg)}</div>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">Макс. ціна</div>
                  <div className="text-sm font-bold text-red-600">{formatPrice(chartMax)}</div>
                </div>
              </div>

              {/* Графік */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">📈 Динаміка ціни</h3>
                {historyLoading ? (
                  <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
                ) : chartData.length > 1 ? (
                  <div className="relative h-40 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const range = chartMax - chartMin || 1;
                        const points = chartData.map((p, i) => ({
                          x: (i / (chartData.length - 1)) * 380 + 10,
                          y: 140 - ((p.price - chartMin) / range) * 120,
                        }));
                        const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                        const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;
                        return (
                          <>
                            <path d={areaD} fill="url(#priceGrad)" />
                            <path d={pathD} stroke="#3b82f6" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            {points.map((p, i) => (
                              <circle key={i} cx={p.x} cy={p.y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                    <div className="absolute top-2 left-3 text-xs text-gray-400">
                      {chartData[0]?.date.toLocaleDateString("uk-UA")}
                    </div>
                    <div className="absolute top-2 right-3 text-xs text-gray-400">
                      {chartData[chartData.length - 1]?.date.toLocaleDateString("uk-UA")}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 bg-gray-50 rounded-xl flex flex-col items-center justify-center text-gray-400 border border-gray-100">
                    <div className="text-3xl mb-2">📊</div>
                    <p className="text-sm">Недостатньо даних для графіку</p>
                    <p className="text-xs mt-1">Натискайте "Записати ціну" щодня</p>
                  </div>
                )}
              </div>

              {/* Кнопки */}
              <div className="flex gap-2">
                <button
                  onClick={() => trackProduct(selectedProduct)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                    tracking.includes(selectedProduct.id)
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}>
                  {tracking.includes(selectedProduct.id) ? "✅ Відстежується" : "📌 Відстежувати ціну"}
                </button>
                <button
                  onClick={async () => {
                    await fetch(`${API}/price-history/${selectedProduct.id}`, { method: "POST" });
                    loadHistory(selectedProduct.id);
                  }}
                  className="px-4 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">
                  📝 Записати ціну
                </button>
                <button
                  onClick={() => navigate("product-detail", { product: selectedProduct })}
                  className="px-4 py-2.5 text-sm font-semibold border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50">
                  Переглянути
                </button>
              </div>
            </div>

            {/* Схожі товари для порівняння */}
            {selectedProduct.categoryId && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-3">Схожі товари в категорії</h3>
                <div className="space-y-2">
                  {products
                    .filter((p: any) => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id)
                    .slice(0, 5)
                    .map((p: any) => (
                      <div key={p.id}
                        onClick={() => selectProduct(p)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer transition-all">
                        <span className="text-xl">{p.image?.startsWith("http") ? "📷" : p.image || "🦷"}</span>
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
          </div>
        ) : (
          <>
            {/* Фільтр категорій */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
              <h2 className="font-semibold text-gray-900 mb-3">Оберіть категорію для аналізу:</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 text-sm rounded-xl border transition-all ${selectedCategory === "all" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                  🔍 Всі категорії
                </button>
                {categories.map((cat: any) => (
                  <button key={cat.id} onClick={() => setSelectedCategory(String(cat.id))}
                    className={`px-4 py-2 text-sm rounded-xl border transition-all ${selectedCategory === String(cat.id) ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <>
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

                {/* Товари з кнопкою відстеження */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                  <h2 className="font-bold text-gray-900 mb-4">
                    Товари {selectedCategory !== "all" && `— ${categories.find((c: any) => c.id === Number(selectedCategory))?.name}`}
                    <span className="text-sm font-normal text-gray-500 ml-2">Натисніть для відстеження</span>
                  </h2>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {filteredProducts.sort((a: any, b: any) => a.price - b.price).map((p: any) => (
                      <div key={p.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                        <span className="text-xl flex-shrink-0">{p.image?.startsWith("http") ? "📷" : p.image || "🦷"}</span>
                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => selectProduct(p)}>
                          <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                          <div className="text-xs text-gray-400">📍 {p.city}</div>
                        </div>
                        <div className="text-sm font-bold text-blue-600 flex-shrink-0">{formatPrice(p.price)}</div>
                        <button
                          onClick={() => trackProduct(p)}
                          className={`flex-shrink-0 px-2 py-1 text-xs rounded-lg border transition-all ${
                            tracking.includes(p.id)
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "text-gray-500 border-gray-200 hover:border-blue-300"
                          }`}>
                          {tracking.includes(p.id) ? "✅" : "📌"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Середня ціна за категорією */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
                  <h2 className="font-bold text-gray-900 mb-4">Середня ціна за категорією</h2>
                  <div className="space-y-3">
                    {categoryStats.map((cat: any) => (
                      <div key={cat.id} onClick={() => setSelectedCategory(String(cat.id))}
                        className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${selectedCategory === String(cat.id) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                        <span className="text-lg w-7">{cat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 truncate">{cat.name}</span>
                            <span className="text-xs font-bold text-blue-600 ml-2">{formatPrice(cat.avg)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all"
                              style={{ width: `${Math.round((cat.avg / maxAvg) * 100)}%` }} />
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 w-14 text-right">{cat.count} тов.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}