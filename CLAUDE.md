# LuxeDropShopping — Contexte Projet

> Plateforme e-commerce dropshipping mondiale, identité 100% propriétaire (pas Shopify).
> Hub : Abidjan, Côte d'Ivoire. Marché : Mondial.

---

## Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | React + Vite + TypeScript → Netlify |
| Backend | Node.js + Express + TypeScript → Render |
| Base de données | Supabase (PostgreSQL + Auth + Storage) |
| Cache | Redis (Upstash) |
| Editeur | Windsurf (Claude Sonnet ou GPT-4o) |

## Paiements
- **PayPal** → Live (`PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET`)
- **PayDunya** → Live, KYC validé (Orange Money, Wave, MTN)
- **Stripe** → À intégrer (cartes internationales)
- **Webhooks** → `https://api.luxedropshoping.com/api/paypal/webhook` etc.

## Fournisseurs Dropshipping
- **AliExpress** → ⚠️ TOUJOURS inclure `category_ids` via `CATEGORY_MAP` dans `AliExpressImportService.ts`
- **EPROLO** → API REST officielle, accès gratuit
- **CJ Dropshipping** → backup

## Catégories Produits
Lingerie · Cosmétiques · Parfums · Bijoux · Produits adultes
1000+ produits importés.

## Domaines
- Frontend : `luxedropshoping.com` (Netlify)
- Backend : `api.luxedropshoping.com` (Render)
- Staging : `staging.luxedropshoping.com`

---

## Règles Absolues de l'Équipe

1. **Chirurgical** — modifier UNIQUEMENT ce qui est demandé
2. **Jamais de refactoring global** non sollicité (leçon GLM-5.1)
3. **Diffs ciblés** — changements précis avec contexte
4. **Stabilité avant optimisation** — le site doit tourner d'abord
5. **TypeScript strict** — pas de `any` non justifié
6. **Jamais de secret dans le code** — tout dans les env vars

---

## Sécurité (Top 5 priorités)

1. RLS activé sur chaque nouvelle table Supabase
2. JWT httpOnly cookie — jamais en localStorage
3. Vérifier signature webhooks (PayPal, PayDunya, Stripe)
4. Rate limiting sur `/auth`, `/checkout`, `/admin`
5. `SUPABASE_SERVICE_KEY` uniquement côté backend

---

## Problèmes Fréquents → Solutions Rapides

| Problème | Solution |
|---|---|
| Produits AliExpress non pertinents | Ajouter `category_ids` via `CATEGORY_MAP` |
| Env var `undefined` Netlify | Vérifier préfixe `VITE_` + rebuild |
| Webhook échoue | Vérifier URL dashboard + signature HMAC |
| CORS error | Ajouter domaine dans whitelist Express |
| Render en veille | Ping cron sur `/api/health` |
| 401 sur route protégée | Vérifier `Authorization: Bearer <token>` |

---

## Références Détaillées (charger uniquement si nécessaire)

> Ne lire ces fichiers QUE si la tâche le requiert — économise les tokens.

- `.claude/skills/luxedrop/references/security.md` → Auth, injections, CSRF, audit
- `.claude/skills/luxedrop/references/payments.md` → PayPal, PayDunya, Stripe, Flutterwave
- `.claude/skills/luxedrop/references/architecture.md` → Schéma DB, scalabilité, jobs async
- `.claude/skills/luxedrop/references/seo.md` → Meta tags, Schema.org, sitemap
- `.claude/skills/luxedrop/references/i18n-currency.md` → Multi-langue, multi-devise
- `.claude/skills/luxedrop/references/performance.md` → Core Web Vitals, cache, index DB
- `.claude/skills/luxedrop/references/testing.md` → Vitest, Playwright, CI/CD
- `.claude/skills/luxedrop/references/analytics.md` → PostHog, KPIs, A/B tests
- `.claude/skills/luxedrop/references/logistics.md` → Commandes, tracking, remboursements
- `.claude/skills/luxedrop/references/legal.md` → RGPD, CGV, conformité
- `.claude/skills/luxedrop/references/mobile.md` → PWA, push notifications
- `.claude/skills/luxedrop/references/marketing.md` → Email, affiliation, fidélité, promo

---

## Vision

Devenir LA plateforme e-commerce dropshipping incontournable dans le monde entier,
avec une identité 100% propriétaire. Construire pour durer et scaler — pas de dépendance
à Shopify ou autre SaaS.
