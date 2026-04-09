import { useState, useEffect, useCallback } from 'react';
import { 
  Package, ShoppingBag, Users, DollarSign, TrendingUp, LogOut,
  Search, Filter, Plus, Edit, Trash2, Eye, RefreshCw, Download,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp,
  Calendar, ArrowUpRight, ArrowDownRight, X, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Types
interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  status: 'active' | 'inactive';
  sales: number;
  createdAt: string;
}

interface Stats {
  todayOrders: number;
  totalProducts: number;
  totalCustomers: number;
  todayRevenue: number;
  yesterdayRevenue: number;
  weeklyGrowth: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Filters
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{type: 'order' | 'product', id: string} | null>(null);

  // 🔥 CORRECTION : Utilisation de Luxe_admin_token
  const token = localStorage.getItem('Luxe_admin_token');

  // Auth check
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Toast helper
  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/admin/stats`, { headers }),
        fetch(`${API_URL}/admin/orders`, { headers }),
        fetch(`${API_URL}/admin/products`, { headers })
      ]);

      if (statsRes.status === 401) {
        // 🔥 CORRECTION : Utilisation de Luxe_admin_token
        localStorage.removeItem('Luxe_admin_token');
        navigate('/login');
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders || []);
      }
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      addToast('error', 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  }, [token, navigate, addToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Actions
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        addToast('success', 'Statut mis à jour');
        fetchData();
      } else {
        addToast('error', 'Erreur de mise à jour');
      }
    } catch {
      addToast('error', 'Erreur réseau');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        addToast('success', 'Commande supprimée');
        fetchData();
      }
    } catch {
      addToast('error', 'Erreur de suppression');
    }
    setDeleteConfirm(null);
  };

  const saveProduct = async (product: Partial<Product>) => {
    try {
      const isEdit = !!product._id;
      const res = await fetch(`${API_URL}/admin/products${isEdit ? `/${product._id}` : ''}`, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product)
      });

      if (res.ok) {
        addToast('success', isEdit ? 'Produit modifié' : 'Produit créé');
        setShowProductForm(false);
        setEditingProduct(null);
        fetchData();
      } else {
        addToast('error', 'Erreur de sauvegarde');
      }
    } catch {
      addToast('error', 'Erreur réseau');
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        addToast('success', 'Produit supprimé');
        fetchData();
      }
    } catch {
      addToast('error', 'Erreur de suppression');
    }
    setDeleteConfirm(null);
  };

  const exportOrders = () => {
    const csv = [
      ['N°', 'Client', 'Email', 'Total', 'Statut', 'Date'].join(';'),
      ...filteredOrders.map(o => [
        o.orderNumber,
        o.customerName,
        o.email,
        o.total,
        o.status,
        new Date(o.createdAt).toLocaleDateString('fr-FR')
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('success', 'Export téléchargé');
  };

  // Filtering
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = orderFilter === 'all' || order.status === orderFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helpers
  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'En attente' },
      processing: { bg: '#dbeafe', text: '#1e40af', label: 'En traitement' },
      shipped: { bg: '#e0e7ff', text: '#3730a3', label: 'Expédiée' },
      delivered: { bg: '#dcfce7', text: '#166534', label: 'Livrée' },
      cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Annulée' }
    };
    return colors[status] || { bg: '#f3f4f6', text: '#374151', label: status };
  };

  const handleLogout = () => {
    // 🔥 CORRECTION : Utilisation de Luxe_admin_token
    localStorage.removeItem('Luxe_admin_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={40} style={{ animation: 'spin 1s linear infinite', color: '#ff4747' }} />
          <p style={{ marginTop: '16px', color: '#666' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex' }}>
      {/* Toasts */}
      <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            padding: '16px 20px',
            borderRadius: '8px',
            background: toast.type === 'error' ? '#dc2626' : toast.type === 'success' ? '#16a34a' : '#f59e0b',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontWeight: '500' }}>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>Confirmer la suppression</h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
              <button 
                onClick={() => deleteConfirm.type === 'order' ? deleteOrder(deleteConfirm.id) : deleteProduct(deleteConfirm.id)}
                style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '24px'
        }} onClick={() => setShowOrderModal(false)}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>Commande #{selectedOrder.orderNumber}</h3>
              <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#666" />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Informations client</h4>
                <p style={{ fontWeight: '600' }}>{selectedOrder.customerName}</p>
                <p style={{ color: '#666' }}>{selectedOrder.email}</p>
              </div>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Adresse de livraison</h4>
                <p>{selectedOrder.shippingAddress?.street}</p>
                <p>{selectedOrder.shippingAddress?.postalCode} {selectedOrder.shippingAddress?.city}</p>
                <p>{selectedOrder.shippingAddress?.country}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>Articles</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '500' }}>{item.name}</p>
                      <p style={{ fontSize: '14px', color: '#666' }}>Qté: {item.quantity}</p>
                    </div>
                    <p style={{ fontWeight: '600' }}>{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '2px solid #eee', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#666' }}>Total</p>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4747' }}>{selectedOrder.total.toFixed(2)} €</p>
                </div>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value as Order['status'])}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="pending">En attente</option>
                  <option value="processing">En traitement</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '24px'
        }} onClick={() => { setShowProductForm(false); setEditingProduct(null); }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '500px', width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px', borderBottom: '1px solid #eee' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold' }}>{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</h3>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveProduct({
                _id: editingProduct?._id,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                category: formData.get('category') as string,
                status: formData.get('status') as 'active' | 'inactive'
              });
            }} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Nom</label>
                <input name="name" defaultValue={editingProduct?.name} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Description</label>
                <textarea name="description" defaultValue={editingProduct?.description} rows={3} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Prix (€)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Stock</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stock} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Statut</label>
                <select name="status" defaultValue={editingProduct?.status || 'active'} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowProductForm(false); setEditingProduct(null); }} style={{ padding: '10px 20px', border: '1px solid #ddd', background: 'white', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#ff4747', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={18} />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: '260px', background: 'white', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #eee' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#ff4747', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="white" />
            </div>
            Admin
          </h1>
        </div>

        <nav style={{ flex: 1, padding: '20px' }}>
          {[ 
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'orders', label: 'Commandes', icon: ShoppingBag },
            { id: 'products', label: 'Produits', icon: Package }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSearchTerm(''); }}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginBottom: '8px',
                textAlign: 'left',
                background: activeTab === item.id ? '#fff5f5' : 'transparent',
                color: activeTab === item.id ? '#ff4747' : '#666',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: activeTab === item.id ? '600' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid #eee' }}>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Tableau de bord</h2>
              <button onClick={fetchData} style={{ padding: '8px', background: 'white', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }}>
                <RefreshCw size={18} />
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Commandes aujourd'hui</span>
                  <div style={{ width: '40px', height: '40px', background: '#ff474715', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingBag size={20} color="#ff4747" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{stats?.todayOrders || 0}</div>
                <div style={{ fontSize: '12px', color: '#22c55e', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={14} />
                  +12% vs hier
                </div>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Revenus</span>
                  <div style={{ width: '40px', height: '40px', background: '#3b82f615', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={20} color="#3b82f6" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{stats?.todayRevenue?.toFixed(2) || '0.00'} €</div>
                <div style={{ fontSize: '12px', color: stats && stats.todayRevenue >= (stats.yesterdayRevenue || 0) ? '#22c55e' : '#dc2626', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {stats && stats.todayRevenue >= (stats.yesterdayRevenue || 0) ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stats ? ((stats.todayRevenue - (stats.yesterdayRevenue || 0)) / (stats.yesterdayRevenue || 1) * 100).toFixed(1) : 0}% vs hier
                </div>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Produits</span>
                  <div style={{ width: '40px', height: '40px', background: '#22c55e15', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={20} color="#22c55e" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{stats?.totalProducts || 0}</div>
              </div>

              <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Clients</span>
                  <div style={{ width: '40px', height: '40px', background: '#f59e0b15', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color="#f59e0b" />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333' }}>{stats?.totalCustomers || 0}</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Activité récente</h3>
              </div>
              <div style={{ padding: '20px' }}>
                {orders.slice(0, 5).map((order, idx) => (
                  <div key={order._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: idx < 4 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={18} color="#666" />
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '14px' }}>Nouvelle commande #{order.orderNumber}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>{order.customerName} • {new Date(order.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <span style={{ fontWeight: '600', color: '#ff4747' }}>+{order.total.toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Gestion des commandes</h2>
              <button onClick={exportOrders} style={{ padding: '10px 20px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={18} />
                Exporter
              </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                <input 
                  type="text" 
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
              <select 
                value={orderFilter} 
                onChange={(e) => setOrderFilter(e.target.value)}
                style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px', background: 'white' }}
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="processing">En traitement</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>N° Commande</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Client</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Total</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Statut</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        Aucune commande trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const status = getStatusColor(order.status);
                      return (
                        <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>#{order.orderNumber}</td>
                          <td style={{ padding: '16px', fontSize: '14px' }}>
                            <div>{order.customerName}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>{order.email}</div>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>{order.total.toFixed(2)} €</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ 
                              background: status.bg, 
                              color: status.text, 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: '600' 
                            }}>
                              {status.label}
                            </span>
                          </td>
                          <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}
                                style={{ padding: '6px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                title="Voir détails"
                              >
                                <Eye size={16} color="#666" />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm({ type: 'order', id: order._id })}
                                style={{ padding: '6px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                title="Supprimer"
                              >
                                <Trash2 size={16} color="#dc2626" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>Gestion des produits</h2>
              <button 
                onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                style={{ padding: '10px 20px', background: '#ff4747', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Plus size={18} />
                Ajouter un produit
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '20px', maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input 
                type="text" 
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Produit</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Prix</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Stock</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Statut</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Ventes</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', color: '#666', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        Aucun produit trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(product => (
                      <tr key={product._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={product.image || '/placeholder.jpg'} 
                              alt={product.name}
                              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #eee' }}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
                            />
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>{product.name}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{product.category}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>{product.price.toFixed(2)} €</td>
                        <td style={{ padding: '16px', fontSize: '14px' }}>
                          <span style={{ color: product.stock < 10 ? '#dc2626' : product.stock < 50 ? '#d97706' : '#16a34a', fontWeight: '600' }}>
                            {product.stock}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span style={{ 
                            background: product.status === 'active' ? '#dcfce7' : '#fee2e2', 
                            color: product.status === 'active' ? '#166534' : '#991b1b', 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: '600' 
                          }}>
                            {product.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px' }}>{product.sales || 0}</td>
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => { setEditingProduct(product); setShowProductForm(true); }}
                              style={{ padding: '6px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                              title="Modifier"
                            >
                              <Edit size={16} color="#666" />
                            </button>
                            <button 
                              onClick={() => setDeleteConfirm({ type: 'product', id: product._id })}
                              style={{ padding: '6px', background: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                              title="Supprimer"
                            >
                              <Trash2 size={16} color="#dc2626" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}