import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, total, removeItem, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    indicatif: '+33',
    pays: 'France',
    adresse: '',
    ville: '',
    codePostal: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    // Validation basique
    if (!formData.prenom || !formData.nom || !formData.email || !formData.adresse || !formData.telephone) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Créer la commande en base de données (statut: pending)
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: total(),
        customerName: `${formData.prenom} ${formData.nom}`,
        email: formData.email,
        phone: `${formData.indicatif} ${formData.telephone}`,
        shippingAddress: {
          street: formData.adresse,
          city: formData.ville,
          postalCode: formData.codePostal,
          country: formData.pays
        },
        status: 'pending'
      };

      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!orderRes.ok) {
        const error = await orderRes.json();
        throw new Error(error.error || 'Erreur création commande');
      }

      const orderResult = await orderRes.json();
      const order_id = orderResult.order?.id || orderResult.order?._id || orderResult.id;

      if (!order_id) {
        throw new Error('ID commande manquant');
      }

      // 2. Créer l'ordre PayPal
      const paypalRes = await fetch(`${API_URL}/pay/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id })
      });

      if (!paypalRes.ok) {
        const error = await paypalRes.json();
        throw new Error(error.error || 'Erreur création paiement PayPal');
      }

      const { approval_url, paypal_order_id } = await paypalRes.json();

      // 3. Sauvegarder l'order_id localement pour la confirmation (optionnel)
      localStorage.setItem('pending_order_id', order_id);

      // 4. Redirection vers PayPal
      if (approval_url) {
        window.location.href = approval_url;
      } else if (paypal_order_id) {
        // Fallback si l'URL n'est pas fournie
        window.location.href = `https://www.paypal.com/checkoutnow?token=${paypal_order_id}`;
      } else {
        throw new Error('URL de paiement manquante');
      }

    } catch (error: any) {
      console.error('Erreur paiement:', error);
      alert(`Une erreur est survenue: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ marginBottom: '20px', color: '#666' }}>Votre panier est vide</p>
          <button 
            onClick={() => navigate('/shop')} 
            style={{ 
              background: '#ff4747', 
              color: 'white', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Retour aux achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <button 
          onClick={() => navigate('/cart')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          <ArrowLeft size={20} />
          Retour au panier
        </button>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* GAUCHE - Formulaire */}
          <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
              Informations de livraison
            </h1>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
              Vos données sont sauvegardées automatiquement
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Prénom *"
                  required
                  disabled={isLoading}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Nom *"
                  required
                  disabled={isLoading}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                />
              </div>

              <input
                type="email"
                placeholder="Email *"
                required
                disabled={isLoading}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />

              {/* Téléphone avec indicatif */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={formData.indicatif}
                  disabled={isLoading}
                  onChange={(e) => setFormData({...formData, indicatif: e.target.value})}
                  style={{ width: '100px', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' }}
                >
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+225">🇨🇮 +225</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+49">🇩🇪 +49</option>
                </select>
                <input
                  type="tel"
                  placeholder="Téléphone *"
                  required
                  disabled={isLoading}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                />
              </div>

              {/* Pays */}
              <select
                value={formData.pays}
                disabled={isLoading}
                onChange={(e) => setFormData({...formData, pays: e.target.value})}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', background: 'white' }}
              >
                <option value="France">France</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Belgique">Belgique</option>
                <option value="Suisse">Suisse</option>
                <option value="Canada">Canada</option>
                <option value="États-Unis">États-Unis</option>
              </select>

              <input
                type="text"
                placeholder="Adresse complète *"
                required
                disabled={isLoading}
                style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
              />

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Code postal *"
                  required
                  disabled={isLoading}
                  style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.codePostal}
                  onChange={(e) => setFormData({...formData, codePostal: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Ville *"
                  required
                  disabled={isLoading}
                  style={{ flex: 2, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
                  value={formData.ville}
                  onChange={(e) => setFormData({...formData, ville: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  background: isLoading ? '#ccc' : '#ff4747',
                  color: 'white',
                  padding: '16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Redirection vers PayPal...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    PAYER MAINTENANT
                  </>
                )}
              </button>

              <p style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
                Vous allez être redirigé vers PayPal pour finaliser le paiement sécurisé
              </p>
            </form>
          </div>

          {/* DROITE - Résumé commande VERTICAL */}
          <div style={{ width: '350px', background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', height: 'fit-content' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: '#333' }}>
              Résumé de la commande
            </h2>

            {/* Liste verticale avec quantité et bouton supprimer */}
            <div style={{ marginBottom: '16px' }}>
              {items.map(item => (
                <div key={item.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px 0',
                  borderBottom: '1px solid #eee',
                  opacity: isLoading ? 0.5 : 1
                }}>
                  {/* Image */}
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee', flexShrink: 0 }}>
                    <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  
                  {/* Infos + Quantité */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', color: '#333', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#ff4747', fontWeight: 'bold', fontSize: '14px' }}>
                        {item.price.toFixed(2)} €
                      </span>
                      <span style={{ background: '#f0f0f0', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                        x{item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Prix total + Bouton supprimer */}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 'bold', fontSize: '14px' }}>
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={isLoading}
                      style={{ 
                        color: '#ff4747', 
                        background: 'none', 
                        border: 'none', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #eee', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: '#666' }}>Sous-total ({items.length} articles)</span>
                <span>{total().toFixed(2)} €</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '14px', color: '#22c55e' }}>
                <span>Livraison</span>
                <span>Gratuite</span>
              </div>
              <div style={{ borderTop: '2px solid #eee', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold' }}>Total</span>
                  <span style={{ fontSize: '24px', color: '#ff4747', fontWeight: 'bold' }}>{total().toFixed(2)} €</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#666' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#22c55e" />
                  <span>Paiement sécurisé SSL</span>
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
    </div>
  );
}