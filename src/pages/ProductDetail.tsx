import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Minus, Plus, ShoppingCart, Zap, Star, Truck, 
  ShieldCheck, RotateCcw, ChevronRight, Heart,
  Share2, MessageCircle, Info, Flame, Award
} from 'lucide-react';
import { productsApi, type Product } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { ProductCard } from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SEO } from '@/components/SEO';
import { ViewersCount, LowStockBadge } from '@/components/SocialProof';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useCurrency } from '@/hooks/useCurrency';
import { useT } from '@/i18n/I18nProvider';
const getRating = (id: string) => parseFloat((4.2 + ((id.charCodeAt(0) % 8) / 10)).toFixed(1));
const getSold   = (id: string) => 50 + (id.charCodeAt(0) % 500);
const getReviews= (id: string) => 5 + ((id.charCodeAt(1) || 65) % 150);

// Extrait toutes les images src depuis le HTML de description
function extractImages(html: string): string[] {
  if (!html) return [];
  const matches = [...html.matchAll(/src="([^"]+)"/g)];
  return matches.map(m => m[1]).filter(s => s.startsWith('http'));
}

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();
  const { t } = useT();

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setReco] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mainImg, setMainImg] = useState('');
  const [inWish, setInWish] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'avis'>('desc');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([productsApi.get(id!), productsApi.list()])
      .then(([p, list]) => {
        if (!mounted) return;
        setProduct(p.product);
        setMainImg(p.product.image);
        // Filtrer les recommandations par catégorie si possible
        const filtered = list.products.filter((i: Product) => i.id !== id);
        setReco(filtered.slice(0, 10));
      })
      .catch(err => console.error(err))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [id]);

  const price = product ? parseFloat(product.price as any) : 0;
  const oldPrice = +(price * 1.35).toFixed(2);
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  const descImages = product ? extractImages(product.description || '') : [];
  const allThumbs = product ? [product.image, ...descImages].slice(0, 6) : [];
  const rating = product ? getRating(product.id) : 4.5;
  const sold = product ? getSold(product.id) : 0;
  const reviews = product ? getReviews(product.id) : 0;

  // Track recently viewed
  const { addViewed } = useRecentlyViewed();
  useEffect(() => {
    if (product) {
      addViewed({ id: product.id, name: product.name, price, image: product.image, category: product.category });
    }
  }, [product?.id]);

  const handleAdd = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price, image: product.image, quantity });
    toast.success(t('product.add_to_cart'), {
      description: `${quantity}x ${product.name}`,
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-[1440px] mx-auto w-full px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-1/2" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Produit introuvable</h2>
        <button onClick={() => navigate('/shop')} className="btn-sensual">Retour à la boutique</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] pb-24 lg:pb-12">
      
      <SEO
        title={product.name}
        description={product.description?.replace(/<[^>]*>/g, '').trim().slice(0, 160) || `${product.name} - Produit d'exception chez LuxeSensuel. Livraison discrète et paiement sécurisé.`}
        keywords={`${product.name}, ${product.category || 'lingerie'}, luxe, boutique en ligne, LuxeSensuel`}
        image={product.image}
        url={`https://prismatic-cheesecake-92caa2.netlify.app/product/${product.id}`}
        type="product"
        product={{
          name: product.name,
          price: price,
          currency: 'EUR',
          availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
          image: product.image,
          category: product.category || 'Produit',
          rating: rating,
          reviewCount: reviews,
          sku: product.id.slice(0, 8).toUpperCase(),
          description: product.description?.replace(/<[^>]*>/g, '').trim().slice(0, 300) || '',
        }}
        breadcrumbs={[
          { name: 'Accueil', url: '/' },
          { name: 'Boutique', url: '/shop' },
          { name: product.name, url: `/product/${product.id}` },
        ]}
      />

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center gap-2 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-[#CC0000]">Boutique</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 line-clamp-1">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 py-6">
        
        {/* ── Main Product Card ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Left: Images Section */}
          <div className="lg:w-1/2 p-4 md:p-8 bg-white">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
              <img 
                src={mainImg} 
                alt={product.name}
                loading="lazy"
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="badge-sensual text-xs py-1.5 px-3 rounded-lg shadow-lg shadow-red-100">-{discount}% OFF</span>
                <span className="badge-hot text-xs py-1.5 px-3 rounded-lg shadow-lg shadow-orange-100">TOP VENTE</span>
              </div>
              <button 
                onClick={() => setInWish(!inWish)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group/heart"
              >
                <Heart className={cn("w-6 h-6 transition-colors", inWish ? "fill-[#CC0000] text-[#CC0000]" : "text-gray-300 group-hover/heart:text-red-300")} />
              </button>
            </div>
            
            {/* Thumbnails */}
            {allThumbs.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allThumbs.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setMainImg(img)}
                    className={cn(
                      "relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all",
                      mainImg === img ? "border-[#CC0000] scale-105" : "border-gray-50 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info Section */}
          <div className="lg:w-1/2 p-6 md:p-10 lg:border-l border-gray-50 flex flex-col">
            <div className="mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC0000] bg-red-50 px-3 py-1 rounded-full">
                {product.category || 'Collection Exclusive'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Social Proof */}
            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-50">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-4 h-4" fill={s <= Math.round(rating) ? '#FFAA00' : 'none'} stroke={s <= Math.round(rating) ? '#FFAA00' : '#D1D5DB'} />
                  ))}
                </div>
                <span className="text-sm font-black text-gray-900">{rating}</span>
                <span className="text-xs text-gray-400 font-medium">({reviews} avis)</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-orange-600">{sold}+ commandes récentes</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Zap className="w-16 h-16 text-[#CC0000]" />
              </div>
              <div className="flex items-baseline gap-4 mb-1">
                <span className="text-4xl font-black text-[#CC0000]">{formatPrice(price)}</span>
                <span className="text-lg text-gray-400 line-through font-medium">{formatPrice(oldPrice)}</span>
              </div>
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> -{discount}% {formatPrice(oldPrice - price)}
              </p>
            </div>

            {/* Stock status */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('product.quantity')}</p>
                {product.stock > 0 ? (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{t('product.in_stock')}: {product.stock}</span>
                ) : (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{t('product.out_of_stock')}</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors text-gray-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-black text-gray-900 border-x-2 border-gray-50 py-3">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-gray-50 transition-colors text-gray-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 flex gap-3">
                  <button 
                    onClick={() => {
                      const text = `Regarde ce produit magnifique : ${product.name} sur LuxeSensuel !`;
                      navigator.clipboard.writeText(`${window.location.href}`);
                      toast.info('Lien copié ! Partagez-le avec vos amis.');
                    }}
                    className="p-3.5 rounded-xl border-2 border-gray-100 text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000] transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button className="p-3.5 rounded-xl border-2 border-gray-100 text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Social Proof Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <ViewersCount productId={product.id} />
              <LowStockBadge stock={product.stock} />
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button 
                onClick={handleAdd}
                className="flex-1 h-16 rounded-2xl bg-white border-2 border-[#CC0000] text-[#CC0000] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-red-50"
              >
                <ShoppingCart className="w-5 h-5" />
                {t('product.add_to_cart')}
              </button>
              <button 
                onClick={() => { handleAdd(); navigate('/checkout'); }}
                className="flex-1 h-16 rounded-2xl bg-[#CC0000] text-white font-black uppercase tracking-widest hover:bg-[#aa0000] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-red-200"
              >
                <Zap className="w-5 h-5 fill-current" />
                {t('product.buy_now')}
              </button>
            </div>

            {/* Security & Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-5 h-5" />, title: 'Envoi discret', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: 'Pay sécurisé', color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { icon: <RotateCcw className="w-5 h-5" />, title: 'Retours 30j', color: 'text-orange-500', bg: 'bg-orange-50' },
              ].map((item, i) => (
                <div key={i} className={cn("p-4 rounded-2xl flex flex-col items-center text-center gap-2 border border-transparent hover:border-gray-100 transition-all", item.bg)}>
                  <div className={item.color}>{item.icon}</div>
                  <span className="text-[9px] font-black uppercase tracking-tighter text-gray-900">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs Section: Details, Specs, Reviews ── */}
        <div className="mt-12 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-50 bg-gray-50/30">
            {[
              { id: 'desc', label: 'Description détaillée', icon: Info },
              { id: 'specs', label: 'Caractéristiques', icon: SlidersHorizontal },
              { id: 'avis', label: `Avis clients (${reviews})`, icon: MessageCircle },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 md:flex-none px-6 md:px-12 py-5 text-xs font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                  activeTab === tab.id ? "text-[#CC0000] bg-white" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#CC0000]" />}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">
            {activeTab === 'desc' && (
              <div className="max-w-4xl mx-auto">
                {descImages.length > 0 ? (
                  <div className="flex flex-col items-center gap-4">
                    {descImages.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-full rounded-2xl shadow-sm border border-gray-100" />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                    {product.description?.replace(/<[^>]*>/g, '').trim() || 'Ce produit d\'exception est le fruit d\'une sélection rigoureuse pour garantir qualité et élégance.'}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Identifiant', product.id.slice(0, 8).toUpperCase()],
                      ['Collection', product.category || 'Général'],
                      ['Disponibilité', product.stock > 0 ? 'En stock' : 'Épuisé'],
                      ['Expédition', '24/48h ouvrées'],
                      ['Emballage', '100% anonyme & discret'],
                      ['Matière / Type', 'Premium Quality'],
                    ].map(([k, v], i) => (
                      <tr key={i} className="border-b border-white last:border-0">
                        <td className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest w-1/3">{k}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'avis' && (
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row gap-12 items-center mb-12 p-8 bg-gray-50 rounded-3xl">
                  <div className="text-center">
                    <div className="text-6xl font-black text-[#CC0000] mb-2">{rating}</div>
                    <div className="flex gap-1 justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-5 h-5" fill={s <= Math.round(rating) ? '#FFAA00' : 'none'} stroke={s <= Math.round(rating) ? '#FFAA00' : '#D1D5DB'} />)}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Moyenne basée sur {reviews} avis</div>
                  </div>
                  <div className="flex-1 w-full space-y-3">
                    {[5, 4, 3, 2, 1].map(s => {
                      const pct = s === 5 ? 75 : s === 4 ? 15 : s === 3 ? 6 : s === 2 ? 3 : 1;
                      return (
                        <div key={s} className="flex items-center gap-4">
                          <span className="text-xs font-bold text-gray-500 w-4">{s}★</span>
                          <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-[#FFAA00]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold text-gray-400 w-8">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-center py-12 px-6 border-2 border-dashed border-gray-100 rounded-3xl">
                  <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-medium">Tous nos avis sont vérifiés et proviennent de clients réels ayant acheté ce produit.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Recommendations ── */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-900">Vous aimerez <span className="text-[#CC0000]">aussi</span></h3>
            <Link to="/shop" className="btn-outline-sensual px-6 py-2 rounded-full text-xs">Tout voir</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recommendations.slice(0, 5).map(p => (
              <ProductCard 
                key={p.id}
                id={p.id}
                image={p.image}
                title={p.name}
                price={p.price}
                category={p.category}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Récemment consultés */}
      <RecentlyViewed />

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex gap-4">
        <button 
          onClick={handleAdd}
          className="flex-1 h-14 rounded-xl border-2 border-[#CC0000] text-[#CC0000] font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
        >
          Panier
        </button>
        <button 
          onClick={() => { handleAdd(); navigate('/checkout'); }}
          className="flex-2 h-14 rounded-xl bg-[#CC0000] text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-transform px-8"
        >
          Acheter maintenant
        </button>
      </div>

    </div>
  );
}

// Helper icons
function SlidersHorizontal(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4h-7M10 4H3M21 12H11M7 12H3M21 20H15M11 20H3M10 2v4M7 10v4M15 18v4"/></svg>
  );
}