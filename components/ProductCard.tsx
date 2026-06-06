"use client";

import { useApp } from "@/app/lib/context";
import { formatPrice } from "@/app/lib/utils";
import { useCompare } from "@/components/CompareWidget";

function resolveImage(image: string | null | undefined): string | null {
  if (!image) return null;
  try {
    const parsed = JSON.parse(image);
    if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
  } catch {}
  if (image.startsWith("https://") || image.startsWith("http://")) return image;
  const uploadIndex = image.indexOf("image/upload");
  if (uploadIndex !== -1) return `https://res.cloudinary.com/dcpksxngc/${image.substring(uploadIndex)}`;
  return null;
}

export default function ProductCard({ product }: { product: any }) {
  const { navigate, favorites, toggleFavorite } = useApp();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isFav = favorites.includes(product.id);
  const inCompare = isInCompare(product.id);
  const imageUrl = resolveImage(product.image);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="relative bg-gray-50 h-40 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{product.image || "🦷"}</span>
        )}
        {product.condition === "USED" && (
          <span className="absolute top-2 left-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Б/у</span>
        )}
        <button onClick={() => toggleFavorite(product.id)}
          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
          <span className={isFav ? "text-red-500" : "text-gray-300"}>{isFav ? "♥" : "♡"}</span>
        </button>
      </div>
      <div className="p-3">
        <div className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-full mb-1.5">
          {product.category?.name}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
          {product.title}
        </h3>
        <div className="text-base font-bold text-gray-900 mb-2">{formatPrice(product.price)}</div>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>📍 {product.city}</span>
          <span>👁 {product.views}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => navigate("product-detail", { product })}
            className="flex-1 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
            Детальніше
          </button>
          <button onClick={() => inCompare ? removeFromCompare(product.id) : addToCompare(product)}
            className={`px-2 py-2 text-xs rounded-lg border transition-colors ${inCompare ? "bg-green-100 text-green-700 border-green-200" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}
            title="Порівняти">⚖️</button>
        </div>
      </div>
    </div>
  );
}