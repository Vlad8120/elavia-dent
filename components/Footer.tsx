"use client";

import { useApp } from "@/app/lib/context";

export default function Footer() {
  const { navigate } = useApp();

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">

          {/* Логотип */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-white font-bold text-lg">Elavia Dent</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Інтелектуальна платформа пошуку стоматологічних товарів, клінік та послуг в Україні.
            </p>
          </div>

          {/* Платформа */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Платформа</h4>
            <ul className="space-y-2">
              {[
                { label: "Товари", page: "marketplace" },
                { label: "Клініки", page: "clinics" },
                { label: "Послуги", page: "services" },
                { label: "Аналітика цін", page: "analytics" },
              ].map(link => (
                <li key={link.page}>
                  <button onClick={() => navigate(link.page)}
                    className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Акаунт */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Акаунт</h4>
            <ul className="space-y-2">
              {[
                { label: "Реєстрація", page: "register" },
                { label: "Увійти", page: "login" },
                { label: "Профіль", page: "profile" },
                { label: "Мої оголошення", page: "my-listings" },
              ].map(link => (
                <li key={link.page}>
                  <button onClick={() => navigate(link.page)}
                    className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Підтримка */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Підтримка</h4>
            <ul className="space-y-2">
              {[
                { label: "Про нас", page: "about" },
                { label: "Контакти", page: "contacts" },
                { label: "Умови використання", page: "terms" },
                { label: "Конфіденційність", page: "privacy" },
              ].map(link => (
                <li key={link.page}>
                  <button onClick={() => navigate(link.page)}
                    className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Нижній рядок */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-600">© 2025 Elavia Dent. Дипломний проект КНЕУ.</p>
          <p className="text-xs text-gray-600">Розробник: Кнюх Владислав Михайлович</p>
        </div>
      </div>
    </footer>
  );
}