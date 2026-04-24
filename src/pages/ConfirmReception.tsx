import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, PackageCheck, Star, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function ConfirmReception() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!token) { 
      setState('error'); 
      return; 
    }
    fetch(`${BASE_URL}/orders/confirm/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOrderNumber(data.order_number);
          setState('success');
          toast.success("Réception confirmée ! Merci.");
        } else {
          setState('error');
        }
      })
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] flex items-center justify-center p-6 relative overflow-hidden">
      <SEO title="Confirmation de Réception" description="Confirmez la réception de votre commande LuxeSensuel." noindex={true} />
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 md:p-14 max-w-lg w-full text-center relative z-10">
        
        {state === 'loading' && (
          <div className="py-10">
            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Loader2 size={40} className="text-[#CC0000] animate-spin" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-widest">Vérification</h2>
            <p className="text-gray-400 text-sm font-medium">Nous validons votre confirmation de réception...</p>
          </div>
        )}

        {state === 'success' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
              <PackageCheck size={48} className="text-emerald-500" />
            </div>
            
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#CC0000] font-black mb-4">
              Réception confirmée
            </p>
            
            <h1 className="text-3xl font-[Cormorant_Garamond] font-semibold text-gray-900 mb-6">
              Merci pour votre confiance !
            </h1>
            
            {orderNumber && (
              <div className="inline-block bg-gray-50 px-6 py-2 rounded-full border border-gray-100 mb-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Commande <span className="text-gray-900 font-black">#{orderNumber}</span>
                </p>
              </div>
            )}
            
            <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
              Nous sommes ravis que vos articles Luxe Dropshoping vous soient parvenus. 
              Votre satisfaction est notre plus grande récompense.
            </p>

            {/* Évaluation */}
            <div className="bg-gray-50 rounded-[2rem] p-8 mb-10 border border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                ✦ Comment évaluez-vous votre expérience ?
              </p>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-all hover:scale-125 active:scale-95"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-4 animate-in slide-in-from-top-2">
                  Merci pour votre note !
                </p>
              )}
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn-sensual w-full h-16 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              Retour à la boutique
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-sm">
              <XCircle size={48} className="text-[#CC0000]" />
            </div>
            
            <h2 className="text-3xl font-[Cormorant_Garamond] font-semibold text-gray-900 mb-4">
              Lien invalide
            </h2>
            
            <p className="text-gray-400 text-sm font-medium mb-10 leading-relaxed">
              Ce lien a déjà été utilisé ou n'est plus valide.<br />
              Notre équipe est à votre disposition si vous avez la moindre question.
            </p>
            
            <div className="space-y-4">
              <a
                href="mailto:luxesensuel11@gmail.com"
                className="flex items-center justify-center gap-3 w-full bg-gray-50 text-gray-900 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
              >
                <Mail size={16} className="text-[#CC0000]" />
                Contact Support
              </a>
              
              <button
                onClick={() => navigate('/')}
                className="w-full border-2 border-gray-100 text-gray-400 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#CC0000]/20 hover:text-[#CC0000] transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
          <ShieldCheck size={16} className="text-emerald-500" />
          Sécurisé par Luxe Dropshoping
        </div>

      </div>
    </div>
  );
}