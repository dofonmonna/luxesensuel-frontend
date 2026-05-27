# SEO Technique & International — LuxeDropShopping

## Objectif : Ranker dans Google worldwide sans dépendre des pubs

---

## 1. Meta Tags & React Helmet

```typescript
// Installation : npm install react-helmet-async

// App.tsx
import { HelmetProvider } from 'react-helmet-async';
<HelmetProvider><App /></HelmetProvider>

// ProductPage.tsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>{product.title[lang]} | LuxeDropShopping</title>
  <meta name="description" content={product.description[lang]?.slice(0, 155)} />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href={`https://luxedropshoping.com/${lang}/products/${product.slug}`} />

  {/* Open Graph (partage social) */}
  <meta property="og:title" content={product.title[lang]} />
  <meta property="og:description" content={product.description[lang]?.slice(0, 200)} />
  <meta property="og:image" content={product.images[0]} />
  <meta property="og:type" content="product" />
  <meta property="og:url" content={currentUrl} />
  <meta property="og:site_name" content="LuxeDropShopping" />

  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={product.title[lang]} />
  <meta name="twitter:image" content={product.images[0]} />
</Helmet>
```

---

## 2. Structured Data (Schema.org JSON-LD)

```typescript
// Produit — améliore les rich snippets Google (étoiles, prix, stock)
const productSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title[lang],
  "description": product.description[lang],
  "image": product.images,
  "sku": product.supplier_product_id,
  "offers": {
    "@type": "Offer",
    "price": product.price_usd,
    "priceCurrency": "USD",
    "availability": product.stock_status === 'in_stock'
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    "seller": { "@type": "Organization", "name": "LuxeDropShopping" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.avg_rating,
    "reviewCount": product.review_count
  }
};

<Helmet>
  <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
</Helmet>

// Organisation
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "LuxeDropShopping",
  "url": "https://luxedropshoping.com",
  "logo": "https://luxedropshoping.com/logo.png",
  "sameAs": [
    "https://www.instagram.com/luxedropshopping",
    "https://www.tiktok.com/@luxedropshopping",
    "https://www.facebook.com/luxedropshopping"
  ]
};
```

---

## 3. Sitemap XML (dynamique)

```typescript
// Backend : générer le sitemap à partir des produits actifs
app.get('/sitemap.xml', async (req, res) => {
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true);

  const langs = ['fr', 'en', 'es', 'pt'];
  const urls = products?.flatMap(p =>
    langs.map(lang => `
    <url>
      <loc>https://luxedropshoping.com/${lang}/products/${p.slug}</loc>
      <lastmod>${p.updated_at.split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`)
  ).join('') || '';

  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
});
```

---

## 4. Performance SEO (Core Web Vitals)

```
LCP (Largest Contentful Paint) < 2.5s
  → Images en WebP/AVIF, lazy loading
  → Preload de l'image hero

FID/INP < 100ms
  → Code splitting React.lazy()
  → Éviter les long tasks JS

CLS < 0.1
  → Toujours définir width/height sur les images
  → Éviter les injections de contenu dynamique au-dessus du fold
```

---

## 5. Robots.txt (Netlify public/)

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Sitemap: https://luxedropshoping.com/sitemap.xml
```

---

## 6. Slugs SEO-friendly

```typescript
// utils/slugify.ts
export function slugify(text: string, lang = 'en'): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// "Robe en Dentelle Noire" → "robe-en-dentelle-noire"
// Stocker un slug par langue dans la table products
```

---

## 7. Prerendering (SPA → SEO)

React (SPA) est mal indexé par défaut. Solutions par ordre de priorité :

```
Option A : Prerender.io (le plus simple, compatible Netlify)
  → Intercepte les crawlers et envoie du HTML statique pré-rendu
  → Configurer dans netlify.toml

Option B : React Snap (génération statique au build)
  npm install --save-dev react-snap
  → Génère des HTML statiques pour toutes les routes connues

Option C (Phase 2) : Migrer les pages produits vers Next.js
  → SSR/SSG natif, optimal pour le SEO
  → Garder React pour les pages app-like (panier, compte)
```

---

## 8. Checklist SEO par page

**Page produit** :
- [ ] `<title>` unique incluant le nom du produit + marque
- [ ] Meta description 120-155 chars, incluant mots-clés
- [ ] URL clean avec slug (/fr/products/robe-dentelle-noire)
- [ ] Balise `<h1>` unique = nom du produit
- [ ] Images avec attribut `alt` descriptif
- [ ] Schema.org Product avec prix et disponibilité
- [ ] Hreflang pour chaque langue disponible
- [ ] Canonical URL

**Page catégorie** :
- [ ] `<h1>` = nom de la catégorie
- [ ] Description de catégorie (100-200 mots)
- [ ] Pagination avec `?page=2` + `rel="next"/"prev"`
- [ ] Fil d'Ariane (Breadcrumb) + schema BreadcrumbList
