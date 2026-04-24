/**
 * Composant SEO réutilisable
 * Gère dynamiquement les meta tags, OpenGraph, Twitter Cards et JSON-LD
 * Compatible avec le système multilingue existant (DeepL/useTranslation)
 * Implémentation sans dépendance externe (pas de react-helmet-async)
 */
import { useEffect } from 'react';
import {
  SITE_CONFIG,
  type SEOProps,
  getProductSchema,
  getBreadcrumbSchema,
  getOrganizationSchema,
  getWebSiteSchema,
} from '@/lib/seo-config';

interface SEOComponentProps extends SEOProps {
  children?: React.ReactNode;
}

function setMeta(attr: string, key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  canonical,
  product,
  breadcrumbs,
}: SEOComponentProps) {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`;
  
  const metaDescription = description || SITE_CONFIG.description;
  const metaImage = image || SITE_CONFIG.defaultImage;
  const metaUrl = url || (typeof window !== 'undefined' ? window.location.href : SITE_CONFIG.url);
  const metaKeywords = keywords || SITE_CONFIG.keywords;
  const canonicalUrl = canonical || metaUrl;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Base meta
    setMeta('name', 'description', metaDescription);
    setMeta('name', 'keywords', metaKeywords);
    setLink('canonical', canonicalUrl);

    // Robots
    setMeta('name', 'robots', noindex
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );

    // OpenGraph
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', metaDescription);
    setMeta('property', 'og:image', metaImage);
    setMeta('property', 'og:url', metaUrl);
    setMeta('property', 'og:type', type === 'product' ? 'product' : 'website');
    setMeta('property', 'og:site_name', SITE_CONFIG.name);
    setMeta('property', 'og:locale', SITE_CONFIG.locale);

    // Product OG
    if (product) {
      setMeta('property', 'product:price:amount', String(product.price));
      setMeta('property', 'product:price:currency', product.currency || 'EUR');
      setMeta('property', 'product:availability', product.availability === 'OutOfStock' ? 'out of stock' : 'in stock');
      setMeta('property', 'product:category', product.category || '');
    }

    // Twitter Card
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', metaDescription);
    setMeta('name', 'twitter:image', metaImage);
    if (SITE_CONFIG.twitterHandle) {
      setMeta('name', 'twitter:site', SITE_CONFIG.twitterHandle);
    }

    // Theme
    setMeta('name', 'theme-color', SITE_CONFIG.themeColor);

    // JSON-LD
    const schemas: object[] = [];
    if (product) {
      const ps = getProductSchema(product);
      if (ps) schemas.push(ps);
    }
    if (breadcrumbs) {
      const bs = getBreadcrumbSchema(breadcrumbs);
      if (bs) schemas.push(bs);
    }
    if (!product && (!breadcrumbs || breadcrumbs.length === 0)) {
      schemas.push(getOrganizationSchema());
      schemas.push(getWebSiteSchema());
    }

    // Remove old JSON-LD
    document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());

    // Add new JSON-LD
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('script[data-seo-jsonld]').forEach(el => el.remove());
    };
  }, [fullTitle, metaDescription, metaImage, metaUrl, metaKeywords, canonicalUrl, noindex, type, product, breadcrumbs]);

  return null;
}
