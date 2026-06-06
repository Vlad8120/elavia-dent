"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchProducts } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";
import ProductCard from "@/components/ProductCard";
import ChatModal from "@/components/ChatModal";

function resolveImage(image: string | null | undefined): string | null {
  if (!image) return null;
  if (image.startsWith("https://") || image.startsWith("http://")) return image;
  const uploadIndex = image.indexOf("image/upload");
  if (uploadIndex !== -1) return `https://res.cloudinary.com/dcpksxngc/${image.substring(uploadIndex)}`;
  return null;
}

function parseImages(image: string | null | undefined): string[] {
  if (!image) return [];
  try {
    const parsed = JSON.parse(image);
    if (Array.isArray(parsed)) return parsed.map(img => resolveImage(img) || img).filter(Boolean);
  } catch {}
  const resolved = resolveImage(image);
  return resolved ? [resolved] : [];
}

function parseContact(description: string | undefined, prefix: string): string {
  if (!description) return "";
  const line = description.split("\n").find(l => l.includes(prefix));
  return line ? line.replace(prefix, "").trim() : "";
}

export default function ProductDetailPage() {
  const { selectedProduct, navigate, favorites, toggleFavorite, user } = useApp();
  const [similar, setSimilar] = useState([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const isFav = selectedProduct ? favorites.includes(selectedProduct.id) : false;
  const images = parseImages(selectedProduct?.image);

  const phone = parseContact(selectedProduct?.description, "📞");
  const email = parseContact(selectedProduct?.description, "📧");
  const cleanDescription = selectedProduct?.description
    ?.split("\n")
    .filter((l: string) => !l.includes("📞") && !l.includes("📧"))
    .join("\n") || "";

  useEffect(() => {
    if (selectedProduct) {
      setActivePhoto(0);
      fetchProducts({ categoryId: selectedProduct.categoryId })
        .then(data => setSimilar((data || []).filter((p: any) => p.id !== selectedProduct.id).slice(0, 4)));
    }
  }, [selectedProduct]);

  if (!selectedProduct) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-5xl mb-3">📦</div>
          <p className="font-medium text-gray-700">Товар не обрано</p>
          <button onClick={() => navigate("marketplace")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
            До маркетплейсу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        <button onClick={() => navigate("marketplace")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-6">
          ← Назад до маркетплейсу
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Галерея */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-col gap-3">
            <div className="h-64 flex items-center justify-center overflow-hidden rounded-xl bg-gray-50">
              {images.length > 0 ? (
                <img src={images[activePhoto]} alt={selectedProduct.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-8xl">{selectedProduct.image || "🦷"}</span>
              )}
            </div>
            {images.length > 1 && (
              <>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, index) => (
                    <button key={index} onClick={() => setActivePhoto(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activePhoto === index ? "border-blue-500" : "border-gray-200"}`}>
                      <img src={img} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between px-1">
                  <button onClick={() => setActivePhoto(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm">←</button>
                  <span className="text-xs text-gray-400">{activePhoto + 1} / {images.length}</span>
                  <button onClick={() => setActivePhoto(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 text-sm">→</button>
                </div>
              </>
            )}
          </div>

          {/* Інформація */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-full mb-2">
              {selectedProduct.category?.name}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedProduct.title}</h1>
            <div className="text-2xl font-bold text-gray-900 mb-1">{formatPrice(selectedProduct.price)}</div>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              <span>📍 {selectedProduct.city}</span>
              <span>👁 {selectedProduct.views} переглядів</span>
              <span className={`px-2 py-0.5 rounded-full font-medium ${selectedProduct.condition === "NEW" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {selectedProduct.condition === "NEW" ? "Новий" : "Б/у"}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line">{cleanDescription}</p>

            {(phone || email) && (
              <div className="p-3 bg-gray-50 rounded-xl mb-4 space-y-1">
                {phone && <div className="text-sm text-gray-700">📞 {phone}</div>}
                {email && <div className="text-sm text-gray-700">📧 {email}</div>}
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">{selectedProduct.seller?.name?.[0] || "П"}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{selectedProduct.seller?.name}</div>
                  <div className="text-xs text-gray-400">📍 {selectedProduct.seller?.city}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => user ? setShowChat(true) : navigate("login")}
                  className="flex-1 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
                  💬 Написати продавцю
                </button>
                <button
                  onClick={() => user ? setShowContact(true) : navigate("login")}
                  className="flex-1 py-3 border border-blue-200 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50">
                  📞 Контакти
                </button>
                <button onClick={() => toggleFavorite(selectedProduct.id)}
                  className={`w-12 h-12 flex items-center justify-center rounded-xl border transition-colors ${isFav ? "bg-red-50 border-red-200" : "border-gray-200 hover:bg-gray-50"}`}>
                  <span className={isFav ? "text-red-500" : "text-gray-400"}>{isFav ? "♥" : "♡"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {similar.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Схожі товари</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Модальне вікно контакту */}
      {showContact && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Контакт продавця</h3>
              <button onClick={() => setShowContact(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-bold text-lg">{selectedProduct.seller?.name?.[0] || "П"}</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{selectedProduct.seller?.name}</div>
                <div className="text-xs text-gray-400">📍 {selectedProduct.seller?.city}</div>
              </div>
            </div>
            <div className="space-y-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Товар</div>
                <div className="text-sm font-medium text-gray-900">{selectedProduct.title}</div>
                <div className="text-sm font-bold text-blue-600 mt-1">{formatPrice(selectedProduct.price)}</div>
              </div>
              {phone ? (
                <div className="p-3 border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">📞 Телефон</div>
                  <div className="text-sm font-medium text-gray-900">{phone}</div>
                </div>
              ) : null}
              {email ? (
                <div className="p-3 border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">📧 Email</div>
                  <div className="text-sm font-medium text-gray-900">{email}</div>
                </div>
              ) : null}
              {!phone && !email && (
                <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700">
                  Продавець не вказав контактні дані
                </div>
              )}
            </div>
            <div className="space-y-2">
              {phone && (
                <a href={`tel:${phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700">
                  📞 Зателефонувати
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">
                  📧 Написати Email
                </a>
              )}
              <button onClick={() => setShowContact(false)}
                className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Чат */}
      {showChat && (
        <ChatModal product={selectedProduct} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}