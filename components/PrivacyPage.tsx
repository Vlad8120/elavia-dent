"use client";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Політика конфіденційності</h1>
          <p className="text-sm text-gray-500 mb-6">Останнє оновлення: 1 червня 2025 року</p>

          <div className="space-y-6 text-sm text-gray-600 leading-relaxed">

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">1. Які дані ми збираємо</h2>
              <p>При реєстрації на платформі Elavia Dent ми збираємо такі дані:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Ім'я та прізвище користувача</li>
                <li>Адреса електронної пошти</li>
                <li>Номер телефону (необов'язково)</li>
                <li>Місто проживання (необов'язково)</li>
                <li>Зашифрований пароль</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">2. Як ми використовуємо дані</h2>
              <p>Зібрані дані використовуються виключно для:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Авторизації та ідентифікації користувача</li>
                <li>Відображення персоналізованого контенту</li>
                <li>Зв'язку з користувачем при необхідності</li>
                <li>Покращення роботи платформи</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">3. Захист даних</h2>
              <p>Платформа Elavia Dent використовує сучасні методи захисту даних. Паролі зберігаються у зашифрованому вигляді за допомогою алгоритму bcrypt. Авторизація здійснюється через JWT токени з обмеженим терміном дії.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. Передача даних третім особам</h2>
              <p>Ми не передаємо персональні дані користувачів третім особам без їх згоди. Виняток становлять випадки передбачені законодавством України.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">5. Cookie файли</h2>
              <p>Платформа використовує localStorage браузера для зберігання токену авторизації та налаштувань користувача. Ці дані зберігаються виключно на вашому пристрої.</p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">6. Права користувача</h2>
              <p>Кожен користувач має право:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Отримати доступ до своїх персональних даних</li>
                <li>Виправити неточні дані</li>
                <li>Видалити свій акаунт та всі пов'язані дані</li>
                <li>Відкликати згоду на обробку даних</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">7. Контакти</h2>
              <p>З питань конфіденційності звертайтесь: privacy@elavia-dent.ua</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}