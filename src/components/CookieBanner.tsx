/**
 * Bannière de consentement RGPD pour les cookies
 * S'affiche une seule fois, choix stocké dans localStorage
 */
import { useState, useEffect } from 'react';
import { ShieldCheck, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'luxe_cookie_consent';

type ConsentLevel = 'all' | 'essential' | null;

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Afficher après un petit délai pour ne pas gêner le chargement
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (level: ConsentLevel) => {
    localStorage.setItem(STORAGE_KEY, level || 'essential');
    setVisible(false);

    // Si l'utilisateur accepte tout, activer les analytics
    if (level === 'all') {
      // Les scripts analytics sont déjà chargés, on signale le consentement
      window.dispatchEvent(new CustomEvent('cookie-consent', { detail: { analytics: true } }));
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[180] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Icon + Text */}
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Cookie className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Votre vie privée nous tient à cœur
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nous utilisons des cookies essentiels pour le fonctionnement du site (panier, préférences) et des cookies analytiques pour améliorer votre expérience. 
                Consultez notre{' '}
                <Link to="/confidentialite" className="text-[#CC0000] hover:underline font-medium">
                  Politique de Confidentialité
                </Link>{' '}
                pour en savoir plus.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => handleAccept('essential')}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Essentiels uniquement
            </button>
            <button
              onClick={() => handleAccept('all')}
              className="px-5 py-2.5 rounded-xl bg-[#CC0000] text-white text-xs font-bold hover:bg-[#aa0000] transition-all shadow-lg shadow-red-100"
            >
              Tout accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
