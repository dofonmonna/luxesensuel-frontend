/**
 * Section "Récemment consultés" — affichée sur Home et ProductDetail
 */
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';

export function RecentlyViewed() {
  const { recentProducts } = useRecentlyViewed();
  const navigate = useNavigate();

  if (recentProducts.length < 2) return null;

  return (
    <section className="py-10 px-4">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Récemment consultés</h3>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
          {recentProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="min-w-[160px] max-w-[160px] bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 shrink-0"
            >
              <div className="aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5">
                <p className="text-[10px] uppercase text-[#CC0000] font-semibold tracking-wider mb-1">
                  {product.category || 'Produit'}
                </p>
                <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug mb-1.5">
                  {product.name}
                </p>
                <p className="text-sm font-black text-[#CC0000]">
                  {product.price.toFixed(2)} €
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
