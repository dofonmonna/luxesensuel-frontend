import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Heart, Zap, ChevronRight,
  ShieldCheck, Truck, RotateCcw, Star,
  Flame, ShoppingBag, Gift, Users, Globe, Quote
} from 'lucide-react';
import { CategoryCard } from '@/components/CategoryCard';
import { TranslatedProductCard } from '@/components/TranslatedProductCard';
import { Newsletter } from '@/components/Newsletter';
import { productsApi, type Product } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const HERO_SLIDES = [
  {
    title: "Des Milliers de Produits Livrés Chez Vous",
    subtitle: "✦ Boutique Internationale",
    description: "Mode, beauté, électronique, maison, sport — tout ce dont vous avez besoin, livré partout dans le monde.",
    image: "https://images.unsplash.com/photo-1512446813985-4a0eb139016c?auto=format&fit=crop&q=80&w=1600",
    cta: "Explorer la boutique",
    badge: "Livraison internationale garantie",
  },
  {
    title: "Les Meilleures Offres du Moment",
    subtitle: "✦ Flash Deals",
    description: "Profitez de prix imbattables sur des milliers de produits sélectionnés. Stocks limités.",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1600",
    cta: "Voir les offres",
    badge: "Jusqu'à -50% sur les tendances",
  },
  {
    title: "Shopping Premium, Livraison Mondiale",
    subtitle: "✦ +50 Pays Desservis",
    description: "Commandez depuis n'importe où. Paiement sécurisé par Mobile Money, Carte ou Wave.",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=1600",
    cta: "Commencer mes achats",
    badge: "Paiement sécurisé · Colis discret",
  },
];

const TESTIMONIALS = [
  {
    name: "Amina K.", city: "Abidjan", rating: 5,
    text: "Colis reçu en 4 jours, emballage totalement neutre. Qualité vraiment premium, je recommande sans hésiter !",
    avatar: "A",
  },
  {
    name: "Fatou D.", city: "Dakar", rating: 5,
    text: "Livraison discrète comme promis. Mon partenaire a adoré le cadeau. Déjà ma 3e commande sur ce site !",
    avatar: "F",
  },
  {
    name: "Marie & Julien", city: "Paris", rating: 5,
    text: "Produits de qualité professionnelle, packaging luxueux. Livraison en 5 jours, on reviendra c'est certain !",
    avatar: "M",
  },
  {
    name: "Kofi A.", city: "Accra", rating: 5,
    text: "Paiement Mobile Money très simple, livraison rapide. Le produit est exactement comme décrit. Top !",
    avatar: "K",
  },
  {
    name: "Nadia R.", city: "Casablanca", rating: 5,
    text: "Encore mieux en vrai que sur les photos. La texture est douce, le packaging soigné. Je suis conquise !",
    avatar: "N",
  },
  {
    name: "Oumar S.", city: "Bamako", rating: 5,
    text: "Discret, professionnel, produits de haute qualité. J'ai commandé pour ma femme et elle est aux anges !",
    avatar: "O",
  },
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
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const { translateProducts, currentLang } = useTranslation();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const [mainRes, newRes, promoRes] = await Promise.all([
          productsApi.list({ random: true, limit: 60 }),
          productsApi.list({ is_new: true, sort: 'newest', limit: 8 }),
          productsApi.list({ promo: true, limit: 10 }),
        ]);

        // Re-mélanger côté client pour garantir un affichage différent à chaque visite
        const shuffled = [...mainRes.products].sort(() => Math.random() - 0.5);
        setProducts(shuffled);

        const news = newRes.products.length >= 2
          ? newRes.products
          : shuffled.slice(0, 4);
        setNewProducts(news);

        const promos = promoRes.products.length >= 2
          ? promoRes.products
          : shuffled.slice(4, 9);
        setPromoProducts(promos);
        if (currentLang !== 'fr') {
          translateProducts(mainRes.products, currentLang).catch(() => {});
        }
      } catch (err) {
        console.error("Home API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [currentLang]);

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
        title="Boutique en Ligne — Produits Premium & Tendance"
        description="LuxeSensuel — Des milliers de produits sélectionnés : mode, beauté, maison, électronique, sport et plus. Livraison mondiale discrète. Paiement sécurisé. Plus de 25 000 clients satisfaits."
        keywords="boutique en ligne, produits premium, mode femme, beauté, accessoires, livraison internationale, paiement mobile money, wave, orange money"
        url="https://luxedropshoping.com/"
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
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-8 md:px-16">
                      <span className="inline-block bg-[#CC0000]/90 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-4">
                        {slide.badge}
                      </span>
                      <p className="text-[#f9c8c8] font-bold text-sm md:text-base mb-2 uppercase tracking-widest">
                        {slide.subtitle}
                      </p>
                      <h2 className="text-white text-3xl md:text-5xl font-black mb-4 leading-tight max-w-xl">
                        {slide.title}
                      </h2>
                      <p className="text-gray-200 text-sm md:text-base mb-8 max-w-md opacity-90">
                        {slide.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Link
                          to="/shop"
                          className="btn-sensual px-8 py-3.5 text-sm font-bold rounded-full shadow-lg shadow-black/30 hover:scale-105 transition-transform"
                        >
                          {slide.cta} →
                        </Link>
                        <div className="flex items-center gap-1.5 text-white/80 text-xs">
                          <div className="flex">
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                          </div>
                          <span className="font-semibold">4.9 · 25 000+ clients</span>
                        </div>
                      </div>
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
                <p className="text-xl font-black leading-tight mb-2">Vers plus de 50 pays</p>
                <p className="text-xs text-white/80">Partout dans le monde</p>
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

      {/* ── MOYENS DE PAIEMENT ──────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-8">
        <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 shrink-0">Paiements acceptés</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-blue-800 font-black text-base italic tracking-tight select-none">VISA</span>
            <span className="flex items-center select-none">
              <span className="w-6 h-6 rounded-full bg-red-500 inline-block" />
              <span className="w-6 h-6 rounded-full bg-orange-400 inline-block -ml-3 opacity-90" />
            </span>
            <span className="bg-[#0067FF] text-white text-[11px] font-black px-2.5 py-0.5 rounded-md select-none tracking-tight">wave</span>
            <span className="bg-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md select-none">Orange Money</span>
            <span className="bg-yellow-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-md select-none">MTN Money</span>
            <span className="bg-blue-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md select-none">Moov Money</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Crypté SSL · 3D Secure
          </div>
        </div>
      </section>

      {/* ── BANDE DE CONFIANCE ──────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-[#CC0000] to-[#990000] rounded-2xl px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6 text-white shadow-lg shadow-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black leading-none">25 000+</p>
              <p className="text-[11px] text-white/80 mt-0.5">Clients satisfaits</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
            </div>
            <div>
              <p className="text-xl font-black leading-none">4.9 / 5</p>
              <p className="text-[11px] text-white/80 mt-0.5">Note moyenne</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black leading-none">50+ pays</p>
              <p className="text-[11px] text-white/80 mt-0.5">Livraison mondiale</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black leading-none">100%</p>
              <p className="text-[11px] text-white/80 mt-0.5">Paiement sécurisé</p>
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
            <Link to="/shop?promo=true" className="text-sm font-bold text-[#CC0000] hover:underline flex items-center gap-1">
              Voir toutes les offres <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)
            ) : (promoProducts.length === 0 ? (
              <p className="col-span-5 text-center text-gray-400 py-8 text-sm">Aucune offre disponible pour le moment.</p>
            ) : promoProducts.slice(0, 5).map((p, i) => {
              const discountPct = (p as any).discount_pct || 30;
              const promoPrice = parseFloat((p.price * (1 - discountPct / 100)).toFixed(2));
              return (
                <TranslatedProductCard
                  key={p.id}
                  product={{ ...p, price: promoPrice, original_price: p.price }}
                  badge={i === 0 ? 'hot' : 'promo'}
                  sold={120 + i * 45}
                />
              );
            }))}
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
              ) : products.slice(5, 9).map((p, i) => (
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
              ) : newProducts.slice(0, 4).map((p) => (
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
          <p className="text-gray-500 max-w-xl mx-auto">Mode, beauté, maison, sport, électronique — des milliers de produits soigneusement sélectionnés, livrés partout dans le monde.</p>
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

      {/* ── TÉMOIGNAGES ─────────────────────────────────────── */}
      <section className="max-w-[1440px] mx-auto px-4 mb-16">
        <div className="text-center mb-10">
          <p className="text-[#CC0000] text-xs font-bold uppercase tracking-widest mb-2">Ils nous font confiance</p>
          <h2 className="text-3xl font-black text-gray-900">Ce que disent <span className="text-[#CC0000]">nos clients</span></h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
            <span className="ml-2 font-black text-gray-900">4.9</span>
            <span className="text-gray-400 text-sm">· 25 000+ avis vérifiés</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Vérifié
                </div>
              </div>
              <div className="relative flex-1">
                <Quote className="absolute -top-1 -left-1 w-6 h-6 text-red-100" />
                <p className="text-sm text-gray-600 leading-relaxed pl-4 italic">"{t.text}"</p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CC0000]/20 to-[#CC0000]/5 flex items-center justify-center text-sm font-black text-[#CC0000] shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Garantie satisfait ou remboursé */}
        <div className="mt-10 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-xl font-black">Satisfait ou Remboursé</p>
              <p className="text-white/70 text-sm mt-1">30 jours pour changer d'avis. Aucune question posée.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-8 text-center">
            <div>
              <p className="text-2xl font-black text-emerald-400">30j</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wide">Retours gratuits</p>
            </div>
            <div>
              <p className="text-2xl font-black text-yellow-300">24h</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wide">Réponse support</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-300">100%</p>
              <p className="text-[11px] text-white/60 uppercase tracking-wide">Discret</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
      
    </div>
  );
}