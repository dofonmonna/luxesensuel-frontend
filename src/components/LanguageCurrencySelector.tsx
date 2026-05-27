/**
 * Sélecteur de Langue & Devise — Version Premium
 * - Changement SANS rechargement de page (via events luxe:langchange)
 * - Affiche le drapeau + symbole devise actuels
 * - Dropdown élégant avec tabs Langue / Devise
 */
import { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, type Language } from '@/hooks/useTranslation';
import { useCurrency, type Currency } from '@/hooks/useCurrency';

interface LanguageCurrencySelectorProps {
  variant?: 'header' | 'footer';
  dark?: boolean; // pour le bandeau rouge du header
}

const LANG_FLAGS: Record<Language, string> = {
  fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪',
  it: '🇮🇹', pt: '🇧🇷', ar: '🇸🇦', zh: '🇨🇳',
  nl: '🇳🇱', ja: '🇯🇵',
};

const LANG_NAMES: Record<Language, string> = {
  fr: 'Français', en: 'English', es: 'Español', de: 'Deutsch',
  it: 'Italiano', pt: 'Português', ar: 'العربية', zh: '中文',
  nl: 'Nederlands', ja: '日本語',
};

const SUPPORTED_LANGS = Object.keys(LANG_FLAGS) as Language[];

export function LanguageCurrencySelector({ variant = 'header', dark = false }: LanguageCurrencySelectorProps) {
  const { currentLang, changeLanguage } = useTranslation();
  const { currency, changeCurrency, currencyInfo, availableCurrencies } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');
  const ref = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
    // Pas de rechargement — les composants écoutent l'event 'luxe:langchange'
  };

  const handleCurrencyChange = (curr: Currency) => {
    changeCurrency(curr);
    setIsOpen(false);
  };

  if (variant === 'footer') {
    return (
      <div className="flex items-center gap-3 text-sm">
        <select
          value={currentLang}
          onChange={e => handleLanguageChange(e.target.value as Language)}
          className="bg-transparent text-gray-400 border-none outline-none cursor-pointer hover:text-white transition-colors"
        >
          {SUPPORTED_LANGS.map(l => (
            <option key={l} value={l} className="bg-gray-900">{LANG_FLAGS[l]} {LANG_NAMES[l]}</option>
          ))}
        </select>
        <span className="text-gray-600">|</span>
        <select
          value={currency}
          onChange={e => handleCurrencyChange(e.target.value as Currency)}
          className="bg-transparent text-gray-400 border-none outline-none cursor-pointer hover:text-white transition-colors"
        >
          {availableCurrencies.map(c => (
            <option key={c.code} value={c.code} className="bg-gray-900">{c.flag} {c.code} {c.symbol}</option>
          ))}
        </select>
      </div>
    );
  }

  // ── Header variant (dropdown premium) ─────────────────────────
  const btnClasses = dark
    ? 'flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/20 text-white/90 hover:text-white transition-all text-xs font-medium'
    : 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 transition-all text-xs font-medium border border-gray-200 hover:border-gray-300';

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setIsOpen(v => !v)} className={btnClasses} aria-label="Langue et devise">
        <span className="text-base leading-none">{LANG_FLAGS[currentLang] || '🌐'}</span>
        <span className="font-bold">{currencyInfo.symbol}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Tabs */}
          <div className="flex border-b border-gray-100 bg-gray-50/50">
            <button
              onClick={() => setActiveTab('language')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'language' ? 'text-[#CC0000] border-b-2 border-[#CC0000] bg-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Langue
            </button>
            <button
              onClick={() => setActiveTab('currency')}
              className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'currency' ? 'text-[#CC0000] border-b-2 border-[#CC0000] bg-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-sm font-black">{currencyInfo.symbol}</span>
              Devise
            </button>
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto overscroll-contain">
            {activeTab === 'language' ? (
              <div className="p-2">
                {SUPPORTED_LANGS.map(l => (
                  <button
                    key={l}
                    onClick={() => handleLanguageChange(l)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      currentLang === l ? 'bg-red-50 text-[#CC0000] font-semibold' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{LANG_FLAGS[l]}</span>
                    <span className="flex-1 text-left">{LANG_NAMES[l]}</span>
                    {currentLang === l && <Check className="w-4 h-4 text-[#CC0000]" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-2">
                {availableCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      currency === c.code ? 'bg-red-50 text-[#CC0000] font-semibold' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <span className="flex-1 text-left">
                      {c.name}
                      <span className="text-gray-400 text-xs ml-1">({c.code})</span>
                    </span>
                    <span className="font-black text-base">{c.symbol}</span>
                    {currency === c.code && <Check className="w-4 h-4 text-[#CC0000]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 text-center font-medium">
            🔄 Taux mis à jour en temps réel · Détection automatique par pays
          </div>
        </div>
      )}
    </div>
  );
}
