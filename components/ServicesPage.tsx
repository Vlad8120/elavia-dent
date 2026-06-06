"use client";

import { useState, useEffect } from "react";
import { fetchServices } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices()
      .then(data => setServices(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Стоматологічні послуги</h1>
          <p className="text-gray-500 text-sm">Огляд послуг та цін у клініках України</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s: any) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
                <h3 className="font-bold text-gray-900 mb-1">{s.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{s.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs text-gray-400">Вартість: </span>
                    <span className="text-sm font-bold text-blue-600">
                      {formatPrice(s.priceFrom)} – {formatPrice(s.priceTo)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">⏱ {s.duration}</div>
                </div>
                <div className="text-xs text-gray-400">
                  Доступно у {s.clinics?.length || 0} клінік(ах)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}