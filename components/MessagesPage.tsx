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
  const [serviceChats, setServiceChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"buying" | "selling" | "clinics" | "services">("buying");
  const [openChat, setOpenChat] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    loadChats();
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [user]);

  async function loadChats() {
    try {
      const [chatsRes, serviceChatsRes] = await Promise.all([
        fetch(`${API}/chats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/service-chats`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const chatsData = await chatsRes.json();
      const serviceChatsData = await serviceChatsRes.json();
      if (chatsData.success) setChats(chatsData.data || []);
      if (serviceChatsData.success) setServiceChats(serviceChatsData.data || []);
    } catch {}
    finally { setLoading(false); }
  }

  if (!user) { navigate("login"); return null; }

  const productChats = chats.filter(c => !c.isClinic);
  const buyingChats = productChats.filter(c => c.isBuying);
  const sellingChats = productChats.filter(c => !c.isBuying);
  const clinicChats = chats.filter(c => c.isClinic);
  const totalUnread = chats.reduce((sum, c) => sum + c.unread, 0) + serviceChats.reduce((sum, c) => sum + c.unread, 0);

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
    const isService = chat.isService;
    const isClinic = chat.isClinic;
    const imageUrl = (!isClinic && !isService) ? resolveImage(chat.product?.image) : null;
    const title = isService ? chat.service?.name : isClinic ? chat.clinic?.name : chat.product?.title;

    return (
      <div onClick={() => setOpenChat(chat)}
        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">
              {isService ? "⚕️" : isClinic ? (chat.clinic?.image || "🏥") : (chat.product?.image || "🦷")}
            </span>
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

  const tabs = [
    { key: "buying", label: "🛒 Купівля", chats: buyingChats },
    { key: "selling", label: "💰 Продаж", chats: sellingChats },
    { key: "clinics", label: "🏥 Клініки", chats: clinicChats },
    { key: "services", label: "⚕️ Послуги", chats: serviceChats },
  ];

  const currentChats = tabs.find(t => t.key === activeTab)?.chats || [];

  const emptyMessages: Record<string, string> = {
    buying: "Напишіть продавцю через кнопку на сторінці товару",
    selling: "Тут з'являться повідомлення від покупців ваших товарів",
    clinics: "Напишіть клініці через кнопку на сторінці клініки",
    services: "Напишіть про послугу через кнопку на сторінці послуг",
  };

  const emptyIcons: Record<string, string> = {
    buying: "🛒", selling: "💰", clinics: "🏥", services: "⚕️",
  };

  const emptyActions: Record<string, { label: string; page: string } | null> = {
    buying: { label: "Перейти до маркетплейсу", page: "marketplace" },
    selling: null,
    clinics: { label: "Перейти до клінік", page: "clinics" },
    services: { label: "Перейти до послуг", page: "services" },
  };

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

          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {tabs.map(tab => {
              const unread = tab.chats.reduce((s, c) => s + c.unread, 0);
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {tab.label}
                  {unread > 0 && (
                    <span className="ml-1 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white min-h-96">
          {loading ? (
            <div className="space-y-1 p-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : currentChats.length > 0 ? (
            currentChats.map((chat: any) => <ChatItem key={chat.key || chat.serviceId || chat.productId} chat={chat} />)
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="text-5xl mb-3">{emptyIcons[activeTab]}</div>
              <p className="font-medium">Немає повідомлень</p>
              <p className="text-sm mt-1 text-center px-8">{emptyMessages[activeTab]}</p>
              {emptyActions[activeTab] && (
                <button onClick={() => navigate(emptyActions[activeTab]!.page)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  {emptyActions[activeTab]!.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {openChat && !openChat.isClinic && !openChat.isService && (
        <ChatModal product={openChat.product} onClose={() => { setOpenChat(null); loadChats(); }} />
      )}

      {openChat && openChat.isClinic && (
        <ClinicChatModal clinic={openChat.clinic} receiverId={openChat.otherUser?.id}
          onClose={() => { setOpenChat(null); loadChats(); }} />
      )}

      {openChat && openChat.isService && (
        <ServiceChatModal service={openChat.service} receiverId={openChat.otherUser?.id}
          onClose={() => { setOpenChat(null); loadChats(); }} />
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadMessages() {
    try {
      const res = await fetch(`${API}/clinic-messages/${clinic.id}`, { headers: { Authorization: `Bearer ${token}` } });
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
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">{clinic.image || "🏥"}</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{clinic.name}</div>
            <div className="text-xs text-gray-400">📍 {clinic.city}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
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
                  <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>{msg.text}</div>
                  <span className="text-xs text-gray-400 px-1">{new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}</span>
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

function ServiceChatModal({ service, receiverId, onClose }: { service: any; receiverId: number; onClose: () => void }) {
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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function loadMessages() {
    try {
      const res = await fetch(`${API}/service-messages/${service.id}`, { headers: { Authorization: `Bearer ${token}` } });
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
        body: JSON.stringify({ text: text.trim(), receiverId: receiverId || 4, serviceId: service.id }),
      });
      const data = await res.json();
      if (data.success) { setMessages(prev => [...prev, data.data]); setText(""); inputRef.current?.focus(); }
    } catch {} finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col" style={{ height: "520px" }}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl">⚕️</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{service?.name}</div>
            <div className="text-xs text-gray-400">Послуга</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-4xl mb-3">⚕️</div>
              <p className="text-sm font-medium">Запитайте про послугу</p>
            </div>
          ) : messages.map(msg => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && <span className="text-xs text-gray-400 px-1">{msg.sender?.name}</span>}
                  <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 text-gray-800 rounded-bl-none"}`}>{msg.text}</div>
                  <span className="text-xs text-gray-400 px-1">{new Date(msg.createdAt).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}</span>
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