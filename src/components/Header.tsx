import { Search, Heart, User, ShoppingCart, Menu, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';

const categories = [
  { name: 'LINGERIE', icon: '✨' },
  { name: 'SOINS CORPORELS', icon: '💧' },
  { name: 'PARFUMS', icon: '🌸' },
  { name: 'COSMÉTIQUES', icon: '💄' },
  { name: 'BIJOUX', icon: '💎' },
  { name: 'BIEN-ÊTRE', icon: '🌿' },
  { name: 'ADULTE', icon: '🔞' },
];

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-gradient-header text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> LIVRAISON DISCRÈTE
            </span>
            <span className="hidden md:inline">✦ PAIEMENT SÉCURISÉ</span>
            <span className="hidden md:inline">✦ RETOURS FACILES</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-pink-200 transition">Connexion</button>
            <span>|</span>
            <button className="hover:text-pink-200 transition">Créer un compte</button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-black tracking-tighter">
              <span className="text-gray-900">LUXE</span>
              <span className="text-gradient">Sensuel</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 rounded-full border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-luxe p-2 rounded-full text-white hover:opacity-90 transition">
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-6">
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <Heart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">3</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition">
              <User className="w-6 h-6 text-gray-700" />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">2</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-t border-gray-100 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide">
          <button className="flex items-center gap-2 bg-gradient-luxe text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition flex-shrink-0">
            <Menu className="w-5 h-5" />
            TOUTES LES CATÉGORIES
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat.name}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-full transition whitespace-nowrap flex items-center gap-1"
            >
              {cat.name}
              {(cat.name === 'NOUVEAUTÉS' || cat.name === 'PROMOTIONS') && (
                <span className="ml-1 text-[10px] bg-gradient-luxe text-white px-1.5 py-0.5 rounded">
                  {cat.name === 'NOUVEAUTÉS' ? 'NEW' : 'HOT'}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}