/**
 * I18n Provider — système de traduction UI
 * - Détection auto de la langue via useGeoLocation (IP) + cookie
 * - Synchronise <html lang> et <html dir> (RTL pour l'arabe)
 * - Hook useT() pour traduire dans tous les composants
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LOCALES, type LocaleKey, type SupportedLang } from './locales';
import { useGeoLocation } from '@/hooks/useGeoLocation';

interface I18nContextValue {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
  t: (key: LocaleKey, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

const RTL_LANGS: SupportedLang[] = ['ar'];

function readCookieLang(): SupportedLang | null {
  const m = document.cookie.match(/user_lang=([a-z]{2})/);
  if (!m) return null;
  const code = m[1] as SupportedLang;
  return code in LOCALES ? code : null;
}

function writeCookieLang(lang: SupportedLang) {
  document.cookie = `user_lang=${lang}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const { geo } = useGeoLocation();
  const [lang, setLangState] = useState<SupportedLang>(() => readCookieLang() || 'fr');

  // Mise à jour automatique quand la géoloc remonte une langue
  useEffect(() => {
    if (!geo) return;
    const cookieLang = readCookieLang();
    if (cookieLang) return; // l'utilisateur a déjà choisi
    const detected = geo.language as SupportedLang;
    if (detected in LOCALES && detected !== lang) {
      setLangState(detected);
    }
  }, [geo, lang]);

  // Synchroniser <html lang> et <html dir>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (newLang: SupportedLang) => {
    if (!(newLang in LOCALES)) return;
    setLangState(newLang);
    writeCookieLang(newLang);
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = LOCALES[lang] || LOCALES.fr;
    return {
      lang,
      setLang,
      dir: RTL_LANGS.includes(lang) ? 'rtl' : 'ltr',
      t: (key: LocaleKey, fallback?: string) => {
        const v = (dict as Record<string, string>)[key];
        if (v !== undefined) return v;
        // Fallback sur français si la clé manque dans la langue cible
        const fr = (LOCALES.fr as Record<string, string>)[key];
        return fr ?? fallback ?? key;
      },
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useT must be used inside <I18nProvider>');
  }
  return ctx;
}
