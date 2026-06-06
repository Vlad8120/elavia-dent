"use client";

import { useState, useRef } from "react";

interface Props {
  onUpload: (urls: string[]) => void;
  currentImages?: string[];
}

export default function ImageUpload({ onUpload, currentImages }: Props) {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages || []);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "elavia_dent");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dcpksxngc/image/upload`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    return data.secure_url || null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = 10 - previews.length;
    if (remaining <= 0) {
      setError("Максимум 10 фото");
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    setUploading(true);
    setError("");

    try {
      const urls = await Promise.all(filesToUpload.map(uploadFile));
      const validUrls = urls.filter(Boolean) as string[];
      const newPreviews = [...previews, ...validUrls];
      setPreviews(newPreviews);
      onUpload(newPreviews);
    } catch {
      setError("Помилка завантаження");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onUpload(newPreviews);
  }

  return (
    <div className="space-y-3">
      {/* Сітка фото */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {previews.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
              <img src={url} alt={`Фото ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                ✕
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                  Головне
                </span>
              )}
            </div>
          ))}

          {/* Кнопка додати ще */}
          {previews.length < 10 && (
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-xl">+</span>
                  <span className="text-xs text-gray-400">Додати</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Велика зона якщо фото немає */}
      {previews.length === 0 && (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all"
        >
          {uploading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Завантаження...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm text-gray-500">Натисніть щоб завантажити фото</p>
              <p className="text-xs text-gray-400 mt-1">До 10 фото, PNG/JPG</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{previews.length}/10 фото</span>
        {previews.length > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || previews.length >= 10}
            className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            + Додати ще фото
          </button>
        )}
      </div>
    </div>
  );
}