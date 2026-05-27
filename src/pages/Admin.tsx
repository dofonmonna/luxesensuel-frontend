import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, DollarSign, Package,
  Trash2, Edit, Download, RefreshCw, AlertCircle,
  CheckCircle, Search, X, ChevronUp, ChevronDown,
  Upload, Plus, Users, Eye, EyeOff, Tag, BarChart2,
  Filter, ArrowUpDown
} from 'lucide-react';
import { ImportModal } from '../components/Admin/ImportModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SITE_CATEGORIES = [
  'Lingerie', 'Plaisir Adulte', 'Soins', 'Parfums',
  'Electronique', 'Accessoires', 'Bijoux', 'Bien-etre', 'Confort', 'Coffrets', 'Couples'
];

const ORDER_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef9c3', color: '#ca8a04', label: 'En attente' },
  paid:       { bg: '#dcfce7', color: '#16a34a', label: 'Payee' },
  processing: { bg: '#ede9fe', color: '#7c3aed', label: 'En traitement' },
  shipped:    { bg: '#dbeafe', color: '#1d4ed8', label: 'Expediee' },
  delivered:  { bg: '#f0fdf4', color: '#15803d', label: 'Livree' },
  cancelled:  { bg: '#fee2e2', color: '#dc2626', label: 'Annulee' },
  refunded:   { bg: '#fff7ed', color: '#c2410c', label: 'Remboursee' },
};

interface Product {
  _id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  supplier: string;
  image: string;
  sales: number;
  status: 'active' | 'inactive';
  category: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
}

interface Stats {
  todayRevenue: number;
  yesterdayRevenue: number;
  monthRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStock: number;
  totalCustomers: number;
  conversionRate: number;
  todayOrders: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// ─── Mini bar chart (CSS only, no lib needed) ───
const RevenueBar = ({ value, max, label, date }: { value: number; max: number; label: string; date: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
    <div style={{ fontSize: '10px', fontWeight: '600', color: '#1e293b' }}>{label}</div>
    <div style={{ width: '100%', height: '80px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      <div style={{
        width: '100%',
        height: max > 0 ? `${Math.max(4, (value / max) * 100)}%` : '4%',
        background: 'linear-gradient(to top, #ff4747, #ff8080)',
        borderRadius: '4px 4px 0 0',
        transition: 'height 0.3s ease'
      }} />
    </div>
    <div style={{ fontSize: '9px', color: '#94a3b8' }}>{date}</div>
  </div>
);

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, alert, subtitle }: any) => (
  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} color={color} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: '20px', background: (trendValue || 0) >= 0 ? '#dcfce7' : '#fee2e2', color: (trendValue || 0) >= 0 ? '#16a34a' : '#dc2626', fontSize: '11px', fontWeight: '700' }}>
          {(trendValue || 0) >= 0 ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {trend}
        </div>
      )}
    </div>
    <h3 style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>{title}</h3>
    <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#1e293b', marginBottom: '2px' }}>{value}</div>
    {alert > 0 && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
        <AlertCircle size={12} />
        {alert} en stock faible
      </div>
    )}
    {subtitle && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{subtitle}</div>}
  </div>
);

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) => (
  <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {toasts.map(toast => (
      <div key={toast.id} style={{ padding: '14px 18px', borderRadius: '10px', background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6', color: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', minWidth: '280px', maxWidth: '400px' }}>
        {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span style={{ flex: 1, fontWeight: '500', fontSize: '13px' }}>{toast.message}</span>
        <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
      </div>
    ))}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth = '700px' }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '600', color: '#1e293b' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

export function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'import'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Products filters & edit
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Orders filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [recategorizeResult, setRecategorizeResult] = useState<{ updated: number; total: number } | null>(null);

  const token = sessionStorage.getItem('Luxe_admin_token');

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  useEffect(() => {
    if (!token) navigate('/admin/login');
  }, [token, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers }),
      ]);
      if (statsRes.status === 401) { sessionStorage.removeItem('Luxe_admin_token'); navigate('/admin/login'); return; }
      if (statsRes.ok) setStats(await statsRes.json());
      if (productsRes.ok) { const d = await productsRes.json(); setProducts(d.products || []); }
      if (ordersRes.ok) { const d = await ordersRes.json(); setOrders(d.orders || []); }
    } catch { addToast('error', 'Erreur chargement des donnees'); }
    finally { setLoading(false); }
  }, [token, navigate, addToast]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  // ─── Actions ───

  const syncStocks = async () => {
    setActionLoading('sync');
    try {
      const res = await fetch(`${API_URL}/admin/sync-stocks`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { addToast('success', 'Stocks synchronises'); fetchDashboardData(); }
      else addToast('error', 'Erreur synchronisation');
    } catch { addToast('error', 'Erreur synchronisation'); }
    finally { setActionLoading(null); }
  };

  const recategorizeAll = async () => {
    setActionLoading('recategorize');
    try {
      const res = await fetch(`${API_URL}/admin/recategorize`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setRecategorizeResult({ updated: data.updated, total: data.total });
        addToast('success', `${data.updated} produit(s) reclassifie(s) sur ${data.total}`);
        fetchDashboardData();
      } else addToast('error', data.error || 'Erreur recategorisation');
    } catch { addToast('error', 'Erreur recategorisation'); }
    finally { setActionLoading(null); }
  };

  const updateProductPrice = async (id: string, newPrice: number) => {
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price: newPrice }),
      });
      if (res.ok) { addToast('success', 'Prix mis a jour'); setEditingProduct(null); fetchDashboardData(); }
      else addToast('error', 'Erreur mise a jour prix');
    } catch { addToast('error', 'Erreur'); }
  };

  const updateProductCategory = async (id: string, category: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}/category`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category }),
      });
      if (res.ok) { addToast('success', 'Categorie mise a jour'); setEditingCategory(null); fetchDashboardData(); }
      else addToast('error', 'Erreur mise a jour categorie');
    } catch { addToast('error', 'Erreur'); }
  };

  const toggleProductStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`${API_URL}/admin/products/${product._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) { addToast('success', `Produit ${newStatus === 'active' ? 'active' : 'desactive'}`); fetchDashboardData(); }
    } catch { addToast('error', 'Erreur'); }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { addToast('success', 'Statut commande mis a jour'); fetchDashboardData(); }
      else { const d = await res.json(); addToast('error', d.error || 'Transition interdite'); }
    } catch { addToast('error', 'Erreur'); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      addToast('success', 'Produit supprime');
      fetchDashboardData();
    } catch { addToast('error', 'Erreur suppression'); }
    setShowDeleteConfirm(null);
  };

  const exportCSV = () => {
    const csv = [
      ['ID', 'Nom', 'Prix', 'Cout', 'Stock', 'Categorie', 'Fournisseur', 'Statut'].join(';'),
      ...products.map(p => [p._id, `"${p.name}"`, p.price, p.costPrice || '', p.stock, p.category, p.supplier, p.status].join(';'))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produits_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('success', 'Export CSV telecharge');
  };

  // ─── Filtered data ───

  const filteredProducts = useMemo(() => {
    let r = products;
    if (statusFilter !== 'all') r = r.filter(p => p.status === statusFilter);
    if (categoryFilter !== 'all') r = r.filter(p => p.category === categoryFilter);
    if (searchTerm) r = r.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return r;
  }, [products, statusFilter, categoryFilter, searchTerm]);

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const filteredOrders = useMemo(() => {
    let r = orders;
    if (orderStatusFilter !== 'all') r = r.filter(o => o.status === orderStatusFilter);
    if (orderSearch) r = r.filter(o =>
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.email.toLowerCase().includes(orderSearch.toLowerCase())
    );
    return r;
  }, [orders, orderStatusFilter, orderSearch]);

  // ─── Revenue chart data (last 7 days from orders) ───
  const revenueChartData = useMemo(() => {
    const days: { label: string; date: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.createdAt?.startsWith(dateStr) && o.status !== 'cancelled');
      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      days.push({
        label: revenue > 0 ? `${revenue.toFixed(0)}` : '0',
        date: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
        value: revenue
      });
    }
    return days;
  }, [orders]);
  const maxRevenue = Math.max(...revenueChartData.map(d => d.value), 1);

  // ─── Category breakdown ───
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => { counts[p.category || 'Sans categorie'] = (counts[p.category || 'Sans categorie'] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [products]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <RefreshCw size={36} style={{ animation: 'spin 1s linear infinite', color: '#ff4747' }} />
        <span style={{ color: '#64748b', fontSize: '14px' }}>Chargement du tableau de bord...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const todayVsYesterday = stats?.yesterdayRevenue
    ? (((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100).toFixed(0)
    : null;

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ─── KPI Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard
          title="CA Aujourd'hui"
          value={`${stats?.todayRevenue?.toFixed(2) || '0.00'} EUR`}
          trend={todayVsYesterday ? `${todayVsYesterday}%` : undefined}
          trendValue={todayVsYesterday ? parseFloat(todayVsYesterday) : 0}
          icon={DollarSign} color="#ff4747"
          subtitle={`Hier : ${stats?.yesterdayRevenue?.toFixed(2) || '0'} EUR`}
        />
        <StatCard
          title="CA Total"
          value={`${stats?.monthRevenue?.toFixed(2) || '0.00'} EUR`}
          icon={TrendingUp} color="#3b82f6"
          subtitle={`${stats?.totalOrders || 0} commandes au total`}
        />
        <StatCard
          title="Commandes aujourd'hui"
          value={stats?.todayOrders || 0}
          icon={ShoppingBag} color="#f59e0b"
          subtitle={`${stats?.pendingOrders || 0} en attente`}
        />
        <StatCard
          title="Produits actifs"
          value={stats?.totalProducts || 0}
          alert={stats?.lowStock || 0}
          icon={Package} color="#22c55e"
        />
        <StatCard
          title="Clients"
          value={stats?.totalCustomers || 0}
          icon={Users} color="#8b5cf6"
          subtitle={`Taux de conv. : ${stats?.conversionRate || 0}%`}
        />
      </div>

      {/* ─── Tabs ─── */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', overflowX: 'auto' }}>
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'products', label: `Produits (${products.length})` },
          { id: 'orders', label: `Commandes (${orders.length})` },
          { id: 'import', label: 'Importer produits' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', whiteSpace: 'nowrap',
            color: activeTab === tab.id ? '#ff4747' : '#64748b',
            fontWeight: activeTab === tab.id ? '600' : '500',
            borderBottom: activeTab === tab.id ? '2px solid #ff4747' : '2px solid transparent',
            marginBottom: '-2px', cursor: 'pointer', fontSize: '13px', transition: 'color 0.15s'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB: VUE D'ENSEMBLE
      ══════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Graphe CA 7 jours */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color="#ff4747" /> CA des 7 derniers jours
              </h3>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>en EUR</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '110px' }}>
              {revenueChartData.map((d, i) => (
                <RevenueBar key={i} value={d.value} max={maxRevenue} label={d.label} date={d.date} />
              ))}
            </div>
          </div>

          {/* Dernieres commandes */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Dernieres commandes</h3>
              <button onClick={() => setActiveTab('orders')} style={{ fontSize: '12px', color: '#ff4747', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Voir tout</button>
            </div>
            {orders.slice(0, 6).map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#1e293b' }}>#{order.orderNumber}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{order.customerName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '700', color: '#ff4747', fontSize: '13px' }}>{order.total.toFixed(2)} EUR</div>
                  <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', ...((STATUS_COLORS[order.status] || STATUS_COLORS.pending)) }}>
                    {STATUS_COLORS[order.status]?.label || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Repartition par categorie */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>Produits par categorie</h3>
              <button onClick={() => setActiveTab('products')} style={{ fontSize: '12px', color: '#ff4747', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '500' }}>Gerer</button>
            </div>
            {categoryBreakdown.map(([cat, count]) => (
              <div key={cat} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#1e293b' }}>{cat}</span>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{count}</span>
                </div>
                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px' }}>
                  <div style={{ height: '100%', width: `${(count / products.length) * 100}%`, background: 'linear-gradient(to right, #ff4747, #ff8080)', borderRadius: '3px' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '16px' }}>Actions rapides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <button onClick={() => setActiveTab('import')} style={{ padding: '16px', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#ff4747', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={20} /> Importer CJ / AliExpress
              </button>
              <button onClick={recategorizeAll} disabled={actionLoading === 'recategorize'} style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '10px', opacity: actionLoading === 'recategorize' ? 0.6 : 1 }}>
                <Tag size={20} style={{ animation: actionLoading === 'recategorize' ? 'spin 1s linear infinite' : 'none' }} />
                {actionLoading === 'recategorize' ? 'En cours...' : 'Recategoriser tout'}
              </button>
              <button onClick={syncStocks} disabled={actionLoading === 'sync'} style={{ padding: '16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '10px', opacity: actionLoading === 'sync' ? 0.6 : 1 }}>
                <RefreshCw size={20} style={{ animation: actionLoading === 'sync' ? 'spin 1s linear infinite' : 'none' }} />
                Synchroniser stocks
              </button>
              <button onClick={exportCSV} style={{ padding: '16px', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: '600', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={20} /> Exporter CSV
              </button>
            </div>
            {recategorizeResult && (
              <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '13px', color: '#16a34a', fontWeight: '500' }}>
                Derniere recategorisation : {recategorizeResult.updated} produit(s) modifie(s) sur {recategorizeResult.total} analyses.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: PRODUITS
      ══════════════════════════════════════ */}
      {activeTab === 'products' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Filtres */}
            <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', minWidth: '180px', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder="Rechercher un produit..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%', padding: '8px 10px 8px 34px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
              </div>
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#374151' }}>
                <option value="all">Toutes categories</option>
                {SITE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', color: '#374151' }}>
                <option value="all">Tous statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={recategorizeAll} disabled={actionLoading === 'recategorize'}
                style={{ padding: '8px 14px', background: actionLoading === 'recategorize' ? '#f1f5f9' : '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                <Tag size={15} style={{ animation: actionLoading === 'recategorize' ? 'spin 1s linear infinite' : 'none' }} />
                {actionLoading === 'recategorize' ? 'En cours...' : 'Recategoriser tout'}
              </button>
              <button onClick={() => setShowImportModal(true)}
                style={{ padding: '8px 14px', background: '#ff4747', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                <Download size={15} /> Importer
              </button>
              <button onClick={syncStocks} disabled={actionLoading === 'sync'}
                style={{ padding: '8px 14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600' }}>
                <RefreshCw size={15} style={{ animation: actionLoading === 'sync' ? 'spin 1s linear infinite' : 'none' }} /> Sync
              </button>
              <button onClick={exportCSV}
                style={{ padding: '8px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <Upload size={15} /> CSV
              </button>
            </div>
          </div>

          {/* Info barre */}
          <div style={{ padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
            {filteredProducts.length} produit(s) affiche(s) sur {products.length} total
            {recategorizeResult && <span style={{ marginLeft: '16px', color: '#16a34a', fontWeight: '600' }}>Derniere recategorisation : {recategorizeResult.updated} modifie(s)</span>}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produit</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categorie</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Source</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map(product => (
                  <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9', background: product.status === 'inactive' ? '#fafafa' : 'white' }}>
                    {/* Produit */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={product.image || '/placeholder.jpg'} alt={product.name}
                          style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', opacity: product.status === 'inactive' ? 0.5 : 1 }}
                          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: product.status === 'inactive' ? '#94a3b8' : '#1e293b' }}>{product.name}</div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>#{product._id.slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    {/* Categorie */}
                    <td style={{ padding: '12px 16px' }}>
                      {editingCategory === product._id ? (
                        <select
                          defaultValue={product.category}
                          autoFocus
                          onChange={e => updateProductCategory(product._id, e.target.value)}
                          onBlur={() => setEditingCategory(null)}
                          style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}
                        >
                          {SITE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => setEditingCategory(product._id)} title="Cliquer pour modifier"
                          style={{ padding: '3px 10px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '20px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Tag size={10} />
                          {product.category || 'Non defini'}
                        </button>
                      )}
                    </td>
                    {/* Source */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: product.supplier === 'cj' ? '#fff5f5' : product.supplier === 'aliexpress' ? '#fff8f0' : '#f0f9ff', color: product.supplier === 'cj' ? '#ff4747' : product.supplier === 'aliexpress' ? '#ff6a00' : '#0369a1' }}>
                        {product.supplier === 'cj' ? 'CJ' : product.supplier === 'aliexpress' ? 'AliExpress' : 'Manuel'}
                      </span>
                    </td>
                    {/* Prix */}
                    <td style={{ padding: '12px 16px' }}>
                      {editingProduct?._id === product._id ? (
                        <input type="number" defaultValue={product.price}
                          onBlur={e => updateProductPrice(product._id, parseFloat(e.target.value))}
                          onKeyDown={e => { if (e.key === 'Escape') setEditingProduct(null); }}
                          style={{ width: '70px', padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px' }} autoFocus />
                      ) : (
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13px' }}>{product.price.toFixed(2)} EUR</div>
                          {product.costPrice ? <div style={{ fontSize: '10px', color: '#94a3b8' }}>cout: {product.costPrice.toFixed(2)}</div> : null}
                        </div>
                      )}
                    </td>
                    {/* Stock */}
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: product.stock < 5 ? '#dc2626' : product.stock < 15 ? '#f59e0b' : '#16a34a', fontWeight: '700', fontSize: '13px' }}>{product.stock}</span>
                    </td>
                    {/* Statut toggle */}
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleProductStatus(product)}
                        style={{ padding: '4px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600', background: product.status === 'active' ? '#dcfce7' : '#f1f5f9', color: product.status === 'active' ? '#16a34a' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {product.status === 'active' ? <Eye size={11} /> : <EyeOff size={11} />}
                        {product.status === 'active' ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => setEditingProduct(product)} title="Modifier prix"
                          style={{ padding: '6px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(product._id)} title="Supprimer"
                          style={{ padding: '6px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          <Trash2 size={14} color="#dc2626" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                      Aucun produit ne correspond aux filtres appliques.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'center', gap: '6px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white', color: currentPage === 1 ? '#cbd5e1' : '#374151' }}>
                Precedent
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const page = i + 1;
                return (
                  <button key={page} onClick={() => setCurrentPage(page)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: currentPage === page ? '#ff4747' : '#f1f5f9', color: currentPage === page ? 'white' : '#64748b', fontWeight: '600', fontSize: '13px' }}>{page}</button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white', color: currentPage === totalPages ? '#cbd5e1' : '#374151' }}>
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: COMMANDES
      ══════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Rechercher commande, client, email..." value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 34px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
            </div>
            <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}>
              <option value="all">Tous les statuts</option>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label || s}</option>)}
            </select>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{filteredOrders.length} commande(s)</div>
          </div>

          {/* Stat rapides commandes */}
          <div style={{ display: 'flex', gap: '1px', background: '#e2e8f0' }}>
            {ORDER_STATUSES.slice(0, 5).map(s => {
              const count = orders.filter(o => o.status === s).length;
              const conf = STATUS_COLORS[s];
              return (
                <div key={s} onClick={() => setOrderStatusFilter(orderStatusFilter === s ? 'all' : s)}
                  style={{ flex: 1, padding: '10px 8px', background: orderStatusFilter === s ? conf.bg : 'white', textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: conf.color }}>{count}</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>{conf.label}</div>
                </div>
              );
            })}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Commande</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Total</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Changer statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '700', color: '#ff4747', fontSize: '13px' }}>#{order.orderNumber}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: '500', fontSize: '13px' }}>{order.customerName}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{order.email}</div>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: '700', fontSize: '13px' }}>{order.total.toFixed(2)} EUR</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', ...(STATUS_COLORS[order.status] || STATUS_COLORS.pending) }}>
                      {STATUS_COLORS[order.status]?.label || order.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b' }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order._id, e.target.value)}
                      style={{ padding: '5px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{STATUS_COLORS[s]?.label || s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Aucune commande.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB: IMPORT
      ══════════════════════════════════════ */}
      {activeTab === 'import' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>📦</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '10px', color: '#1e293b' }}>Import de produits</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '28px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
            Importez des produits depuis CJ Dropshipping ou AliExpress directement dans votre boutique.
            Les categories sont detectees automatiquement.
          </p>
          <button onClick={() => setShowImportModal(true)}
            style={{ padding: '14px 28px', background: '#ff4747', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Ouvrir l'import
          </button>
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '40px' }}>
            {[
              { emoji: '🏪', name: 'CJ Dropshipping', desc: 'Livraison rapide, stocks EU/US' },
              { emoji: '🛒', name: 'AliExpress', desc: 'Prix competitifs, large catalogue' },
            ].map(s => (
              <div key={s.name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.emoji}</div>
                <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{s.name}</p>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Modal suppression ─── */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirmer la suppression" maxWidth="400px">
        <p style={{ color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>Voulez-vous vraiment supprimer ce produit ? Cette action est irreversible.</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '9px 18px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Annuler</button>
          <button onClick={() => showDeleteConfirm && deleteProduct(showDeleteConfirm)} style={{ padding: '9px 18px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Supprimer</button>
        </div>
      </Modal>

      {/* ─── Import Modal ─── */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => { addToast('success', 'Produit importe avec succes !'); fetchDashboardData(); }}
        apiUrl={API_URL}
        token={token || ''}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
