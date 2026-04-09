import { CheckCircle, Mail, PackageCheck, ShoppingBag, Truck, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../hooks/useCart';

export default function Confirmation() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderNumber = params.get('order');
  const method = params.get('method');
  const { clearCart } = useCart();

  // Vider le panier à l'arrivée sur cette page
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 text-gray-900 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <p className="text-sm uppercase tracking-widest text-orange-500 font-semibold mb-3">
              Commande validée
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Merci pour votre commande !
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Votre paiement a été reçu et votre commande est en cours de préparation. 
              Vous recevrez un email de confirmation avec les détails de suivi.
            </p>
          </div>

          {/* Référence et méthode */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Numéro de commande</p>
              <p className="text-2xl font-bold text-gray-900">{orderNumber ? `#${orderNumber}` : 'En cours'}</p>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Mode de paiement</p>
              <p className="text-lg font-medium text-gray-900">{method === 'mobile' ? 'Mobile Money' : method === 'card' ? 'Carte bancaire' : 'Paiement à la livraison'}</p>
            </div>
            <div className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-6">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Statut</p>
              <p className="text-lg font-medium text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Confirmée
              </p>
            </div>
          </div>

          {/* Processus */}
          <div className="grid gap-4 md:grid-cols-3 mb-10">
            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Un récapitulatif complet vous a été envoyé par email avec votre numéro de suivi.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Truck size={24} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Préparation</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Votre commande est préparée avec soin et expédiée sous 24-48h en emballage discret.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <PackageCheck size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Livraison</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Livraison estimée sous 3-5 jours ouvrés. Vous recevrez un SMS quand le colis arrive.
              </p>
            </div>
          </div>

          {/* Circuit : Client → Moi → Fournisseur → Expédition */}
          <div className="rounded-xl bg-orange-50 border border-orange-200 p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
              Circuit de votre commande
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium">Vous (Commande)</span>
              </div>
              <span className="hidden md:block text-gray-400">→</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                <span className="font-medium">LuxeSensuel (Traitement)</span>
              </div>
              <span className="hidden md:block text-gray-400">→</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="font-medium">Fournisseur</span>
              </div>
              <span className="hidden md:block text-gray-400">→</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span className="font-medium">Expédition</span>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-white font-semibold transition-colors hover:bg-orange-600 shadow-sm"
            >
              <ShoppingBag size={20} />
              Continuer mes achats
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 px-8 py-4 text-gray-700 font-semibold transition-colors hover:bg-gray-50"
            >
              <Home size={20} />
              Retour à l'accueil
            </button>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center text-sm text-gray-500">
            Une question ? Contactez-nous à <a href="mailto:luxesensuel11@gmail.com" className="text-orange-500 hover:underline">luxesensuel11@gmail.com</a>
          </div>
        </div>
      </div>
    </div>
  );
}