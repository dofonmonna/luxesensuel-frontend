/**
 * Système de traduction automatique des produits
 * Détecte la langue du navigateur et traduit les produits en temps réel
 */
import { useState, useEffect, useCallback } from 'react';
import { useGeoLocation } from './useGeoLocation';

export type Language = 'fr' | 'en' | 'es' | 'de' | 'it' | 'pt' | 'ar' | 'zh' | 'nl' | 'ja';

interface TranslatedProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  tags: string[];
}

const LANGUAGE_NAMES: Record<Language, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ar: 'العربية',
  zh: '中文',
  nl: 'Nederlands',
  ja: '日本語',
};

const LANGUAGE_FLAGS: Record<Language, string> = {
  fr: '🇫🇷',
  en: '🇺🇸',
  es: '🇪🇸',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ar: '🇸🇦',
  zh: '🇨🇳',
  nl: '🇳🇱',
  ja: '🇯🇵',
};

// ─── Cache mémoire + localStorage persistant ────────────────────────────────
const TRANS_CACHE_KEY = 'luxe_trans_v2';
const translationCache: Map<string, Map<Language, TranslatedProduct>> = (() => {
  try {
    const raw = localStorage.getItem(TRANS_CACHE_KEY);
    if (raw) {
      const obj = JSON.parse(raw) as Record<string, Record<Language, TranslatedProduct>>;
      const m = new Map<string, Map<Language, TranslatedProduct>>();
      for (const [id, langs] of Object.entries(obj)) {
        m.set(id, new Map(Object.entries(langs) as [Language, TranslatedProduct][]));
      }
      return m;
    }
  } catch { /* ignore */ }
  return new Map();
})();

const CACHE_MAX_BYTES = 2 * 1024 * 1024; // 2 MB max

function persistCache() {
  try {
    const obj: Record<string, Record<string, TranslatedProduct>> = {};
    translationCache.forEach((langs, id) => {
      obj[id] = {};
      langs.forEach((tp, lang) => { obj[id][lang] = tp; });
    });
    const serialized = JSON.stringify(obj);
    if (serialized.length > CACHE_MAX_BYTES) {
      // Trop gros : on vide le cache localStorage mais on garde la mémoire
      localStorage.removeItem(TRANS_CACHE_KEY);
      return;
    }
    localStorage.setItem(TRANS_CACHE_KEY, serialized);
  } catch { /* quota dépassé — silencieux */ }
}

const SUPPORTED_LANGS: Language[] = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'nl', 'ja'];

function detectLangFromCookie(): Language | null {
  const m = document.cookie.match(/user_lang=([a-z]{2})/);
  if (m && SUPPORTED_LANGS.includes(m[1] as Language)) return m[1] as Language;
  return null;
}

export function useTranslation() {
  const { geo } = useGeoLocation();
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    return detectLangFromCookie() || 'fr';
  });
  const [isTranslating, setIsTranslating] = useState(false);

  // Écoute les changements de langue déclenchés par I18nProvider
  useEffect(() => {
    const handler = (e: Event) => {
      const lang = (e as CustomEvent<{ lang: Language }>).detail?.lang;
      if (lang && SUPPORTED_LANGS.includes(lang)) setCurrentLang(lang);
    };
    window.addEventListener('luxe:langchange', handler);
    return () => window.removeEventListener('luxe:langchange', handler);
  }, []);

  // Détection géo (une seule fois si pas de cookie)
  useEffect(() => {
    if (detectLangFromCookie()) return;
    if (geo?.language && SUPPORTED_LANGS.includes(geo.language as Language)) {
      setCurrentLang(geo.language as Language);
      return;
    }
    const browserLang = (navigator.language || 'fr').split('-')[0] as Language;
    if (SUPPORTED_LANGS.includes(browserLang)) setCurrentLang(browserLang);
  }, [geo]);

  // Sauvegarder la langue choisie
  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLang(lang);
    document.cookie = `user_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent('luxe:langchange', { detail: { lang } }));
  }, []);

  // Traduire un produit
  const translateProduct = useCallback(async (
    product: any,
    targetLang: Language = currentLang
  ): Promise<TranslatedProduct> => {
    // Si français, retourner tel quel
    if (targetLang === 'fr') {
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        tags: product.tags || [],
      };
    }

    // Vérifier le cache
    if (translationCache.has(product.id)) {
      const cached = translationCache.get(product.id)!.get(targetLang);
      if (cached) return cached;
    }

    setIsTranslating(true);

    try {
      // Appel à l'API de traduction du backend (Render en prod, localhost en dev)
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/translate/product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          targetLang,
        }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const translated = await response.json();

      // Mettre en cache mémoire + localStorage
      if (!translationCache.has(product.id)) {
        translationCache.set(product.id, new Map());
      }
      translationCache.get(product.id)!.set(targetLang, translated);
      persistCache();

      return translated;
    } catch (error) {
      // Fallback : retourner le produit original
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        subcategory: product.subcategory,
        tags: product.tags || [],
      };
    } finally {
      setIsTranslating(false);
    }
  }, [currentLang]);

  // Traduire plusieurs produits en batch (1 seul appel API)
  const translateProducts = useCallback(async (
    products: any[],
    targetLang: Language = currentLang
  ): Promise<TranslatedProduct[]> => {
    if (targetLang === 'fr') {
      return products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        tags: p.tags || [],
      }));
    }

    // Séparer les produits déjà en cache de ceux à traduire
    const toFetch: any[] = [];
    products.forEach(p => {
      if (!translationCache.get(p.id)?.get(targetLang)) toFetch.push(p);
    });

    if (toFetch.length > 0) {
      setIsTranslating(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || '/api';
        const res = await fetch(`${apiBase}/translate/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: toFetch, targetLang }),
        });
        if (res.ok) {
          const { translations } = await res.json() as { translations: TranslatedProduct[] };
          translations.forEach(t => {
            if (!translationCache.has(t.id)) translationCache.set(t.id, new Map());
            translationCache.get(t.id)!.set(targetLang, t);
          });
          persistCache();
        }
      } catch { /* fallback individuel */ }
      finally { setIsTranslating(false); }
    }

    // Reconstituer le tableau final
    return products.map(p => {
      const cached = translationCache.get(p.id)?.get(targetLang);
      return cached || { id: p.id, name: p.name, description: p.description, category: p.category, subcategory: p.subcategory, tags: p.tags || [] };
    });
  }, [translateProduct, currentLang]);

  return {
    currentLang,
    changeLanguage,
    translateProduct,
    translateProducts,
    isTranslating,
    languageName: LANGUAGE_NAMES[currentLang],
    languageFlag: LANGUAGE_FLAGS[currentLang],
    availableLanguages: Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
      code: code as Language,
      name,
      flag: LANGUAGE_FLAGS[code as Language],
    })),
  };
}
