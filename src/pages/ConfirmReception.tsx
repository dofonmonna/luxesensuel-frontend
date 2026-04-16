import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, PackageCheck, Star } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ✅ CHANGEMENT : export default → export function
export function ConfirmReception() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [orderNumber, setOrderNumber] = useState('');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!token) { setState('error'); return; }
    fetch(`${BASE_URL}/orders/confirm/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setOrderNumber(data.order_number);
          setState('success');
        } else {
          setState('error');
        }
      })
      .catch(() => setState('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 max-w-md w-full text-center">
        
        {state === 'loading' && (
          <div className="py-8">
            <Loader2 size={48} className="text-orange-500 animate-spin mx-auto mb-6" />
            <p className="text-gray-600 text-lg">
              Vérification en cours…
            </p>
          </div>
        )}

        {state === 'success' && (
          <div className="py-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageCheck size={40} className="text-green-600" />
            </div>
            
            <p className="text-sm uppercase tracking-widest text-orange-500 font-semibold mb-3">
              Réception confirmée
            </p>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Merci pour votre confiance !
            </h1>
            
            {orderNumber && (
              <p className="text-gray-600 mb-6">
                Commande <span className="font-semibold text-gray-900">#{orderNumber}</span>
              </p>
            )}
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Nous sommes ravis que vous ayez reçu votre commande. 
              Votre satisfaction est notre priorité.
            </p>

            {/* Évaluation */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Comment évaluez-vous votre expérience ?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={28}
                      className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
            >
              Retour à la boutique
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="py-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Lien invalide
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              Ce lien a déjà été utilisé ou n'est plus valide.<br />
              Contactez-nous si vous avez un problème.
            </p>
            
            <a
              href="mailto:luxesensuel11@gmail.com"
              className="block w-full bg-gray-200 text-gray-800 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors mb-4"
            >
              luxesensuel11@gmail.com
            </a>
            
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}