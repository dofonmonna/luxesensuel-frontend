import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, Sparkles, Heart, Zap, ChevronRight, 
  ShieldCheck, Truck, RotateCcw, Star, 
  Flame, ShoppingBag, Gift, Award
} from 'lucide-react';
import { CategoryCard } from '@/components/CategoryCard';
import { TranslatedProductCard } from '@/components/TranslatedProductCard';
import { Newsletter } from '@/components/Newsletter';
import { productsApi, type Product } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HERO_SLIDES = [
  {
    title: "Collection Lingerie de Nuit",
    subtitle: "Élégance & Séduction",
    description: "Découvrez nos nouvelles pièces en soie et dentelle fine pour des moments inoubliables.",
    image: "https://images.unsplash.com/photo-1512446813985-4a0eb139016c?auto=format&fit=crop&q=80&w=1600",
    cta: "Explorer la collection",
    color: "bg-[#1a1a2e]"
  },
  {
    title: "Bien-être & Massages",
    subtitle: "Rituels Sensoriels",
    description: "Éveillez vos sens avec nos huiles de massage et bougies parfumées haut de gamme.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1600",
    cta: "Voir les soins",
    color: "bg-[#2d3436]"
  },
  {
    title: "Coffrets Cadeaux",
    subtitle: "L'Art d'Offrir",
    description: "Des sélections élégantes pour surprendre et ravir votre partenaire.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600",
    cta: "Découvrir les coffrets",
    color: "bg-[#636e72]"
  }
];

const CATEGORY_ICONS = [
  { title: 'Lingerie', icon: Heart, slug: 'lingerie' },
  { title: 'Électronique', icon: Zap, slug: 'électronique' },
  { title: 'Soins', icon: Sparkles, slug: 'soins' },
  { title: 'Accessoires', icon: ShoppingBag, slug: 'accessoires' },
  { title: 'Nouveautés', icon: Flame, slug: 'new' },
];

export function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productsApi.list({ random: true, limit: 30 });
        setProducts(res.products);
      } catch (err) {
        console.error("Home API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Timer Flash Deals
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat]">
      <SEO
        title="Lingerie de Luxe & Accessoires d'Exception"
        description="LuxeSensuel - Découvrez notre collection exclusive de lingerie fine, nuisettes, soins et accessoires de luxe. Livraison internationale discrète. Plus de 25 000 clients satisfaits."
        keywords="lingerie de luxe, lingerie fine, nuisettes, soins corporels, accessoires intimes, livraison discrète, boutique en ligne"
        url="https://prismatic-cheesecake-92caa2.netlify.app/"
        type="website"
      />
      
      {/* ── SECTION 1 : Hero Banner & Side Deals ───────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Carousel */}
          <div className="lg:col-span-3">
            <Carousel className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-sm">
              <CarouselContent>
                {HERO_SLIDES.map((slide, i) => (
                  <CarouselItem key={i} className="relative w-full h-[400px] md:h-[500px]">
                    <img 
                      src={slide.image} 
                      alt={slide.title} 
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-8 md:px-16">
                      <p className="text-[#CC0000] font-bold text-sm md:text-base mb-2 uppercase tracking-widest animate-fade-in">
                        {slide.subtitle}
                      </p>
                      <h2 className="text-white text-4xl md:text-6xl font-black mb-4 leading-tight max-w-xl animate-fade-in">
                        {slide.title}
                      </h2>
                      <p className="text-gray-200 text-sm md:text-lg mb-8 max-w-md line-clamp-2 animate-fade-in opacity-80">
                        {slide.description}
                      </p>
                      <Link 
                        to="/shop" 
                        className="btn-sensual w-fit px-8 py-3.5 text-base rounded-full shadow-lg shadow-black/20 hover:scale-105 transition-transform"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-4 bg-white/20 border-white/20 text-white hover:bg-white hover:text-black transition-all" />
                <CarouselNext className="right-4 bg-white/20 border-white/20 text-white hover:bg-white hover:text-black transition-all" />
              </div>
            </Carousel>
          </div>

          {/* Side Deals / Promo */}
          <div className="hidden lg:flex flex-col gap-6">
            <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10">
                <h4 className="text-xs font-bold text-[#CC0000] tracking-widest uppercase mb-2">Offre de Bienvenue</h4>
                <p className="text-xl font-black text-gray-900 leading-tight mb-3">Obtenez -20% sur votre 1ère commande</p>
                <p className="text-sm text-gray-400">Code: <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">WELCOME20</span></p>
              </div>
              <button className="relative z-10 w-full py-3 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                Copier le code
              </button>
            </div>
            
            <div className="flex-1 bg-gradient-sensual rounded-2xl p-6 text-white flex flex-col justify-between shadow-sm relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Gift className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-bold text-white/70 tracking-widest uppercase mb-2">Livraison</h4>
                <p className="text-xl font-black leading-tight mb-2">Offerte dès 50€ d'achat</p>
                <p className="text-xs text-white/80">Partout en Europe</p>
              </div>
              <Link to="/shop" className="relative z-10 w-full py-3 bg-white text-[#CC0000] text-xs font-bold rounded-lg hover:bg-red-50 transition-colors text-center">
                Voir les conditions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2 : Avantages ───────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 border-r border-gray-50 last:border-0 pr-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#CC0000]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Expédition 24h</p>
              <p className="text-[10px] text-gray-400">Livraison ultra-rapide</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-r border-gray-50 last:border-0 pr-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Paiement 100% Sécure</p>
              <p className="text-[10px] text-gray-400">Certifié SSL & 3D Secure</p>
            </div>
          </div>
          <div className="flex items-center gap-4 border-r border-gray-50 last:border-0 pr-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Retours Gratuits</p>
              <p className="text-[10px] text-gray-400">30 jours pour changer d'avis</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">Pack Discret</p>
              <p className="text-[10px] text-gray-400">Emballage neutre & soigné</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3 : Catégories ──────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-12">
        <div className="section-header">
          <h3 className="section-title">Parcourir par <span className="section-accent">Catégorie</span></h3>
          <Link to="/shop" className="section-link">Tout voir <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_ICONS.map((cat, i) => (
            <CategoryCard key={i} title={cat.title} icon={cat.icon} slug={cat.slug} />
          ))}
        </div>
      </section>

      {/* ── SECTION 4 : Flash Deals ─────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-12">
        <div className="bg-[#FFFFFF] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#CC0000] text-white px-4 py-2 rounded-lg shadow-lg shadow-red-100">
                <Zap className="w-5 h-5 fill-current" />
                <span className="font-black uppercase tracking-widest">Flash Deals</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase">Finit dans:</span>
                <div className="flash-timer">
                  <div className="flash-timer-block">{timeLeft.hours.toString().padStart(2, '0')}</div>
                  <div className="flash-timer-sep">:</div>
                  <div className="flash-timer-block">{timeLeft.minutes.toString().padStart(2, '0')}</div>
                  <div className="flash-timer-sep">:</div>
                  <div className="flash-timer-block">{timeLeft.seconds.toString().padStart(2, '0')}</div>
                </div>
              </div>
            </div>
            <Link to="/shop?cat=promo" className="text-sm font-bold text-[#CC0000] hover:underline flex items-center gap-1">
              Voir toutes les offres <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            ) : products.slice(0, 5).map((p, i) => (
              <TranslatedProductCard
                key={p.id}
                product={{ ...p, price: p.price * 0.7, original_price: p.price }}
                badge={i === 0 ? 'hot' : 'promo'}
                sold={120 + i * 45}
              />
            ))}
          </div>
          
          {/* Subtle Background Shape */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-red-50/50 rounded-full blur-3xl -z-0" />
        </div>
      </section>

      {/* ── SECTION 5 : Trending & New Arrivals ──────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Trending */}
          <div>
            <div className="section-header">
              <h3 className="section-title">Les <span className="section-accent">Tendances</span></h3>
              <Link to="/shop" className="section-link">Voir plus <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                [1, 2].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
              ) : products.slice(5, 7).map((p, i) => (
                <TranslatedProductCard
                  key={p.id}
                  product={p}
                  badge="hot"
                  rank={i + 1}
                />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div>
            <div className="section-header">
              <h3 className="section-title"><span className="section-accent">Nouveautés</span> Irrésistibles</h3>
              <Link to="/shop" className="section-link">Voir plus <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {loading ? (
                [1, 2].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
              ) : products.slice(8, 10).map((p) => (
                <TranslatedProductCard
                  key={p.id}
                  product={p}
                  badge="nouveau"
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 6 : Just For You (Main Grid) ─────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-4 font-[Montserrat]">Sélectionné <span className="text-[#CC0000]">Pour Vous</span></h2>
          <p className="text-gray-500 max-w-xl mx-auto">Notre collection exclusive de produits premium pour sublimer votre intimité et vos moments de détente.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
          ) : products.map((p) => (
            <TranslatedProductCard
              key={p.id}
              product={p}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <button 
            onClick={() => navigate('/shop')}
            className="btn-outline-sensual px-12 py-4 rounded-full text-base border-2 border-[#CC0000] text-[#CC0000] hover:bg-[#CC0000] hover:text-white transition-all font-bold"
          >
            Afficher plus de produits
          </button>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
      
    </div>
  );
}