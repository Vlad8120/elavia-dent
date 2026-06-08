"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchCategories } from "@/app/lib/api";
import ImageUpload from "@/components/ImageUpload";

const CITIES = ["Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Запоріжжя", "Полтава"];
const OBLASTS: Record<string, string> = {
  "Київ": "Київська", "Львів": "Львівська", "Одеса": "Одеська",
  "Дніпро": "Дніпропетровська", "Харків": "Харківська",
  "Вінниця": "Вінницька", "Запоріжжя": "Запорізька", "Полтава": "Полтавська",
};

const inputCls = "w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const selectCls = "w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

export default function NewListingPage() {
  const { user, navigate, token } = useApp();
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "", description: "", price: "", city: "",
    condition: "NEW", categoryId: "", image: "🦷",
    contactPhone: "", contactEmail: "",
  });

  useEffect(() => {
    fetchCategories().then(data => setCategories(data || []));
    if (user) setForm(prev => ({ ...prev, contactEmail: user.email || "" }));
  }, [user]);

  if (!user) { navigate("login"); return null; }

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.price || !form.city || !form.categoryId) {
      setError("Заповніть всі обов'язкові поля"); return;
    }
    setLoading(true); setError("");
    try {
      const description = form.description +
        (form.contactPhone ? `\n📞 ${form.contactPhone}` : "") +
        (form.contactEmail ? `\n📧 ${form.contactEmail}` : "");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: form.title,
          description,
          price: Number(form.price),
          city: form.city,
          oblast: OBLASTS[form.city] || "",
          condition: form.condition,
          categoryId: Number(form.categoryId),
          sellerId: user.id,
          image: imageUrls.length > 0 ? JSON.stringify(imageUrls) : form.image,
        }),
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); }
      else { setError(data.message || "Помилка створення оголошення"); }
    } catch { setError("Помилка з'єднання з сервером"); }
    finally { setLoading(false); }
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Оголошення успішно створено!</h2>
          <p className="text-gray-500 text-sm mb-6">Ваше оголошення додано до маркетплейсу.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("marketplace")}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm">
              До маркетплейсу
            </button>
            <button onClick={() => {
              setSubmitted(false); setImageUrls([]);
              setForm({ title: "", description: "", price: "", city: "", condition: "NEW", categoryId: "", image: "🦷", contactPhone: "", contactEmail: user.email || "" });
            }}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm">
              Додати ще
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Нове оголошення</h1>
          <p className="text-gray-500 text-sm">Заповніть форму для публікації товару</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Фото товару (до 10 штук)</label>
              <ImageUpload onUpload={(urls) => setImageUrls(urls)} currentImages={imageUrls} />
            </div>

            {imageUrls.length === 0 && (
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Або оберіть іконку</label>
                <div className="flex gap-2 flex-wrap">
                  {["🦷", "🔧", "💊", "⚙️", "💡", "📡", "🪑", "⚗️", "💉", "📐"].map(icon => (
                    <button key={icon} type="button" onClick={() => handleChange("image", icon)}
                      className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${form.image === icon ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Назва товару *</label>
              <input
                value={form.title}
                onChange={e => handleChange("title", e.target.value)}
                placeholder="Напр.: Стоматологічна установка KAVO"
                className={inputCls}
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Опис *</label>
              <textarea
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
                rows={4}
                placeholder="Детальний опис товару…"
                className={`${inputCls} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Ціна (UAH) *</label>
                <input
                  value={form.price}
                  onChange={e => handleChange("price", e.target.value)}
                  type="number"
                  placeholder="0"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Стан</label>
                <select value={form.condition} onChange={e => handleChange("condition", e.target.value)} className={selectCls}>
                  <option value="NEW">Новий</option>
                  <option value="USED">Б/у</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Місто *</label>
                <select value={form.city} onChange={e => handleChange("city", e.target.value)} className={selectCls}>
                  <option value="">Оберіть місто</option>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Категорія *</label>
                <select value={form.categoryId} onChange={e => handleChange("categoryId", e.target.value)} className={selectCls}>
                  <option value="">Оберіть категорію</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">📞 Контактна інформація</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Телефон</label>
                  <input
                    value={form.contactPhone}
                    onChange={e => handleChange("contactPhone", e.target.value)}
                    placeholder="+38 000 000-00-00"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                  <input
                    value={form.contactEmail}
                    onChange={e => handleChange("contactEmail", e.target.value)}
                    type="email"
                    placeholder="example@email.com"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
              {loading ? "Публікація..." : "Опублікувати оголошення"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}