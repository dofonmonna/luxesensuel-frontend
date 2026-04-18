import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
// ✅ Imports NOMMÉS (sans default)
import { StoreLayout } from './pages/StoreLayout';
import { AdminLayout } from './pages/AdminLayout';
// Pages Storefront
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Confirmation } from './pages/Confirmation';
import { ConfirmReception } from './pages/ConfirmReception';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
// Admin
import { Admin } from './pages/Admin';
import { AdminLogin } from './pages/AdminLogin';
// Callback
import { AECallback } from './pages/AECallback';

export function App() {
  return (
    <Router>
      <Routes>
        {/* STORE LAYOUT */}
        <Route element={<StoreLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/confirm-reception" element={<ConfirmReception />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/callback" element={<AECallback />} />
        </Route>

        {/* ADMIN LOGIN — hors layout admin */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ADMIN LAYOUT */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-black flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-500 text-6xl font-bold mb-4">404</p>
                <p className="text-white/40 uppercase tracking-widest text-sm">
                  Page introuvable
                </p>
              </div>
            </div>
          }
        />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A1A',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#F5F5F5',
          },
        }}
      />
    </Router>
  );
}