"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import { formatPrice } from "@/app/lib/utils";
import { useApp } from "@/app/lib/context";

type CompareContextType = {
  compareList: any[];
  addToCompare: (product: any) => void;
  removeFromCompare: (id: number) => void;
  isInCompare: (id: number) => boolean;
  clearCompare: () => void;
};

const CompareContext = createContext<CompareContextType | null>(null);

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<any[]>([]);

  function addToCompare(product: any) {
    if (compareList.length >= 3) return;
    if (compareList.find(p => p.id === product.id)) return;
    setCompareList(prev => [...prev, product]);
  }

  function removeFromCompare(id: number) {
    setCompareList(prev => prev.filter(p => p.id !== id));
  }

  function isInCompare(id: number) {
    return compareList.some(p => p.id === id);
  }

  function clearCompare() {
    setCompareList([]);
  }

  return (
    <CompareContext.Provider value={{ compareList, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export default function CompareWidget() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { navigate } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Кнопка порівняння */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 left-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all z-50 flex items-center gap-2"
      >
        <span>⚖️</span>
        <span className="text-sm font-semibold">Порівняти ({compareList.length})</span>
      </button>

      {/* Панель порівняння */}
      {isOpen && (
        <div className="fixed bottom-40 left-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 w-80 sm:w-96">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Порівняння товарів</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {compareList.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                <span className="text-2xl">{p.image}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.title}</div>
                  <div className="text-xs text-blue-600 font-bold">{formatPrice(p.price)}</div>
                </div>
                <button onClick={() => removeFromCompare(p.id)}
                  className="text-red-400 hover:text-red-600 text-sm">✕</button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100 flex gap-2">
            <button
              onClick={() => { navigate("compare"); setIsOpen(false); }}
              className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
              Порівняти
            </button>
            <button onClick={clearCompare}
              className="px-3 py-2 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50">
              Очистити
            </button>
          </div>
        </div>
      )}
    </>
  );
}