import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Filter, Search, SlidersHorizontal, ChevronDown, 
  X, Grid, List, ArrowUpDown, Info, Gift
} from 'lucide-react';
import { productsApi, type Product } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Lingerie", "Plaisir Adulte", "Électronique", "Soins", "Parfums", "Accessoires", "Bijoux", "Bien-être", "Confort", "Coffrets", "Couples"
];

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('random');

  const categoryFilter = searchParams.get('cat');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.list({ 
          category: categoryFilter || undefined, 
          search: searchQuery || undefined,
          random: sortBy === 'random'
        });
        setProducts(res.products);
      } catch (err) {
        console.error("Erreur chargement produits:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [categoryFilter, searchQuery, sortBy]);

  const sortedProducts = useMemo(() => {
    const result = [...products];
    if (sortBy === 'price-asc') return result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return result.sort((a, b) => b.price - a.price);
    if (sortBy === 'name') return result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'newest') return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return result; // default (random or already shuffled by API)
  }, [products, sortBy]);

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat]">
      
      {/* ── Header Page ────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-8 mb-6">
        <div className="max-w-[1440px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">
                {categoryFilter ? (
                  <span className="capitalize">{categoryFilter}</span>
                ) : searchQuery ? (
                  <span>Résultats pour "{searchQuery}"</span>
                ) : (
                  "Tous nos produits"
                )}
              </h1>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Boutique</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#CC0000]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#CC0000]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] bg-white border-gray-200 h-10 rounded-lg text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <SelectValue placeholder="Trier par" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Sélection intelligente</SelectItem>
                  <SelectItem value="newest">Nouveautés</SelectItem>
                  <SelectItem value="price-asc">Prix croissant</SelectItem>
                  <SelectItem value="price-desc">Prix décroissant</SelectItem>
                  <SelectItem value="name">Nom A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 pb-20">
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
          
          {/* ── Sidebar Filtres ──────────────────────────────── */}
          <aside className="lg:col-span-1 space-y-8">
            
            {/* Active Filters */}
            {(categoryFilter || searchQuery) && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900 text-sm">Filtres actifs</h4>
                  <button onClick={clearFilters} className="text-[10px] text-[#CC0000] font-bold hover:underline">Effacer</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categoryFilter && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-[#CC0000] text-[10px] font-bold rounded-full border border-red-100 capitalize">
                      {categoryFilter}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('cat');
                        setSearchParams(next);
                      }} />
                    </span>
                  )}
                  {searchQuery && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-900 text-[10px] font-bold rounded-full border border-gray-100">
                      "{searchQuery}"
                      <X className="w-3 h-3 cursor-pointer" onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.delete('search');
                        setSearchParams(next);
                      }} />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-[#CC0000]" />
                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-widest">Catégories</h4>
              </div>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.delete('cat');
                      setSearchParams(next);
                    }}
                    className={`w-full text-left text-sm py-1 transition-colors ${!categoryFilter ? 'text-[#CC0000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Toutes les collections
                  </button>
                </li>
                {CATEGORIES.map(cat => (
                  <li key={cat}>
                    <button 
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set('cat', cat.toLowerCase());
                        setSearchParams(next);
                      }}
                      className={`w-full text-left text-sm py-1 transition-colors capitalize ${categoryFilter === cat.toLowerCase() ? 'text-[#CC0000] font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Banner Side */}
            <div className="bg-gradient-sensual rounded-2xl p-6 text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
              <div className="relative z-10">
                <Gift className="w-8 h-8 mb-4 opacity-50" />
                <h4 className="text-lg font-black mb-2">Livraison Gratuite</h4>
                <p className="text-xs text-white/80 mb-6">Dès 50€ d'achat sur toute la boutique.</p>
                <Link to="/shop?cat=promo" className="inline-block px-6 py-2 bg-white text-[#CC0000] text-[10px] font-black rounded-full uppercase tracking-widest hover:bg-red-50 transition-colors">
                  En profiter
                </Link>
              </div>
            </div>

          </aside>

          {/* ── Grille Produits ──────────────────────────────── */}
          <main className="lg:col-span-3">
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                  {sortedProducts.map(p => (
                    <ProductCard 
                      key={p.id}
                      id={p.id}
                      image={p.image}
                      title={p.name}
                      price={p.price}
                      category={p.category}
                      badge={p.is_new ? 'nouveau' : undefined}
                      rating={4.7}
                      reviews={12}
                    />
                  ))}
                </div>
                
                {/* Simplified Pagination for infinite feel */}
                {products.length >= 20 && (
                  <div className="mt-16 flex justify-center">
                    <button 
                      onClick={() => {
                        // In a real app, this would load more or go to next page
                        // For this "intelligent" feel, we'll just keep it simple
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn-outline-sensual px-12 py-4 rounded-full text-base border-2 border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-all font-bold"
                    >
                      Afficher plus de produits
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 mb-8">Nous n'avons trouvé aucun résultat correspondant à vos critères.</p>
                <button onClick={clearFilters} className="btn-sensual px-8 py-3 rounded-full">
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {/* Footer Shop Info */}
            <div className="mt-20 p-8 bg-white rounded-3xl border border-gray-100 flex items-start gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Aide à l'achat</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Besoin d'un conseil sur une taille ou une matière ? Notre équipe est disponible par chat ou email pour vous accompagner dans votre choix. Tous nos envois sont effectués dans des emballages 100% neutres.
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>

    </div>
  );
}