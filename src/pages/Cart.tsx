import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../hooks/useCart';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '48px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <ShoppingBag style={{ margin: '0 auto 16px', color: '#ccc' }} size={64} />
          <p style={{ color: '#666', fontSize: '18px', marginBottom: '24px' }}>Votre panier est vide</p>
          <button
            onClick={() => navigate('/shop')}
            style={{ background: '#ff4747', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            Continuer mes achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        
        {/* GAUCHE - Liste des articles */}
        <div style={{ flex: 1, background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag color="#ff4747" size={24} />
            Panier ({items.length})
          </h1>

          {/* Bouton tout sélectionner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #ff4747', background: '#ff4747', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={14} color="white" />
            </div>
            <span style={{ fontSize: '14px', color: '#333' }}>Tous les articles sélectionnés</span>
            <button 
              onClick={clearCart}
              style={{ marginLeft: 'auto', color: '#ff4747', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
            >
              Vider le panier
            </button>
          </div>

          {items.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              {/* Checkbox */}
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #ff4747', background: '#ff4747', flexShrink: 0, marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={14} color="white" />
              </div>

              {/* Image PETITE 80x80 */}
              <div style={{ width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              {/* Infos */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', color: '#333', marginBottom: '6px', lineHeight: '1.4' }}>
                  {item.name}
                </h3>
                <p style={{ color: '#ff4747', fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>
                  {item.price.toFixed(2)} €
                </p>
                
                {/* Quantité */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    style={{ width: '28px', height: '28px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ width: '32px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{ width: '28px', height: '28px', border: '1px solid #ddd', borderRadius: '4px', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Prix total + Supprimer */}
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>
                  {(item.price * item.quantity).toFixed(2)} €
                </p>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ color: '#999', background: 'none', border: 'none', cursor: 'pointer', marginTop: '8px' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* DROITE - Résumé */}
        <div style={{ width: '350px', flexShrink: 0, background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>Résumé</h2>
          
          {/* Miniatures TOUT PETITES 48x48 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {items.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #eee' }}>
                  <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ff4747',
                  color: 'white',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.quantity}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: '#666' }}>Sous-total ({items.length} articles)</span>
              <span>{total().toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#22c55e' }}>
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div style={{ borderTop: '2px solid #eee', paddingTop: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Total</span>
                <span style={{ fontSize: '24px', color: '#ff4747', fontWeight: 'bold' }}>{total().toFixed(2)} €</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              style={{ width: '100%', background: '#ff4747', color: 'white', padding: '16px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Commander
              <ArrowRight size={20} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#666' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} color="#22c55e" />
                <span>Paiement 100% sécurisé</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={14} color="#22c55e" />
                <span>Livraison discrète</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}