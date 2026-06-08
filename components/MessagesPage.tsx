"use client";

import { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<"buying" | "selling">("buying");
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

  if (!user) {
    navigate("login");
    return null;
  }

  const buyingChats = chats.filter(c => c.isBuying);
  const sellingChats = chats.filter(c => !c.isBuying);
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
    const imageUrl = resolveImage(chat.product?.image);
    const isEmoji = !imageUrl;

    return (
      <div
        onClick={() => setOpenChat(chat)}
        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
      >
        {/* Фото товару */}
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={chat.product?.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{chat.product?.image || "🦷"}</span>
          )}
        </div>

        {/* Інфо */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm font-semibold text-gray-900 truncate">
              {chat.otherUser?.name || "Користувач"}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage?.createdAt)}
            </span>
          </div>
          <div className="text-xs text-gray-500 truncate mb-1">{chat.product?.title}</div>
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

  const currentChats = activeTab === "buying" ? buyingChats : sellingChats;

  return (
    <div className="flex-1 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold text-gray-900">Повідомлення</h1>
            {totalUnread > 0 && (
              <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalUnread}
              </span>
            )}
          </div>

          {/* Вкладки */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("buying")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "buying"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🛒 Купівля
              {buyingChats.reduce((s, c) => s + c.unread, 0) > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                  {buyingChats.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("selling")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === "selling"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              💰 Продаж
              {sellingChats.reduce((s, c) => s + c.unread, 0) > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full inline-flex items-center justify-center">
                  {sellingChats.reduce((s, c) => s + c.unread, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Список чатів */}
        <div className="bg-white min-h-96">
          {loading ? (
            <div className="space-y-1 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : currentChats.length > 0 ? (
            currentChats.map(chat => (
              <ChatItem key={chat.productId} chat={chat} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="text-5xl mb-3">
                {activeTab === "buying" ? "🛒" : "💰"}
              </div>
              <p className="font-medium">
                {activeTab === "buying" ? "Немає чатів покупця" : "Немає чатів продавця"}
              </p>
              <p className="text-sm mt-1 text-center px-8">
                {activeTab === "buying"
                  ? "Напишіть продавцю через кнопку на сторінці товару"
                  : "Тут з'являться повідомлення від покупців ваших товарів"}
              </p>
              {activeTab === "buying" && (
                <button onClick={() => navigate("marketplace")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-xl hover:bg-blue-700">
                  Перейти до маркетплейсу
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Відкритий чат */}
      {openChat && (
        <ChatModal
          product={openChat.product}
          onClose={() => { setOpenChat(null); loadChats(); }}
        />
      )}
    </div>
  );
}