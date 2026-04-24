/**
 * Analytics unifié : Google Analytics 4 + Meta Pixel + TikTok Pixel
 * Tracking des conversions e-commerce
 */

import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  category?: string;
  currency?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  currency: string;
  items: Product[];
}

// IDs de tracking (à configurer dans .env)
const GA4_ID = import.meta.env.VITE_GA4_ID || '';
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID || '';

// Facebook Pixel types
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    ttq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export function useAnalytics() {
  const location = useLocation();

  // Charger les scripts au montage
  useEffect(() => {
    initGoogleAnalytics();
    initMetaPixel();
    initTikTokPixel();
  }, []);

  // Tracker les changements de page
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // ===== GOOGLE ANALYTICS 4 =====
  const initGoogleAnalytics = () => {
    if (!GA4_ID || window.gtag) return;

    // Ajouter le script GA4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    // Initialiser dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(...args: any[]) {
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, {
      send_page_view: false, // On gère manuellement
      currency: 'EUR',
    });

    console.log('✅ GA4 initialized');
  };

  // ===== META PIXEL (Facebook/Instagram) =====
  const initMetaPixel = () => {
    if (!META_PIXEL_ID || window.fbq) return;

    // Facebook Pixel base code
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${META_PIXEL_ID}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    console.log('✅ Meta Pixel initialized');
  };

  // ===== TIKTOK PIXEL =====
  const initTikTokPixel = () => {
    if (!TIKTOK_PIXEL_ID || window.ttq) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
        ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
        ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
        for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
        ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
        ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
        var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        ttq.load('${TIKTOK_PIXEL_ID}');
        ttq.page();
      }(window, document, 'ttq');
    `;
    document.head.appendChild(script);

    console.log('✅ TikTok Pixel initialized');
  };

  // ===== TRACKING DES ÉVÉNEMENTS =====

  // Page view
  const trackPageView = useCallback((page: string) => {
    const pageTitle = document.title;

    // GA4
    window.gtag?.('event', 'page_view', {
      page_location: window.location.href,
      page_path: page,
      page_title: pageTitle,
    });

    // Meta Pixel
    window.fbq?.('track', 'PageView');

    // TikTok
    window.ttq?.('track', 'Browse');

    console.log('📊 Page view:', page);
  }, []);

  // Produit vu
  const trackProductView = useCallback((product: Product) => {
    const eventData = {
      currency: product.currency || 'EUR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Produit',
        price: product.price,
        quantity: 1,
      }],
    };

    // GA4
    window.gtag?.('event', 'view_item', eventData);

    // Meta Pixel
    window.fbq?.('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: product.currency || 'EUR',
    });

    // TikTok
    window.ttq?.('track', 'ViewContent', {
      content_id: product.id,
      content_name: product.name,
      content_type: 'product',
      price: product.price,
      currency: product.currency || 'EUR',
    });
  }, []);

  // Ajouter au panier
  const trackAddToCart = useCallback((product: Product, quantity: number = 1) => {
    const eventData = {
      currency: product.currency || 'EUR',
      value: product.price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category || 'Produit',
        price: product.price,
        quantity,
      }],
    };

    // GA4
    window.gtag?.('event', 'add_to_cart', eventData);

    // Meta Pixel
    window.fbq?.('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price * quantity,
      currency: product.currency || 'EUR',
    });

    // TikTok
    window.ttq?.('track', 'AddToCart', {
      content_id: product.id,
      content_name: product.name,
      price: product.price * quantity,
      quantity,
      currency: product.currency || 'EUR',
    });

    console.log('🛒 Add to cart:', product.name);
  }, []);

  // Commencer checkout
  const trackBeginCheckout = useCallback((cartItems: Product[], total: number) => {
    const eventData = {
      currency: 'EUR',
      value: total,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: 1,
      })),
    };

    // GA4
    window.gtag?.('event', 'begin_checkout', eventData);

    // Meta Pixel
    window.fbq?.('track', 'InitiateCheckout', {
      content_ids: cartItems.map(i => i.id),
      value: total,
      currency: 'EUR',
      num_items: cartItems.length,
    });

    // TikTok
    window.ttq?.('track', 'StartCheckout', {
      value: total,
      currency: 'EUR',
    });
  }, []);

  // Achat complété (LE PLUS IMPORTANT)
  const trackPurchase = useCallback((order: Order) => {
    const eventData = {
      transaction_id: order.orderNumber || order.id,
      value: order.total,
      currency: order.currency,
      tax: 0,
      shipping: 0,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: 1,
      })),
    };

    // GA4
    window.gtag?.('event', 'purchase', eventData);

    // Meta Pixel
    window.fbq?.('track', 'Purchase', {
      content_ids: order.items.map(i => i.id),
      content_type: 'product',
      value: order.total,
      currency: order.currency,
      order_id: order.orderNumber || order.id,
    });

    // TikTok
    window.ttq?.('track', 'CompletePayment', {
      content_type: 'product',
      value: order.total,
      currency: order.currency,
      order_id: order.orderNumber || order.id,
    });

    console.log('💰 Purchase tracked:', order.orderNumber, order.total + order.currency);
  }, []);

  // Recherche
  const trackSearch = useCallback((query: string, resultsCount: number) => {
    window.gtag?.('event', 'search', {
      search_term: query,
      results_count: resultsCount,
    });

    window.fbq?.('track', 'Search', {
      search_string: query,
    });
  }, []);

  // Wishlist
  const trackAddToWishlist = useCallback((product: Product) => {
    window.gtag?.('event', 'add_to_wishlist', {
      currency: product.currency || 'EUR',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        price: product.price,
      }],
    });

    window.fbq?.('track', 'AddToWishlist', {
      content_ids: [product.id],
      content_name: product.name,
      value: product.price,
      currency: product.currency || 'EUR',
    });
  }, []);

  return {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackBeginCheckout,
    trackPurchase,
    trackSearch,
    trackAddToWishlist,
    isEnabled: !!(GA4_ID || META_PIXEL_ID || TIKTOK_PIXEL_ID),
  };
}

// Hook standalone pour les composants qui n'ont pas besoin de tout
export function useTrackProduct() {
  const { trackProductView, trackAddToCart } = useAnalytics();
  return { trackProductView, trackAddToCart };
}

export function useTrackPurchase() {
  const { trackPurchase } = useAnalytics();
  return trackPurchase;
}
