"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/app/lib/context";
import { fetchServices } from "@/app/lib/api";
import { formatPrice } from "@/app/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function ServiceChatModal({ service, onClose }: { service: any; onClose: () => void }) {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const receiverId = 4;

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
      const res = await fetch(`${API}/service-messages/${service.id}`, {
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
      const res = await fetch(`${API}/service-messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: text.trim(), receiverId, serviceId: service.id }),
      });
      const data = await res.json();
      if (data.success) { setMessages(prev => [...prev, data.data]); setText(""); inputRef.current?.focus(); }
    } catch {} finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col" style={{ height: "520px" }}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl flex-shrink-0">⚕️</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{service.name}</div>
            <div className="text-xs text-gray-400">{formatPrice(service.priceFrom)} – {formatPrice(service.priceTo)}</div>
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
              <div className="text-4xl mb-3">⚕️</div>
              <p className="text-sm font-medium">Запитайте про послугу</p>
              <p className="text-xs mt-1 text-center">Ціна, запис, деталі</p>
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

export default function ServicesPage() {
  const { serviceFavorites, toggleServiceFavorite, user, navigate } = useApp();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChat, setOpenChat] = useState<any>(null);

  useEffect(() => {
    fetchServices()
      .then(data => setServices(data || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Стоматологічні послуги</h1>
          <p className="text-gray-500 text-sm">Огляд послуг та цін у клініках України</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((s: any) => {
              const isFav = serviceFavorites.includes(s.id);
              return (
                <div key={s.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold text-gray-900">{s.name}</h3>
                    <button onClick={() => toggleServiceFavorite(s.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0">
                      <span className={isFav ? "text-red-500" : "text-gray-300"}>{isFav ? "♥" : "♡"}</span>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{s.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-gray-400">Вартість: </span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatPrice(s.priceFrom)} – {formatPrice(s.priceTo)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">⏱ {s.duration}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400">
                      Доступно у {s.clinics?.length || 0} клінік(ах)
                    </div>
                    <button
                      onClick={() => user ? setOpenChat(s) : navigate("login")}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      💬 Запитати
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {openChat && <ServiceChatModal service={openChat} onClose={() => setOpenChat(null)} />}
    </div>
  );
}