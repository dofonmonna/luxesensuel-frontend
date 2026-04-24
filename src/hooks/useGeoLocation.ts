/**
 * Détection unifiée IP → langue + devise
 * Un seul appel API, partagé via cache localStorage (30 jours)
 */
import { useEffect, useState } from 'react';
import type { Language } from './useTranslation';
import type { Currency } from './useCurrency';

interface GeoData {
  country: string;
  language: Language;
  currency: Currency;
  timestamp: number;
}

const CACHE_KEY = 'luxesensuel_geo';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 jours

// Mapping pays → langue principale
const COUNTRY_TO_LANG: Record<string, Language> = {
  FR: 'fr', BE: 'fr', LU: 'fr', MC: 'fr', CH: 'fr',
  GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en', IE: 'en', ZA: 'en',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es',
  DE: 'de', AT: 'de',
  IT: 'it',
  PT: 'pt', BR: 'pt',
  NL: 'nl',
  JP: 'ja',
  CN: 'zh', TW: 'zh', HK: 'zh', SG: 'zh',
  SA: 'ar', AE: 'ar', EG: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', QA: 'ar', KW: 'ar',
};

// Mapping pays → devise
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', BE: 'EUR', NL: 'EUR',
  AT: 'EUR', IE: 'EUR', LU: 'EUR', MC: 'EUR',
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', CH: 'CHF',
  SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  GH: 'GHS', NG: 'NGN', MA: 'MAD',
};

function getBrowserLang(): Language {
  const supported: Language[] = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'zh', 'nl', 'ja'];
  const navLang = (navigator.language || 'fr').split('-')[0] as Language;
  return supported.includes(navLang) ? navLang : 'fr';
}

function readCache(): GeoData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as GeoData;
    if (Date.now() - data.timestamp > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(data: GeoData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function useGeoLocation() {
  const [geo, setGeo] = useState<GeoData | null>(() => readCache());
  const [loading, setLoading] = useState(!geo);

  useEffect(() => {
    if (geo) return; // déjà en cache

    let aborted = false;
    const detect = async () => {
      // Respecter la préférence utilisateur si elle existe (cookies)
      const userLangMatch = document.cookie.match(/user_lang=([^;]+)/);
      const userCurrMatch = document.cookie.match(/user_currency=([A-Z]{3})/);

      let country = 'FR';
      try {
        const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          country = data.country_code || data.country || 'FR';
        }
      } catch {
        // Fallback: deviner via navigator.language
        const navLang = (navigator.language || 'fr-FR').toUpperCase();
        const parts = navLang.split('-');
        if (parts[1]) country = parts[1];
      }

      if (aborted) return;

      const detectedLang = COUNTRY_TO_LANG[country] || getBrowserLang();
      const detectedCurr = COUNTRY_TO_CURRENCY[country] || 'EUR';

      const result: GeoData = {
        country,
        language: (userLangMatch?.[1] as Language) || detectedLang,
        currency: (userCurrMatch?.[1] as Currency) || detectedCurr,
        timestamp: Date.now(),
      };

      writeCache(result);
      setGeo(result);
      setLoading(false);
    };

    detect();
    return () => { aborted = true; };
  }, [geo]);

  return { geo, loading };
}
