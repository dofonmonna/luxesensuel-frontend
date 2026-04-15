import { Heart, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  image: string;
  title: string;
  price: number;
  oldPrice?: number;
  badge?: 'tendance' | 'nouveau' | 'promo';
  discount?: string;
  rank?: number;
}

export function ProductCard({ image, title, price, oldPrice, badge, discount, rank }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3 bg-gray-500/80 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            #{rank}
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {badge === 'tendance' && (
            <span className="badge-tendance flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> TENDANCE
            </span>
          )}
          {badge === 'nouveau' && (
            <span className="badge-nouveau">
              <Sparkles className="w-3 h-3" /> NOUVEAU
            </span>
          )}
        </div>
        
        {discount && (
          <span className="absolute top-3 right-3 badge-promo">
            {discount}
          </span>
        )}
        
        {/* Quick Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <button className="bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 text-gray-700 hover:text-pink-500 transition">
            <Heart className="w-5 h-5" />
          </button>
          <button className="bg-gradient-luxe p-2 rounded-full shadow-lg text-white hover:opacity-90 transition">
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-purple-600">{price}€</span>
          {oldPrice && (
            <span className="text-sm text-gray-400 line-through">{oldPrice}€</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Import manquant dans l'exemple
import { Sparkles } from 'lucide-react';