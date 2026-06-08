"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/app/lib/context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import ClinicCard from "@/components/ClinicCard";
import MarketplacePage from "@/components/MarketplacePage";
import ProductDetailPage from "@/components/ProductDetailPage";
import SearchPage from "@/components/SearchPage";
import ClinicsPage from "@/components/ClinicsPage";
import ClinicDetailPage from "@/components/ClinicDetailPage";
import ServicesPage from "@/components/ServicesPage";
import LoginPage from "@/components/LoginPage";
import RegisterPage from "@/components/RegisterPage";
import ProfilePage from "@/components/ProfilePage";
import FavoritesPage from "@/components/FavoritesPage";
import NewListingPage from "@/components/NewListingPage";
import MyListingsPage from "@/components/MyListingsPage";
import AnalyticsPage from "@/components/AnalyticsPage";
import AdminPage from "@/components/AdminPage";
import ChatWidget from "@/components/ChatWidget";
import AboutPage from "@/components/AboutPage";
import ContactPage from "@/components/ContactPage";
import TermsPage from "@/components/TermsPage";
import PrivacyPage from "@/components/PrivacyPage";
import ClinicsMapPage from "@/components/ClinicsMapPage";
import ComparePage from "@/components/ComparePage";
import CompareWidget from "@/components/CompareWidget";
import MessagesPage from "@/components/MessagesPage";
import { fetchProducts, fetchClinics, fetchCategories } from "@/app/lib/api";

function HomePage() {
  const { navigate } = useApp();
  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, c, cat] = await Promise.all([
          fetchProducts(),
          fetchClinics(),
          fetchCategories(),
        ]);
        setProducts(p || []);
        setClinics(c || []);
        setCategories(cat || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <HeroSection />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: `${products.length}+`, label: "Оголошень" },
              { value: `${clinics.length}+`, label: "Клінік" },
              { value: "8", label: "Міст України" },
              { value: `${categories.length}`, label: "Категорій" },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Категорії товарів</h2>
              <p className="text-gray-500 text-sm mt-1">Оберіть потрібну категорію</p>
            </div>
            <button onClick={() => navigate("marketplace")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Всі товари →
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => navigate("marketplace")}
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left group">
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 leading-tight">
                    {cat.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {cat._count?.products || 0} оголошень
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Популярні товари</h2>
              <p className="text-gray-500 text-sm mt-1">Найбільш переглянуті цього тижня</p>
            </div>
            <button onClick={() => navigate("marketplace")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Всі товари →
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Рекомендовані клініки</h2>
              <p className="text-gray-500 text-sm mt-1">Перевірені стоматологічні клініки</p>
            </div>
            <button onClick={() => navigate("clinics")}
              className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Всі клініки →
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clinics.slice(0, 3).map((clinic: any) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🔍", title: "Розумний пошук", desc: "Фільтрація за містом, ціною, категорією та рейтингом" },
              { icon: "🛡️", title: "Перевірені продавці", desc: "Всі оголошення проходять модерацію адміністратора" },
              { icon: "📊", title: "Аналітика цін", desc: "Порівнюйте ціни та знаходьте найкращі пропозиції" },
            ].map(f => (
              <div key={f.title}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-lg mb-1">{f.title}</h3>
                <p className="text-blue-100 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function Page() {
  const { page } = useApp();

  const renderPage = () => {
    switch (page) {
      case "home": return <HomePage />;
      case "marketplace": return <MarketplacePage />;
      case "product-detail": return <ProductDetailPage />;
      case "search": return <SearchPage />;
      case "clinics": return <ClinicsPage />;
      case "clinic-detail": return <ClinicDetailPage />;
      case "services": return <ServicesPage />;
      case "login": return <LoginPage />;
      case "register": return <RegisterPage />;
      case "profile": return <ProfilePage />;
      case "favorites": return <FavoritesPage />;
      case "new-listing": return <NewListingPage />;
      case "my-listings": return <MyListingsPage />;
      case "analytics": return <AnalyticsPage />;
      case "admin": return <AdminPage />;
      case "about": return <AboutPage />;
      case "contacts": return <ContactPage />;
      case "terms": return <TermsPage />;
      case "privacy": return <PrivacyPage />;
      case "clinics-map": return <ClinicsMapPage />;
      case "compare": return <ComparePage />;
      case "messages": return <MessagesPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex flex-col">
        {renderPage()}
      </main>
      <Footer />
      <ChatWidget />
      <CompareWidget />
    </div>
  );
}