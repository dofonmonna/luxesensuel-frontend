# Internationalisation & Multi-devise — LuxeDropShopping

## Langues cibles
| Phase | Langues |
|---|---|
| Phase 1 | Français, Anglais, Espagnol, Portugais |
| Phase 2 | Arabe (RTL), Swahili, Hausa |
| Phase 3 | Chinois, Japonais, Allemand, Hindi |

## Devises supportées
```
XOF (FCFA Afrique de l'Ouest), USD, EUR, GBP, CAD
MAD (Maroc), EGP (Égypte), NGN (Nigeria), GHS (Ghana)
KES (Kenya), ZAR (Afrique du Sud), BRL (Brésil), INR (Inde)
```

---

## Setup i18next (Frontend)

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['fr', 'en', 'es', 'pt', 'ar'],
    ns: ['common', 'product', 'checkout', 'account', 'errors'],
    defaultNS: 'common',
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    interpolation: { escapeValue: false },
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
    },
  });

// Utilisation dans les composants
const { t, i18n } = useTranslation('product');
<h1>{t('product.title')}</h1>
<button onClick={() => i18n.changeLanguage('en')}>English</button>
```

---

## Structure des fichiers de traduction

```
public/locales/
├── fr/
│   ├── common.json      { "add_to_cart": "Ajouter au panier" }
│   ├── product.json
│   ├── checkout.json
│   └── errors.json
├── en/
│   ├── common.json      { "add_to_cart": "Add to cart" }
│   └── ...
└── ar/
    └── common.json      { "add_to_cart": "أضف إلى السلة" }
```

---

## Multi-devise (Frontend)

```typescript
// hooks/useCurrency.ts
import { useEffect, useState } from 'react';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', XOF: 'FCFA', NGN: '₦',
  GHS: '₵', KES: 'KSh', ZAR: 'R', MAD: 'MAD', BRL: 'R$',
};

export function useCurrency() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currency, setCurrency] = useState(
    localStorage.getItem('currency') || 'USD'
  );

  useEffect(() => {
    // Récupérer les taux de change (mis en cache 1h côté backend)
    fetch('/api/exchange-rates').then(r => r.json()).then(setRates);
  }, []);

  const convert = (amountUSD: number): string => {
    const rate = rates[currency] || 1;
    const converted = amountUSD * rate;
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol} ${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return { currency, setCurrency, convert };
}

// Utilisation
const { convert } = useCurrency();
<span>{convert(product.price_usd)}</span>  // "FCFA 25,400"
```

---

## Cache des taux de change (Backend)

```typescript
// services/ExchangeRateService.ts
import { redisClient } from '../redis';

export class ExchangeRateService {
  private static CACHE_KEY = 'exchange_rates';
  private static TTL = 3600; // 1 heure

  static async getRates(): Promise<Record<string, number>> {
    const cached = await redisClient.get(this.CACHE_KEY);
    if (cached) return JSON.parse(cached);

    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`
    );
    const data = await response.json();

    await redisClient.setEx(this.CACHE_KEY, this.TTL, JSON.stringify(data.conversion_rates));
    return data.conversion_rates;
  }
}

// Route
app.get('/api/exchange-rates', async (req, res) => {
  const rates = await ExchangeRateService.getRates();
  res.json(rates);
});
```

---

## URLs SEO Multilingue

```typescript
// React Router — structure des routes
// /fr/produits/:slug
// /en/products/:slug
// /es/productos/:slug

const routes = [
  { path: '/:lang', element: <HomePage /> },
  { path: '/:lang/produits/:slug', element: <ProductPage /> },
  { path: '/:lang/panier', element: <CartPage /> },
  { path: '/:lang/commande', element: <CheckoutPage /> },
];

// Hreflang dans le <head> (React Helmet)
<Helmet>
  <link rel="alternate" hreflang="fr" href="https://luxedropshoping.com/fr/produits/robe-dentelle" />
  <link rel="alternate" hreflang="en" href="https://luxedropshoping.com/en/products/lace-dress" />
  <link rel="alternate" hreflang="es" href="https://luxedropshoping.com/es/productos/vestido-encaje" />
  <link rel="alternate" hreflang="x-default" href="https://luxedropshoping.com/fr/produits/robe-dentelle" />
</Helmet>
```

---

## Support RTL (Arabe)

```typescript
// Détecter la direction
const isRTL = i18n.language === 'ar';
document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', i18n.language);

// Tailwind RTL
// Utiliser les classes rtl: prefix
<div className="ml-4 rtl:mr-4 rtl:ml-0">...</div>
```
