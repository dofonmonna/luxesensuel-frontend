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

const CACHE_KEY = 'luxesensuel_geo_v3'; // v3 : force re-détection (corrige bug devise cookie → cache)
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

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

      // Le pays doit venir de l'IP — navigator.language n'est pas fiable pour le pays
      // (un utilisateur en Côte d'Ivoire peut avoir un navigateur en 'en-GB')
      let country = '';

      // Priorité 1 : ipwho.is (HTTPS, gratuit, 10k/mois, pas de clé)
      try {
        const res = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          if (data.success !== false && data.country_code) {
            country = data.country_code;
          }
        }
      } catch { /* essayer le suivant */ }

      // Priorité 2 : ipapi.co (fallback)
      if (!country) {
        try {
          const res2 = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2.country_code) country = data2.country_code;
          }
        } catch { /* conserver le fallback */ }
      }

      // Fallback final : extraire uniquement la LANGUE du navigateur (pas le pays)
      if (!country) country = 'FR';

      if (aborted) return;

      const detectedLang = COUNTRY_TO_LANG[country] || getBrowserLang();
      const detectedCurr = COUNTRY_TO_CURRENCY[country] || 'EUR';

      const result: GeoData = {
        country,
        // La langue du cookie est respectée pour l'UI, mais on garde la langue détectée en cache
        // pour que le changement de pays soit détecté à la prochaine visite sans cookie
        language: (userLangMatch?.[1] as Language) || detectedLang,
        // La devise en cache = toujours celle détectée par IP/pays (jamais le cookie)
        // useCurrency.ts gère la priorité cookie > cache de son côté
        currency: detectedCurr,
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
