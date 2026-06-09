"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { formatPrice } from "@/app/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function ClinicChatModal({ clinic, onClose }: { clinic: any; onClose: () => void }) {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const receiverId = clinic.ownerId || 1;

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    try {
      const res = await fetch(`${API}/clinic-messages/${clinic.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch {} finally { setLoading(false); }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/clinic-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: text.trim(), receiverId, clinicId: clinic.id }),
      });
      const data = await res.json();
      if (data.success) { setMessages(prev => [...prev, data.data]); setText(""); inputRef.current?.focus(); }
    } catch {} finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col" style={{ height: "520px" }}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl flex-shrink-0">
            {clinic.image || "🏥"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{clinic.name}</div>
            <div className="text-xs text-gray-400">📍 {clinic.city}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-4xl mb-3">🏥</div>
              <p className="text-sm font-medium">Почніть розмову з клінікою</p>
              <p className="text-xs mt-1 text-center">Запитайте про послуги, ціни або запис</p>
            </div>
          ) : messages.map(msg => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && <span className="text-xs text-gray-400 px-1">{msg.sender?.name}</span>}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-gray-400 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <input ref={inputRef} value={text} onChange={e => setText(e.target.value)}
            placeholder="Написати повідомлення…" disabled={sending}
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
          <button type="submit" disabled={sending || !text.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
            {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "➤"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ClinicDetailPage() {
  const { selectedClinic, setSelectedClinic, navigate, user, token } = useApp();
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showChat, setShowChat] = useState(false);

  if (!selectedClinic) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="text-center">
          <div className="text-5xl mb-3">🏥</div>
          <p className="font-medium text-gray-700">Клініку не обрано</p>
          <button onClick={() => navigate("clinics")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
            До списку клінік
          </button>
        </div>
      </div>
    );
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewText) { setError("Напишіть відгук"); return; }
    setSubmitting(true); setError("");
    try {
      const res = await fetch(`${API}/clinics/${selectedClinic.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: reviewText, rating: reviewRating }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Відгук успішно додано! ✅");
        setReviewText(""); setReviewRating(5);
        setSelectedClinic({ ...selectedClinic, reviews: [data.data, ...(selectedClinic.reviews || [])] });
      } else { setError(data.message || "Помилка додавання відгуку"); }
    } catch { setError("Помилка з'єднання з сервером"); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        <button onClick={() => navigate("clinics")}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mb-6">
          ← Назад до клінік
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0">
              {selectedClinic.image}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedClinic.name}</h1>
              <div className="text-sm text-gray-500 mt-1">📍 {selectedClinic.city}, {selectedClinic.address}</div>
              <div className="flex items-center gap-1 mt-2">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={i <= Math.round(selectedClinic.rating) ? "text-amber-400" : "text-gray-200"}>★</span>
                ))}
                <span className="ml-1 text-sm text-gray-500">{selectedClinic.rating?.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-4">{selectedClinic.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Лікарів", value: selectedClinic.doctors },
              { label: "Рейтинг", value: `${selectedClinic.rating?.toFixed(1)}/5` },
              { label: "Заснована", value: selectedClinic.founded },
              { label: "Відгуків", value: selectedClinic.reviews?.length || 0 },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-blue-600">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Кнопка чату */}
          <button
            onClick={() => user ? setShowChat(true) : navigate("login")}
            className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            💬 Написати клініці
          </button>
        </div>

        {selectedClinic.services && selectedClinic.services.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-4">Послуги та ціни</h2>
            <div className="space-y-3">
              {selectedClinic.services.map((cs: any) => (
                <div key={cs.id} className="flex items-start justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{cs.service.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{cs.service.description}</div>
                    <div className="text-xs text-gray-400 mt-0.5">⏱ {cs.service.duration}</div>
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-sm font-bold text-gray-900">{formatPrice(cs.service.priceFrom)}</div>
                    <div className="text-xs text-gray-400">від</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-3">Контакти</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><span>📞</span><span>{selectedClinic.phone}</span></div>
            <div className="flex items-center gap-2 text-sm"><span>✉️</span><span>{selectedClinic.email}</span></div>
            <div className="flex items-center gap-2 text-sm"><span>📍</span><span>{selectedClinic.city}, {selectedClinic.address}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="font-bold text-gray-900 mb-4">Відгуки ({selectedClinic.reviews?.length || 0})</h2>

          {selectedClinic.reviews && selectedClinic.reviews.length > 0 ? (
            <div className="space-y-3 mb-6">
              {selectedClinic.reviews.map((review: any) => (
                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-xs font-bold">{review.user?.name?.[0] || "?"}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{review.user?.name || "Користувач"}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <span key={i} className={i <= review.rating ? "text-amber-400 text-sm" : "text-gray-200 text-sm"}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-6">Поки немає відгуків. Будьте першим!</p>
          )}

          {user ? (
            <form onSubmit={handleReviewSubmit}>
              <h3 className="font-semibold text-gray-900 mb-3">Залишити відгук</h3>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">Рейтинг</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" onClick={() => setReviewRating(i)}
                      className={`text-2xl transition-all hover:scale-110 ${i <= reviewRating ? "text-amber-400" : "text-gray-200"}`}>★</button>
                  ))}
                  <span className="ml-2 text-sm text-gray-500 self-center">{reviewRating}/5</span>
                </div>
              </div>
              <div className="mb-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">Ваш відгук</label>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
                  rows={3} placeholder="Поділіться своїм досвідом…"
                  className="w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white" />
              </div>
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              {success && <p className="text-xs text-green-600 mb-2">{success}</p>}
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {submitting ? "Надсилання..." : "Надіслати відгук"}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500 mb-2">Щоб залишити відгук — увійдіть в акаунт</p>
              <button onClick={() => navigate("login")}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Увійти
              </button>
            </div>
          )}
        </div>
      </div>

      {showChat && (
        <ClinicChatModal clinic={selectedClinic} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}