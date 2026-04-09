import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Zap, Star, Truck, ShieldCheck, RotateCcw, ChevronRight, Heart } from 'lucide-react';
import { productsApi, type Product } from '../lib/api';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

const money = (v: number) => v.toFixed(2) + ' €';
const getRating = (id: string) => parseFloat((3.8 + ((id.charCodeAt(0) % 12) / 10)).toFixed(1));
const getSold   = (id: string) => 100 + (id.charCodeAt(0) % 900);
const getReviews= (id: string) => 10 + ((id.charCodeAt(1) || 65) % 300);

// Extrait toutes les images src depuis le HTML de description
function extractImages(html: string): string[] {
  if (!html) return [];
  const matches = [...html.matchAll(/src="([^"]+)"/g)];
  return matches.map(m => m[1]).filter(s => s.startsWith('http'));
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct]           = useState<Product | null>(null);
  const [recommendations, setReco]      = useState<Product[]>([]);
  const [quantity, setQuantity]         = useState(1);
  const [loading, setLoading]           = useState(true);
  const [mainImg, setMainImg]           = useState('');
  const [inWish, setInWish]             = useState(false);
  const [activeTab, setActiveTab]       = useState<'desc'|'specs'|'avis'>('desc');

  useEffect(() => {
    let mounted = true;
    Promise.all([productsApi.get(id!), productsApi.list()])
      .then(([p, list]) => {
        if (!mounted) return;
        setProduct(p.product);
        setMainImg(p.product.image);
        setReco(list.products.filter((i: Product) => i.id !== id).slice(0, 12));
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false };
  }, [id]);

  const price    = product ? parseFloat(product.price as any) : 0;
  const oldPrice = +(price * 1.45).toFixed(2);
  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);
  const descImages = product ? extractImages(product.description || '') : [];
  const allThumbs  = product ? [product.image, ...descImages].slice(0, 7) : [];
  const rating     = product ? getRating(product.id) : 4;
  const sold       = product ? getSold(product.id) : 0;
  const reviews    = product ? getReviews(product.id) : 0;

  const handleAdd = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price, image: product.image, quantity });
    toast.success('Ajouté au panier !');
  };

  if (loading) return (
    <div style={{ background: 'white', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#888' }}>
        <div style={{ width: 36, height: 36, border: '3px solid #F0F0F0', borderTopColor: '#CC0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Chargement...
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Produit introuvable</div>
  );

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', fontFamily: "'DM Sans','Roboto',sans-serif" }}>

      {/* ─── BREADCRUMB ─── */}
      <div style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '8px 12px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#888' }}>
          <span style={{ cursor: 'pointer', color: '#CC0000' }} onClick={() => navigate('/')}>Accueil</span>
          <ChevronRight size={12} />
          <span style={{ cursor: 'pointer', color: '#CC0000' }} onClick={() => navigate('/shop')}>Boutique</span>
          <ChevronRight size={12} />
          <span style={{ color: '#333' }}>{product.name.slice(0, 40)}...</span>
        </div>
      </div>

      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '12px' }}>

        {/* ─── MAIN CARD ─── */}
        <div style={{ background: 'white', borderRadius: 8, overflow: 'hidden', display: 'flex', gap: 0, border: '1px solid #F0F0F0' }}>

          {/* LEFT — IMAGES */}
          <div style={{ width: 480, flexShrink: 0, padding: 20 }}>

            {/* Main image */}
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #F0F0F0', marginBottom: 10 }}>
              <img
                src={mainImg}
                alt={product.name}
                style={{ width: '100%', height: 380, objectFit: 'cover', display: 'block' }}
              />
              <span style={{ position: 'absolute', top: 12, left: 12, background: '#CC0000', color: 'white', fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 4 }}>
                -{discount}%
              </span>
              <button
                onClick={() => setInWish(w => !w)}
                style={{ position: 'absolute', top: 12, right: 12, background: 'white', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
              >
                <Heart size={16} fill={inWish ? '#CC0000' : 'none'} color={inWish ? '#CC0000' : '#AAA'} />
              </button>
            </div>

            {/* Thumbnails */}
            {allThumbs.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {allThumbs.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setMainImg(img)}
                    style={{
                      width: 64, height: 64, objectFit: 'cover', borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                      border: mainImg === img ? '2px solid #CC0000' : '2px solid #F0F0F0',
                      opacity: mainImg === img ? 1 : 0.75, transition: 'all 0.15s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — INFO */}
          <div style={{ flex: 1, padding: '24px 28px', borderLeft: '1px solid #F5F5F5' }}>

            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: '0 0 12px', lineHeight: 1.4 }}>
              {product.name}
            </h1>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={13} fill={s <= Math.round(rating) ? '#FFAA00' : 'none'} color={s <= Math.round(rating) ? '#FFAA00' : '#DDD'} />
                ))}
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FFAA00', marginLeft: 4 }}>{rating}</span>
              </div>
              <span style={{ fontSize: 12, color: '#888', borderLeft: '1px solid #E8E8E8', paddingLeft: 12 }}>{reviews} avis</span>
              <span style={{ fontSize: 12, color: '#FF4747', borderLeft: '1px solid #E8E8E8', paddingLeft: 12, fontWeight: 600 }}>🔥 {sold}+ vendus</span>
              <span style={{ fontSize: 12, color: '#00897B', borderLeft: '1px solid #E8E8E8', paddingLeft: 12 }}>🚚 Livraison 5-10 jours</span>
            </div>

            {/* Price block */}
            <div style={{ background: '#FFF8F8', borderRadius: 8, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: '#CC0000' }}>{money(price)}</span>
                <span style={{ fontSize: 16, color: '#BBB', textDecoration: 'line-through' }}>{money(oldPrice)}</span>
                <span style={{ background: '#CC0000', color: 'white', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>-{discount}%</span>
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: '6px 0 0' }}>
                💰 Économisez <strong style={{ color: '#CC0000' }}>{money(oldPrice - price)}</strong> par rapport au prix d'origine
              </p>
            </div>

            {/* Stock */}
            {product.stock > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
                <span style={{ fontSize: 13, color: '#4CAF50', fontWeight: 600 }}>En stock</span>
                <span style={{ fontSize: 12, color: '#888' }}>({product.stock} disponibles)</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF4747' }} />
                <span style={{ fontSize: 13, color: '#FF4747', fontWeight: 600 }}>Épuisé</span>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: '#555', fontWeight: 600, marginBottom: 8 }}>Quantité :</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #E8E8E8', borderRadius: 6, width: 'fit-content', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  style={{ width: 40, height: 40, background: '#F5F5F5', border: 'none', fontSize: 18, cursor: 'pointer', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ width: 52, textAlign: 'center', fontSize: 15, fontWeight: 700, color: '#111', borderLeft: '1px solid #E8E8E8', borderRight: '1px solid #E8E8E8', lineHeight: '40px' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  style={{ width: 40, height: 40, background: '#F5F5F5', border: 'none', fontSize: 18, cursor: 'pointer', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Buttons */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <button
                  onClick={handleAdd}
                  style={{ flex: 1, height: 48, background: 'white', border: '2px solid #CC0000', color: '#CC0000', borderRadius: 6, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
                >
                  <ShoppingCart size={16} /> Ajouter au panier
                </button>
                <button
                  onClick={() => { handleAdd(); navigate('/checkout'); }}
                  style={{ flex: 1, height: 48, background: '#CC0000', border: '2px solid #CC0000', color: 'white', borderRadius: 6, fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }}
                >
                  <Zap size={16} /> Acheter maintenant
                </button>
              </div>
            )}

            {/* Guarantees */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { icon: <Truck size={16} />, label: 'Livraison', sub: '5-10 jours' },
                { icon: <ShieldCheck size={16} />, label: 'Paiement', sub: 'Sécurisé' },
                { icon: <RotateCcw size={16} />, label: 'Retour', sub: '30 jours' },
              ].map((g, i) => (
                <div key={i} style={{ background: '#FAFAFA', border: '1px solid #F0F0F0', borderRadius: 6, padding: '10px', textAlign: 'center' }}>
                  <div style={{ color: '#CC0000', display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{g.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#333' }}>{g.label}</div>
                  <div style={{ fontSize: 10, color: '#888' }}>{g.sub}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ─── TABS : Description / Specs / Avis ─── */}
        <div style={{ background: 'white', borderRadius: 8, marginTop: 12, border: '1px solid #F0F0F0' }}>

          {/* Tab buttons */}
          <div style={{ display: 'flex', borderBottom: '1px solid #F0F0F0' }}>
            {(['desc', 'specs', 'avis'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: '14px 28px', fontSize: 14, fontWeight: activeTab === tab ? 800 : 500, color: activeTab === tab ? '#CC0000' : '#555', borderBottom: activeTab === tab ? '2px solid #CC0000' : '2px solid transparent', background: 'none', border: 'none', borderBottom: activeTab === tab ? '2px solid #CC0000' : '2px solid transparent', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Caractéristiques' : `Avis clients (${reviews})`}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 24px' }}>

            {activeTab === 'desc' && (
              <div>
                {/* Description images from CJ */}
                {descImages.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                    {descImages.map((img, i) => (
                      <img key={i} src={img} alt="" style={{ maxWidth: '100%', display: 'block' }} />
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7 }}>
                    {product.description?.replace(/<[^>]*>/g, '').trim() || 'Aucune description disponible.'}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <tbody>
                  {[
                    ['Référence', product.id.slice(0, 12).toUpperCase()],
                    ['Catégorie', product.category || 'Général'],
                    ['Stock', product.stock > 0 ? `${product.stock} unités` : 'Épuisé'],
                    ['Livraison', '5 à 10 jours ouvrés'],
                    ['Origine', 'International'],
                    ['Garantie', 'Retour 30 jours'],
                  ].map(([k, v], i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#FAFAFA' : 'white' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 600, color: '#555', width: 200 }}>{k}</td>
                      <td style={{ padding: '10px 16px', color: '#333' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'avis' && (
              <div>
                <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, fontWeight: 900, color: '#CC0000' }}>{rating}</div>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 4 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={16} fill={s <= Math.round(rating) ? '#FFAA00' : 'none'} color={s <= Math.round(rating) ? '#FFAA00' : '#DDD'} />)}
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>{reviews} avis</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(s => {
                      const pct = s === 5 ? 62 : s === 4 ? 23 : s === 3 ? 10 : s === 2 ? 3 : 2;
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 12, color: '#888', width: 20 }}>{s}★</span>
                          <div style={{ flex: 1, height: 8, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#FFAA00' }} />
                          </div>
                          <span style={{ fontSize: 12, color: '#888', width: 30 }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 20, border: '1px dashed #E8E8E8', borderRadius: 8 }}>
                  Soyez le premier à laisser un avis sur ce produit.
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ─── TU POURRAIS AUSSI AIMER ─── */}
        <div style={{ background: 'white', borderRadius: 8, marginTop: 12, padding: '16px 20px', border: '1px solid #F0F0F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>🧠 Tu pourrais aussi aimer</span>
            <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#CC0000', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              Voir tout <ChevronRight size={14} />
            </button>
          </div>

          {/* Horizontal grid — 6 cards visible */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
            {recommendations.map(p => {
              const rPrice = parseFloat(p.price as any);
              const rOld   = (rPrice * 1.45).toFixed(2);
              const rDisc  = Math.round(((rPrice * 1.45 - rPrice) / (rPrice * 1.45)) * 100);
              const rRating = getRating(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
                  style={{ cursor: 'pointer', borderRadius: 8, border: '1px solid #F0F0F0', overflow: 'hidden', background: 'white', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  <div style={{ position: 'relative' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                    <span style={{ position: 'absolute', top: 6, left: 6, background: '#FF4747', color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 5px', borderRadius: 3 }}>-{rDisc}%</span>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <p style={{ fontSize: 11, color: '#333', margin: '0 0 4px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4 }}>
                      {[1,2,3,4,5].map(s => <Star key={s} size={8} fill={s <= Math.round(rRating) ? '#FFAA00' : 'none'} color={s <= Math.round(rRating) ? '#FFAA00' : '#DDD'} />)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#CC0000' }}>{rPrice.toFixed(2)}€</span>
                      <span style={{ fontSize: 10, color: '#bbb', textDecoration: 'line-through' }}>{rOld}€</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ─── MOBILE STICKY BOTTOM ─── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #E8E8E8', padding: '10px 16px', display: 'flex', gap: 10 }}>
        <button
          onClick={handleAdd}
          style={{ flex: 1, height: 46, background: 'white', border: '2px solid #CC0000', color: '#CC0000', borderRadius: 6, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Ajouter au panier
        </button>
        <button
          onClick={() => { handleAdd(); navigate('/checkout'); }}
          style={{ flex: 1, height: 46, background: '#CC0000', border: 'none', color: 'white', borderRadius: 6, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Acheter maintenant
        </button>
      </div>

      <div style={{ height: 70 }} />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
