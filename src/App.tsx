import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { Toaster } from 'sonner';

import ScrollToTop from './components/ScrollToTop';

import { AnalyticsProvider } from './components/AnalyticsProvider';

// ✅ Imports NOMMÉS (sans default)
import { StoreLayout } from './pages/StoreLayout';
import { AdminLayout } from './pages/AdminLayout';

// Pages Storefront - eager (first load)
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';

// Pages Storefront - lazy loaded
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const Cart = lazy(() => import('./pages/Cart').then(m => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/Checkout').then(m => ({ default: m.Checkout })));
const Confirmation = lazy(() => import('./pages/Confirmation').then(m => ({ default: m.Confirmation })));
const ConfirmReception = lazy(() => import('./pages/ConfirmReception').then(m => ({ default: m.ConfirmReception })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Signup = lazy(() => import('./pages/Signup').then(m => ({ default: m.Signup })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));

// Admin - lazy loaded
const Admin = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.Admin })));
const AdminLogin = lazy(() => import('./pages/AdminLogin').then(m => ({ default: m.AdminLogin })));

// Callback - lazy loaded
const AECallback = lazy(() => import('./pages/AECallback').then(m => ({ default: m.AECallback })));

// Legal - lazy loaded
const CGV = lazy(() => import('./pages/Legal/CGV').then(m => ({ default: m.CGV })));
const MentionsLegales = lazy(() => import('./pages/Legal/MentionsLegales').then(m => ({ default: m.MentionsLegales })));
const Confidentialite = lazy(() => import('./pages/Legal/Confidentialite').then(m => ({ default: m.Confidentialite })));
const Retours = lazy(() => import('./pages/Legal/Retours').then(m => ({ default: m.Retours })));

import { CookieBanner } from './components/CookieBanner';
import { I18nProvider } from './i18n/I18nProvider';

const LoadingFallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#CC0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export function App() {
  return (

    <Router>

      <I18nProvider>

        <AnalyticsProvider>

          <ScrollToTop />

          <Routes>

            {/* STORE LAYOUT */}
          <Route element={<StoreLayout />}>

            <Route path="/" element={<Home />} />

            <Route path="/shop" element={<Shop />} />

            <Route path="/product/:id" element={<Suspense fallback={<LoadingFallback />}><ProductDetail /></Suspense>} />

            <Route path="/cart" element={<Suspense fallback={<LoadingFallback />}><Cart /></Suspense>} />

            <Route path="/checkout" element={<Suspense fallback={<LoadingFallback />}><Checkout /></Suspense>} />

            <Route path="/confirmation" element={<Suspense fallback={<LoadingFallback />}><Confirmation /></Suspense>} />

            <Route path="/confirm-reception" element={<Suspense fallback={<LoadingFallback />}><ConfirmReception /></Suspense>} />

            <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><Login /></Suspense>} />

            <Route path="/signup" element={<Suspense fallback={<LoadingFallback />}><Signup /></Suspense>} />

            <Route path="/profile" element={<Suspense fallback={<LoadingFallback />}><Profile /></Suspense>} />

            <Route path="/settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>} />

            <Route path="/callback" element={<Suspense fallback={<LoadingFallback />}><AECallback /></Suspense>} />

            {/* Pages Légales */}

            <Route path="/cgv" element={<Suspense fallback={<LoadingFallback />}><CGV /></Suspense>} />

            <Route path="/mentions-legales" element={<Suspense fallback={<LoadingFallback />}><MentionsLegales /></Suspense>} />

            <Route path="/confidentialite" element={<Suspense fallback={<LoadingFallback />}><Confidentialite /></Suspense>} />

            <Route path="/retours" element={<Suspense fallback={<LoadingFallback />}><Retours /></Suspense>} />

          </Route>



          {/* ADMIN LOGIN — hors layout admin */}

          <Route path="/admin/login" element={<Suspense fallback={<LoadingFallback />}><AdminLogin /></Suspense>} />



          {/* ADMIN LAYOUT */}

          <Route path="/admin" element={<AdminLayout />}>

            <Route index element={<Suspense fallback={<LoadingFallback />}><Admin /></Suspense>} />

          </Route>



          {/* 404 */}

          <Route

            path="*"

            element={

              <div className="min-h-screen bg-black flex items-center justify-center">

                <div className="text-center">

                  <p className="text-red-500 text-6xl font-bold mb-4">404</p>

                  <p className="text-white/40 uppercase tracking-widest text-sm">

                    Page not found / Page introuvable

                  </p>

                </div>

              </div>

            }

          />

        </Routes>

        <CookieBanner />

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

      </AnalyticsProvider>

    </I18nProvider>

    </Router>

  );

}