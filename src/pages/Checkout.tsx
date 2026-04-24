import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, Trash2, Loader2, Smartphone, X, ChevronRight, MapPin, Mail, Phone, User, Minus, Plus } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function Checkout() {
  const navigate = useNavigate();
  const { items, total, removeItem, clearCart, updateQuantity } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
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
      toast.error('Votre panier est vide');
      return;
    }
    if (!formData.prenom || !formData.nom || !formData.email || !formData.adresse || !formData.telephone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setIsLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({ product_id: item.id, quantity: item.quantity })),
        customer: { 
          email: formData.email, 
          first_name: formData.prenom, 
          last_name: formData.nom, 
          phone: `${formData.indicatif} ${formData.telephone}` 
        },
        shipping: { 
          address: formData.adresse, 
          city: formData.ville, 
          postal: formData.codePostal, 
          country: formData.pays 
        }
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
      if (!order_id) throw new Error('ID commande manquant');
      
      localStorage.setItem('pending_order_id', order_id);
      setOrderId(order_id);
      setShowPaymentModal(true);
    } catch (error: any) {
      toast.error(`Une erreur est survenue: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const payWithPaypal = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const paypalRes = await fetch(`${API_URL}/pay/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });
      if (!paypalRes.ok) {
        const error = await paypalRes.json();
        throw new Error(error.error || 'Erreur PayPal');
      }
      const { approval_url, paypal_order_id } = await paypalRes.json();
      if (approval_url) {
        window.location.href = approval_url;
      } else if (paypal_order_id) {
        window.location.href = `https://www.paypal.com/checkoutnow?token=${paypal_order_id}`;
      } else {
        throw new Error('URL PayPal manquante');
      }
    } catch (error: any) {
      toast.error(`Erreur PayPal: ${error.message}`);
      setIsLoading(false);
    }
  };

  const payWithDunyaPay = async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      const dunyaRes = await fetch(`${API_URL}/paydunya/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order_id: orderId, 
          origin: window.location.origin,
          customer: { 
            email: formData.email, 
            phone: `${formData.indicatif}${formData.telephone}`, 
            first_name: formData.prenom, 
            last_name: formData.nom 
          } 
        })
      });
      if (!dunyaRes.ok) {
        const error = await dunyaRes.json();
        throw new Error(error.error || 'Erreur DunyaPay');
      }
      const { checkout_url } = await dunyaRes.json();
      if (checkout_url) {
        window.location.href = checkout_url;
      } else {
        throw new Error('URL DunyaPay manquante');
      }
    } catch (error: any) {
      toast.error(`Erreur DunyaPay: ${error.message}`);
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] bg-[#F5F5F5] flex items-center justify-center p-4">
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trash2 className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-gray-500 mb-8 font-medium">Votre panier est vide</p>
          <button 
            onClick={() => navigate('/shop')} 
            className="btn-sensual w-full rounded-2xl py-4"
          >
            Retour aux achats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-10 px-4">
      <SEO title="Paiement Sécurisé" description="Finalisez votre commande LuxeSensuel. Paiement 100% sécurisé SSL, livraison discrète." noindex={true} />
      <div className="max-w-6xl mx-auto">
        
        {/* Breadcrumb / Back Link */}
        <button 
          onClick={() => navigate('/cart')} 
          className="group flex items-center gap-2 mb-8 text-sm font-bold text-gray-400 hover:text-[#CC0000] transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Retour au panier
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* GAUCHE - Formulaire de livraison */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-[#CC0000]" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-gray-900 leading-tight">Informations de livraison</h1>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">Étape 1 sur 2 : Vos coordonnées</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                    <input 
                      type="text" placeholder="Prénom *" required disabled={isLoading} 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                      value={formData.prenom} onChange={(e) => setFormData({...formData, prenom: e.target.value})} 
                    />
                  </div>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                    <input 
                      type="text" placeholder="Nom *" required disabled={isLoading} 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                      value={formData.nom} onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input 
                    type="email" placeholder="Email *" required disabled={isLoading} 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>

                <div className="flex gap-4">
                  <div className="w-32 shrink-0">
                    <select 
                      value={formData.indicatif} disabled={isLoading} 
                      onChange={(e) => setFormData({...formData, indicatif: e.target.value})} 
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-black appearance-none"
                    >
                      <option value="+225">🇨🇮 +225</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                    </select>
                  </div>
                  <div className="flex-1 relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                    <input 
                      type="tel" placeholder="Téléphone *" required disabled={isLoading} 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                      value={formData.telephone} onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <select 
                    value={formData.pays} disabled={isLoading} 
                    onChange={(e) => setFormData({...formData, pays: e.target.value})} 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-bold appearance-none"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>

                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input 
                    type="text" placeholder="Adresse complète *" required disabled={isLoading} 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                    value={formData.adresse} onChange={(e) => setFormData({...formData, adresse: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <input 
                      type="text" placeholder="Code postal" disabled={isLoading} 
                      className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                      value={formData.codePostal} onChange={(e) => setFormData({...formData, codePostal: e.target.value})} 
                    />
                  </div>
                  <div className="sm:col-span-2 relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                    <input 
                      type="text" placeholder="Ville *" required disabled={isLoading} 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                      value={formData.ville} onChange={(e) => setFormData({...formData, ville: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={isLoading} 
                    className="btn-sensual w-full h-16 rounded-2xl text-base shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                  >
                    {isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        PAYER MAINTENANT
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#CC0000] shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Paiement 100% sécurisé</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Vos informations sont cryptées et protégées par les protocoles de sécurité les plus avancés du marché (SSL 256 bits).</p>
              </div>
            </div>
          </div>

          {/* DROITE - Résumé de la commande */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-28">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 pb-4 border-b border-gray-50">Résumé de commande</h2>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 shrink-0 shadow-sm relative group-hover:scale-105 transition-transform">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1 leading-tight mb-2">{item.name}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 h-8">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 text-gray-400 hover:text-[#CC0000] transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-black text-gray-900 w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 text-gray-400 hover:text-[#CC0000] transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-[#CC0000]">{(item.price * item.quantity).toFixed(2)} €</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Sous-total</span>
                  <span className="text-gray-900 font-bold">{total().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Frais de livraison</span>
                  <span className="text-emerald-600 font-black">GRATUIT</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-black text-gray-900 uppercase tracking-widest text-[10px]">Total TTC</span>
                  <span className="text-3xl font-black text-[#CC0000]">{total().toFixed(2)} €</span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <Truck className="w-5 h-5 text-blue-500" />
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Livraison discrète garantie sous 3-5 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CHOIX PAIEMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowPaymentModal(false)} 
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-[#CC0000]" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">Choisir le paiement</h2>
              <p className="text-gray-500 text-sm">Sélectionnez votre mode de paiement sécurisé pour finaliser votre commande.</p>
            </div>

            <div className="space-y-4">
              {/* DunyaPay */}
              <button 
                onClick={payWithDunyaPay} disabled={isLoading} 
                className="w-full group p-6 border-2 border-emerald-100 bg-emerald-50/50 rounded-3xl hover:border-emerald-500 hover:bg-white transition-all flex items-center gap-5 relative overflow-hidden"
              >
                <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-gray-900 text-lg">DunyaPay</p>
                    <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Mobile Money</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">Orange, MTN, Wave, Moov + Carte bancaire</p>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* PayPal */}
              <button 
                onClick={payWithPaypal} disabled={isLoading} 
                className="w-full group p-6 border-2 border-blue-100 bg-blue-50/50 rounded-3xl hover:border-blue-500 hover:bg-white transition-all flex items-center gap-5 relative overflow-hidden"
              >
                <div className="w-14 h-14 bg-[#0070ba] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-gray-900 text-lg">PayPal</p>
                    <span className="text-[9px] font-black bg-[#0070ba] text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">International</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">Cartes bancaires internationales (Visa, Mastercard, etc.)</p>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {isLoading && (
              <div className="mt-8 flex items-center justify-center gap-3 text-gray-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection sécurisée...
              </div>
            )}

            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Transactions 100% sécurisées
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}