"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/app/lib/context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export default function ChatWidget() {
  const { navigate } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Привіт! Я AI асистент Elavia Dent 🦷\n\nМожу допомогти:\n• Знайти товари та порівняти ціни\n• Підібрати клініку та послуги\n• Відповісти на питання про платформу\n\nЩо вас цікавить?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");

    const userMessage: Message = { id: Date.now(), role: "user", text: userText };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const [productsRes, clinicsRes, servicesRes] = await Promise.all([
        fetch(`${API}/products`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API}/clinics`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API}/services`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      const products = (productsRes.data || []).slice(0, 30);
      const clinics = (clinicsRes.data || []).slice(0, 15);
      const services = (servicesRes.data || []).slice(0, 20);

      const productsContext = products.map((p: any) =>
        `- ${p.title} | Ціна: ${p.price} грн | Місто: ${p.city} | Категорія: ${p.category?.name || "—"} | Опис: ${p.description ? p.description.slice(0, 100) : "Інформацію не надано — зверніться до продавця"}`
      ).join("\n");

      const clinicsContext = clinics.map((c: any) =>
        `- ${c.name} | Місто: ${c.city} | Адреса: ${c.address} | Телефон: ${c.phone} | Рейтинг: ${c.rating}/5 | Лікарів: ${c.doctors} | Послуги: ${c.services?.map((s: any) => s.service?.name).filter(Boolean).join(", ") || "не вказано"}`
      ).join("\n");

      const servicesContext = services.map((s: any) =>
        `- ${s.name} | Ціна від: ${s.priceFrom} грн до ${s.priceTo} грн | Тривалість: ${s.duration} | Опис: ${s.description || "не вказано"}`
      ).join("\n");

      const prices = products.map((p: any) => p.price).filter(Boolean);
      const minPrice = prices.length ? Math.min(...prices) : 0;
      const maxPrice = prices.length ? Math.max(...prices) : 0;
      const avgPrice = prices.length ? Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length) : 0;

      const systemPrompt = `Ти — розумний AI асистент платформи Elavia Dent, українського маркетплейсу стоматологічних товарів та послуг.

РЕАЛЬНІ ДАНІ З БАЗИ ДАНИХ:

=== ТОВАРИ (${products.length} штук) ===
${productsContext}

=== КЛІНІКИ (${clinics.length} штук) ===
${clinicsContext}

=== ПОСЛУГИ (${services.length} штук) ===
${servicesContext}

=== АНАЛІЗ ЦІН ===
Мінімальна ціна: ${minPrice} грн | Максимальна: ${maxPrice} грн | Середня: ${avgPrice} грн

ПРАВИЛА:
1. Відповідай ТІЛЬКИ українською
2. Використовуй ТІЛЬКИ реальні дані вище — не вигадуй
3. Якщо опис товару порожній — пиши: "По цьому товару детальна інформація не надана продавцем — зверніться до продавця напряму через кнопку 'Написати'"
4. При питаннях про ціни — аналізуй, порівнюй, давай рекомендації
5. При питаннях про клініки — вказуй адресу, телефон, рейтинг, послуги
6. Якщо послуга не вказана — пиши що інформація відсутня
7. Відповідай коротко але конкретно (3-6 речень)`;

      const conversationHistory = messages
        .filter(m => m.id !== 1)
        .slice(-6)
        .map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.text }));

      conversationHistory.push({ role: "user", content: userText });

      const response = await fetch(`${API}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory, systemPrompt }),
      });

      const data = await response.json();
      const text = data.text || "Вибачте, сталася помилка. Спробуйте ще раз.";

      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", text }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        text: "Вибачте, сталася технічна помилка 😔 Спробуйте ще раз.",
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const quickQuestions = [
    "Порівняй ціни на імплантати",
    "Клініки в Києві",
    "Де дешевше обладнання?",
    "Послуги з відбілювання",
  ];

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50 flex items-center justify-center text-2xl">
        {isOpen ? "✕" : "🦷"}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden"
          style={{ height: "520px" }}>

          <div className="bg-blue-600 text-white p-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🦷</div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Elavia Dent AI</div>
              <div className="text-xs text-blue-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                Онлайн · Знає реальні ціни та клініки
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1 mr-2">🦷</div>
                )}
                <div className={`max-w-xs px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1 mr-2">🦷</div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    <span className="text-xs text-gray-400 ml-1">Аналізую дані…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0">
            {quickQuestions.map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors">
                {q}
              </button>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Запитайте про товари, клініки, ціни…"
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50" />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="w-9 h-9 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "➤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}