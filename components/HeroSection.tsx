"use client";

import { useState } from "react";
import { useApp } from "@/app/lib/context";

export default function HeroSection() {
  const { navigate, setSearchQuery } = useApp();
  const [localSearch, setLocalSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products");

  function handleSearch() {
    setSearchQuery(localSearch);
    navigate("search");
  }

  const tabs = [
    { key: "products", label: "🛒 Товари" },
    { key: "clinics", label: "🏥 Клініки" },
    { key: "services", label: "⚕️ Послуги" },
  ];

  const placeholders: Record<string, string> = {
    products: "Пошук стоматологічних товарів…",
    clinics: "Пошук клінік за містом або назвою…",
    services: "Пошук стоматологічних послуг…",
  };

  const popularSearches = [
    "Турбінний наконечник",
    "Стоматологічна установка",
    "Імплантати",
    "Клініки Київ",
  ];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" style={{ filter: "blur(60px)" }} />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-blue-300" style={{ filter: "blur(40px)" }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Єдина платформа для стоматологічного ринку України
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
          Знайди все необхідне для{" "}
          <span className="text-blue-200">стоматології в одному місці</span>
        </h1>

        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
          Інтелектуальний пошук стоматологічних товарів, клінік та послуг по всій Україні.
        </p>

        {/* Блок пошуку */}
        <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-2xl mx-auto">
          <div className="flex rounded-xl overflow-hidden border border-gray-100 mb-2">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2 text-sm font-medium transition-all ${
                  activeTab === t.key ? "bg-blue-600 text-white rounded-lg" : "text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder={placeholders[activeTab]}
              className="flex-1 px-4 py-3 text-gray-800 text-sm focus:outline-none rounded-lg"
            />
            <button onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Знайти
            </button>
          </div>
        </div>

        {/* Популярні запити */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-blue-200">
          <span>Популярні:</span>
          {popularSearches.map(q => (
            <button key={q} onClick={() => { setLocalSearch(q); setSearchQuery(q); navigate("search"); }}
              className="hover:text-white transition-colors underline underline-offset-2">
              {q}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}