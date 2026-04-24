/**
 * Popup de bienvenue avec code promo -10%
 * S'affiche une seule fois après 5 secondes pour les nouveaux visiteurs
 */
import { useState, useEffect } from 'react';
import { X, Gift, Copy, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const PROMO_CODE = 'BIENVENUE10';
const STORAGE_KEY = 'luxe_welcome_shown';
const DELAY_MS = 5000;

export function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const alreadyShown = localStorage.getItem(STORAGE_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMO_CODE);
    setCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Merci ! Votre code -10% est activé.', {
        description: `Code envoyé à ${email}`,
      });
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem('luxe_promo_email', email);
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header gradient */}
        <div className="bg-gradient-to-br from-[#CC0000] to-[#8B0000] p-8 pb-12 text-center relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 text-6xl">✨</div>
            <div className="absolute bottom-4 right-8 text-4xl">🎁</div>
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              -10% OFFERTS
            </h2>
            <p className="text-white/80 text-sm">
              Sur votre première commande
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 -mt-4 relative">
          <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-center border-2 border-dashed border-gray-200">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Votre code exclusif
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-black text-[#CC0000] tracking-wider font-[Montserrat]">
                {PROMO_CODE}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:border-[#CC0000] hover:bg-red-50 transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Votre email pour recevoir le code"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all"
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#CC0000] text-white font-bold text-sm hover:bg-[#aa0000] transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Activer ma réduction -10%
            </button>
          </form>

          <p className="text-[10px] text-gray-400 text-center mt-4">
            En continuant, vous acceptez de recevoir nos offres exclusives.
            Désabonnement en 1 clic.
          </p>
        </div>
      </div>
    </div>
  );
}
