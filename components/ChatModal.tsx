"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/app/lib/context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Props {
  product: any;
  onClose: () => void;
}

function resolveImage(image: string | null | undefined): string | null {
  if (!image) return null;
  try {
    const parsed = JSON.parse(image);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
  } catch {}
  if (image.startsWith("https://") || image.startsWith("http://")) return image;
  const uploadIndex = image.indexOf("image/upload");
  if (uploadIndex !== -1) return `https://res.cloudinary.com/dcpksxngc/${image.substring(uploadIndex)}`;
  return null;
}

export default function ChatModal({ product, onClose }: Props) {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const receiverId = product.sellerId;
  const productId = product.id;
  const imageUrl = resolveImage(product.image);

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
      const res = await fetch(`${API}/messages/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data || []);
    } catch (e) {
      console.error("loadMessages помилка:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user) { setError("Потрібно увійти"); return; }

    setSending(true);
    setError("");

    try {
      const res = await fetch(`${API}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: text.trim(),
          receiverId: Number(receiverId),
          productId: Number(productId),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setText("");
        inputRef.current?.focus();
      } else {
        setError(data.message || "Помилка відправки");
      }
    } catch (err) {
      console.error("Помилка:", err);
      setError("Помилка з'єднання з сервером");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col" style={{ height: "520px" }}>

        {/* Шапка */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-bold text-sm">{product.seller?.name?.[0] || "П"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{product.seller?.name}</div>
            <div className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Онлайн
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
            ✕
          </button>
        </div>

        {/* Товар */}
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{product.image || "🦷"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-800 truncate">{product.title}</div>
            <div className="text-xs font-bold text-blue-600">
              {new Intl.NumberFormat("uk-UA", { style: "currency", currency: "UAH", maximumFractionDigits: 0 }).format(product.price)}
            </div>
          </div>
        </div>

        {/* Повідомлення */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm font-medium">Почніть розмову</p>
              <p className="text-xs mt-1 text-center">Напишіть продавцю про товар</p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-xs text-gray-400 px-1">{msg.sender?.name}</span>
                    )}
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="px-4 py-2 bg-red-50 text-red-600 text-xs flex-shrink-0">{error}</div>
        )}

        {/* Поле вводу */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Написати повідомлення…"
            disabled={sending}
            className="flex-1 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "➤"}
          </button>
        </form>
      </div>
    </div>
  );
}