import { CheckCircle, Mail, PackageCheck, ShoppingBag, Truck, Home, ShieldCheck, ArrowRight, ChevronRight, Star } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SEO } from '@/components/SEO';

export function Confirmation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderNumber = params.get('order');
  const method = params.get('method');
  const { clearCart, items, totalPrice } = useCart();
  const { trackPurchase } = useAnalytics();

  // Vider le panier + Track Purchase
  useEffect(() => {
    clearCart();

    // 📊 Track Purchase (événement le plus important !)
    if (orderNumber) {
      trackPurchase({
        id: orderNumber,
        orderNumber: orderNumber,
        total: totalPrice,
        currency: 'EUR',
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
        })),
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <SEO title="Commande Confirmée" description="Votre commande LuxeSensuel a été confirmée avec succès." noindex={true} />

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="max-w-4xl w-full relative z-10">
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-8 md:p-14 overflow-hidden relative">

          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-emerald-50 shadow-sm animate-in zoom-in duration-500">
              <CheckCircle size={48} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CC0000] mb-4">
              Commande confirmée avec succès
            </p>
            <h1 className="font-[Cormorant_Garamond] text-4xl md:text-5xl font-semibold text-gray-900 mb-6">
              Merci pour votre confiance !
            </h1>
            <p className="text-gray-400 text-sm font-medium max-w-2xl mx-auto leading-relaxed">
              Votre commande est désormais entre nos mains expertes.
              Préparez-vous à vivre l'expérience Luxe Dropshoping très prochainement.
            </p>
          </div>

          {/* Référence et méthode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="rounded-[2rem] bg-gray-50 border border-gray-100 p-8 text-center hover:bg-white hover:shadow-xl hover:shadow-red-500/5 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">N° Commande</p>
              <p className="text-xl font-black text-gray-900">{orderNumber ? `#${orderNumber}` : 'EN COURS'}</p>
            </div>
            <div className="rounded-[2rem] bg-gray-50 border border-gray-100 p-8 text-center hover:bg-white hover:shadow-xl hover:shadow-red-500/5 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Paiement</p>
              <p className="text-sm font-black text-gray-900 uppercase">
                {method === 'mobile' ? 'Mobile Money' : method === 'card' ? 'Carte bancaire' : 'Confirmé'}
              </p>
            </div>
            <div className="rounded-[2rem] bg-gray-50 border border-gray-100 p-8 text-center hover:bg-white hover:shadow-xl hover:shadow-red-500/5 transition-all">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Statut Actuel</p>
              <p className="text-sm font-black text-emerald-500 uppercase flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Traitement
              </p>
            </div>
          </div>

          {/* Processus */}
          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[
              {
                icon: <Mail size={24} className="text-blue-500" />,
                title: 'Email envoyé',
                desc: 'Un récapitulatif complet vous a été envoyé avec votre numéro de suivi.',
                bg: 'bg-blue-50'
              },
              {
                icon: <Truck size={24} className="text-[#CC0000]" />,
                title: 'Préparation',
                desc: 'Expédition sous 24-48h dans un emballage totalement discret.',
                bg: 'bg-red-50'
              },
              {
                icon: <PackageCheck size={24} className="text-emerald-500" />,
                title: 'Livraison',
                desc: 'Livraison estimée sous 3-5 jours. Vous serez notifié par SMS.',
                bg: 'bg-emerald-50'
              }
            ].map((step, i) => (
              <div key={i} className="rounded-[2rem] border border-gray-50 bg-white p-8 hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                <div className={`w-14 h-14 ${step.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-3">{step.title}</h3>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Circuit Visuel */}
          <div className="rounded-[2.5rem] bg-[#111827] p-8 md:p-10 mb-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-20" />

            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-10 flex items-center gap-3">
              <span className="w-8 h-px bg-white/20" /> Circuit de votre commande
            </h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              {[
                { label: 'Commande', color: 'bg-emerald-500', active: true },
                { label: 'Luxe Dropshoping', color: 'bg-[#CC0000]', active: true },
                { label: 'Logistique', color: 'bg-gray-700', active: false },
                { label: 'Expédition', color: 'bg-gray-700', active: false }
              ].map((point, i, arr) => (
                <div key={i} className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full md:w-auto">
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${point.color} flex items-center justify-center shadow-lg ${point.active ? 'shadow-red-500/20' : ''}`}>
                      {point.active ? <CheckCircle size={18} className="text-white" /> : <div className="w-2 h-2 bg-white/20 rounded-full" />}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${point.active ? 'text-white' : 'text-white/20'}`}>
                      {point.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="btn-sensual px-10 h-16 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              <ShoppingBag size={18} />
              Continuer mes achats
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-gray-100 bg-white px-10 h-16 text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000]/20 transition-all active:scale-[0.98]"
            >
              <Home size={18} />
              Retour à l'accueil
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Transaction Sécurisée
            </div>
            <p className="text-[10px] text-gray-400 font-medium">
              Besoin d'aide ? <a href="mailto:luxesensuel11@gmail.com" className="text-[#CC0000] font-black hover:underline">luxesensuel11@gmail.com</a>
            </p>
          </div>
        </div>

        {/* Suggestion Section */}
        <div className="mt-10 bg-[#CC0000] rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-10 group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} className="fill-white" />)}
            </div>
            <h3 className="text-2xl font-black mb-2">Votre avis compte énormément</h3>
            <p className="text-white/70 text-sm max-w-md leading-relaxed">
              Une fois vos articles reçus, partagez votre expérience et profitez de <span className="text-white font-black underline">10% de réduction</span> sur votre prochaine commande.
            </p>
          </div>
          <button className="bg-white text-[#CC0000] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shrink-0 active:scale-95 shadow-lg">
            Laisser un avis
          </button>
        </div>
      </div>
    </div>
  );
}