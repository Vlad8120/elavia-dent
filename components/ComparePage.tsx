"use client";

import { useApp } from "@/app/lib/context";
import { useCompare } from "@/components/CompareWidget";
import { formatPrice } from "@/app/lib/utils";

export default function ComparePage() {
  const { navigate } = useApp();
  const { compareList, removeFromCompare, clearCompare } = useCompare();

  if (compareList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-5xl mb-3">⚖️</div>
          <p className="font-medium text-gray-700">Немає товарів для порівняння</p>
          <p className="text-sm text-gray-500 mb-4">Додайте товари через кнопку порівняння</p>
          <button onClick={() => navigate("marketplace")}
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
            До маркетплейсу
          </button>
        </div>
      </div>
    );
  }

  const fields = [
    { label: "Фото", key: "image", render: (v: any) => <span className="text-4xl">{v}</span> },
    { label: "Назва", key: "title", render: (v: any) => <span className="font-medium text-sm">{v}</span> },
    { label: "Ціна", key: "price", render: (v: any) => <span className="font-bold text-blue-600">{formatPrice(v)}</span> },
    { label: "Категорія", key: "category", render: (v: any) => <span className="text-sm">{v?.name || "-"}</span> },
    { label: "Місто", key: "city", render: (v: any) => <span className="text-sm">📍 {v}</span> },
    { label: "Стан", key: "condition", render: (v: any) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v === "NEW" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
        {v === "NEW" ? "Новий" : "Б/у"}
      </span>
    )},
    { label: "Перегляди", key: "views", render: (v: any) => <span className="text-sm">👁 {v}</span> },
    { label: "Продавець", key: "seller", render: (v: any) => <span className="text-sm">{v?.name || "-"}</span> },
  ];

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Порівняння товарів</h1>
            <p className="text-gray-500 text-sm">{compareList.length} товари для порівняння</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("marketplace")}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50">
              + Додати товар
            </button>
            <button onClick={clearCompare}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50">
              Очистити
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="p-4 text-left text-xs font-medium text-gray-500 w-32">
                    Характеристика
                  </th>
                  {compareList.map(p => (
                    <th key={p.id} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">{p.image}</span>
                        <span className="text-xs font-medium text-gray-700 line-clamp-2">{p.title}</span>
                        <button onClick={() => removeFromCompare(p.id)}
                          className="text-xs text-red-400 hover:text-red-600">
                          Видалити
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map(field => (
                  <tr key={field.key} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 text-xs font-medium text-gray-500">
                      {field.label}
                    </td>
                    {compareList.map(p => (
                      <td key={p.id} className="p-4 text-center">
                        {field.render(p[field.key])}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Рядок з кнопками */}
                <tr>
                  <td className="p-4"></td>
                  {compareList.map(p => (
                    <td key={p.id} className="p-4 text-center">
                      <button
                        onClick={() => {
                          navigate("product-detail", { product: p });
                        }}
                        className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">
                        Детальніше
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}