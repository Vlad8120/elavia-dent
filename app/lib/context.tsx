"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  city?: string;
};

type AppContextType = {
  page: string;
  navigate: (page: string, data?: any) => void;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  favorites: number[];
  clinicFavorites: number[];
  toggleFavorite: (id: number) => void;
  toggleClinicFavorite: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProduct: any;
  setSelectedProduct: (p: any) => void;
  selectedClinic: any;
  setSelectedClinic: (c: any) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [clinicFavorites, setClinicFavorites] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

    const savedClinicFavorites = localStorage.getItem("clinicFavorites");
    if (savedClinicFavorites) setClinicFavorites(JSON.parse(savedClinicFavorites));
  }, []);

  function navigate(pg: string, data?: any) {
    setPage(pg);
    if (data?.product) setSelectedProduct(data.product);
    if (data?.clinic) setSelectedClinic(data.clinic);
    window.scrollTo(0, 0);
  }

  function login(newToken: string, newUser: User) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("home");
  }

  function toggleFavorite(id: number) {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("favorites", JSON.stringify(newFavs));
      return newFavs;
    });
  }

  function toggleClinicFavorite(id: number) {
    setClinicFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("clinicFavorites", JSON.stringify(newFavs));
      return newFavs;
    });
  }

  return (
    <AppContext.Provider value={{
      page, navigate,
      user, token, login, logout,
      favorites, toggleFavorite,
      clinicFavorites, toggleClinicFavorite,
      searchQuery, setSearchQuery,
      selectedProduct, setSelectedProduct,
      selectedClinic, setSelectedClinic,
    }}>
      {children}
    </AppContext.Provider>
  );
}