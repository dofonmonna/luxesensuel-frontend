import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Settings, 
  LogOut, ChevronRight, Bell, Search 
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    // Récupérer l'user connecté
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Produits', icon: Package },
    { path: '/admin/orders', label: 'Commandes', icon: ShoppingBag },
    { path: '/admin/customers', label: 'Clients', icon: Users },
    { path: '/admin/settings', label: 'Paramètres', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '280px', 
        background: 'white', 
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        zIndex: 50
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            background: 'linear-gradient(135deg, #ff4747 0%, #ff6b6b 100%)', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            L
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>LuxeSensuel</h1>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Administration</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px' }}>
          <p style={{ 
            fontSize: '11px', 
            fontWeight: '600', 
            color: '#94a3b8', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '12px',
            paddingLeft: '12px'
          }}>
            Menu principal
          </p>
          
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '4px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  background: active ? '#fff5f5' : 'transparent',
                  color: active ? '#ff4747' : '#64748b',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.2s',
                  border: active ? '1px solid #fecaca' : '1px solid transparent'
                }}
              >
                <item.icon size={20} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {active && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #f1f5f9',
          marginTop: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '10px',
            marginBottom: '12px'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#e2e8f0', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#64748b'
            }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{user?.name || 'Admin'}</p>
              <p style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'admin@luxesensuel.com'}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        marginLeft: '280px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{ 
          height: '72px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
            <div style={{ position: 'relative', maxWidth: '400px', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Rechercher..."
                style={{ 
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#f8fafc'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button style={{ 
              position: 'relative',
              padding: '10px',
              background: '#f8fafc',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <Bell size={20} color="#64748b" />
              {notifications > 0 && (
                <span style={{ 
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '18px',
                  height: '18px',
                  background: '#ff4747',
                  color: 'white',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}