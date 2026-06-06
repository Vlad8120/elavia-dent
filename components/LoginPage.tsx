"use client";

import { useState } from "react";
import { useApp } from "@/app/lib/context";
import { loginUser } from "@/app/lib/api";

export default function LoginPage() {
  const { login, navigate } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Заповніть всі поля"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        login(res.data.token, res.data.user);
        navigate("home");
      } else {
        setError(res.message || "Помилка входу");
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
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Вхід до Elavia Dent</h1>
            <p className="text-sm text-gray-500 mt-1">Введіть ваші дані для входу</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="example@email.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Пароль</label>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
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
              {loading ? "Завантаження..." : "Увійти"}
            </button>

            <div className="text-center text-xs text-gray-400 bg-gray-50 p-2 rounded-lg">
              Тест: admin@elavia-dent.ua / password123
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Немає акаунту?{" "}
            <button onClick={() => navigate("register")}
              className="text-blue-600 font-medium hover:underline">
              Зареєструватись
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}