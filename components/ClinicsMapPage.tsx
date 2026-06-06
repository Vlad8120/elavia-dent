"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchClinics } from "@/app/lib/api";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Завантаження карти...</p>
    </div>
  ),
});

export default function ClinicsMapPage() {
  const { navigate, setSelectedClinic } = useApp();
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClinics()
      .then(data => setClinics(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Карта клінік</h1>
          <p className="text-gray-500 text-sm">
            {clinics.length} клінік на карті України
          </p>
        </div>

        {/* Карта */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          {loading ? (
            <div className="w-full h-96 bg-gray-200 rounded-xl animate-pulse flex items-center justify-center">
              <p className="text-gray-500">Завантаження...</p>
            </div>
          ) : (
            <MapComponent clinics={clinics} onClinicClick={(clinic: any) => {
              setSelectedClinic(clinic);
              navigate("clinic-detail");
            }} />
          )}
        </div>

        {/* Список клінік */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clinics.map((clinic: any) => (
            <div key={clinic.id}
              onClick={() => { setSelectedClinic(clinic); navigate("clinic-detail"); }}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{clinic.image}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{clinic.name}</div>
                  <div className="text-xs text-gray-400">📍 {clinic.city}</div>
                  <div className="text-xs text-amber-500">★ {clinic.rating}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}