// pages/Admin.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingBag, DollarSign, Package, 
  Trash2, Edit, Download, RefreshCw, AlertCircle, 
  CheckCircle, Search, X,
  ChevronUp, ChevronDown, Upload
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

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
  monthRevenue: number;
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

interface SearchResult {
  productId?: string;
  pid?: string;
  productTitle?: string;
  productNameEn?: string;
  productMainImageUrl?: string;
  productImage?: string;
  salePrice?: string;
  sellPrice?: string;
}

const StatCard = ({ title, value, trend, trendValue, icon: Icon, color, alert, subtitle }: any) => (
  <div style={{ 
    background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
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
      <div key={toast.id} style={{ padding: '16px 20px', borderRadius: '8px', background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : '#f59e0b', color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', minWidth: '300px' }}>
        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span style={{ flex: 1, fontWeight: '500' }}>{toast.message}</span>
        <button onClick={() => removeToast(toast.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={16} /></button>
      </div>
    ))}
  </div>
);

const Modal = ({ isOpen, onClose, title, children, maxWidth = '700px' }: any) => {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [importSource, setImportSource] = useState<'cj' | 'aliexpress'>('cj');
  const [importKeyword, setImportKeyword] = useState('lingerie');
  const [importResults, setImportResults] = useState<SearchResult[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

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
    if (!token) { navigate('/admin/login'); return; }
  }, [token, navigate]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [statsRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers })
      ]);

      if (statsRes.status === 401) {
        localStorage.removeItem('Luxe_admin_token');
        navigate('/admin/login');
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (productsRes.ok) { const d = await productsRes.json(); setProducts(d.products || []); }
      if (ordersRes.ok) { const d = await ordersRes.json(); setOrders(d.orders || []); }
    } catch (error) {
      addToast('error', 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [token, navigate, addToast]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const searchSupplierProducts = async () => {
    if (!importKeyword.trim()) return;
    setImportLoading(true);
    setImportResults([]);
    setSelectedProducts(new Set());
    try {
      const res = await fetch(`${API_URL}/admin/import/${importSource}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ keyword: importKeyword, page: 1 })
      });
      const data = await res.json();
      if (res.ok) {
        setImportResults(data.produits || []);
        if ((data.produits || []).length === 0) addToast('warning', 'Aucun produit trouvé');
      } else {
        addToast('error', data.error || 'Erreur de recherche');
      }
    } catch (err) {
      addToast('error', 'Erreur connexion API');
    } finally {
      setImportLoading(false);
    }
  };

  const importProduct = async (product: SearchResult) => {
    const productId = product.productId || product.pid || '';
    if (!productId) return;
    setImportingId(productId);
    try {
      const body = importSource === 'cj'
        ? { cj_product_id: productId }
        : { ae_product_id: productId };

      const res = await fetch(`${API_URL}/admin/import/${importSource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', data.message || '✅ Produit importé !');
        fetchDashboardData();
      } else {
        addToast('error', data.error || 'Erreur import');
      }
    } catch (err) {
      addToast('error', 'Erreur connexion');
    } finally {
      setImportingId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === importResults.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(importResults.map(p => p.productId || p.pid || '').filter(Boolean));
      setSelectedProducts(allIds);
    }
  };

  const importBulkProducts = async () => {
    if (selectedProducts.size === 0) return;
    setImportingId('bulk');
    try {
      const res = await fetch(`${API_URL}/admin/import/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          platform: importSource, 
          productIds: Array.from(selectedProducts) 
        })
      });
      const data = await res.json();
      if (res.ok) {
        addToast('success', data.message || `✅ Importation en masse démarrée !`);
        setSelectedProducts(new Set());
      } else {
        addToast('error', data.error || 'Erreur lors de l\'import en masse');
      }
    } catch (err) {
      addToast('error', 'Erreur de connexion serveur');
    } finally {
      setImportingId(null);
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
      if (res.ok) { addToast('success', 'Stocks synchronisés ✅'); fetchDashboardData(); }
    } catch { addToast('error', 'Erreur synchronisation'); }
    finally { setActionLoading(null); }
  };

  const reorganizeProducts = async () => {
    setActionLoading('reorganize');
    try {
      const res = await fetch(`${API_URL}/admin/products/reorganize`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) { 
        addToast('success', data.message || 'Produits réorganisés ✅'); 
        fetchDashboardData(); 
      }
    } catch { 
      addToast('error', 'Erreur lors de la réorganisation'); 
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
      if (res.ok) { addToast('success', 'Prix mis à jour'); setEditingProduct(null); fetchDashboardData(); }
    } catch { addToast('error', 'Erreur mise à jour'); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await fetch(`${API_URL}/admin/products/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      addToast('success', 'Produit supprimé');
      fetchDashboardData();
    } catch { addToast('error', 'Erreur suppression'); }
    setShowDeleteConfirm(null);
  };

  const exportCSV = () => {
    const csv = [
      ['ID', 'Nom', 'Prix', 'Stock', 'Fournisseur', 'Statut'].join(';'),
      ...products.map(p => [p._id, `"${p.name}"`, p.price, p.stock, p.supplier, p.status].join(';'))
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
    if (searchTerm) result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return result;
  }, [products, statusFilter, searchTerm]);

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
        <StatCard title="CA Aujourd'hui" value={`${stats?.todayRevenue?.toFixed(2) || '0.00'} €`} trend="+12%" trendValue={12} icon={DollarSign} color="#ff4747" />
        <StatCard title="CA Mensuel" value={`${stats?.monthRevenue?.toFixed(2) || '0.00'} €`} trend="+8%" trendValue={8} icon={TrendingUp} color="#3b82f6" />
        <StatCard title="Commandes en attente" value={stats?.pendingOrders || 0} icon={ShoppingBag} color="#f59e0b" />
        <StatCard title="Produits en stock" value={stats?.totalProducts || 0} alert={stats?.lowStock || 0} icon={Package} color="#22c55e" />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0' }}>
        {[
          { id: 'overview', label: 'Vue d\'ensemble' },
          { id: 'products', label: `Produits (${products.length})` },
          { id: 'orders', label: `Commandes (${orders.length})` },
          { id: 'import', label: '📦 Importer produits' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
            padding: '12px 24px', border: 'none', background: 'transparent',
            color: activeTab === tab.id ? '#ff4747' : '#64748b',
            fontWeight: activeTab === tab.id ? '600' : '500',
            borderBottom: activeTab === tab.id ? '2px solid #ff4747' : 'none',
            marginBottom: '-2px', cursor: 'pointer', fontSize: '14px'
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'import' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#1e293b' }}>
            Importer des produits
          </h2>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div onClick={() => setImportSource('cj')} style={{
              flex: 1, padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
              border: importSource === 'cj' ? '2px solid #ff4747' : '2px solid #e2e8f0',
              background: importSource === 'cj' ? '#fff5f5' : 'white'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: importSource === 'cj' ? '#ff4747' : '#333' }}>CJ Dropshipping</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Livraison rapide, large catalogue</div>
            </div>
            <div onClick={() => setImportSource('aliexpress')} style={{
              flex: 1, padding: '20px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center',
              border: importSource === 'aliexpress' ? '2px solid #ff6a00' : '2px solid #e2e8f0',
              background: importSource === 'aliexpress' ? '#fff8f0' : 'white'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛒</div>
              <div style={{ fontWeight: '700', fontSize: '16px', color: importSource === 'aliexpress' ? '#ff6a00' : '#333' }}>AliExpress</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Prix compétitifs, millions de produits</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Mot-clé ou lien AliExpress (ex: https://...)"
                value={importKeyword}
                onChange={(e) => setImportKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchSupplierProducts()}
                style={{ width: '100%', padding: '12px 12px 12px 42px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <button
              onClick={searchSupplierProducts}
              disabled={importLoading}
              style={{
                padding: '12px 28px', background: importSource === 'cj' ? '#ff4747' : '#ff6a00',
                color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600',
                cursor: importLoading ? 'not-allowed' : 'pointer', fontSize: '14px', whiteSpace: 'nowrap'
              }}
            >
              {importLoading ? (
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : '🔍 Rechercher'}
            </button>
          </div>

          {importResults.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  {importResults.length} produits trouvés — Cliquez sur <strong>Importer</strong> pour ajouter à votre boutique
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={toggleSelectAll} style={{ padding: '8px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    {selectedProducts.size === importResults.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                  </button>
                  {selectedProducts.size > 0 && (
                    <button 
                      onClick={importBulkProducts} 
                      disabled={importingId === 'bulk'} 
                      style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '6px', cursor: importingId === 'bulk' ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                      {importingId === 'bulk' ? '⏳ Démarrage...' : `Importer la sélection (${selectedProducts.size})`}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {importResults.map((product, idx) => {
                  const pid = product.productId || product.pid || '';
                  const name = product.productTitle || product.productNameEn || 'Produit';
                  const image = product.productMainImageUrl || product.productImage || '';
                  const price = product.salePrice || product.sellPrice || '0';
                  const isImporting = importingId === pid;

                  return (
                    <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', background: 'white', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}>
                        <input 
                          type="checkbox" 
                          checked={selectedProducts.has(pid)}
                          onChange={() => {
                            const newSet = new Set(selectedProducts);
                            if (newSet.has(pid)) newSet.delete(pid);
                            else newSet.add(pid);
                            setSelectedProducts(newSet);
                          }}
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: importSource === 'cj' ? '#ff4747' : '#ff6a00' }}
                        />
                      </div>
                      <div style={{ height: '160px', overflow: 'hidden', background: '#f8fafc', position: 'relative' }} onClick={() => {
                        const newSet = new Set(selectedProducts);
                        if (newSet.has(pid)) newSet.delete(pid);
                        else newSet.add(pid);
                        setSelectedProducts(newSet);
                      }} style={{cursor: 'pointer'}}>
                        <img
                          src={image}
                          alt={name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                        />
                      </div>
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontSize: '12px', color: '#333', marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {name}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#ff4747', marginBottom: '10px' }}>
                          ${price}
                        </p>
                        <button
                          onClick={() => importProduct(product)}
                          disabled={isImporting}
                          style={{
                            width: '100%', padding: '8px', borderRadius: '6px', border: 'none',
                            background: isImporting ? '#ccc' : importSource === 'cj' ? '#ff4747' : '#ff6a00',
                            color: 'white', fontWeight: '600', fontSize: '12px',
                            cursor: isImporting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isImporting ? '⏳ Import...' : '+ Importer'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!importLoading && importResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>Recherchez des produits à importer</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Tapez un mot-clé et cliquez sur Rechercher</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1, maxWidth: '500px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <option value="all">Tous</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveTab('import')}
                style={{ padding: '10px 20px', background: '#ff4747', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Download size={18} /> Importer
              </button>
              <button onClick={syncStocks} disabled={actionLoading === 'sync'}
                style={{ padding: '10px 20px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={18} style={{ animation: actionLoading === 'sync' ? 'spin 1s linear infinite' : 'none' }} /> Sync stocks
              </button>
              <button onClick={exportCSV}
                style={{ padding: '10px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Upload size={18} /> Export CSV
              </button>
              <button onClick={reorganizeProducts} disabled={actionLoading === 'reorganize'}
                style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={18} style={{ animation: actionLoading === 'reorganize' ? 'spin 1s linear infinite' : 'none' }} /> Réorganiser catégories
              </button>
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Produit</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Source</th>
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
                      <img src={product.image || '/placeholder.jpg'} alt={product.name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '13px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{product._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      background: product.supplier === 'cj' ? '#fff5f5' : product.supplier === 'aliexpress' ? '#fff8f0' : '#f0f9ff',
                      color: product.supplier === 'cj' ? '#ff4747' : product.supplier === 'aliexpress' ? '#ff6a00' : '#0369a1'
                    }}>
                      {product.supplier === 'cj' ? 'CJ' : product.supplier === 'aliexpress' ? 'AliExpress' : 'Manuel'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {editingProduct?._id === product._id ? (
                      <input type="number" defaultValue={product.price}
                        onBlur={(e) => updateProductPrice(product._id, parseFloat(e.target.value))}
                        style={{ width: '80px', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '4px' }} autoFocus />
                    ) : (
                      <div style={{ fontWeight: '600' }}>{product.price.toFixed(2)} €</div>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ color: product.stock < 10 ? '#dc2626' : '#16a34a', fontWeight: '600' }}>{product.stock}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button onClick={() => setEditingProduct(product)}
                      style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '6px', marginRight: '8px', cursor: 'pointer' }}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(product._id)}
                      style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={16} color="#dc2626" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)} style={{
                  padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  background: currentPage === page ? '#ff4747' : '#f1f5f9',
                  color: currentPage === page ? 'white' : '#64748b', fontWeight: '600'
                }}>{page}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Commande</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Client</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Total</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Statut</th>
                <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: '#64748b' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#ff4747' }}>#{order.orderNumber}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '500' }}>{order.customerName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{order.email}</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600' }}>{order.total.toFixed(2)} €</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      background: order.status === 'paid' ? '#dcfce7' : order.status === 'pending' ? '#fef9c3' : order.status === 'shipped' ? '#dbeafe' : order.status === 'delivered' ? '#f0fdf4' : '#fee2e2',
                      color: order.status === 'paid' ? '#16a34a' : order.status === 'pending' ? '#ca8a04' : order.status === 'shipped' ? '#1d4ed8' : order.status === 'delivered' ? '#15803d' : '#dc2626'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b' }}>
                    {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Dernières commandes</h3>
            {orders.slice(0, 5).map(order => (
              <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px' }}>#{order.orderNumber}</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{order.customerName}</div>
                </div>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{order.total.toFixed(2)} €</div>
              </div>
            ))}
            {orders.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                Aucune commande récente
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Produits faibles en stock</h3>
            {products.filter(p => p.stock < 10).slice(0, 5).map(product => (
              <div key={product._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={product.image || '/placeholder.jpg'} alt={product.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{product.name}</div>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#dc2626' }}>{product.stock} restant(s)</div>
              </div>
            ))}
            {products.filter(p => p.stock < 10).length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                ✅ Tous les stocks sont bons
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirmer la suppression" maxWidth="400px">
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <AlertCircle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <p style={{ color: '#64748b', marginBottom: '24px' }}>Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '10px 24px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
            <button onClick={() => showDeleteConfirm && deleteProduct(showDeleteConfirm)} style={{ padding: '10px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Supprimer</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Modifier le prix" maxWidth="400px">
        {editingProduct && (
          <div style={{ padding: '16px 0' }}>
            <p style={{ marginBottom: '16px', color: '#64748b' }}>{editingProduct.name}</p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151' }}>Nouveau prix (€)</label>
              <input
                type="number"
                step="0.01"
                defaultValue={editingProduct.price}
                id="editPrice"
                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingProduct(null)} style={{ padding: '10px 20px', border: '1px solid #e2e8f0', background: 'white', borderRadius: '8px', cursor: 'pointer' }}>Annuler</button>
              <button 
                onClick={() => {
                  const input = document.getElementById('editPrice') as HTMLInputElement;
                  updateProductPrice(editingProduct._id, parseFloat(input.value));
                }} 
                style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

