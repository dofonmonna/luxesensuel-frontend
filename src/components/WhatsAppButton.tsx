/**
 * Bouton WhatsApp flottant pour support client
 * Visible sur toutes les pages, position bas droite
 */
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '2250505409595';
const DEFAULT_MESSAGE = 'Bonjour LuxeSensuel ! J\'ai une question sur vos produits.';

export function WhatsAppButton() {
  const [tooltip, setTooltip] = useState(false);

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-20 right-4 z-[100] flex flex-col items-end gap-2">
      {/* Tooltip */}
      {tooltip && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-[220px] animate-in slide-in-from-right duration-300">
          <button
            onClick={() => setTooltip(false)}
            className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="text-xs font-bold text-gray-900 mb-1">Besoin d'aide ?</p>
          <p className="text-[11px] text-gray-500 leading-snug">
            Notre équipe répond en moins de 5 min sur WhatsApp !
          </p>
        </div>
      )}

      {/* Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        className="w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Contactez-nous sur WhatsApp"
      >
        <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
