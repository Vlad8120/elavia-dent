"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import { fetchCategories } from "@/app/lib/api";
import ImageUpload from "@/components/ImageUpload";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const OBLASTS_CITIES: Record<string, string[]> = {
  "Київська": ["Київ", "Біла Церква", "Бровари", "Ірпінь", "Буча", "Боярка", "Васильків", "Фастів", "Обухів", "Переяслав", "Бориспіль", "Вишневе"],
  "Харківська": ["Харків", "Лозова", "Ізюм", "Куп'янськ", "Балаклія", "Чугуїв", "Охтирка", "Богодухів"],
  "Одеська": ["Одеса", "Ізмаїл", "Білгород-Дністровський", "Южне", "Теплодар", "Котовськ", "Балта"],
  "Дніпропетровська": ["Дніпро", "Кривий Ріг", "Нікополь", "Павлоград", "Кам'янське", "Жовті Води"],
  "Запорізька": ["Запоріжжя", "Бердянськ", "Мелітополь", "Енергодар", "Токмак", "Пологи"],
  "Львівська": ["Львів", "Дрогобич", "Трускавець", "Стрий", "Борислав", "Червоноград", "Самбір", "Яворів"],
  "Вінницька": ["Вінниця", "Бар", "Козятин", "Могилів-Подільський", "Жмеринка", "Гайсин", "Тульчин"],
  "Миколаївська": ["Миколаїв", "Первомайськ", "Вознесенськ", "Южноукраїнськ"],
  "Херсонська": ["Херсон", "Нова Каховка", "Генічеськ", "Скадовськ", "Каховка"],
  "Полтавська": ["Полтава", "Кременчук", "Лубни", "Миргород", "Горішні Плавні"],
  "Чернігівська": ["Чернігів", "Ніжин", "Конотоп", "Прилуки", "Бахмач"],
  "Черкаська": ["Черкаси", "Умань", "Золотоноша", "Канів", "Сміла"],
  "Житомирська": ["Житомир", "Бердичів", "Коростень", "Новоград-Волинський"],
  "Сумська": ["Суми", "Охтирка", "Ромни", "Лебедин", "Шостка", "Глухів"],
  "Хмельницька": ["Хмельницький", "Кам'янець-Подільський", "Шепетівка", "Нетішин"],
  "Рівненська": ["Рівне", "Дубно", "Острог", "Костопіль", "Сарни"],
  "Івано-Франківська": ["Івано-Франківськ", "Коломия", "Калуш", "Надвірна", "Болехів"],
  "Тернопільська": ["Тернопіль", "Чортків", "Бережани", "Збараж", "Кременець"],
  "Волинська": ["Луцьк", "Ковель", "Нововолинськ", "Рожище"],
  "Закарпатська": ["Ужгород", "Мукачево", "Берегово", "Хуст", "Виноградів"],
  "Чернівецька": ["Чернівці", "Новодністровськ", "Хотин", "Сторожинець"],
  "Кіровоградська": ["Кропивницький", "Олександрія", "Знам'янка", "Світловодськ"],
  "Донецька": ["Краматорськ", "Слов'янськ", "Маріуполь", "Бахмут", "Покровськ"],
  "Луганська": ["Сєвєродонецьк", "Лисичанськ", "Рубіжне", "Старобільськ"],
};

const ALL_OBLASTS = Object.keys(OBLASTS_CITIES).sort();

const inputCls = "w-full px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";
const selectCls = "w-full px-3 py-2.5 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

type TabType = "product" | "clinic" | "service";

export default function NewListingPage() {
  const { user, navigate, token } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>("product");
  const [categories, setCategories] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedOblast, setSelectedOblast] = useState("");

  const [productForm, setProductForm] = useState({
    title: "", description: "", price: "", city: "",
    condition: "NEW", categoryId: "", image: "🦷",
    contactPhone: "", contactEmail: "",
  });

  const [clinicForm, setClinicForm] = useState({
    name: "", description: "", city: "", oblast: "",
    address: "", phone: "", email: "", image: "🏥",
    founded: "", doctors: "1",
  });

  const [serviceForm, setServiceForm] = useState({
    name: "", description: "",
    priceFrom: "", priceTo: "", duration: "",
  });

  useEffect(() => {
    fetchCategories().then(data => setCategories(data || []));
    if (user) setProductForm(prev => ({ ...prev, contactEmail: user.email || "" }));
  }, [user]);

  if (!user) { navigate("login"); return null; }

  function handleOblastChange(oblast: string) {
    setSelectedOblast(oblast);
    setProductForm(prev => ({ ...prev, city: "" }));
    setClinicForm(prev => ({ ...prev, oblast, city: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    try {
      if (activeTab === "product") {
        if (!productForm.title || !productForm.price || !productForm.city || !productForm.categoryId) {
          setError("Заповніть всі обов'язкові поля"); setLoading(false); return;
        }
        const description = productForm.description +
          (productForm.contactPhone ? `\n📞 ${productForm.contactPhone}` : "") +
          (productForm.contactEmail ? `\n📧 ${productForm.contactEmail}` : "");

        const res = await fetch(`${API}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: productForm.title, description,
            price: Number(productForm.price),
            city: productForm.city, oblast: selectedOblast,
            condition: productForm.condition,
            categoryId: Number(productForm.categoryId),
            sellerId: user.id,
            image: imageUrls.length > 0 ? JSON.stringify(imageUrls) : productForm.image,
          }),
        });
        const data = await res.json();
        if (data.success) setSubmitted(true);
        else setError(data.message || "Помилка");

      } else if (activeTab === "clinic") {
        if (!clinicForm.name || !clinicForm.city || !clinicForm.address || !clinicForm.phone) {
          setError("Заповніть всі обов'язкові поля"); setLoading(false); return;
        }
        const res = await fetch(`${API}/clinics`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: clinicForm.name, description: clinicForm.description,
            city: clinicForm.city, oblast: selectedOblast,
            address: clinicForm.address, phone: clinicForm.phone,
            email: clinicForm.email, image: clinicForm.image,
            founded: clinicForm.founded ? Number(clinicForm.founded) : null,
            doctors: Number(clinicForm.doctors),
          }),
        });
        const data = await res.json();
        if (data.success) setSubmitted(true);
        else setError(data.message || "Помилка");

      } else if (activeTab === "service") {
        if (!serviceForm.name || !serviceForm.priceFrom || !serviceForm.duration) {
          setError("Заповніть всі обов'язкові поля"); setLoading(false); return;
        }
        const res = await fetch(`${API}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            name: serviceForm.name, description: serviceForm.description,
            priceFrom: Number(serviceForm.priceFrom),
            priceTo: Number(serviceForm.priceTo || serviceForm.priceFrom),
            duration: serviceForm.duration,
          }),
        });
        const data = await res.json();
        if (data.success) setSubmitted(true);
        else setError(data.message || "Помилка");
      }
    } catch { setError("Помилка з'єднання з сервером"); }
    finally { setLoading(false); }
  }

  const tabLabels: Record<TabType, string> = {
    product: "успішно додано до маркетплейсу",
    clinic: "клініку додано до каталогу",
    service: "послугу додано до каталогу",
  };

  if (submitted) {
    return (
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Успішно створено!</h2>
          <p className="text-gray-500 text-sm mb-6">Ваш запис {tabLabels[activeTab]}.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(activeTab === "product" ? "marketplace" : activeTab === "clinic" ? "clinics" : "services")}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium text-sm">
              Переглянути
            </button>
            <button onClick={() => { setSubmitted(false); setImageUrls([]); setSelectedOblast(""); }}
              className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium text-sm">
              Додати ще
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Нове оголошення</h1>
          <p className="text-gray-500 text-sm">Оберіть тип і заповніть форму</p>
        </div>

        {/* Вкладки типу */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "product", label: "🛒 Товар" },
            { key: "clinic", label: "🏥 Клініка" },
            { key: "service", label: "⚕️ Послуга" },
          ] as { key: TabType; label: string }[]).map(t => (
            <button key={t.key} onClick={() => { setActiveTab(t.key); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all ${
                activeTab === t.key ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ТОВАР */}
            {activeTab === "product" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Фото товару (до 10 штук)</label>
                  <ImageUpload onUpload={(urls) => setImageUrls(urls)} currentImages={imageUrls} />
                </div>
                {imageUrls.length === 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Або оберіть іконку</label>
                    <div className="flex gap-2 flex-wrap">
                      {["🦷", "🔧", "💊", "⚙️", "💡", "📡", "🪑", "⚗️", "💉", "📐"].map(icon => (
                        <button key={icon} type="button"
                          onClick={() => setProductForm(p => ({ ...p, image: icon }))}
                          className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${productForm.image === icon ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Назва товару *</label>
                  <input value={productForm.title} onChange={e => setProductForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Напр.: Стоматологічна установка KAVO" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Опис</label>
                  <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Детальний опис товару…" className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Ціна (UAH) *</label>
                    <input value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))}
                      type="number" placeholder="0" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Стан</label>
                    <select value={productForm.condition} onChange={e => setProductForm(p => ({ ...p, condition: e.target.value }))} className={selectCls}>
                      <option value="NEW">Новий</option>
                      <option value="USED">Б/у</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Область *</label>
                    <select value={selectedOblast} onChange={e => handleOblastChange(e.target.value)} className={selectCls}>
                      <option value="">Оберіть область</option>
                      {ALL_OBLASTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Місто *</label>
                    <select value={productForm.city} onChange={e => setProductForm(p => ({ ...p, city: e.target.value }))}
                      disabled={!selectedOblast} className={selectCls}>
                      <option value="">Оберіть місто</option>
                      {selectedOblast && OBLASTS_CITIES[selectedOblast]?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Категорія *</label>
                  <select value={productForm.categoryId} onChange={e => setProductForm(p => ({ ...p, categoryId: e.target.value }))} className={selectCls}>
                    <option value="">Оберіть категорію</option>
                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">📞 Контактна інформація</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Телефон</label>
                      <input value={productForm.contactPhone} onChange={e => setProductForm(p => ({ ...p, contactPhone: e.target.value }))}
                        placeholder="+38 000 000-00-00" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                      <input value={productForm.contactEmail} onChange={e => setProductForm(p => ({ ...p, contactEmail: e.target.value }))}
                        type="email" placeholder="example@email.com" className={inputCls} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* КЛІНІКА */}
            {activeTab === "clinic" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Іконка клініки</label>
                  <div className="flex gap-2 flex-wrap">
                    {["🏥", "🦷", "⭐", "💎", "🌟", "👑", "✨", "💚", "🏛️", "🌊"].map(icon => (
                      <button key={icon} type="button"
                        onClick={() => setClinicForm(p => ({ ...p, image: icon }))}
                        className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${clinicForm.image === icon ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Назва клініки *</label>
                  <input value={clinicForm.name} onChange={e => setClinicForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Напр.: Стоматологія «Dent Lux»" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Опис</label>
                  <textarea value={clinicForm.description} onChange={e => setClinicForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Опис клініки, спеціалізація…" className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Область *</label>
                    <select value={selectedOblast} onChange={e => handleOblastChange(e.target.value)} className={selectCls}>
                      <option value="">Оберіть область</option>
                      {ALL_OBLASTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Місто *</label>
                    <select value={clinicForm.city} onChange={e => setClinicForm(p => ({ ...p, city: e.target.value }))}
                      disabled={!selectedOblast} className={selectCls}>
                      <option value="">Оберіть місто</option>
                      {selectedOblast && OBLASTS_CITIES[selectedOblast]?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Адреса *</label>
                  <input value={clinicForm.address} onChange={e => setClinicForm(p => ({ ...p, address: e.target.value }))}
                    placeholder="вул. Хрещатик, 22" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Телефон *</label>
                    <input value={clinicForm.phone} onChange={e => setClinicForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+38 044 123-45-67" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Email</label>
                    <input value={clinicForm.email} onChange={e => setClinicForm(p => ({ ...p, email: e.target.value }))}
                      type="email" placeholder="info@clinic.ua" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Рік заснування</label>
                    <input value={clinicForm.founded} onChange={e => setClinicForm(p => ({ ...p, founded: e.target.value }))}
                      type="number" placeholder="2010" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Кількість лікарів</label>
                    <input value={clinicForm.doctors} onChange={e => setClinicForm(p => ({ ...p, doctors: e.target.value }))}
                      type="number" placeholder="5" className={inputCls} />
                  </div>
                </div>
              </>
            )}

            {/* ПОСЛУГА */}
            {activeTab === "service" && (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Назва послуги *</label>
                  <input value={serviceForm.name} onChange={e => setServiceForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Напр.: Відбілювання зубів" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Опис</label>
                  <textarea value={serviceForm.description} onChange={e => setServiceForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Детальний опис послуги…" className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Ціна від (UAH) *</label>
                    <input value={serviceForm.priceFrom} onChange={e => setServiceForm(p => ({ ...p, priceFrom: e.target.value }))}
                      type="number" placeholder="500" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">Ціна до (UAH)</label>
                    <input value={serviceForm.priceTo} onChange={e => setServiceForm(p => ({ ...p, priceTo: e.target.value }))}
                      type="number" placeholder="2000" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 block mb-1">Тривалість *</label>
                  <input value={serviceForm.duration} onChange={e => setServiceForm(p => ({ ...p, duration: e.target.value }))}
                    placeholder="Напр.: 30-60 хв" className={inputCls} />
                </div>
              </>
            )}

            {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
              {loading ? "Публікація..." : activeTab === "product" ? "Опублікувати товар" : activeTab === "clinic" ? "Додати клініку" : "Додати послугу"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}