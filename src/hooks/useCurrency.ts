/**
 * Système multi-devises avec détection géographique
 * Utilise useGeoLocation (cache 30j, 1 seul appel IP partagé)
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

const CURRENCIES: Record<Currency, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', paydunyaSupported: true },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', paydunyaSupported: true },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', paydunyaSupported: true },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', paydunyaSupported: true },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', paydunyaSupported: true },
  CHF: { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭', paydunyaSupported: true },
  XOF: { code: 'XOF', symbol: 'CFA', name: 'CFA Franc BCEAO', flag: '🇸🇳', paydunyaSupported: true },
  XAF: { code: 'XAF', symbol: 'CFA', name: 'CFA Franc BEAC', flag: '🇨🇲', paydunyaSupported: true },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghana Cedi', flag: '🇬🇭', paydunyaSupported: true },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', paydunyaSupported: true },
  MAD: { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham', flag: '🇲🇦', paydunyaSupported: true },
};

// Taux de change approximatifs (à remplacer par une API en production)
const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CAD: 1.47,
  AUD: 1.65,
  CHF: 0.94,
  XOF: 655.96,
  XAF: 655.96,
  GHS: 13.5,
  NGN: 1650,
  MAD: 10.8,
};

// Détection devise par pays
const COUNTRY_TO_CURRENCY: Record<string, Currency> = {
  FR: 'EUR', DE: 'EUR', ES: 'EUR', IT: 'EUR', PT: 'EUR', BE: 'EUR', NL: 'EUR',
  US: 'USD', CA: 'CAD', GB: 'GBP', AU: 'AUD', CH: 'CHF',
  SN: 'XOF', CI: 'XOF', ML: 'XOF', BF: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
  CM: 'XAF', GA: 'XAF', CG: 'XAF', TD: 'XAF', CF: 'XAF', GQ: 'XAF',
  GH: 'GHS', NG: 'NGN', MA: 'MAD',
};

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [rates, setRates] = useState<Record<Currency, number>>(EXCHANGE_RATES);

  // Détection unifiée via useGeoLocation (cache partagé)
  const { geo } = useGeoLocation();
  useEffect(() => {
    const detect = () => {
      // 1. Cookie utilisateur prioritaire
      const cookieCurrency = document.cookie.match(/user_currency=([A-Z]{3})/);
      if (cookieCurrency && CURRENCIES[cookieCurrency[1] as Currency]) {
        setCurrency(cookieCurrency[1] as Currency);
        return;
      }
      // 2. Devise déduite de la géoloc IP
      if (geo?.currency && CURRENCIES[geo.currency as Currency]) {
        setCurrency(geo.currency as Currency);
      }
    };
    detect();
  }, [geo]);

  // Re-lire le cookie devise si l'utilisateur change de langue (changement de pays possible)
  useEffect(() => {
    const handler = () => {
      const cookieCurrency = document.cookie.match(/user_currency=([A-Z]{3})/);
      if (cookieCurrency && CURRENCIES[cookieCurrency[1] as Currency]) {
        setCurrency(cookieCurrency[1] as Currency);
      }
    };
    window.addEventListener('luxe:langchange', handler);
    return () => window.removeEventListener('luxe:langchange', handler);
  }, []);

  // Mettre à jour les taux depuis l'API
  const updateRates = useCallback(async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
      const data = await response.json();
      
      const newRates: Record<Currency, number> = { ...EXCHANGE_RATES };
      Object.keys(CURRENCIES).forEach((curr) => {
        if (data.rates[curr]) {
          newRates[curr as Currency] = data.rates[curr];
        }
      });
      
      setRates(newRates);
    } catch (error) {
      console.log('Using default exchange rates');
    }
  }, []);

  // Changer la devise manuellement
  const changeCurrency = useCallback((newCurrency: Currency) => {
    setCurrency(newCurrency);
    document.cookie = `user_currency=${newCurrency}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }, []);

  // Convertir un montant
  const convert = useCallback((amountEUR: number): number => {
    return Math.round((amountEUR * rates[currency]) * 100) / 100;
  }, [currency, rates]);

  // Formater un montant
  const format = useCallback((amount: number): string => {
    const converted = currency === 'EUR' ? amount : convert(amount);
    const info = CURRENCIES[currency];
    
    if (currency === 'XOF' || currency === 'XAF' || currency === 'NGN') {
      return `${converted.toLocaleString()} ${info.symbol}`;
    }
    
    return `${info.symbol}${converted.toFixed(2)}`;
  }, [currency, convert]);

  // Prix avec symbole pour affichage
  const formatPrice = useCallback((amountEUR: number): string => {
    return format(amountEUR);
  }, [format]);

  return {
    currency,
    changeCurrency,
    convert,
    formatPrice,
    currencyInfo: CURRENCIES[currency],
    availableCurrencies: Object.values(CURRENCIES),
    updateRates,
    isPaydunyaSupported: CURRENCIES[currency].paydunyaSupported,
  };
}
