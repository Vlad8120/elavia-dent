"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchClinics } from "@/app/lib/api";
import ClinicCard from "@/components/ClinicCard";

const CITIES = ["Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Запоріжжя", "Полтава"];

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");

  async function loadClinics() {
    setLoading(true);
    try {
      const data = await fetchClinics({
        city: cityFilter || undefined,
        search: search || undefined,
      });
      setClinics(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClinics();
  }, [cityFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadClinics();
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Стоматологічні клініки</h1>
          <p className="text-gray-500 text-sm">{clinics.length} клінік знайдено</p>
        </div>

        {/* Фільтри */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Назва або місто…"
            className="flex-1 max-w-md px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Всі міста</option>
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button type="submit"
            className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700">
            Знайти
          </button>
        </form>

        {/* Список клінік */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : clinics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clinics.map((clinic: any) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🏥</div>
            <p className="font-medium">Клінік не знайдено</p>
            <p className="text-sm">Спробуйте змінити фільтри</p>
          </div>
        )}
      </div>
    </div>
  );
}