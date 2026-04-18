import { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  id?: string;
  image: string;
  title: string;
  price: number;
  oldPrice?: number;
  badge?: 'tendance' | 'nouveau' | 'promo' | 'hot';
  discount?: string;
  rank?: number;
  rating?: number;
  reviews?: number;
  sold?: number;
  category?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className="w-3 h-3"
          fill={s <= Math.round(rating) ? '#FFAA00' : 'none'}
          stroke={s <= Math.round(rating) ? '#FFAA00' : '#D1D5DB'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export function ProductCard({
  id,
  image,
  title,
  price,
  oldPrice,
  badge,
  discount,
  rank,
  rating = 4.5,
  reviews,
  sold,
  category,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [wished, setWished] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discountPct = oldPrice
    ? Math.round(((oldPrice - price) / oldPrice) * 100)
    : discount
    ? parseInt(discount.replace(/\D/g, ''))
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({ id: id || title, name: title, price, image, quantity: 1 });
    toast.success('Ajouté au panier !', {
      description: title.slice(0, 40) + (title.length > 40 ? '…' : ''),
    });
  };

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWished(v => !v);
    toast(wished ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleClick = () => {
    if (id) navigate(`/product/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {!imgError ? (
          <img
            src={image}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct && discountPct > 0 && (
            <span className="badge-sensual text-[10px] font-bold px-2 py-0.5 rounded">
              -{discountPct}%
            </span>
          )}
          {badge === 'nouveau' && (
            <span className="badge-new text-[9px] font-bold px-2 py-0.5 rounded">
              NOUVEAU
            </span>
          )}
          {(badge === 'tendance' || badge === 'hot') && (
            <span className="badge-hot text-[9px] font-bold px-2 py-0.5 rounded">
              🔥 HOT
            </span>
          )}
        </div>

        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md"
            style={{ background: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32' }}
          >
            #{rank}
          </div>
        )}

        {/* Action buttons - hover */}
        <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleWish}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-red-50 transition-colors"
          >
            <Heart
              className="w-4 h-4 transition-colors"
              fill={wished ? '#CC0000' : 'none'}
              stroke={wished ? '#CC0000' : '#6B7280'}
            />
          </button>
          {id && (
            <button
              onClick={e => { e.stopPropagation(); navigate(`/product/${id}`); }}
              className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors"
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Category */}
        {category && (
          <p className="text-[9px] uppercase tracking-widest text-[#CC0000] font-semibold mb-1 opacity-80">
            {category}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm text-gray-800 font-medium mb-2 line-clamp-2 leading-snug min-h-[2.5rem]">
          {title}
        </h3>

        {/* Stars + reviews */}
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={rating} />
          <span className="text-[10px] text-gray-400 font-medium">
            {rating.toFixed(1)}
            {reviews ? ` (${reviews})` : ''}
          </span>
          {sold && (
            <span className="ml-auto text-[10px] text-orange-500 font-medium">
              🔥 {sold}+ vendus
            </span>
          )}
        </div>

        {/* Prix et Bouton Panier */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-black text-[#CC0000] leading-none">
              {price.toFixed(2)} €
            </span>
            {oldPrice && (
              <span className="text-[10px] text-gray-400 line-through mt-1">
                {oldPrice.toFixed(2)} €
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className="w-10 h-10 rounded-2xl bg-gray-900 hover:bg-[#CC0000] text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-[0_8px_20px_rgba(204,0,0,0.2)] active:scale-90 group/cart"
          >
            <ShoppingCart className="w-4 h-4 group-hover/cart:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
