"use client";

import { useApp } from "@/app/lib/context";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}>★</span>
      ))}
      <span className="ml-1 text-xs text-gray-500 font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function ClinicCard({ clinic }: { clinic: any }) {
  const { navigate, clinicFavorites, toggleClinicFavorite } = useApp();
  const isFav = clinicFavorites.includes(clinic.id);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all">

      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative">
          {clinic.image}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{clinic.name}</h3>
            <button
              onClick={e => { e.stopPropagation(); toggleClinicFavorite(clinic.id); }}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <span className={isFav ? "text-red-500" : "text-gray-300"}>{isFav ? "♥" : "♡"}</span>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-0.5">📍 {clinic.city}, {clinic.address}</div>
        </div>
      </div>

      <StarRating rating={clinic.rating} />
      <div className="text-xs text-gray-400 mt-0.5">{clinic.reviews?.length || 0} відгуків · {clinic.doctors} лікарів</div>

      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{clinic.description}</p>

      {clinic.services && clinic.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {clinic.services.slice(0, 3).map((cs: any) => (
            <span key={cs.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {cs.service.name}
            </span>
          ))}
          {clinic.services.length > 3 && (
            <span className="text-xs text-gray-400">+{clinic.services.length - 3}</span>
          )}
        </div>
      )}

      <button
        onClick={() => navigate("clinic-detail", { clinic })}
        className="mt-3 w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
        Переглянути клініку
      </button>
    </div>
  );
}