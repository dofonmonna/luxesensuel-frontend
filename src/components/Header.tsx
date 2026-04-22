import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ShoppingCart, User, Heart, Menu, X,
  Sparkles, ChevronDown, Bell, Package, LogOut,
  Shield, Truck, RotateCcw, UserPlus
} from 'lucide-react';
import { useCart } from '@/hooks/useCart';

const CATEGORIES = [
  { label: 'Lingerie',        href: '/shop?cat=lingerie',    emoji: '✨' },
  { label: 'Soins Corporels', href: '/shop?cat=soins',       emoji: '💧' },
  { label: 'Parfums',         href: '/shop?cat=parfums',      emoji: '🌸' },
  { label: 'Cosmétiques',     href: '/shop?cat=cosmetiques',  emoji: '💄' },
  { label: 'Bijoux',          href: '/shop?cat=bijoux',       emoji: '💎' },
  { label: 'Bien-être',       href: '/shop?cat=bienetre',     emoji: '🌿' },
  { label: 'Adulte',          href: '/shop?cat=adulte',       emoji: '🔞' },
  { label: 'Nouveautés',      href: '/shop?cat=new',          emoji: '🆕', badge: 'NEW' },
  { label: 'Promotions',      href: '/shop?cat=promo',        emoji: '🔥', badge: 'HOT' },
];

const PROMOS = [
  '🎁 BIENVENUE20 : -20% sur votre 1ère commande',
  '🚚 Livraison discrète garantie — emballage neutre',
  '🔒 Paiement 100% sécurisé — SSL 256 bits',
  '⭐ +25 000 clients satisfaits — Note 4.9/5',
];

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'ar', label: 'العربية',   flag: '🇦🇪' },
];

export function Header() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [query, setQuery] = useState('');
  const [promoIdx, setPromoIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  // Total articles panier
  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0);

  // Rotation du bandeau promo
  useEffect(() => {
    const t = setInterval(() => setPromoIdx(i => (i + 1) % PROMOS.length), 3500);
    return () => clearInterval(t);
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
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const changeLanguage = (langCode: string) => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
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
              {PROMOS[promoIdx]}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3 border-l border-white/20 pl-4">
            <select 
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer border-none appearance-none hover:text-white/80 transition-colors"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="text-gray-900 bg-white">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 opacity-50" />
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

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl relative">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher lingerie, soins, parfums…"
              className="w-full h-11 pl-4 pr-14 rounded-lg border-2 border-gray-200 focus:border-[#CC0000] outline-none text-sm font-[Montserrat] transition-colors duration-200 bg-gray-50 focus:bg-white"
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
              title="Favoris"
            >
              <Heart className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">Favoris</span>
            </button>

            {/* S'inscrire */}
            <button
              onClick={() => navigate('/signup')}
              className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              title="S'inscrire"
            >
              <UserPlus className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">S'inscrire</span>
            </button>

            {/* Compte */}
            <button
              onClick={() => navigate('/login')}
              className="hidden md:flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group"
              title="Se connecter"
            >
              <User className="w-5 h-5 text-gray-600 group-hover:text-[#CC0000] transition-colors" />
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">Connexion</span>
            </button>

            {/* Panier */}
            <button
              onClick={() => navigate('/cart')}
              className="relative flex flex-col items-center p-2 rounded-lg hover:bg-red-50 transition-colors group"
              title="Panier"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-[#CC0000] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
              <span className="text-[10px] text-gray-500 mt-0.5 hidden lg:block">Panier</span>
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
              TOUTES LES CATÉGORIES
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
            </button>

            {catOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 overflow-hidden">
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.label}
                    to={cat.href}
                    onClick={() => setCatOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 hover:text-[#CC0000] text-gray-700 text-sm transition-colors"
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="font-medium">{cat.label}</span>
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
              key={cat.label}
              to={cat.href}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-gray-600 hover:text-[#CC0000] hover:bg-red-50 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
            >
              {cat.label}
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
                placeholder="Rechercher…"
                className="w-full h-10 pl-4 pr-12 rounded-lg border border-gray-200 focus:border-[#CC0000] outline-none text-sm"
              />
              <button type="submit" className="absolute right-0 top-0 h-10 px-3 text-[#CC0000]">
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="py-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                to={cat.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm border-b border-gray-50 last:border-0"
              >
                <span>{cat.emoji}</span>
                <span className="font-medium">{cat.label}</span>
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
              Connexion
            </button>
            <button
              onClick={() => { navigate('/cart'); setMobileOpen(false); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#CC0000] text-white rounded-lg text-sm font-semibold hover:bg-[#aa0000] transition-colors relative"
            >
              <ShoppingCart className="w-4 h-4" />
              Panier
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