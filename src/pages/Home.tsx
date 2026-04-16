import { Header } from '@/components/Header';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { Newsletter } from '@/components/Newsletter';
import { Sparkles, Heart, Droplets, Flame, Gem, Leaf, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
  { title: 'Lingerie', count: '245 produits', icon: Sparkles, gradient: 'category-lingerie' },
  { title: 'Soins Corporels', count: '189 produits', icon: Heart, gradient: 'category-soins' },
  { title: 'Parfums', count: '156 produits', icon: Droplets, gradient: 'category-parfums' },
  { title: 'Cosmétiques', count: '312 produits', icon: Flame, gradient: 'category-cosmetiques' },
  { title: 'Bijoux', count: '98 produits', icon: Gem, gradient: 'category-bijoux' },
  { title: 'Bien-être', count: '134 produits', icon: Leaf, gradient: 'category-bienetre' },
];

// ✅ CHANGEMENT : export default → export function
export function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Subtitle */}
        <p className="text-gray-600 mb-6">Trouvez ce que vous cherchez parmi nos <span className="font-semibold text-purple-600">1288 produits</span></p>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
        
        {/* Meilleures Ventes */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-400 to-pink-500 p-3 rounded-xl text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Meilleures Ventes</h2>
                <p className="text-gray-500 text-sm">Les produits les plus populaires ce mois-ci</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded-full hover:border-purple-500 hover:text-purple-600 transition">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="p-2 border border-gray-300 rounded-full hover:border-purple-500 hover:text-purple-600 transition">
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="ml-2 text-purple-600 font-semibold hover:underline">
                Voir tout
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ProductCard 
              image="/api/placeholder/300/300" 
              title="Ensemble Élégance Noire"
              price={89.99}
              oldPrice={120}
              badge="tendance"
              discount="-50%"
              rank={1}
            />
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 py-8 border-y border-gray-200">
          {[
            { value: '50K+', label: 'Produits vendus', icon: TrendingUp },
            { value: '25K+', label: 'Clients satisfaits', icon: Heart },
            { value: '12K+', label: 'Avis vérifiés', icon: Sparkles },
            { value: '4.8/5', label: 'Note moyenne', icon: Gem },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-gray-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </section>
      </main>
      
      <Newsletter />
    </div>
  );
}