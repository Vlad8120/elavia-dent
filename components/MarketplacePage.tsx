"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts, fetchCategories } from "@/app/lib/api";
import ProductCard from "@/components/ProductCard";

const CITIES = ["Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Запоріжжя", "Полтава"];

export default function MarketplacePage() {
  const { navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("views");
  const [search, setSearch] = useState("");

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await fetchProducts({
        city: cityFilter || undefined,
        categoryId: categoryFilter ? Number(categoryFilter) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        search: search || undefined,
        sortBy,
      });
      setProducts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories().then(data => setCategories(data || []));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [cityFilter, categoryFilter, sortBy]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadProducts();
  }

  function resetFilters() {
    setCityFilter("");
    setCategoryFilter("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("views");
    setSearch("");
  }

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Заголовок */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Маркетплейс товарів</h1>
          <p className="text-gray-500 text-sm">{products.length} оголошень знайдено</p>
        </div>

        <div className="flex gap-6">

          {/* Сайдбар фільтрів */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-4">🔍 Фільтри</h3>
              <div className="space-y-4">

                {/* Місто */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">МІСТО</label>
                  <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="">Всі міста</option>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                {/* Категорія */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">КАТЕГОРІЯ</label>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="">Всі категорії</option>
                    {categories.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Ціна */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">ЦІНА (UAH)</label>
                  <div className="flex gap-2">
                    <input value={minPrice} onChange={e => setMinPrice(e.target.value)}
                      placeholder="Від" type="number"
                      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none bg-gray-50" />
                    <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                      placeholder="До" type="number"
                      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-2 focus:outline-none bg-gray-50" />
                  </div>
                </div>

                {/* Сортування */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">СОРТУВАННЯ</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="views">За популярністю</option>
                    <option value="price-asc">Ціна: зростання</option>
                    <option value="price-desc">Ціна: спадання</option>
                    <option value="newest">Найновіші</option>
                  </select>
                </div>

                {/* Кнопка застосувати ціну */}
                <button onClick={loadProducts}
                  className="w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Застосувати
                </button>

                {/* Скинути */}
                <button onClick={resetFilters}
                  className="w-full py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Скинути фільтри
                </button>
              </div>
            </div>
          </aside>

          {/* Основний контент */}
          <div className="flex-1 min-w-0">

            {/* Пошуковий рядок */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Пошук по назві або категорії…"
                className="flex-1 pl-4 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit"
                className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                Знайти
              </button>
              <button type="button" onClick={() => navigate("new-listing")}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white hover:bg-gray-50">
                + Додати
              </button>
            </form>

            {/* Товари */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((p: any) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <div className="text-5xl mb-3">🔍</div>
                <p className="font-medium">Нічого не знайдено</p>
                <p className="text-sm">Спробуйте змінити фільтри або пошуковий запит</p>
                <button onClick={resetFilters}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  Скинути фільтри
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}