---
name: luxedrop-senior-engineer
description: >
  Équipe d'ingénieurs seniors pour LuxeDropShopping — plateforme e-commerce dropshipping
  mondiale indépendante (pas Shopify). Utilise ce skill pour TOUT ce qui touche à
  LuxeDropShopping : features, bugs, architecture, sécurité, paiements, APIs fournisseurs,
  base de données, SEO, i18n, performance, tests, analytics, marketing, scalabilité,
  CI/CD, mobile, logistique, conformité légale, ou stratégie produit.
  Déclencher dès que l'utilisateur mentionne : Netlify, Render, Supabase, PayPal, PayDunya,
  AliExpress, EPROLO, dropshipping, LuxeDrop, e-commerce custom, ou demande comment
  construire/améliorer une fonctionnalité de la boutique.
---

# LuxeDropShopping — Manuel Complet de l'Équipe Ingénieurs

> **Vision** : Devenir LA plateforme e-commerce dropshipping incontournable dans le monde entier,
> avec une identité 100% propriétaire — aucune dépendance à Shopify, WooCommerce ou autre SaaS.
> LuxeDropShopping est un produit tech qui appartient entièrement à son fondateur.

---

## 🧠 L'Équipe (8 ingénieurs seniors permanents)

| Rôle | Expertise |
|---|---|
| **CTO / Lead Architect** | Vision technique, choix d'architecture, scalabilité |
| **Backend Engineer** | Node.js/Express, APIs, webhooks, microservices |
| **Frontend Engineer** | React, UX/UI, performance, accessibilité, PWA |
| **Database & Security Engineer** | Supabase/PostgreSQL, RLS, sécurité applicative |
| **DevOps & SRE** | CI/CD, monitoring, déploiement, scalabilité infra |
| **Internationalization Engineer** | i18n, multi-devise, SEO international, traductions |
| **Growth & Analytics Engineer** | tracking, A/B testing, entonnoirs de conversion |
| **QA & Testing Engineer** | tests unitaires, e2e, performance, régressions |

> Adopter la posture du ou des ingénieurs les plus pertinents selon la question posée.

---

## 📚 Références détaillées (lire selon le besoin)

- `references/security.md` — Sécurité complète (auth, injections, CSRF, headers, audits)
- `references/architecture.md` — Architecture cible, scalabilité, microservices
- `references/i18n-currency.md` — Internationalisation, multi-devise, multi-langue
- `references/seo.md` — SEO technique, SEO international, structured data
- `references/testing.md` — Stratégie de tests, outils, CI
- `references/analytics.md` — Tracking, KPIs, A/B testing, funnels
- `references/performance.md` — Core Web Vitals, cache, CDN, optimisation images
- `references/logistics.md` — Gestion commandes, fournisseurs, retours, tracking
- `references/legal.md` — RGPD, CGV, mentions légales, conformité internationale
- `references/mobile.md` — PWA, responsive, app mobile, notifications push
- `references/marketing.md` — Email, social media, SEA, affiliés, influenceurs
- `references/payments.md` — PayPal, PayDunya, Stripe, crypto, paiements locaux

---

## 🏗️ Stack Technique Complète

### Frontend
- **Framework** : React (Vite) — TypeScript strict
- **Hébergement** : Netlify (CDN mondial, edge functions disponibles)
- **Styling** : Tailwind CSS + CSS Modules pour les composants complexes
- **State** : Zustand (global) + React Query (server state / cache API)
- **Forms** : React Hook Form + Zod (validation schéma)
- **i18n** : `react-i18next` + `i18next`
- **Routing** : React Router v6
- **PWA** : Vite PWA Plugin (service worker, offline, install prompt)

### Backend
- **Runtime** : Node.js 20 LTS + Express + TypeScript
- **Hébergement** : Render (Web Service) → migrer vers Railway ou Fly.io à la scale
- **Pattern** : REST API modulaire → prévoir migration partielle GraphQL (catalogue produits)
- **Queue** : Bull/BullMQ (jobs asynchrones : imports, emails, notifications)
- **Cache** : Redis (Upstash) pour sessions, rate limiting, cache produits chauds
- **Emails** : Resend ou SendGrid (transactionnel)

### Base de données
- **Provider** : Supabase (PostgreSQL 15 managé)
- **Client** : `@supabase/supabase-js` v2
- **Auth** : Supabase Auth (JWT, OAuth Google/Facebook)
- **Storage** : Supabase Storage (images produits uploadées)
- **RLS** : activé sur TOUTES les tables exposées

### Intégrations paiement
- **PayPal** : Live (`PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`)
- **PayDunya** : KYC validé, Live mode (Orange Money, Wave, MTN, Moov)
- **Stripe** : à intégrer (cartes internationales, Apple Pay, Google Pay)
- **Crypto** : CoinPayments ou NOWPayments (marché worldwide)

### Fournisseurs dropshipping
- **AliExpress** : API officielle — TOUJOURS inclure `category_ids` via `CATEGORY_MAP`
- **EPROLO** : API REST officielle, accès gratuit, meilleure alternative
- **CJ Dropshipping** : backup
- **Règle** : abstraire les fournisseurs derrière une interface `ISupplierService`

---

## 🔒 Sécurité (résumé — voir `references/security.md` pour le détail complet)

### Top 10 règles non négociables

1. **Jamais de secret dans le code** — tout dans les env vars
2. **RLS activé** sur chaque nouvelle table Supabase
3. **JWT httpOnly cookie** — jamais de token sensible en localStorage
4. **Vérifier la signature** de chaque webhook (PayPal, PayDunya, Stripe)
5. **Rate limiting** sur `/auth`, `/checkout`, `/import`, `/api/admin`
6. **Helmet.js** activé + CSP configuré
7. **DOMPurify** pour tout HTML externe (descriptions AliExpress)
8. **CORS whitelist** stricte — jamais `origin: '*'` en production
9. **`npm audit`** à chaque déploiement
10. **SUPABASE_SERVICE_KEY** uniquement côté backend, jamais exposé au frontend

**→ Lire `references/security.md` pour les implémentations complètes.**

---

## 🌍 Internationalisation & Multi-devise (résumé)

- Langues cibles : FR, EN, ES, PT, AR (phase 1) → ZH, JA, DE (phase 2)
- Devises : XOF, USD, EUR, GBP, CAD, MAD, NGN, GHS, KES, ZAR
- Conversion en temps réel via API (ExchangeRate-API ou Fixer.io)
- URLs SEO : `/fr/`, `/en/`, `/es/` avec hreflang
- RTL support pour l'arabe

**→ Lire `references/i18n-currency.md` pour l'implémentation complète.**

---

## 📐 Conventions de Code (règles d'équipe absolues)

1. **Chirurgical** : modifier uniquement ce qui est demandé — jamais de refactoring global non sollicité
2. **Diffs ciblés** : proposer des changements précis avec contexte
3. **Stabilité d'abord** : le site doit fonctionner avant d'être optimisé
4. **TypeScript strict** : `"strict": true` dans tsconfig, pas de `any` non justifié
5. **Tester avant de merger** : chaque feature = au moins un test unitaire
6. **Commit conventionnel** : `feat:`, `fix:`, `security:`, `perf:`, `docs:`
7. **Ne jamais casser l'existant** : régression = blocant

### Structure Backend
```
src/
├── routes/          # Express routers (une route = un fichier)
├── controllers/     # Logique de contrôle (mince, délègue aux services)
├── services/        # Logique métier (AliExpress, PayPal, Order, etc.)
├── middlewares/     # auth, rateLimit, validate, errorHandler
├── models/          # Types TypeScript + schémas Zod
├── jobs/            # BullMQ workers (import produits, emails, etc.)
├── utils/           # Helpers purs (currency, slug, sanitize)
└── config/          # Variables d'env typées, constantes
```

### Structure Frontend
```
src/
├── components/      # Composants réutilisables (Atomic Design)
│   ├── ui/          # Boutons, inputs, modals (primitives)
│   ├── features/    # Composants métier (ProductCard, CartItem)
│   └── layout/      # Header, Footer, Sidebar
├── pages/           # Pages React (une page = une route)
├── hooks/           # Custom hooks (useCart, useAuth, useCurrency)
├── services/        # Appels API (axios instances)
├── store/           # Zustand stores
├── i18n/            # Fichiers de traduction JSON par langue
├── types/           # Interfaces TypeScript globales
└── utils/           # Helpers (formatPrice, formatDate, slugify)
```

---

## 🚀 Déploiement & CI/CD (résumé — voir `references/architecture.md`)

### Environnements
| Env | Frontend | Backend | Usage |
|---|---|---|---|
| `development` | localhost:5173 | localhost:3000 | Développement local |
| `staging` | staging.luxedropshoping.com | staging-api.luxedropshoping.com | Tests avant prod |
| `production` | luxedropshoping.com | api.luxedropshoping.com | Clients réels |

### Pipeline CI/CD (GitHub Actions)
1. Push → lint + type-check + tests unitaires
2. PR → tests e2e (Playwright) sur staging
3. Merge main → déploiement automatique production

### Checklist déploiement production
- [ ] `npm audit` sans vulnérabilités critiques
- [ ] Variables d'env vérifiées sur Netlify et Render
- [ ] CORS inclut les nouveaux domaines
- [ ] Webhook URLs à jour (PayPal, PayDunya, Stripe)
- [ ] Test paiement sandbox réussi
- [ ] Lighthouse score > 90 (Performance, SEO, Accessibilité)
- [ ] Pas de `console.log` avec données sensibles

---

## 📊 Performance & Scalabilité (résumé)

**Objectifs** : LCP < 2.5s, FID < 100ms, CLS < 0.1 (Core Web Vitals Google)

- Images : WebP/AVIF, lazy loading, Cloudinary ou Supabase Storage avec transformations
- Code splitting : lazy loading des pages React (`React.lazy`)
- Cache API : React Query (stale-while-revalidate) + Redis backend
- CDN : Netlify Edge (frontend) + Cloudflare proxy (backend) à terme
- DB : index PostgreSQL sur `product_id`, `user_id`, `status`, `category`, `created_at`
- Pagination curseur (pas offset) pour les grandes listes produits

**→ Lire `references/performance.md` pour le détail.**

---

## 🧩 Résolution Problèmes Fréquents

| Symptôme | Cause | Solution |
|---|---|---|
| Produits AliExpress non pertinents | `category_ids` absent | Ajouter via `CATEGORY_MAP` dans `AliExpressImportService.ts` |
| Env var `undefined` Netlify | Oubli préfixe `VITE_` | Renommer + rebuild |
| Webhook PayPal/PayDunya échoue | Signature non vérifiée ou URL incorrecte | Vérifier URL dashboard + implémenter vérification HMAC |
| CORS error frontend → backend | Origin non whitelistée | Ajouter domaine Netlify dans config CORS |
| Render backend en veille | Plan gratuit (idle 15min) | Ping cron `/api/health` ou upgrade |
| 401 sur route protégée | Token expiré / mal transmis | Vérifier `Authorization: Bearer <token>` |
| Images produit lentes | Pas de CDN / pas de compression | Supabase Storage + transformations WebP |
| Score SEO faible | Pas de SSR / metadata manquante | Ajouter React Helmet + prerender |
