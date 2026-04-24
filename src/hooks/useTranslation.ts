/**
 * Système de traduction automatique des produits
 * Détecte la langue du navigateur et traduit les produits en temps réel
 */
import { useState, useEffect, useCallback } from 'react';

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

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isTranslating, setIsTranslating] = useState(false);

  // Détection automatique de la langue
  useEffect(() => {
    const detectLanguage = (): Language => {
      const browserLang = navigator.language.split('-')[0] as Language;
      const supportedLangs: Language[] = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'nl', 'ja'];

      // Vérifier le cookie de langue d'abord
      const cookieLang = document.cookie.match(/user_lang=([^;]+)/);
      if (cookieLang && supportedLangs.includes(cookieLang[1] as Language)) {
        return cookieLang[1] as Language;
      }

      // Sinon utiliser la langue du navigateur
      if (supportedLangs.includes(browserLang)) {
        return browserLang;
      }

      return 'fr';
    };

    setCurrentLang(detectLanguage());
  }, []);

  // Sauvegarder la langue choisie
  const changeLanguage = useCallback((lang: Language) => {
    setCurrentLang(lang);
    document.cookie = `user_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Mettre à jour Google Translate si présent
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      const gtLang = lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : lang;
      select.value = gtLang;
      select.dispatchEvent(new Event('change'));
    }
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
      // Appel à l'API de traduction du backend
      const response = await fetch('/api/translate/product', {
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
