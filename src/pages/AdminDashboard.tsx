import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, Users, DollarSign, Package, 
  Plus, Trash2, Edit, Download, RefreshCw, AlertCircle, 
  CheckCircle, ExternalLink, Search, Filter, MoreVertical,
  ChevronUp, ChevronDown, X, Upload, Link2, Calendar,
  ArrowUpRight, ArrowDownRight, Eye, Settings
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Types (inchangés)
interface Product {
  _id: string;
  name: string;
  price: number;
  costPrice?: number;
  stock: number;
  supplier: 'aliexpress' | 'cj' | 'manual';
  image: string;
  sales: number;
  status: 'active' | 'inactive';
  lastSynced: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: any[];
}

interface Stats {
  todayRevenue: number;
  monthRevenue: number;
  yesterdayRevenue: number;
  lastMonthRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStock: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

// Components (inchangés)
const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, alert, subtitle }: any) => (
  <div style={{ 
    background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer'
  }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'; }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={24} color={color} />
      </div>
      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: (trendValue || 0) >= 0 ? '#dcfce7' : '#fee2e2', color: (trendValue || 0) >= 0 ? '#16a34a' : '#dc2626', fontSize: '12px', fontWeight: '600' }}>
          {(trendValue || 0) >= 0 ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {trend}
        </div>
      )}
    </div>
    <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>{title}</h3>
    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>{value}</div>
    {alert > 0 && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '12px', color: '#dc2626', fontWeight: '500' }}>
        <AlertCircle size={14} />
        {alert} produit{alert > 1 ? 's' : ''} en stock faible
      </div>
    )}
    {subtitle && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{subtitle}</div>}
  </div>
);

const ToastContainer = ({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) => (
  <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {toasts.map(toast => (
      <div key={toast.id} style={{ padding: '16px 20px', borderRadius: '8px', background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : '#f59e0b', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px', animation: 'slideIn 0.3s ease-out' }}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span style={{ flex: 1, fontWeight: '500' }}>{toast.message}</span>
        <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}><X size={16} /></button>
      </div>
    ))}
    <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
  </div>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth = '600px' }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'suppliers'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // 🔥 CORRECTION ICI : Luxe_admin_token au lieu de token
  const token = localStorage.getItem('Luxe_admin_token');

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (!token) {
        console.error('❌ Pas de token trouvé !');
        navigate('/login');
        return;
      }

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers })
      ]);

      if (statsRes.status === 401 || productsRes.status === 401 || ordersRes.status === 401) {
        console.error('❌ Token invalide (401)');
        localStorage.removeItem('Luxe_admin_token'); // 🔥 CORRECTION
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Erreur:', error);
      addToast('error', 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [token, navigate, addToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const importFromAliExpress = async () => {
    setActionLoading('aliexpress');
    try {
      const res = await fetch(`${API_URL}/admin/import/aliexpress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ limit: 20 })
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', `${data.imported} produits importés`);
        fetchDashboardData();
      } else addToast('error', data.message || 'Erreur import');
    } catch {
      addToast('error', 'Erreur connexion API');
    } finally {
      setActionLoading(null);
      setShowImportModal(false);
    }
  };

  const syncStocks = async () => {
    setActionLoading('sync');
    try {
      const res = await fetch(`${API_URL}/admin/sync-stocks`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', `${data.updated} stocks mis à jour`);
        fetchDashboardData();
      }
    } catch {
      addToast('error', 'Erreur synchronisation');
    } finally {
      setActionLoading(null);
    }
  };

  const updateProductPrice = async (id: string, newPrice: number) => {
    try {
      const res = await fetch(`${API_URL}/admin/products/${id}/price`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ price: newPrice })
      });
      if (res.ok) {
        addToast('success', 'Prix mis à jour');
        setEditingProduct(null);
        fetchDashboardData();
      }
    } catch {
      addToast('error', 'Erreur mise à jour');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      addToast('success', 'Produit supprimé');
      fetchDashboardData();
    } catch {
      addToast('error', 'Erreur suppression');
    }
    setShowDeleteConfirm(null);
  };

  const exportCSV = () => {
    const csv = [
      ['ID', 'Nom', 'Prix', 'Stock', 'Fournisseur', 'Ventes', 'Statut'].join(';'),
      ...products.map(p => [p._id, `"${p.name}"`, p.price, p.stock, p.supplier, p.sales, p.status].join(';'))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produits_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('success', 'Export CSV téléchargé');
  };

  const filteredProducts = useMemo(() => {
    let result = products;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    return result;
  }, [products, statusFilter]);

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: '#ff4747' }} />
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <StatCard title="CA Aujourd'hui" value={`${stats?.todayRevenue?.toFixed(2) || '0.00'} €`} trend="+12%" trendValue={12} icon={DollarSign} color="#ff4747" subtitle="vs hier" />
        <StatCard title="CA Mensuel" value={`${stats?.monthRevenue?.toFixed(2) || '0.00'} €`} trend="+8%" trendValue={8} icon={TrendingUp} color="#3b82f6" subtitle="vs mois dernier" />
        <StatCard title="Commandes en attente" value={stats?.pendingOrders || 0} icon={ShoppingBag} color="#f59e0b" />
        <StatCard title="Produits en stock" value={stats?.totalProducts || 0} alert={stats?.lowStock || 0} icon={Package} color="#22c55e" />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
        {[ { id: 'overview', label: 'Vue d\'ensemble' }, { id: 'products', label: `Produits (${products.length})` }, { id: 'orders', label: `Commandes (${orders.length})` } ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{ padding: '12px 24px', border: 'none', background: 'transparent', color: activeTab === tab.id ? '#ff4747' : '#64748b', fontWeight: activeTab === tab.id ? '600' : '500', borderBottom: activeTab === tab.id ? '2px solid #ff4747' : 'none', marginBottom: '-2px', cursor: 'pointer' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '500px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="all">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowImportModal(true)} disabled={!!actionLoading} style={{ padding: '10px 20px', background: '#ff4747', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <Download size={18} /> Importer
              </button>
              <button onClick={syncStocks} disabled={actionLoading === 'sync'} style={{ padding: '10px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                <RefreshCw size={18} style={{ animation: actionLoading === 'sync' ? 'spin 1s linear infinite' : 'none' }} /> Sync
              </button>
              <button onClick={exportCSV} style={{ padding: '10px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer' }}>
                <Upload size={18} /> Export
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Produit</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Prix</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Stock</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(product => (
                <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={product.image || '/placeholder.jpg'} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
                      <div>
                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{product._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {editingProduct?._id === product._id ? (
                      <input type="number" defaultValue={product.price} onBlur={(e) => updateProductPrice(product._id, parseFloat(e.target.value))} style={{ width: '80px', padding: '4px' }} autoFocus />
                    ) : (
                      <div style={{ fontWeight: '600' }}>{product.price.toFixed(2)} €</div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: product.stock < 10 ? '#dc2626' : '#16a34a', fontWeight: '600' }}>{product.stock}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button onClick={() => setEditingProduct(product)} style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', marginRight: '8px' }}><Edit size={16} /></button>
                    <button onClick={() => setShowDeleteConfirm(product._id)} style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '6px' }}><Trash2 size={16} color="#dc2626" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Importer">
        <div onClick={importFromAliExpress} style={{ padding: '24px', border: '2px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', marginBottom: '12px' }}>
          <h4>AliExpress</h4>
          <p>Importer depuis AliExpress API</p>
        </div>
      </Modal>
      
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirmer" maxWidth="400px">
        <p>Supprimer ce produit ?</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: '6px' }}>Annuler</button>
          <button onClick={() => showDeleteConfirm && deleteProduct(showDeleteConfirm)} style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px' }}>Supprimer</button>
        </div>
      </Modal>
    </div>
  );
}