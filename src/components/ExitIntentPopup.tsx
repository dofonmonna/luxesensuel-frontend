/**
 * Popup Exit-Intent — S'affiche quand l'utilisateur veut quitter la page
 * Offre -15% supplémentaire pour retenir le client
 */
import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, Copy, Check, Timer } from 'lucide-react';
import { toast } from 'sonner';

const EXIT_CODE = 'RESTEZ15';
const STORAGE_KEY = 'luxe_exit_shown';

export function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    // Détecter quand la souris sort par le haut (intention de quitter)
    if (e.clientY <= 5) {
      const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
      if (alreadyShown) return;

      setVisible(true);
      sessionStorage.setItem(STORAGE_KEY, 'true');
    }
  }, []);

  useEffect(() => {
    // Attendre 10s avant d'activer la détection
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleClose = () => setVisible(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(EXIT_CODE);
    setCopied(true);
    toast.success('Code copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-center relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-6 text-5xl">⏰</div>
            <div className="absolute bottom-2 right-6 text-3xl">💸</div>
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <AlertTriangle className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              ATTENDEZ !
            </h2>
            <p className="text-white/90 text-lg font-bold">
              -15% SUPPLÉMENTAIRES
            </p>
            <p className="text-white/70 text-xs mt-1">
              Offre exclusive valable 30 minutes
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-center text-sm text-gray-600 mb-6 leading-relaxed">
            Ne partez pas les mains vides ! Utilisez ce code <strong>avant qu'il n'expire</strong> pour profiter de 15% de réduction immédiate.
          </p>

          <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-center border-2 border-dashed border-orange-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-orange-500 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                Expire dans 30 minutes
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-black text-[#CC0000] tracking-wider">
                {EXIT_CODE}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg bg-white border border-orange-200 hover:border-[#CC0000] hover:bg-red-50 transition-all"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                handleCopy();
                handleClose();
              }}
              className="flex-1 py-3 rounded-xl bg-[#CC0000] text-white font-bold text-sm hover:bg-[#aa0000] transition-all shadow-lg shadow-red-100"
            >
              Utiliser mon -15%
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 rounded-xl border border-gray-200 text-gray-400 text-sm hover:bg-gray-50 transition-all"
            >
              Non merci
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
