"use client";

import { useState } from "react";
import { useApp } from "@/app/lib/context";
import { registerUser } from "@/app/lib/api";

const CITIES = ["Київ", "Львів", "Одеса", "Дніпро", "Харків", "Вінниця", "Запоріжжя", "Полтава"];

export default function RegisterPage() {
  const { login, navigate } = useApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    city: "",
    role: "BUYER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Заповніть всі обов'язкові поля");
      return;
    }
    if (form.password !== form.password2) {
      setError("Паролі не збігаються");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        city: form.city,
        role: form.role,
      });
      if (res.success) {
        login(res.data.token, res.data.user);
        navigate("home");
      } else {
        setError(res.message || "Помилка реєстрації");
      }
    } catch {
      setError("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">

          {/* Логотип */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Реєстрація</h1>
            <p className="text-sm text-gray-500 mt-1">Створіть акаунт Elavia Dent</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Повне ім'я *</label>
              <input
                value={form.name}
                onChange={e => handleChange("name", e.target.value)}
                placeholder="Іваненко Іван Іванович"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email *</label>
              <input
                value={form.email}
                onChange={e => handleChange("email", e.target.value)}
                type="email"
                placeholder="example@email.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Телефон</label>
              <input
                value={form.phone}
                onChange={e => handleChange("phone", e.target.value)}
                placeholder="+38 000 000-00-00"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Місто</label>
              <select
                value={form.city}
                onChange={e => handleChange("city", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Оберіть місто</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Тип акаунту</label>
              <select
                value={form.role}
                onChange={e => handleChange("role", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="BUYER">Покупець</option>
                <option value="SELLER">Продавець</option>
                <option value="CLINIC_OWNER">Власник клініки</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Пароль *</label>
              <input
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
                type="password"
                placeholder="Мінімум 6 символів"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Підтвердження пароля *</label>
              <input
                value={form.password2}
                onChange={e => handleChange("password2", e.target.value)}
                type="password"
                placeholder="Повторіть пароль"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
            >
              {loading ? "Завантаження..." : "Зареєструватися"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            Вже є акаунт?{" "}
            <button onClick={() => navigate("login")}
              className="text-blue-600 font-medium hover:underline">
              Увійти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}