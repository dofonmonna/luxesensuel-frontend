import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Check, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

export function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 font-[Montserrat]">
        <div className="text-center max-w-md bg-white p-12 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag className="w-12 h-12 text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Votre panier est vide</h2>
          <p className="text-gray-500 mb-10 text-sm leading-relaxed">Découvrez nos collections exclusives et trouvez votre bonheur parmi nos articles de luxe.</p>
          <button
            onClick={() => navigate('/shop')}
            className="btn-sensual w-full py-4 rounded-2xl text-base shadow-lg shadow-red-100"
          >
            Explorer la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
          <ShoppingBag className="w-8 h-8 text-[#CC0000]" />
          Mon Panier <span className="text-[#CC0000] font-normal">({items.length} articles)</span>
        </h1>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 items-start">
          
          {/* List of Items */}
          <div className="lg:col-span-2 w-full space-y-4">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              
              {/* Header selection */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-[#CC0000] rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Tous les articles</span>
                </div>
                <button 
                  onClick={() => {
                    clearCart();
                    toast.info('Le panier a été vidé');
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#CC0000] hover:underline"
                >
                  Vider le panier
                </button>
              </div>

              {/* Items */}
              <div className="space-y-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 md:gap-6 group relative">
                    {/* Checkbox */}
                    <div className="hidden sm:flex items-center shrink-0 pt-2">
                      <div className="w-5 h-5 bg-[#CC0000] rounded-full flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-gray-100 shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-tight hover:text-[#CC0000] transition-colors cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                          {item.name}
                        </h3>
                        <p className="text-lg font-black text-[#CC0000]">{item.price.toFixed(2)} €</p>
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border-2 border-gray-50 rounded-xl overflow-hidden bg-gray-50 shadow-sm w-fit">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="p-2.5 hover:bg-white transition-colors text-gray-400 hover:text-[#CC0000]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-xs font-black text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2.5 hover:bg-white transition-colors text-gray-400 hover:text-[#CC0000]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Article retiré du panier');
                          }}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal Item (Desktop) */}
                    <div className="hidden sm:block text-right self-center min-w-[100px]">
                      <p className="text-sm font-black text-gray-900">{(item.price * item.quantity).toFixed(2)} €</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations or Message */}
            <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#CC0000] shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">Paiement 100% sécurisé</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Vos transactions sont protégées par le cryptage SSL 256 bits le plus sécurisé du marché.</p>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="w-full lg:col-span-1 space-y-6 lg:sticky lg:top-32">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-8 uppercase tracking-widest text-xs border-b border-gray-50 pb-4">Résumé de commande</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Sous-total</span>
                  <span className="text-gray-900">{total().toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-gray-400">Livraison</span>
                  <span className="text-emerald-500 font-bold">Gratuite</span>
                </div>
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base font-black text-gray-900">Total TTC</span>
                  <span className="text-3xl font-black text-[#CC0000]">{total().toFixed(2)} €</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="btn-sensual w-full h-16 rounded-2xl text-base shadow-xl shadow-red-200 group active:scale-95 transition-all"
              >
                Passer à la commande
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Livraison discrète garantie</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <RotateCcw className="w-4 h-4 text-orange-500" />
                  <span>Retours gratuits sous 30 jours</span>
                </div>
              </div>
            </div>

            {/* Coupons / Promo (Optional) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3">Code Promo</p>
              <div className="flex gap-2">
                <input type="text" placeholder="Entrez votre code" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#CC0000] transition-colors" />
                <button className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors uppercase tracking-widest">Appliquer</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}