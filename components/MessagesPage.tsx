"use client";

import { useState, useEffect, useRef } from "react";
import { useApp } from "@/app/lib/context";
import ChatModal from "@/components/ChatModal";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function resolveImage(image: string | null | undefined): string | null {
  if (!image) return null;
  try {
    const parsed = JSON.parse(image);
    if (Array.isArray(parsed) && parsed.length > 0) image = parsed[0];
  } catch {}
  if (image.startsWith("https://") || image.startsWith("http://")) return image;
  const uploadIndex = image.indexOf("image/upload");
  if (uploadIndex !== -1) return `https://res.cloudinary.com/dcpksxngc/${image.substring(uploadIndex)}`;
  return null;
}

export default function MessagesPage() {
  const { user, token, navigate } = useApp();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"buying" | "selling" | "clinics">("buying");
  const [openChat, setOpenChat] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadChats() {
    try {
      const res = await fetch(`${API}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setChats(data.data || []);
    } catch {}
    finally { setLoading(false); }
  }

  if (!user) { navigate("login"); return null; }

  const productChats = chats.filter(c => !c.isClinic);
  const buyingChats = productChats.filter(c => c.isBuying);
  const sellingChats = productChats.filter(c => !c.isBuying);
  const clinicChats = chats.filter(c => c.isClinic);
  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0);

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Щойно";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} хв тому`;
    if (diff < 86400000) return date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
  }

  function ChatItem({ chat }: { chat: any }) {
    const imageUrl = chat.isClinic ? null : resolveImage(chat.product?.image);
    const title = chat.isClinic ? chat.clinic?.name : chat.product?.title;
    const subtitle = chat.isClinic ? `📍 ${chat.clinic?.city}` : chat.product?.title;

    return (
      <div onClick={() => setOpenChat(chat)}
        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{chat.isClinic ? (chat.clinic?.image || "🏥") : (chat.product?.image || "🦷")}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {chat.otherUser?.name || "Користувач"}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage?.createdAt)}
            </span>
          </div>
          <div className="text-xs text-gray-500 truncate mb-1">{title}</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 truncate">
              {chat.lastMessage?.senderId === user?.id ? "Ви: " : ""}
              {chat.lastMessage?.text}
            </span>
            {chat.unread > 0 && (
              <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentChats = activeTab === "buying" ? buyingChats : activeTab === "selling" ? sellingChats : clinicChats;

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-900">Повідомлення</h1>
            {totalUnread > 0 && (
              <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalUnread}
              </span>
            )}
          </div>

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setActiveTab("buying")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "buying" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              🛒 Купівля
              {buyingChats.reduce((s, c) => s + c.unread, 0) > 0 && (
                <span className="ml-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                  {buyingChats.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab("selling")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "selling" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              💰 Продаж
              {sellingChats.reduce((s, c) => s + c.unread, 0) > 0 && (
                <span className="ml-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                  {sellingChats.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab("clinics")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === "clinics" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              🏥 Клініки
              {clinicChats.reduce((s, c) => s + c.unread, 0) > 0 && (
                <span className="ml-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                  {clinicChats.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white min-h-96">
          {loading ? (
            <div className="space-y-1 p-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : currentChats.length > 0 ? (
            currentChats.map(chat => <ChatItem key={chat.key || chat.productId} chat={chat} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="text-5xl mb-3">
                {activeTab === "buying" ? "🛒" : activeTab === "selling" ? "💰" : "🏥"}
              </div>
              <p className="font-medium">
                {activeTab === "buying" ? "Немає чатів покупця" : activeTab === "selling" ? "Немає чатів продавця" : "Немає чатів з клініками"}
              </p>
              <p className="text-sm mt-1 text-center px-8">
                {activeTab === "buying" ? "Напишіть продавцю через кнопку на сторінці товару"
                  : activeTab === "selling" ? "Тут з'являться повідомлення від покупців ваших товарів"
                  : "Напишіть клініці через кнопку на сторінці клініки"}
              </p>
              {activeTab === "buying" && (
                <button onClick={() => navigate("marketplace")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  Перейти до маркетплейсу
                </button>
              )}
              {activeTab === "clinics" && (
                <button onClick={() => navigate("clinics")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  Перейти до клінік
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {openChat && !openChat.isClinic && (
        <ChatModal
          product={openChat.product}
          onClose={() => { setOpenChat(null); loadChats(); }}
        />
      )}

      {openChat && openChat.isClinic && (
        <ClinicChatModal
          clinic={openChat.clinic}
          receiverId={openChat.otherUser?.id}
          onClose={() => { setOpenChat(null); loadChats(); }}
        />
      )}
    </div>
  );
}

function ClinicChatModal({ clinic, receiverId, onClose }: { clinic: any; receiverId: number; onClose: () => void }) {
  const { user, token } = useApp();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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