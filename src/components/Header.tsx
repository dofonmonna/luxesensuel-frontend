import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, User, Heart, Menu, X,
  ChevronDown,
  Shield, Truck, RotateCcw, UserPlus
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useT } from '@/i18n/I18nProvider';
import { LOCALES, type LocaleKey, type SupportedLang } from '@/i18n/locales';

const CATEGORIES: Array<{ key: LocaleKey; href: string; emoji: string; badge?: string }> = [
  { key: 'cat.lingerie', href: '/shop?cat=lingerie', emoji: '✨' },
  { key: 'cat.soins', href: '/shop?cat=soins', emoji: '💧' },
  { key: 'cat.parfums', href: '/shop?cat=parfums', emoji: '🌸' },
  { key: 'cat.cosmetiques', href: '/shop?cat=cosmetiques', emoji: '💄' },
  { key: 'cat.bijoux', href: '/shop?cat=bijoux', emoji: '💎' },
  { key: 'cat.bienetre', href: '/shop?cat=bienetre', emoji: '🌿' },
  { key: 'cat.new', href: '/shop?cat=new', emoji: '🆕', badge: 'NEW' },
  { key: 'cat.promo', href: '/shop?cat=promo', emoji: '🔥', badge: 'HOT' },
];

const PROMO_KEYS: LocaleKey[] = [
  'promo.welcome',
  'promo.shipping_discreet',
  'promo.secure',
  'promo.satisfied',
];

const LANG_FLAGS: Record<SupportedLang, string> = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹', pt: '🇧🇷', ar: '🇸🇦' };

export function Header() {
  const navigate = useNavigate();
  const { items } = useCart();
  const { t, lang, setLang } = useT();
  const [query, setQuery] = useState('');
  const [promoIdx, setPromoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Total articles panier
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  // Rotation du bandeau promo
  useEffect(() => {
    const timer = setInterval(() => setPromoIdx(i => (i + 1) % PROMO_KEYS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  // Sticky shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className={`w-full sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? 'shadow-[0_2px_8px_rgba(0,0,0,0.12)]' : ''}`}>

      {/* ── NIVEAU 1 : Bandeau annonce + Traducteur ────────── */}
      <div className="bg-[#CC0000] text-white py-1.5 px-4 overflow-hidden">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between relative">

          <div className="flex-1 flex justify-center gap-2 text-[10px] sm:text-xs font-medium tracking-wide">
            <span
              key={promoIdx}
              className="animate-fade-in whitespace-nowrap"
              style={{ animationDuration: '0.5s' }}
            >
              {t(PROMO_KEYS[promoIdx])}
            </span>
          </div>

          {/* Sélecteur langue */}
          <div ref={langRef} className="relative flex-shrink-0">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex items-center gap-1 text-white/90 hover:text-white text-[10px] sm:text-xs font-medium transition-colors"
            >
              <span>{LANG_FLAGS[lang] || '🌐'}</span>
              <span className="hidden sm:inline">{lang.toUpperCase()}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] py-1 max-h-56 overflow-y-auto">
                {(Object.keys(LANG_FLAGS) as SupportedLang[]).map(code => (
                  <button
                    key={code}
                    onClick={() => { setLang(code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 transition-colors ${
                      code === lang ? 'bg-red-50 text-[#CC0000] font-semibold' : 'text-gray-700'
                    }`}
                  >
                    <span>{LANG_FLAGS[code]}</span>
                    <span>{code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── NIVEAU 2 : Logo + Recherche + Icônes ───────────── */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex flex-col leading-tight select-none"
          >
            <span className="font-[Cormorant_Garamond] text-2xl font-semibold tracking-widest text-gray-900">
              LUXE<span className="text-[#CC0000] italic">Dropshoping</span>
            </span>
            <span className="text-[8px] font-medium tracking-[4px] text-gray-400 uppercase">
              Votre boutique d'exception
            </span>
          </Link>

          {/* Barre de recherche — masquée sur mobile, visible dans le menu burger */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-3xl relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('nav.search')}
              className="w-full h-11 pl-4 pr-14 rounded-lg border-2 border-gray-200 focus:border-[#CC0000] outline-none text-sm font-[Montserrat] transition-colors duration-200 bg-gray-50 focus:bg-white overflow-hidden text-ellipsis whitespace-nowrap box-border"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 h-11 px-4 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-r-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Icônes droite */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Wishlist */}
            <button
              className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              title={t('nav.favorites')}
            >
              <Heart className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">{t('nav.favorites')}</span>
            </button>

            {/* S'inscrire */}
            <button
              onClick={() => navigate('/signup')}
              className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              title={t('nav.signup')}
            >
              <UserPlus className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">{t('nav.signup')}</span>
            </button>

            {/* Compte */}
            <button
              onClick={() => navigate('/login')}
              className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              title={t('nav.login')}
            >
              <User className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">{t('nav.login')}</span>
            </button>

            {/* Recherche mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              title={t('nav.search')}
            >
              <Search className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
            </button>

            {/* Panier */}
            <button
              onClick={() => navigate('/cart')}
              className="relative flex flex-col items-center p-2 rounded-lg hover:bg-red-50 transition-colors group"
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-[#CC0000] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">{t('nav.cart')}</span>
            </button>

            {/* Burger mobile */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── NIVEAU 3 : Navigation catégories ───────────────── */}
      <nav className="bg-white border-b border-gray-100 hidden md:block">
        <div className="max-w-[1440px] mx-auto px-4 flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">

          {/* Toutes les catégories — dropdown */}
          <div ref={catRef} className="relative flex-shrink-0">
            <button
              onClick={() => setCatOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-md text-xs font-semibold transition-colors duration-200 whitespace-nowrap"
            >
              <Menu className="w-4 h-4" />
              {t('nav.categories')}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.key}
                    to={cat.href}
                    onClick={() => setCatOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 hover:text-[#CC0000] text-gray-700 text-sm transition-colors"
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-medium">{t(cat.key)}</span>
                    {cat.badge && (
                      <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${cat.badge === 'NEW' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {cat.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div className="h-5 w-px bg-gray-200 mx-1 flex-shrink-0" />

          {/* Pills catégories */}
          {CATEGORIES.map(cat => (
            <Link
              key={cat.key}
              to={cat.href}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 hover:text-[#CC0000] hover:bg-red-50 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
            >
              {t(cat.key)}
              {cat.badge && (
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${cat.badge === 'NEW' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                  {cat.badge}
                </span>
              )}
            </Link>
          ))}

          <div className="ml-auto flex-shrink-0 flex items-center gap-3 text-[10px] text-gray-400 font-medium">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-green-500" />Paiement sécurisé</span>
            <span className="flex items-center gap-1"><Truck className="w-3 h-3 text-blue-500" />Livraison discrète</span>
            <span className="flex items-center gap-1"><RotateCcw className="w-3 h-3 text-orange-500" />Retours 30j</span>
          </div>
        </div>
      </nav>

      {/* ── Menu Mobile ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg z-40">
          <div className="px-4 py-3 border-b border-gray-100">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('nav.search')}
                className="w-full h-10 pl-4 pr-12 rounded-lg border border-gray-200 focus:border-[#CC0000] outline-none text-sm"
              />
              <button type="submit" className="absolute right-0 top-0 h-10 px-3 text-[#CC0000]">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="flex flex-col py-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.key}
                to={cat.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm border-b border-gray-50 last:border-0"
              >
                <span>{cat.emoji}</span>
                <span className="font-medium">{t(cat.key)}</span>
                {cat.badge && (
                  <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded ${cat.badge === 'NEW' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {cat.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => { navigate('/login'); setMobileOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000] transition-colors"
            >
              <User className="w-4 h-4" />
              {t('nav.login')}
            </button>
            <button
              onClick={() => { navigate('/cart'); setMobileOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#CC0000] text-white rounded-lg text-sm font-semibold hover:bg-[#aa0000] transition-colors relative"
            >
              <ShoppingCart className="w-4 h-4" />
              {t('nav.cart')}
              {cartCount > 0 && (
                <span className="ml-1 bg-white text-[#CC0000] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}