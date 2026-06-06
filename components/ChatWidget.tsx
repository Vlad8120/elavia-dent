"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/app/lib/context";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

const FAQ: Record<string, string> = {
  "привіт": "Привіт! Я AI асистент Elavia Dent 🦷 Допоможу знайти стоматологічні товари, клініки та послуги. Що вас цікавить?",
  "hello": "Привіт! Я AI асистент Elavia Dent 🦷 Чим можу допомогти?",
  "допоможи": "Звичайно! Я можу допомогти вам знайти товари, клініки або послуги. Що саме шукаєте?",
  "товари": "На нашому маркетплейсі є понад 20 стоматологічних товарів! Категорії: обладнання, інструменти, матеріали, імплантати та інші. Перейдіть до розділу 'Товари' щоб переглянути всі.",
  "клініки": "У нас представлено 8 перевірених стоматологічних клінік по всій Україні: Київ, Львів, Одеса, Дніпро, Харків, Вінниця, Запоріжжя, Полтава. Перейдіть до розділу 'Клініки'.",
  "послуги": "Ми пропонуємо інформацію про 10 видів стоматологічних послуг: терапія, хірургія, імплантація, ортодонтія, протезування та інші. Перейдіть до розділу 'Послуги'.",
  "ціна": "Ціни на товари від 380 грн до 420 000 грн. Для порівняння цін перейдіть до розділу 'Аналітика цін'. Там можна обрати категорію і побачити мін/макс/середню ціну.",
  "ціни": "Ціни на товари від 380 грн до 420 000 грн. Для порівняння цін перейдіть до розділу 'Аналітика цін'.",
  "реєстрація": "Для реєстрації натисніть кнопку 'Реєстрація' у верхньому правому куті. Заповніть форму і виберіть тип акаунту: Покупець, Продавець або Власник клініки.",
  "увійти": "Для входу натисніть 'Увійти' у верхньому правому куті. Тестовий акаунт: admin@elavia-dent.ua / password123",
  "пошук": "Використовуйте пошуковий рядок вгорі сторінки або на головній. Можна шукати товари, клініки та послуги одночасно!",
  "фільтр": "На сторінці товарів є фільтри по місту, категорії, ціні та сортуванню. На сторінці клінік — фільтр по місту.",
  "обране": "Щоб додати товар в обране — натисніть ♡ на картці товару. Всі збережені товари будуть у розділі 'Обране'.",
  "оголошення": "Щоб додати оголошення — увійдіть в акаунт і натисніть '+ Додати' у верхньому меню. Заповніть форму з назвою, описом, ціною та категорією.",
  "київ": "У Києві є клініки: Стоматологія «Dent Lux» (вул. Хрещатик, 22). Також багато товарів від продавців з Києва!",
  "львів": "У Львові є клініка Dental Art Lviv (пр. Свободи, 18). Рейтинг 4.8 ⭐",
  "одеса": "В Одесі є клініка «Одеса Дент» (вул. Дерибасівська, 5). Найбільша мережа в місті!",
  "імплантати": "Імплантати Nobel Biocare Active (5 шт) — 52 000 грн. Доступні в Києві. Перейдіть до розділу 'Товари' → категорія 'Імплантати'.",
  "дякую": "Будь ласка! 😊 Якщо є ще питання — звертайтесь!",
  "дякую!": "Будь ласка! 😊",
  "бувай": "До побачення! Гарного дня! 🦷",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase().trim();

  for (const key of Object.keys(FAQ)) {
    if (lower.includes(key)) {
      return FAQ[key];
    }
  }

  if (lower.includes("устан") || lower.includes("крісл") || lower.includes("обладн")) {
    return "Стоматологічне обладнання на нашому маркетплейсі: установки KAVO, крісла A-Dec, рентген Planmeca та інше. Перейдіть до розділу 'Товари' → категорія 'Стоматологічне обладнання'.";
  }

  if (lower.includes("автокл") || lower.includes("дезинф") || lower.includes("стерил")) {
    return "Для дезінфекції та стерилізації у нас є автоклав Melag Vacuklav 31B+ за 96 000 грн та дезінфектор Durr FD 366 за 680 грн.";
  }

  if (lower.includes("анесте")) {
    return "Анестетик Ubistesini 4% (50 карпул) — 2 100 грн. Доступний в Дніпрі. Перейдіть до розділу 'Товари' → категорія 'Анестезія'.";
  }

  if (lower.includes("брекет") || lower.includes("ортодон")) {
    return "Ортодонтичні послуги доступні в клініках Харків Смайл, Dental Art Lviv та Арт-Дент Дніпро. Ціни від 15 000 до 85 000 грн. Також є брекети 3M Clarity у розділі Товари.";
  }

  if (lower.includes("контакт") || lower.includes("телефон")) {
    return "Контакти клінік доступні на сторінці кожної клініки. Перейдіть до розділу 'Клініки' і натисніть 'Переглянути клініку'.";
  }

  return "Вибачте, не зовсім зрозумів запит 🤔 Спробуйте запитати про: товари, клініки, послуги, ціни, реєстрацію, пошук або конкретне місто.";
}

export default function ChatWidget() {
  const { navigate } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Привіт! Я AI асистент Elavia Dent 🦷 Допоможу знайти стоматологічні товари, клініки та послуги по всій Україні. Що вас цікавить?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      text: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = getResponse(input);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        text: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setTyping(false);
    }, 800);
  }

  const quickQuestions = [
    "Які товари є?",
    "Клініки в Києві",
    "Як додати оголошення?",
    "Порівняти ціни",
  ];

  return (
    <>
      {/* Кнопка відкриття */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center justify-center text-2xl"
      >
        {isOpen ? "✕" : "🦷"}
      </button>

      {/* Вікно чату */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* Шапка */}
          <div className="bg-blue-600 text-white p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              🦷
            </div>
            <div>
              <div className="font-semibold text-sm">Elavia Dent Assistant</div>
              <div className="text-xs text-blue-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Онлайн
              </div>
            </div>
          </div>

          {/* Повідомлення */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Швидкі питання */}
          <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
            {quickQuestions.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                {q}
              </button>
            ))}
          </div>

          {/* Поле вводу */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Напишіть питання…"
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}