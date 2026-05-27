# Analytics & Growth — LuxeDropShopping

## Stack Analytics (sans dépendance à Google si besoin de confidentialité)

| Outil | Usage | Gratuit |
|---|---|---|
| **PostHog** | Événements, funnels, A/B tests, session replay | Oui (1M events/mois) |
| **Google Analytics 4** | Trafic, acquisition, SEO | Oui |
| **Hotjar** | Heatmaps, enregistrements sessions | Oui (limité) |
| **Plausible** (alt. privacy) | Analytics sans cookies, RGPD-friendly | Payant (abordable) |

---

## 1. KPIs Essentiels à Tracker

### Acquisition
- Sessions par source : SEO organique, Social, Direct, Paid, Email
- Taux de rebond par page
- Pages d'entrée les plus performantes

### Conversion (le plus important)
```
Visiteur → Fiche produit → Ajout panier → Début checkout → Paiement → Confirmation

Taux de conversion global cible : 1-3% (e-commerce mode)
Taux abandon panier cible : < 70%
```

### Rétention
- Taux de clients récurrents (cible : > 30% à 6 mois)
- Customer Lifetime Value (CLV)
- Délai moyen entre deux commandes

### Revenus
- GMV (Gross Merchandise Value) journalier / mensuel
- AOV (Average Order Value) — valeur panier moyen
- Revenue par pays / langue / devise
- Marge par fournisseur (AliExpress vs EPROLO vs CJ)

---

## 2. Événements à Tracker (PostHog / GA4)

```typescript
// hooks/useAnalytics.ts
import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: 'https://app.posthog.com',
  capture_pageview: false, // Géré manuellement pour les SPAs
});

export const analytics = {
  // Navigation
  pageView: (path: string) => posthog.capture('$pageview', { $current_url: path }),

  // Catalogue
  productViewed: (product: Product) =>
    posthog.capture('product_viewed', { product_id: product.id, category: product.category, price: product.price_usd }),

  productSearched: (query: string, resultsCount: number) =>
    posthog.capture('product_searched', { query, results_count: resultsCount }),

  // Panier
  addedToCart: (product: Product, quantity: number) =>
    posthog.capture('added_to_cart', { product_id: product.id, quantity, value: product.price_usd }),

  removedFromCart: (productId: string) =>
    posthog.capture('removed_from_cart', { product_id: productId }),

  // Checkout
  checkoutStarted: (cartValue: number, itemCount: number) =>
    posthog.capture('checkout_started', { cart_value: cartValue, item_count: itemCount }),

  paymentMethodSelected: (method: string) =>
    posthog.capture('payment_method_selected', { method }),

  orderCompleted: (orderId: string, total: number, currency: string, items: any[]) =>
    posthog.capture('order_completed', { order_id: orderId, total, currency, item_count: items.length }),

  orderFailed: (reason: string) =>
    posthog.capture('order_failed', { reason }),

  // Compte
  userSignedUp: (method: 'email' | 'google' | 'facebook') =>
    posthog.capture('user_signed_up', { method }),

  userLoggedIn: () => posthog.capture('user_logged_in'),

  // Engagement
  wishlistAdded: (productId: string) =>
    posthog.capture('wishlist_added', { product_id: productId }),

  reviewSubmitted: (rating: number) =>
    posthog.capture('review_submitted', { rating }),

  // Localisation
  currencyChanged: (from: string, to: string) =>
    posthog.capture('currency_changed', { from, to }),

  languageChanged: (from: string, to: string) =>
    posthog.capture('language_changed', { from, to }),
};
```

---

## 3. Funnel de Conversion (PostHog)

```
Créer dans PostHog → Funnels :

Étape 1 : product_viewed
Étape 2 : added_to_cart
Étape 3 : checkout_started
Étape 4 : order_completed

→ Identifier où les utilisateurs abandonnent
→ Segmenter par : pays, langue, device, source d'acquisition
```

---

## 4. A/B Testing

```typescript
// PostHog Feature Flags pour A/B tests
import { useFeatureFlagVariantKey } from 'posthog-js/react';

function ProductPage({ product }: { product: Product }) {
  // Test : Bouton "Acheter maintenant" vs "Ajouter au panier"
  const ctaVariant = useFeatureFlagVariantKey('product-cta-test');

  return (
    <button data-testid="add-to-cart">
      {ctaVariant === 'buy-now' ? 'Acheter maintenant 🔥' : 'Ajouter au panier'}
    </button>
  );
}

// Tests à prioriser :
// 1. Texte bouton CTA
// 2. Position du bouton panier (fixed vs inline)
// 3. Affichage prix barré vs badge "Promo"
// 4. Nombre de photos produit (3 vs 6 vs slider)
// 5. Position des avis (sous description vs en bas de page)
```

---

## 5. Dashboard Métriques Internes

```typescript
// Backend — endpoint métriques pour dashboard admin
app.get('/api/admin/metrics', requireAdmin, async (req, res) => {
  const { period = '30d' } = req.query;
  const since = new Date(Date.now() - parsePeriod(period));

  const [orders, revenue, newUsers, topProducts] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact' })
      .gte('created_at', since.toISOString()).eq('status', 'paid'),

    supabase.from('orders').select('total_usd')
      .gte('created_at', since.toISOString()).eq('status', 'paid'),

    supabase.from('user_profiles').select('id', { count: 'exact' })
      .gte('created_at', since.toISOString()),

    supabase.from('order_items').select('product_id, quantity')
      .gte('created_at', since.toISOString())
      .order('quantity', { ascending: false }).limit(10),
  ]);

  const totalRevenue = revenue.data?.reduce((sum, o) => sum + o.total_usd, 0) || 0;

  res.json({
    orders: orders.count || 0,
    revenue: totalRevenue,
    newUsers: newUsers.count || 0,
    aov: orders.count ? totalRevenue / orders.count : 0,
    topProducts: topProducts.data || [],
  });
});
```

---

## 6. Alertes automatiques

```typescript
// Alerter si taux de conversion chute > 20% vs semaine précédente
// Alerter si 0 commande depuis 6h en heures ouvrables
// Alerter si taux d'erreur paiement > 5%
// Envoyer un rapport hebdomadaire par email (Resend)

// Implémenter via un cron job BullMQ quotidien
const metricsJob = new Queue('metrics-alert');
metricsJob.add('daily-check', {}, { repeat: { cron: '0 9 * * *' } }); // 9h chaque matin
```
