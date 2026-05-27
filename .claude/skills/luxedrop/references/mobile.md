# Mobile & PWA — LuxeDropShopping

## Objectif : Expérience mobile native sans app store

> 70%+ des achats e-commerce se font sur mobile.
> Une PWA bien faite est indistinguable d'une app native pour l'utilisateur.

---

## 1. Configuration PWA (Vite)

```typescript
// Installation : npm install -D vite-plugin-pwa

// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.svg'],
      manifest: {
        name: 'LuxeDropShopping',
        short_name: 'LuxeDrop',
        description: 'Mode, Beauté & Lifestyle — Livraison Mondiale',
        theme_color: '#C8102E',      // Rouge LuxeDrop
        background_color: '#FFFFFF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['shopping', 'lifestyle'],
        shortcuts: [
          {
            name: 'Mon Panier',
            url: '/fr/panier',
            icons: [{ src: '/icons/cart-96.png', sizes: '96x96' }],
          },
          {
            name: 'Mes Commandes',
            url: '/fr/account/orders',
            icons: [{ src: '/icons/orders-96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.luxedropshopping\.com\/api\/products/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-products', expiration: { maxAgeSeconds: 300 } },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 200, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
});
```

---

## 2. Prompt d'installation (Add to Home Screen)

```typescript
// hooks/usePWAInstall.ts
export function usePWAInstall() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    analytics.capture('pwa_install_prompted', { accepted: result.outcome === 'accepted' });
    setInstallPrompt(null);
  };

  return { canInstall: !!installPrompt && !isInstalled, install };
}

// Afficher le bandeau d'installation après 3 visites ou après une commande
const { canInstall, install } = usePWAInstall();
{canInstall && (
  <div className="install-banner">
    <span>📱 Installer l'app LuxeDropShopping</span>
    <button onClick={install}>Installer</button>
  </div>
)}
```

---

## 3. Notifications Push

```typescript
// Backend : utiliser web-push
// npm install web-push

// Générer les clés VAPID (une seule fois) :
// npx web-push generate-vapid-keys → stocker dans env vars
// VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY

// Frontend : s'abonner aux notifications
const subscribeToPush = async () => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  });
  // Envoyer la subscription au backend
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(subscription),
  });
};

// Backend : envoyer une notification
import webpush from 'web-push';
webpush.setVapidDetails('mailto:hello@luxedropshoping.com', VAPID_PUBLIC, VAPID_PRIVATE);

const sendPushNotification = async (subscription: PushSubscription, payload: object) => {
  await webpush.sendNotification(subscription, JSON.stringify({
    title: 'LuxeDropShopping',
    ...payload,
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
  }));
};

// Notifications à envoyer :
// - "Votre commande a été expédiée ! 📦 Suivez-la ici"
// - "Baisse de prix sur un article de votre wishlist ❤️"
// - "Votre panier expire dans 24h 🛒"
// - "Nouveau produit dans votre catégorie préférée ✨"
```

---

## 4. Design Mobile-First (Tailwind)

```typescript
// Principes d'interface mobile LuxeDropShopping

// Tailles minimales (zone de tap : 44x44px minimum)
// ✅ Correct
<button className="min-h-[44px] min-w-[44px] px-4 py-3">Ajouter au panier</button>

// Navigation mobile : bottom tab bar
const BottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
    <div className="flex justify-around py-2">
      <NavItem href="/fr" icon={<HomeIcon />} label="Accueil" />
      <NavItem href="/fr/search" icon={<SearchIcon />} label="Recherche" />
      <NavItem href="/fr/panier" icon={<CartIcon />} label="Panier" badge={cartCount} />
      <NavItem href="/fr/wishlist" icon={<HeartIcon />} label="Wishlist" />
      <NavItem href="/fr/account" icon={<UserIcon />} label="Compte" />
    </div>
  </nav>
);

// Grille produits responsive
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

---

## 5. Performance Mobile (LCP < 2.5s sur 3G)

```typescript
// Précharger l'image hero
<link rel="preload" as="image" href="/hero-mobile.webp" media="(max-width: 768px)" />

// Taille d'images adaptée au device
const getImageSize = () => {
  if (window.innerWidth < 768) return '400';
  if (window.innerWidth < 1024) return '600';
  return '800';
};

// Éviter les fonts lourdes — utiliser system fonts ou inter (Google Fonts avec display=swap)
// @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

---

## 6. Checklist Mobile

- [ ] PWA installable (manifest + service worker)
- [ ] Score Lighthouse Mobile > 90
- [ ] Zones de tap ≥ 44x44px
- [ ] Bottom navigation sur mobile
- [ ] Pas de scroll horizontal
- [ ] Formulaire checkout optimisé mobile (autocomplete, inputmode)
- [ ] Images WebP avec srcset pour différentes tailles d'écran
- [ ] Notifications push fonctionnelles
- [ ] Test sur appareils réels : iPhone, Samsung Galaxy, Tecno (marché africain)
