/**
 * Système multi-devises avec détection géographique
 * - Taux de change RÉELS (exchangerate-api.com, mis à jour toutes les heures)
 * - Détection auto par IP + cookie persistant
 * - Synchronisation avec la langue de l'utilisateur
 */
import { useState, useEffect, useCallback } from 'react';
import { useGeoLocation } from './useGeoLocation';

export type Currency = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'AUD' | 'CHF' | 'XOF' | 'XAF' | 'GHS' | 'NGN' | 'MAD';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  flag: string;
  paydunyaSupported: boolean;
}

export const CURRENCIES: Record<Currency, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', paydunyaSupported: true },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', paydunyaSupported: true },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', paydunyaSupported: true },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', paydunyaSupported: true },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', paydunyaSupported: true },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭', paydunyaSupported: true },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'CFA Franc BCEAO', flag: '🌍', paydunyaSupported: true },
  XAF: { code: 'XAF', symbol: 'CFA', name: 'CFA Franc BEAC', flag: '🌍', paydunyaSupported: true },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', flag: '🇬🇭', paydunyaSupported: true },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', paydunyaSupported: true },
  MAD: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', flag: '🇲🇦', paydunyaSupported: true },
};

// Taux de fallback (utilisés si l'API de change est hors ligne)
const FALLBACK_RATES: Record<Currency, number> = {
  EUR: 1, USD: 1.08, GBP: 0.85, CAD: 1.47, AUD: 1.65,
  CHF: 0.94, XOF: 655.96, XAF: 655.96, GHS: 13.5, NGN: 1650, MAD: 10.8,
};

const RATES_CACHE_KEY = 'luxe_fx_rates';
const RATES_CACHE_TTL = 60 * 60 * 1000; // 1 heure

function loadCachedRates(): Record<Currency, number> {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return FALLBACK_RATES;
    const { rates, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > RATES_CACHE_TTL) return FALLBACK_RATES;
    return rates;
  } catch {
    return FALLBACK_RATES;
  }
}

function saveCachedRates(rates: Record<Currency, number>) {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
  } catch { /* quota ignore */ }
}

async function fetchLiveRates(): Promise<Record<Currency, number>> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/EUR', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error('API indisponible');
    const data = await res.json();
    const newRates = { ...FALLBACK_RATES };
    (Object.keys(CURRENCIES) as Currency[]).forEach(c => {
      if (data.rates[c]) newRates[c] = data.rates[c];
    });
    saveCachedRates(newRates);
    return newRates;
  } catch {
    return loadCachedRates();
  }
}

// Mapping pays → devise
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', BE: 'EUR', NL: 'EUR',
  AT: 'EUR', IE: 'EUR', LU: 'EUR', MC: 'EUR', GR: 'EUR', FI: 'EUR', SK: 'EUR',
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', CH: 'CHF',
  SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF', NE: 'XOF',
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  GH: 'GHS', NG: 'NGN', MA: 'MAD',
};

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>(() => {
    // 1. Cookie utilisateur (préférence manuelle)
    const m = document.cookie.match(/user_currency=([A-Z]{3})/);
    if (m && CURRENCIES[m[1] as Currency]) return m[1] as Currency;
    // 2. Cache géoloc
    try {
      const geo = JSON.parse(localStorage.getItem('luxesensuel_geo_v3') || '{}');
      if (geo.currency && CURRENCIES[geo.currency as Currency]) return geo.currency as Currency;
    } catch { /* ignore */ }
    return 'EUR';
  });

  const [rates, setRates] = useState<Record<Currency, number>>(loadCachedRates);

  const { geo } = useGeoLocation();

  // Auto-détecter la devise selon la géoloc IP
  useEffect(() => {
    const cookieCurrency = document.cookie.match(/user_currency=([A-Z]{3})/);
    if (cookieCurrency && CURRENCIES[cookieCurrency[1] as Currency]) return; // préférence manuelle prioritaire
    if (geo?.country && COUNTRY_TO_CURRENCY[geo.country]) {
      setCurrency(COUNTRY_TO_CURRENCY[geo.country]);
    }
  }, [geo]);

  // Charger les taux en temps réel (1 seul appel par heure)
  useEffect(() => {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    const isExpired = !raw || Date.now() - JSON.parse(raw).timestamp > RATES_CACHE_TTL;
    if (isExpired) {
      fetchLiveRates().then(setRates);
    }
  }, []);

  // Re-détecter si l'utilisateur change de langue
  useEffect(() => {
    const handler = () => {
      const m = document.cookie.match(/user_currency=([A-Z]{3})/);
      if (m && CURRENCIES[m[1] as Currency]) setCurrency(m[1] as Currency);
    };
    window.addEventListener('luxe:langchange', handler);
    window.addEventListener('luxe:currencychange', handler);
    return () => {
      window.removeEventListener('luxe:langchange', handler);
      window.removeEventListener('luxe:currencychange', handler);
    };
  }, []);

  // Changer la devise manuellement
  const changeCurrency = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
    document.cookie = `user_currency=${newCurrency}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent('luxe:currencychange', { detail: { currency: newCurrency } }));
  }, []);

  // Convertir un montant (base EUR)
  const convert = useCallback((amountEUR: number): number => {
    if (currency === 'EUR') return amountEUR;
    return Math.round(amountEUR * rates[currency] * 100) / 100;
  }, [currency, rates]);

  // Formater un montant avec le bon séparateur et le bon symbole
  const formatPrice = useCallback((amountEUR: number): string => {
    const amount = convert(amountEUR);
    const info = CURRENCIES[currency];
    if (currency === 'XOF' || currency === 'XAF') {
      return `${Math.round(amount).toLocaleString('fr-FR')} ${info.symbol}`;
    }
    if (currency === 'NGN') {
      return `${info.symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${info.symbol}${amount.toFixed(2)}`;
  }, [currency, convert]);

  return {
    currency,
    changeCurrency,
    convert,
    formatPrice,
    currencyInfo: CURRENCIES[currency],
    availableCurrencies: Object.values(CURRENCIES),
    isPaydunyaSupported: CURRENCIES[currency].paydunyaSupported,
    rates,
  };
}
