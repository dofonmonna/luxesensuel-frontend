import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { setIsCartOpen, cartItems } = useCart();

  // Calcul du nombre d'articles (sécurisé)
  const cartCount = cartItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0D0D0D]/95 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-white">
        
        {/* Gauche */}
        <div className="hidden md:flex space-x-8 text-[10px] tracking-[0.3em] uppercase opacity-70">
          <a href="#/" className="hover:text-[#D4A5A5] transition-colors">Accueil</a>
          <a href="#/about" className="hover:text-[#D4A5A5] transition-colors">La Maison</a>
        </div>

        {/* Centre : Logo */}
        <a href="#/" className="group">
          <h1 className="text-2xl md:text-3xl font-['Cormorant_Garamond'] tracking-[0.4em] font-light transition-all group-hover:tracking-[0.5em] animate-pulse animate-fade">
            LUXE<span className="text-[sensual]">SENSUEL</span>
          </h1>
        </a>

        {/* Droite */}
        <div className="flex items-center space-x-6">
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-[sensual] transition-transform hover:scale-110">
            <Search size={20} strokeWidth={1.5} />
          </button>
          
          <button onClick={() => window.location.hash = "/login"} className="hover:text-[sensual] transition-transform hover:scale-110">
            <User size={20} strokeWidth={1.5} />
          </button>

          <button onClick={() => setIsCartOpen(true)} className="relative hover:text-[sensual] transition-transform hover:scale-110">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[sensual] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Barre de Recherche */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0D0D0D]/98 border-b border-white/10 p-6 animate-in slide-in-from-top duration-300">
          <div className="max-w-3xl mx-auto relative">
            <input 
              autoFocus
              type="text" 
              placeholder="QUELLE SENTEUR RECHERCHEZ-VOUS ?" 
              className="w-full bg-transparent border-b border-white/20 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[sensual] tracking-[0.2em] text-sm uppercase"
            />
            <button onClick={() => setIsSearchOpen(false)} className="absolute right-0 top-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
