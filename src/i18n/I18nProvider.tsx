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

  // Priorité : cookie > géo > 'fr'
  const [lang, setLangState] = useState<SupportedLang>(() => {
    const cookie = readCookieLang();
    if (cookie) return cookie;
    // Lire le cache géo directement au init
    try {
      const raw = localStorage.getItem('luxesensuel_geo');
      if (raw) {
        const cached = JSON.parse(raw);
        const geoLang = cached?.language as SupportedLang;
        if (geoLang && geoLang in LOCALES) return geoLang;
      }
    } catch { /* ignore */ }
    return 'fr';
  });

  // Détection géo — une seule fois quand geo arrive et PAS de cookie
  const [geoApplied, setGeoApplied] = useState(false);
  useEffect(() => {
    if (geoApplied || !geo) return;
    const cookieLang = readCookieLang();
    if (cookieLang) { setGeoApplied(true); return; }
    const detected = geo.language as SupportedLang;
    if (detected in LOCALES) {
      setLangState(detected);
    }
    setGeoApplied(true);
  }, [geo, geoApplied]);

  // Synchroniser <html lang> et <html dir>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  }, [lang]);

  // Changement de langue explicite par l'utilisateur
  const setLang = (newLang: SupportedLang) => {
    if (!(newLang in LOCALES)) return;
    setLangState(newLang);
    writeCookieLang(newLang);
    // Mettre à jour le cache géo pour éviter le conflit au prochain chargement
    try {
      const raw = localStorage.getItem('luxesensuel_geo');
      if (raw) {
        const cached = JSON.parse(raw);
        cached.language = newLang;
        localStorage.setItem('luxesensuel_geo', JSON.stringify(cached));
      }
    } catch { /* ignore */ }
    // Notifier tous les hooks useTranslation du changement
    window.dispatchEvent(new CustomEvent('luxe:langchange', { detail: { lang: newLang } }));
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
        const fr = (LOCALES.fr as Record<string, string>)[key];
        return fr ?? fallback ?? key;
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
