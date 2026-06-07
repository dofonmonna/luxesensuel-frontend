/**
 * Configuration SEO centralisée pour LuxeDropShopping
 * Contient les métadonnées par défaut et les helpers pour le SEO
 */

export const SITE_CONFIG = {
  name: 'LuxeDropShopping',
  tagline: 'Boutique Généraliste en Ligne — Mode, Beauté, Tech & Plus',
  url: 'https://luxedropshoping.com',
  defaultImage: 'https://luxedropshoping.com/logo.png',
  locale: 'fr_FR',
  twitterHandle: '@luxedropshopping',
  themeColor: '#CC0000',
  description: 'LuxeDropShopping — Boutique généraliste en ligne : mode, beauté, électronique, bijoux, sport et plus. Livraison mondiale discrète et rapide.',
  keywords: 'boutique en ligne, mode, beauté, électronique, bijoux, sport, livraison internationale, dropshipping, LuxeDropShopping, acheter en ligne',
};

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  canonical?: string;
  // Product-specific
  product?: {
    name: string;
    price: number;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    image: string;
    category?: string;
    rating?: number;
    reviewCount?: number;
    sku?: string;
    description?: string;
  };
  // Breadcrumb
  breadcrumbs?: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Génère le JSON-LD Organization pour le site
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/vite.svg`,
    description: SITE_CONFIG.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French', 'English', 'Spanish', 'German', 'Italian', 'Portuguese', 'Arabic', 'Chinese'],
    },
    sameAs: [],
  };
}

/**
 * Génère le JSON-LD WebSite avec SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Génère le JSON-LD Product
 */
export function getProductSchema(product: SEOProps['product']) {
  if (!product) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image,
    sku: product.sku || '',
    category: product.category || '',
    brand: {
      '@type': 'Brand',
      name: SITE_CONFIG.name,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'EUR',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
      seller: {
        '@type': 'Organization',
        name: SITE_CONFIG.name,
      },
    },
    ...(product.rating && product.reviewCount ? {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
  };
}

/**
 * Génère le JSON-LD BreadcrumbList
 */
export function getBreadcrumbSchema(breadcrumbs: SEOProps['breadcrumbs']) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}
