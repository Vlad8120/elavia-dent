"use client";

import { useApp } from "@/app/lib/context";

export default function AboutPage() {
  const { navigate } = useApp();

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Заголовок */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-6">
          <div className="text-5xl mb-4">🦷</div>
          <h1 className="text-3xl font-bold mb-2">Про Elavia Dent</h1>
          <p className="text-blue-100 text-lg">
            Інтелектуальна платформа для стоматологічного ринку України
          </p>
        </div>

        {/* Місія */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-3">🎯 Наша місія</h2>
          <p className="text-gray-600 leading-relaxed">
            Elavia Dent — це сучасна веб-платформа яка об'єднує покупців та продавців
            стоматологічних товарів, клініки та пацієнтів в одному місці. Ми прагнемо
            зробити пошук стоматологічних товарів та послуг простим, швидким та зручним
            для кожного користувача в Україні.
          </p>
        </div>

        {/* Що ми пропонуємо */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💡 Що ми пропонуємо</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🛒", title: "Маркетплейс товарів", desc: "Понад 20 категорій стоматологічних товарів від перевірених продавців" },
              { icon: "🏥", title: "Каталог клінік", desc: "8 перевірених стоматологічних клінік по всій Україні з рейтингами та відгуками" },
              { icon: "⚕️", title: "Послуги", desc: "Повний перелік стоматологічних послуг з цінами та тривалістю" },
              { icon: "📊", title: "Аналітика цін", desc: "Порівнюйте ціни по категоріях та містах України" },
              { icon: "🔍", title: "Розумний пошук", desc: "Знаходьте потрібне за секунди завдяки інтелектуальній системі пошуку" },
              { icon: "🤖", title: "AI асистент", desc: "Цілодобовий чат-асистент допоможе знайти відповідь на будь-яке питання" },
            ].map(item => (
              <div key={item.title} className="flex gap-3 p-3 rounded-xl bg-gray-50">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Статистика */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Платформа в цифрах</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { value: "20+", label: "Товарів" },
              { value: "8", label: "Клінік" },
              { value: "8", label: "Міст" },
              { value: "10", label: "Послуг" },
            ].map(s => (
              <div key={s.label} className="bg-blue-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Команда */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">👨‍💻 Розробник</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
              👨‍🎓
            </div>
            <div>
              <div className="font-bold text-gray-900">Кнюх Владислав Михайлович</div>
              <div className="text-sm text-gray-500">Студент КНЕУ</div>
              <div className="text-sm text-gray-500">Дипломний проект 2025</div>
              <div className="text-xs text-blue-600 mt-1">
                Тема: «Розроблення веб-системи інтелектуального пошуку стоматологічних товарів та послуг»
              </div>
            </div>
          </div>
        </div>

        {/* Технології */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Технології</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Next.js 16", "React 19", "TypeScript",
              "Tailwind CSS", "Node.js", "Express.js",
              "PostgreSQL", "Prisma ORM", "JWT", "bcrypt",
            ].map(tech => (
              <span key={tech} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          <button onClick={() => navigate("marketplace")}
            className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Перейти до маркетплейсу
          </button>
          <button onClick={() => navigate("clinics")}
            className="flex-1 py-3 border border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
            Переглянути клініки
          </button>
        </div>

      </div>
    </div>
  );
}