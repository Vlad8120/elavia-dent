"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Повідомлення надіслано!</h2>
          <p className="text-gray-500 text-sm">Ми зв'яжемось з вами найближчим часом.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Контакти</h1>
          <p className="text-gray-500 text-sm">Зв'яжіться з нами будь-яким зручним способом</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Контактна інформація */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">📬 Контактна інформація</h2>
              <div className="space-y-3">
                {[
                  { icon: "✉️", label: "Email", value: "info@elavia-dent.ua" },
                  { icon: "📞", label: "Телефон", value: "+38 044 123-45-67" },
                  { icon: "📍", label: "Адреса", value: "м. Київ, Україна" },
                  { icon: "🕐", label: "Графік роботи", value: "Пн-Пт: 9:00-18:00" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="text-sm font-medium text-gray-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-bold text-gray-900 mb-4">🌐 Соціальні мережі</h2>
              <div className="space-y-2">
                {[
                  { icon: "📘", label: "Facebook", value: "facebook.com/elavia-dent" },
                  { icon: "📸", label: "Instagram", value: "instagram.com/elavia-dent" },
                  { icon: "💬", label: "Telegram", value: "t.me/elavia_dent" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                      <div className="text-sm text-blue-600">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Форма */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">💌 Написати нам</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Ваше ім'я *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Іваненко Іван"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Email *</label>
                <input
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  type="email"
                  placeholder="example@email.com"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Тема</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  placeholder="Тема звернення"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Повідомлення *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  rows={4}
                  placeholder="Ваше повідомлення…"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              <button type="submit"
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm">
                Надіслати повідомлення
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}