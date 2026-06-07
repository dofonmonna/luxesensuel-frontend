/**
 * Vercel Serverless Function — SSR meta tags pour /product/:id
 *
 * Intercepte les requêtes vers /product/:id, lit le produit en Supabase,
 * injecte les meta OpenGraph/Twitter/canonical dans dist/index.html,
 * puis sert le HTML modifié. Le SPA React démarre normalement ensuite.
 *
 * Crawlers (Google, Facebook, Twitter) voient les bonnes balises.
 * Utilisateurs réels voient la même SPA qu'avant.
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const SITE_URL  = 'https://luxedropshoping.com';
const SITE_NAME = 'LUXEDropshoping';

// ─── Lit dist/index.html (inclus via vercel.json includeFiles) ────
function readTemplate() {
  // Vercel bundle le fichier dans le répertoire de la fonction
  const candidates = [
    path.join(__dirname, 'index.html'),           // bundlé par includeFiles
    path.join(process.cwd(), 'dist', 'index.html'), // local / fallback
  ];
  for (const p of candidates) {
    try { return fs.readFileSync(p, 'utf-8'); } catch (_) {}
  }
  return null;
}

// ─── Fetch produit depuis Supabase REST ───────────────────────────
async function fetchProduct(id) {
  const supaUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supaKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supaUrl || !supaKey) return null;

  try {
    const url = `${supaUrl}/rest/v1/products?id=eq.${encodeURIComponent(id)}&is_active=eq.true&select=id,name,description,price,image,category&limit=1`;
    const resp = await fetch(url, {
      headers: {
        apikey: supaKey,
        Authorization: `Bearer ${supaKey}`,
        Accept: 'application/json',
      },
    });
    if (!resp.ok) return null;
    const rows = await resp.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch (e) {
    console.error('[SSR product] Supabase fetch error:', e.message);
    return null;
  }
}

// ─── Injecte les meta dans le HTML ───────────────────────────────
function injectMeta(html, { title, desc, image, url, keywords, price, category }) {
  const esc = (s) => String(s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const metaBlock = `
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <meta name="keywords" content="${esc(keywords)}" />
  <meta name="author" content="${SITE_NAME}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <link rel="canonical" href="${esc(url)}" />
  <!-- OpenGraph produit -->
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${esc(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${esc(url)}" />
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:locale" content="fr_FR" />
  ${price ? `<meta property="product:price:amount" content="${esc(String(price))}" />
  <meta property="product:price:currency" content="EUR" />` : ''}
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${esc(image)}" />
  <!-- JSON-LD Product -->
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Product","name":${JSON.stringify(title.replace(` | ${SITE_NAME}`, ''))},"description":${JSON.stringify(desc)},"image":${JSON.stringify(image)},"url":${JSON.stringify(url)},"brand":{"@type":"Brand","name":${JSON.stringify(SITE_NAME)}}${price ? `,"offers":{"@type":"Offer","price":${JSON.stringify(String(price))},"priceCurrency":"EUR","availability":"https://schema.org/InStock","seller":{"@type":"Organization","name":${JSON.stringify(SITE_NAME)}}}` : ''}${category ? `,"category":${JSON.stringify(category)}` : ''}}
  </script>`;

  // Remplace le bloc <title>…</title> existant + toutes les anciennes meta OG/twitter
  // On insère notre bloc juste avant </head> pour être sûr qu'il est présent
  return html
    .replace(/<title>[\s\S]*?<\/title>/, '') // enlève l'ancien <title>
    .replace(/<meta[^>]*(?:og:|twitter:|description|keywords|author|robots|canonical)[^>]*>/gi, '') // enlève les anciennes meta
    .replace(/<link[^>]*rel="canonical"[^>]*>/gi, '')                                               // enlève le canonical
    .replace(/<script[^>]*application\/ld\+json[\s\S]*?<\/script>/gi, '')                           // enlève les anciens JSON-LD
    .replace('</head>', metaBlock + '\n  </head>');
}

// ─── Handler principal ────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const id = req.query.id;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).send('ID invalide');
  }

  const productUrl = `${SITE_URL}/product/${id}`;

  // Lire le template HTML
  const template = readTemplate();

  // Fetcher le produit
  const product = await fetchProduct(id);

  if (!template) {
    // Fallback minimal : page de redirection avec bonnes meta
    const title   = product ? `${product.name} | ${SITE_NAME}` : `Produit | ${SITE_NAME}`;
    const desc    = product
      ? (product.description || '').replace(/<[^>]*>/g, '').trim().slice(0, 155) || title
      : `Découvrez ce produit sur ${SITE_NAME} — boutique généraliste, livraison mondiale discrète.`;
    const image   = product?.image || `${SITE_URL}/logo.png`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="description" content="${desc}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${productUrl}" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:image" content="${image}" />
<link rel="canonical" href="${productUrl}" />
<meta http-equiv="refresh" content="0;url=${productUrl}">
</head>
<body><script>window.location.href='${productUrl}';</script></body>
</html>`);
  }

  let html = template;

  if (product) {
    const rawDesc = (product.description || '').replace(/<[^>]*>/g, '').trim();
    const desc     = rawDesc.slice(0, 155) || `${product.name} — ${SITE_NAME}, livraison mondiale discrète.`;
    const title    = `${product.name} | ${SITE_NAME}`;
    const image    = product.image || `${SITE_URL}/logo.png`;
    const keywords = [
      product.name,
      product.category,
      'boutique en ligne',
      'livraison internationale',
      SITE_NAME,
    ].filter(Boolean).join(', ');

    html = injectMeta(html, {
      title,
      desc,
      image,
      url: productUrl,
      keywords,
      price: product.price,
      category: product.category,
    });
  } else {
    // Produit non trouvé → meta génériques mais canonical correct
    html = injectMeta(html, {
      title: `Produit | ${SITE_NAME}`,
      desc: `Boutique généraliste en ligne — mode, beauté, électronique, sport et plus. Livraison mondiale discrète.`,
      image: `${SITE_URL}/logo.png`,
      url: productUrl,
      keywords: `boutique en ligne, ${SITE_NAME}, livraison internationale`,
    });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.send(html);
};
