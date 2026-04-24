/**
 * Carte produit avec traduction automatique
 * Affiche les informations dans la langue du client
 */
import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { useCurrency } from '@/hooks/useCurrency';

interface TranslatedProductCardProps {
  product: {
    id: string;
    name: string;
    name_en?: string;
    description: string;
    description_en?: string;
    price: number;
    original_price?: number;
    image: string;
    category: string;
    rating?: number;
    reviews?: number;
    tags?: string[];
    is_new?: boolean;
    is_bestseller?: boolean;
  };
  badge?: 'tendance' | 'nouveau' | 'promo' | 'hot';
  rank?: number;
  sold?: number;
}

function Stars({ rating = 4.5 }: { rating: number }) {
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

export function TranslatedProductCard({ 
  product, 
  badge, 
  rank, 
  sold 
}: TranslatedProductCardProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { currentLang, translateProduct, isTranslating } = useTranslation();
  const { formatPrice } = useCurrency();
  
  const [wished, setWished] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [translatedData, setTranslatedData] = useState({
    name: product.name,
    description: product.description,
    category: product.category,
  });

  // Traduire le produit si nécessaire
  useEffect(() => {
    const loadTranslation = async () => {
      if (currentLang !== 'fr') {
        try {
          const translated = await translateProduct(product);
          setTranslatedData({
            name: translated.name,
            description: translated.description,
            category: translated.category,
          });
        } catch (error) {
          console.log('Translation failed, using original');
        }
      } else {
        setTranslatedData({
          name: product.name,
          description: product.description,
          category: product.category,
        });
      }
    };

    loadTranslation();
  }, [currentLang, product, translateProduct]);

  const discountPct = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: translatedData.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
    toast.success(
      currentLang === 'fr' ? 'Ajouté au panier !' :
      currentLang === 'en' ? 'Added to cart!' :
      currentLang === 'es' ? '¡Añadido al carrito!' :
      currentLang === 'de' ? 'Zum Warenkorb hinzugefügt!' :
      'Added to cart!',
      { description: translatedData.name.slice(0, 40) + (translatedData.name.length > 40 ? '…' : '') }
    );
  };

  const handleWish = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWished(v => !v);
    toast(wished ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  // Traductions des badges
  const badgeLabels = {
    fr: { nouveau: 'NOUVEAU', promo: 'PROMO', hot: '🔥 HOT', tendance: 'TENDANCE' },
    en: { nouveau: 'NEW', promo: 'SALE', hot: '🔥 HOT', tendance: 'TRENDING' },
    es: { nouveau: 'NUEVO', promo: 'OFERTA', hot: '🔥 HOT', tendance: 'TENDENCIA' },
    de: { nouveau: 'NEU', promo: 'ANGEBOT', hot: '🔥 HOT', tendance: 'TREND' },
    it: { nouveau: 'NUOVO', promo: 'OFFERTA', hot: '🔥 HOT', tendance: 'TENDENZA' },
    pt: { nouveau: 'NOVO', promo: 'PROMO', hot: '🔥 HOT', tendance: 'TENDÊNCIA' },
  };

  const labels = badgeLabels[currentLang as keyof typeof badgeLabels] || badgeLabels.fr;

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {!imgError && product.image ? (
          <img
            src={product.image}
            alt={translatedData.name}
            loading="lazy"
            width={400}
            height={400}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100 flex-col gap-2">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">
              {currentLang === 'fr' ? 'Image indisponible' : 'Image unavailable'}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discountPct && discountPct > 0 && (
            <span className="bg-[#CC0000] text-white text-[10px] font-bold px-2 py-0.5 rounded">
              -{discountPct}%
            </span>
          )}
          {product.is_new && (
            <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">
              {labels.nouveau}
            </span>
          )}
          {badge === 'hot' && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded">
              {labels.hot}
            </span>
          )}
        </div>

        {/* Rank badge */}
        {rank && rank <= 3 && (
          <div 
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md"
            style={{ background: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32' }}
          >
            #{rank}
          </div>
        )}

        {/* Loading indicator for translation */}
        {isTranslating && (
          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] px-2 py-1 rounded-full animate-pulse">
            🌐 Translating...
          </div>
        )}

        {/* Action buttons */}
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
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        {/* Category */}
        <p className="text-[9px] uppercase tracking-widest text-[#CC0000] font-semibold mb-1 opacity-80">
          {translatedData.category}
        </p>

        {/* Title */}
        <h3 className="text-sm text-gray-800 font-medium mb-2 line-clamp-2 leading-snug min-h-[2.5rem]">
          {translatedData.name}
        </h3>

        {/* Stars + reviews */}
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={product.rating || 4.5} />
          <span className="text-[10px] text-gray-400 font-medium">
            {(product.rating || 4.5).toFixed(1)}
            {product.reviews ? ` (${product.reviews})` : ''}
          </span>
          {sold && (
            <span className="ml-auto text-[10px] text-orange-500 font-medium">
              🔥 {sold}+
            </span>
          )}
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-black text-[#CC0000] leading-none">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-[10px] text-gray-400 line-through mt-1">
                {formatPrice(product.original_price)}
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
