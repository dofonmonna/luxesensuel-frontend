# Performance & Optimisation — LuxeDropShopping

## Objectifs Core Web Vitals (Google)
| Métrique | Cible | Signification |
|---|---|---|
| LCP | < 2.5s | Temps chargement élément principal |
| INP | < 200ms | Réactivité aux interactions |
| CLS | < 0.1 | Stabilité visuelle (pas de sauts) |
| TTFB | < 800ms | Temps de réponse serveur |

---

## 1. Images (impact #1 sur la performance)

```typescript
// Composant Image optimisé
// Installation : npm install browser-image-compression

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean; // true pour le hero/premier produit visible
}

export function OptimizedImage({ src, alt, width, height, priority = false }: OptimizedImageProps) {
  // Transformer l'URL pour demander WebP via Supabase Storage
  const webpSrc = src.includes('supabase') ? `${src}?format=webp&width=${width}` : src;

  return (
    <img
      src={webpSrc}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      style={{ aspectRatio: `${width}/${height}` }} // Évite CLS
    />
  );
}

// Règles :
// - Toujours définir width ET height (évite CLS)
// - priority=true uniquement pour la première image visible
// - Format WebP pour toutes les images produits (40% plus léger que JPEG)
// - Max 1200px de large pour les images de produit
```

---

## 2. Code Splitting React

```typescript
// pages/index.tsx — Lazy loading de chaque page
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const HomePage = lazy(() => import('./HomePage'));
const ProductPage = lazy(() => import('./ProductPage'));
const CartPage = lazy(() => import('./CartPage'));
const CheckoutPage = lazy(() => import('./CheckoutPage'));
const AccountPage = lazy(() => import('./AccountPage'));
const AdminPage = lazy(() => import('./AdminPage'));

// Router avec Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/:lang" element={<HomePage />} />
    <Route path="/:lang/products/:slug" element={<ProductPage />} />
    <Route path="/:lang/cart" element={<CartPage />} />
    <Route path="/:lang/checkout" element={<CheckoutPage />} />
    <Route path="/:lang/account/*" element={<AccountPage />} />
    <Route path="/admin/*" element={<AdminPage />} />
  </Routes>
</Suspense>
```

---

## 3. Cache API avec React Query

```typescript
// Installation : npm install @tanstack/react-query

// main.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // Données fraîches 5 min
      gcTime: 30 * 60 * 1000,    // Garder en cache 30 min
      retry: 2,
    },
  },
});

// hooks/useProducts.ts
export function useProducts(category: string, page: number) {
  return useQuery({
    queryKey: ['products', category, page],
    queryFn: () => api.getProducts({ category, page }),
    placeholderData: keepPreviousData, // Pas de flash blanc lors de pagination
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => api.getProduct(slug),
    staleTime: 10 * 60 * 1000, // Produit frais 10 min
  });
}
```

---

## 4. Cache Redis (Backend)

```typescript
// middleware/cacheMiddleware.ts
import { redisClient } from '../redis';

export const cacheResponse = (ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redisClient.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
      res.setHeader('X-Cache', 'MISS');
      return originalJson(data);
    };
    next();
  };
};

// Utilisation sur les routes lourdes
app.get('/api/products', cacheResponse(300), getProducts);         // Cache 5min
app.get('/api/categories', cacheResponse(3600), getCategories);   // Cache 1h
app.get('/api/exchange-rates', cacheResponse(3600), getRates);    // Cache 1h
// ❌ Ne pas cacher : /api/cart, /api/orders (données personnelles temps réel)
```

---

## 5. Pagination Curseur (liste produits)

```typescript
// ✅ Curseur — performant même avec 1M produits
app.get('/api/products', async (req, res) => {
  const { cursor, limit = 20, category } = req.query;

  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(Number(limit) + 1); // +1 pour détecter s'il y a une page suivante

  if (category) query = query.eq('category', category);
  if (cursor) query = query.lt('created_at', cursor); // Pagination par curseur

  const { data } = await query;
  const hasMore = data && data.length > Number(limit);
  const products = hasMore ? data.slice(0, -1) : data;
  const nextCursor = hasMore ? products[products.length - 1]?.created_at : null;

  res.json({ data: products, nextCursor, hasMore });
});

// ❌ JAMAIS pour les grandes tables :
const { data } = await supabase.from('products').select('*').range(1000, 1020); // LENT
```

---

## 6. Index PostgreSQL

```sql
-- Obligatoires (créer dès le départ)
CREATE INDEX idx_products_category ON products(category) WHERE is_active = true;
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_supplier ON products(supplier);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Recherche textuelle
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('french', title->>'fr' || ' ' || COALESCE(description->>'fr', ''))
);

-- Requête recherche full-text
SELECT * FROM products
WHERE to_tsvector('french', title->>'fr') @@ plainto_tsquery('french', 'robe dentelle')
ORDER BY ts_rank(to_tsvector('french', title->>'fr'), plainto_tsquery('french', 'robe dentelle')) DESC
LIMIT 20;
```

---

## 7. Bundle Size Frontend

```bash
# Analyser le bundle
npm run build && npx vite-bundle-visualizer

# Cibles
# - Chunk initial (index.js) : < 150 KB gzippé
# - Chunk par page : < 80 KB gzippé

# Optimisations courantes :
# - Importer seulement ce qui est utilisé : import { format } from 'date-fns' (pas import * as dateFns)
# - Exclure les grandes librairies du bundle initial via dynamic import
# - Vérifier les dépendances lourdes : moment.js → date-fns, lodash → lodash-es
```

---

## 8. Monitoring Performance

```typescript
// Mesurer les Web Vitals et les envoyer à PostHog
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, rating }: Metric) {
  analytics.capture('web_vital', { metric: name, value: Math.round(value), rating });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

// Alerte si LCP > 4s sur 10% des sessions → optimiser en priorité
```
