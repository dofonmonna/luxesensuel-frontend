import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from 'react';

import { Toaster } from 'sonner';

import ScrollToTop from './components/ScrollToTop';

import { AnalyticsProvider } from './components/AnalyticsProvider';

// ✅ Imports NOMMÉS (sans default)
import { StoreLayout } from './pages/StoreLayout';
import { AdminLayout } from './pages/AdminLayout';

// Pages Storefront - toutes lazy pour bundle initial minimal
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Shop = lazy(() => import('./pages/Shop').then(m => ({ default: m.Shop })));

// Capture les erreurs JS et affiche une page de secours au lieu d'un écran blanc
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: '#CC0000', fontSize: 48, fontWeight: 900 }}>!</p>
          <p style={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 4, fontSize: 12 }}>Une erreur est survenue</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            style={{ marginTop: 16, padding: '12px 24px', background: '#CC0000', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
            Retour à la boutique
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
const Contact = lazy(() => import('./pages/Contact').then(m => ({ default: m.Contact })));

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

      <ErrorBoundary>

      <I18nProvider>

        <AnalyticsProvider>

          <ScrollToTop />

          <Routes>

            {/* STORE LAYOUT */}
          <Route element={<StoreLayout />}>

            <Route path="/" element={<Suspense fallback={<LoadingFallback />}><Home /></Suspense>} />

            <Route path="/shop" element={<Suspense fallback={<LoadingFallback />}><Shop /></Suspense>} />

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

            <Route path="/contact" element={<Suspense fallback={<LoadingFallback />}><Contact /></Suspense>} />

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

                  <p className="text-white/40 uppercase tracking-widest text-sm mb-8">

                    Page not found / Page introuvable

                  </p>

                  <Link to="/" className="inline-block px-8 py-3 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-lg text-sm font-semibold transition-colors">

                    ← Retour à la boutique

                  </Link>

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

      </ErrorBoundary>

    </Router>

  );

}