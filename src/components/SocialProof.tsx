/**
 * Social Proof - Notifications d'achat en temps réel (simulées)
 * Affiche des toasts "Sophie de Paris vient d'acheter..." toutes les 30s
 */
import { useEffect, useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';

const FAKE_BUYERS = [
  { name: 'Sophie', city: 'Paris', country: '🇫🇷' },
  { name: 'Marie', city: 'Lyon', country: '🇫🇷' },
  { name: 'Sarah', city: 'Bruxelles', country: '🇧🇪' },
  { name: 'Emma', city: 'Montréal', country: '🇨🇦' },
  { name: 'Léa', city: 'Genève', country: '🇨🇭' },
  { name: 'Amina', city: 'Abidjan', country: '🇨🇮' },
  { name: 'Fatou', city: 'Dakar', country: '🇸🇳' },
  { name: 'Clara', city: 'Madrid', country: '🇪🇸' },
  { name: 'Giulia', city: 'Milan', country: '🇮🇹' },
  { name: 'Anna', city: 'Berlin', country: '🇩🇪' },
  { name: 'Lisa', city: 'Amsterdam', country: '🇳🇱' },
  { name: 'Chloe', city: 'London', country: '🇬🇧' },
  { name: 'Yuki', city: 'Tokyo', country: '🇯🇵' },
  { name: 'Aïcha', city: 'Casablanca', country: '🇲🇦' },
  { name: 'Nadia', city: 'Douala', country: '🇨🇲' },
];

const FAKE_PRODUCTS = [
  'Ensemble Lingerie Satin',
  'Huile de Massage Premium',
  'Parfum Sensuel Nuit',
  'Coffret Bien-être Deluxe',
  'Nuisette Soie Bordeaux',
  'Set Bijoux Dorés',
  'Bougie Parfumée Rose',
  'Crème Corporelle Velvet',
];

const INTERVALS = [25000, 35000, 45000, 30000, 40000];

export function SocialProofToast() {
  const [notification, setNotification] = useState<{
    buyer: typeof FAKE_BUYERS[0];
    product: string;
    time: string;
  } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const showNotification = () => {
      const buyer = FAKE_BUYERS[Math.floor(Math.random() * FAKE_BUYERS.length)];
      const product = FAKE_PRODUCTS[Math.floor(Math.random() * FAKE_PRODUCTS.length)];
      const minutes = Math.floor(Math.random() * 15) + 1;

      setNotification({ buyer, product, time: `il y a ${minutes} min` });
      setVisible(true);

      setTimeout(() => setVisible(false), 5000);

      const nextInterval = INTERVALS[Math.floor(Math.random() * INTERVALS.length)];
      timeoutId = setTimeout(showNotification, nextInterval);
    };

    // Premier affichage après 15s
    timeoutId = setTimeout(showNotification, 15000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!notification || !visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[150] animate-in slide-in-from-left duration-500 max-w-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-gray-900 leading-snug">
            {notification.buyer.country} {notification.buyer.name} de {notification.buyer.city}
          </p>
          <p className="text-[11px] text-gray-500 leading-snug mt-0.5">
            vient d'acheter <span className="font-semibold text-[#CC0000]">{notification.product}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            {notification.time}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-300 hover:text-gray-500 transition-colors p-0.5"
        >
          <span className="text-xs">✕</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Badge "X personnes regardent ce produit" pour la page ProductDetail
 */
export function ViewersCount({ productId }: { productId: string }) {
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    // Générer un nombre pseudo-aléatoire basé sur l'ID produit
    const base = productId.charCodeAt(0) % 20;
    setViewers(base + Math.floor(Math.random() * 10) + 3);

    // Fluctuation légère toutes les 10s
    const interval = setInterval(() => {
      setViewers(prev => {
        const delta = Math.random() > 0.5 ? 1 : -1;
        return Math.max(2, Math.min(prev + delta, 40));
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg font-medium">
      <Eye className="w-3.5 h-3.5 animate-pulse" />
      <span><strong>{viewers} personnes</strong> regardent ce produit</span>
    </div>
  );
}

/**
 * Badge stock faible pour urgence
 */
export function LowStockBadge({ stock }: { stock: number }) {
  if (stock > 10) return null;
  
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      {stock <= 3
        ? `Plus que ${stock} en stock !`
        : `Stock limité — ${stock} restants`}
    </div>
  );
}
