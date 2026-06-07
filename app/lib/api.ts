const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchProducts(params?: {
  city?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
}) {
  const query = new URLSearchParams();
  if (params?.city) query.append("city", params.city);
  if (params?.categoryId) query.append("categoryId", String(params.categoryId));
  if (params?.minPrice) query.append("minPrice", String(params.minPrice));
  if (params?.maxPrice) query.append("maxPrice", String(params.maxPrice));
  if (params?.search) query.append("search", params.search);
  if (params?.sortBy) query.append("sortBy", params.sortBy);

  const res = await fetch(`${API_URL}/products?${query}`);
  const data = await res.json();
  return data.data;
}

export async function fetchProductById(id: number) {
  const res = await fetch(`${API_URL}/products/${id}`);
  const data = await res.json();
  return data.data;
}

export async function fetchClinics(params?: {
  city?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.city) query.append("city", params.city);
  if (params?.search) query.append("search", params.search);

  const res = await fetch(`${API_URL}/clinics?${query}`);
  const data = await res.json();
  return data.data;
}

export async function fetchClinicById(id: number) {
  const res = await fetch(`${API_URL}/clinics/${id}`);
  const data = await res.json();
  return data.data;
}

export async function fetchServices() {
  const res = await fetch(`${API_URL}/services`);
  const data = await res.json();
  return data.data;
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/categories`);
  const data = await res.json();
  return data.data;
}

export async function registerUser(body: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
  role?: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

export async function loginUser(body: {
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return await res.json();
}

export async function getMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.data;
}