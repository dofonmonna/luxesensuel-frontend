/**
 * Sélecteur de Langue et Devise International
 * S'adapte automatiquement à la localisation du client
 */
import { useState, useEffect } from 'react';
import { Globe, DollarSign, Check, ChevronDown } from 'lucide-react';
import { useTranslation, type Language } from '@/hooks/useTranslation';
import { useCurrency, type Currency } from '@/hooks/useCurrency';

interface LanguageCurrencySelectorProps {
  variant?: 'header' | 'footer' | 'modal';
}

export function LanguageCurrencySelector({ variant = 'header' }: LanguageCurrencySelectorProps) {
  const { 
    currentLang, 
    changeLanguage, 
    languageName, 
    languageFlag,
    availableLanguages 
  } = useTranslation();
  
  const { 
    currency, 
    changeCurrency, 
    currencyInfo, 
    availableCurrencies 
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'language' | 'currency'>('language');

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-currency-selector')) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLanguageChange = (lang: Language) => {
    changeLanguage(lang);
    setIsOpen(false);
    // Recharger la page pour appliquer les traductions
    window.location.reload();
  };

  const handleCurrencyChange = (curr: Currency) => {
    changeCurrency(curr);
    setIsOpen(false);
    window.location.reload();
  };

  if (variant === 'header') {
    return (
      <div className="lang-currency-selector relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg">{languageFlag}</span>
          <span className="text-xs font-medium text-gray-700">{currencyInfo.symbol}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('language')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'language' 
                    ? 'text-[#CC0000] border-b-2 border-[#CC0000]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Globe className="w-4 h-4" />
                Langue
              </button>
              <button
                onClick={() => setActiveTab('currency')}
                className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'currency' 
                    ? 'text-[#CC0000] border-b-2 border-[#CC0000]' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                Devise
              </button>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {activeTab === 'language' ? (
                <div className="p-2">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        currentLang === lang.code
                          ? 'bg-red-50 text-[#CC0000]'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="flex-1 text-left">{lang.name}</span>
                      {currentLang === lang.code && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-2">
                  {availableCurrencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleCurrencyChange(curr.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        currency === curr.code
                          ? 'bg-red-50 text-[#CC0000]'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span className="text-xl">{curr.flag}</span>
                      <span className="flex-1 text-left">
                        {curr.name}
                        <span className="text-gray-400 ml-1">({curr.code})</span>
                      </span>
                      <span className="font-semibold">{curr.symbol}</span>
                      {currency === curr.code && (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer info */}
            <div className="px-4 py-2 bg-gray-50 text-[10px] text-gray-500 text-center border-t border-gray-100">
              Les prix sont convertis selon le taux du jour
            </div>
          </div>
        )}
      </div>
    );
  }

  // Footer variant - plus compact
  return (
    <div className="flex items-center gap-4">
      <select
        value={currentLang}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        className="bg-transparent text-sm text-gray-600 border-none outline-none cursor-pointer"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <span className="text-gray-300">|</span>
      <select
        value={currency}
        onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
        className="bg-transparent text-sm text-gray-600 border-none outline-none cursor-pointer"
      >
        {availableCurrencies.map((curr) => (
          <option key={curr.code} value={curr.code}>
            {curr.code} {curr.symbol}
          </option>
        ))}
      </select>
    </div>
  );
}
