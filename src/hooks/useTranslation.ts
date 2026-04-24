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

// Cache de traductions pour éviter les appels répétés
const translationCache: Map<string, Map<Language, TranslatedProduct>> = new Map();

const SUPPORTED_LANGS: Language[] = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'nl', 'ja'];

export function useTranslation() {
  const { geo } = useGeoLocation();
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isTranslating, setIsTranslating] = useState(false);

  // Détection: cookie > geo IP > navigateur > 'fr'
  useEffect(() => {
    const cookieLang = document.cookie.match(/user_lang=([^;]+)/);
    if (cookieLang && SUPPORTED_LANGS.includes(cookieLang[1] as Language)) {
      setCurrentLang(cookieLang[1] as Language);
      return;
    }
    if (geo?.language && SUPPORTED_LANGS.includes(geo.language as Language)) {
      setCurrentLang(geo.language as Language);
      return;
    }
    const browserLang = (navigator.language || 'fr').split('-')[0] as Language;
    if (SUPPORTED_LANGS.includes(browserLang)) {
      setCurrentLang(browserLang);
    }
  }, [geo]);

  // Sauvegarder la langue choisie
  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLang(lang);
    document.cookie = `user_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
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

      // Mettre en cache
      if (!translationCache.has(product.id)) {
        translationCache.set(product.id, new Map());
      }
      translationCache.get(product.id)!.set(targetLang, translated);

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

  // Traduire plusieurs produits en batch
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

    const translations = await Promise.all(
      products.map(p => translateProduct(p, targetLang))
    );

    return translations;
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
