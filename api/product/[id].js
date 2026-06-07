/**
 * Vercel Serverless Function — SSR meta tags pour /product/:id
 * Runtime: nodejs20.x (explicitement, pas Edge)
 *
 * RÈGLE ABSOLUE : cette fonction ne renvoie JAMAIS 500.
 * Toute erreur → sert l'index.html statique ou une page de fallback.
 */
'use strict';

const SITE_URL  = 'https://luxedropshoping.com';
const SITE_NAME = 'LUXEDropshoping';

// ─── Récupère dist/index.html : filesystem puis HTTP fallback ─────
async function readTemplate() {
  // Essai 1 : filesystem (require fs dans le corps évite crash module-level)
  try {
    const fs   = require('fs');
    const path = require('path');
    const candidates = [
      path.join(__dirname, '../../dist/index.html'),
      path.join(process.cwd(), 'dist/index.html'),
      path.join(__dirname, 'index.html'),
    ];
    for (const p of candidates) {
      try { return fs.readFileSync(p, 'utf-8'); } catch (_) {}
    }
  } catch (_) {}

  // Essai 2 : fetch HTTP depuis le CDN Vercel (route statique /, pas une fonction)
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    const resp = await fetch(`${SITE_URL}/`, { signal: ctrl.signal });
    clearTimeout(t);
    if (resp.ok) {
      const html = await resp.text();
      // Vérifier que c'est bien un HTML SPA (contient le div root)
      if (html.includes('<div id="root"') || html.includes('<div id="app"')) return html;
    }
  } catch (_) {}

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
      signal: AbortSignal.timeout(5000),
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

// ─── Sert la SPA (index.html brut) ────────────────────────────────
function serveSPA(res, template) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(template);
}

// ─── Handler principal ────────────────────────────────────────────
module.exports = async function handler(req, res) {
  const id = (req.query.id || '').toString().trim();

  // Lire le template au tout début — disponible même dans le catch
  let template = null;
  try { template = await readTemplate(); } catch (_) {}

  try {
    // ID trop court pour être un UUID → laisser la SPA gérer
    if (!id || id.length < 8) {
      return template
        ? serveSPA(res, template)
        : res.status(200).send('<html><body><script>location.href="/";</script></body></html>');
    }

    const productUrl = `${SITE_URL}/product/${id}`;
    const product    = await fetchProduct(id);

    // Pas de template : fallback minimal avec meta + redirect JS
    if (!template) {
      const title = product ? `${product.name} | ${SITE_NAME}` : `Produit | ${SITE_NAME}`;
      const desc  = product
        ? (product.description || '').replace(/<[^>]*>/g, '').trim().slice(0, 155) || title
        : `Découvrez ce produit sur ${SITE_NAME} — boutique généraliste, livraison mondiale discrète.`;
      const image = product?.image || `${SITE_URL}/logo.png`;
      const esc   = s => String(s || '').replace(/"/g, '&quot;');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(
        `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">` +
        `<title>${esc(title)}</title>` +
        `<meta name="description" content="${esc(desc)}" />` +
        `<meta property="og:title" content="${esc(title)}" />` +
        `<meta property="og:description" content="${esc(desc)}" />` +
        `<meta property="og:image" content="${esc(image)}" />` +
        `<meta property="og:url" content="${esc(productUrl)}" />` +
        `<meta property="og:site_name" content="${SITE_NAME}" />` +
        `<meta name="twitter:card" content="summary_large_image" />` +
        `<meta name="twitter:title" content="${esc(title)}" />` +
        `<meta name="twitter:image" content="${esc(image)}" />` +
        `<link rel="canonical" href="${esc(productUrl)}" />` +
        `<meta http-equiv="refresh" content="0;url=${esc(productUrl)}">` +
        `</head><body><script>window.location.href='${productUrl}';</script></body></html>`
      );
    }

    // Injection des meta dans le template SPA
    let html = template;
    if (product) {
      const rawDesc  = (product.description || '').replace(/<[^>]*>/g, '').trim();
      const desc     = rawDesc.slice(0, 155) || `${product.name} — ${SITE_NAME}, livraison mondiale discrète.`;
      const title    = `${product.name} | ${SITE_NAME}`;
      const image    = product.image || `${SITE_URL}/logo.png`;
      const keywords = [product.name, product.category, 'boutique en ligne', 'livraison internationale', SITE_NAME]
        .filter(Boolean).join(', ');
      html = injectMeta(html, { title, desc, image, url: productUrl, keywords, price: product.price, category: product.category });
    } else {
      // Produit introuvable → meta génériques + canonical correct
      html = injectMeta(html, {
        title:    `Produit | ${SITE_NAME}`,
        desc:     `Boutique généraliste en ligne — mode, beauté, électronique, sport et plus. Livraison mondiale discrète.`,
        image:    `${SITE_URL}/logo.png`,
        url:      productUrl,
        keywords: `boutique en ligne, ${SITE_NAME}, livraison internationale`,
      });
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);

  } catch (err) {
    // ─── SAFETY NET : jamais de 500 ──────────────────────────────
    // En cas d'erreur quelconque, on sert la SPA brute → React gère.
    console.error('[SSR product] crash:', err.message, err.stack);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    if (template) return res.status(200).send(template);
    // Dernier recours
    return res.status(200).send(
      `<!DOCTYPE html><html><head><meta charset="UTF-8">` +
      `<meta http-equiv="refresh" content="0;url=/product/${encodeURIComponent(id)}">` +
      `</head><body><script>window.location.href='/product/${encodeURIComponent(id)}';</script></body></html>`
    );
  }
};
