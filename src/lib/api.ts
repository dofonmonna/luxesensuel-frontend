/**
 * Client API LuxeSensuel
 * Toutes les requêtes backend passent par ce module.
 * Fallback automatique sur les mock data si le backend est hors ligne.
 */
import { MOCK_PRODUCTS } from './mockData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Détecte si le backend est disponible (mis en cache 30s)
let backendAvailable: boolean | null = null;
let lastCheck = 0;

async function isBackendUp(): Promise<boolean> {
  const now = Date.now();
  if (backendAvailable !== null && now - lastCheck < 30_000) return backendAvailable;
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    backendAvailable = res.ok;
  } catch {
    backendAvailable = false;
  }
  lastCheck = now;
  return backendAvailable;
}

// ─── Token admin (JWT) ────────────────────────────────────────
export const getAdminToken = () => localStorage.getItem('luxe_admin_token');
export const setAdminToken = (token: string) => localStorage.setItem('luxe_admin_token', token);
export const removeAdminToken = () => localStorage.removeItem('luxe_admin_token');
export const isAdminAuthenticated = () => !!getAdminToken();

// ─── Fetch helper ─────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  adminAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (adminAuth) {
    const token = getAdminToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur réseau' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── PRODUITS ─────────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  images?: string[];
  is_new: boolean;
  is_active: boolean;
  created_at: string;
}

export const productsApi = {
  list: async (params?: { category?: string; search?: string; random?: boolean; limit?: number }) => {
    if (!(await isBackendUp())) {
      let products = [...MOCK_PRODUCTS];
      if (params?.category) products = products.filter(p => p.category === params.category);
      if (params?.search) {
        const q = params.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (params?.random) {
        products = products.sort(() => Math.random() - 0.5);
      }
      if (params?.limit) {
        products = products.slice(0, params.limit);
      }
      return { products };
    }
    const filteredParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    ) : null;
    const qs = filteredParams ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
    const res = await apiFetch<{ products: Product[] }>(`/products${qs}`);
    // Normaliser les numériques (PostgreSQL retourne des strings)
    res.products = res.products.map(p => ({ ...p, price: parseFloat(p.price as any), stock: parseInt(p.stock as any) }));
    return res;
  },
  get: async (id: string) => {
    if (!(await isBackendUp())) {
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (!product) throw new Error('Produit introuvable');
      return { product };
    }
    const res = await apiFetch<{ product: Product }>(`/products/${id}`);
    res.product.price = parseFloat(res.product.price as any);
    res.product.stock = parseInt(res.product.stock as any);
    return res;
  },
  create: (data: Partial<Product>) =>
    apiFetch<{ product: Product }>('/products', { method: 'POST', body: JSON.stringify(data) }, true),
  update: (id: string, data: Partial<Product>) =>
    apiFetch<{ product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  delete: (id: string) =>
    apiFetch<{ message: string }>(`/products/${id}`, { method: 'DELETE' }, true),
};

// ─── COMMANDES ────────────────────────────────────────────────
export interface OrderItem {
  product_id: string;
  quantity: number;
}

export interface CreateOrderPayload {
  items: OrderItem[];
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
  };
  shipping: {
    address?: string;
    city?: string;
    postal?: string;
    country: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first: string;
  customer_last: string;
  total: number;
  status: string;
  payment_id?: string;
  created_at: string;
  items?: any[];
}

export const ordersApi = {
  create: (data: CreateOrderPayload) =>
    apiFetch<{ order: { id: string; order_number: string; total: number; status: string } }>(
      '/orders', { method: 'POST', body: JSON.stringify(data) }
    ),
  list: (params?: { status?: string; limit?: number; offset?: number }) => {
    const filteredParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v != null)
    ) : null;
    const qs = filteredParams ? '?' + new URLSearchParams(filteredParams as any).toString() : '';
    return apiFetch<{ orders: Order[]; total: number }>(`/orders${qs}`, {}, true);
  },
  get: (id: string) =>
    apiFetch<{ order: Order }>(`/orders/${id}`, {}, true),
  updateStatus: (id: string, data: { status: string; tracking_number?: string; notes?: string }) =>
    apiFetch<{ order: Order }>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }, true),
};

// ─── PAIEMENTS ──────────────────────────────────────────────
export const payApi = {
  createPayPalOrder: (order_id: string) =>
    apiFetch<{ paypal_order_id: string; status: string }>(
      '/pay/create', { method: 'POST', body: JSON.stringify({ order_id }) }
    ),
  capturePayment: (order_id: string, paypal_order_id: string) =>
    apiFetch<{ success: boolean; capture_id: string; status: string; order_number: string }>(
      '/pay/capture', { method: 'POST', body: JSON.stringify({ order_id, paypal_order_id }) }
    ),
  createPayDunyaOrder: (order_id: string, customer: any) =>
    apiFetch<{ checkout_url: string }>(
      '/paydunya/create', { method: 'POST', body: JSON.stringify({ order_id, customer }) }
    ),
};

// ─── ADMIN ────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  country?: string;
  is_active: boolean;
}

export interface CjImportResult {
  product?: Product;
  produit?: Product;
  source?: string;
  success?: boolean;
}

export const adminApi = {
  login: async (password: string) => {
    const res = await apiFetch<{ token: string; expires_in: string }>(
      '/admin/login', { method: 'POST', body: JSON.stringify({ password }) }
    );
    setAdminToken(res.token);
    return res;
  },
  logout: () => removeAdminToken(),

  dashboard: () =>
    apiFetch<{ stats: any; products: any; recent_orders: Order[] }>('/admin/dashboard', {}, true),
  stock: () =>
    apiFetch<{ products: (Product & { low_stock_alert: boolean })[]; threshold: number; alerts: number }>(
      '/admin/stock', {}, true
    ),
  revenue: () =>
    apiFetch<{ revenue: { day: string; orders: number; revenue: number }[] }>('/admin/revenue', {}, true),

  // Fournisseurs
  getSuppliers: () =>
    apiFetch<{ suppliers: Supplier[] }>('/admin/suppliers', {}, true),
  createSupplier: (data: Partial<Supplier>) =>
    apiFetch<{ supplier: Supplier }>('/admin/suppliers', { method: 'POST', body: JSON.stringify(data) }, true),
  updateSupplier: (id: string, data: Partial<Supplier>) =>
    apiFetch<{ supplier: Supplier }>(`/admin/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  searchCJ: (keyword: string, page = 1) =>
    apiFetch<{ produits: any[]; total: number; source: string }>(
      `/admin/search/cj?` + new URLSearchParams({ keyword, page: String(page) }).toString(),
      {},
      true
    ),
  importCJ: (data: { cj_product_id: string; is_adult?: boolean; category?: string }) =>
    apiFetch<CjImportResult>('/admin/import/cj', { method: 'POST', body: JSON.stringify(data) }, true),
};
