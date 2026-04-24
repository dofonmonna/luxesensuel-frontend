import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { RotateCcw, Package, Mail, Clock, ShieldCheck, CheckCircle } from 'lucide-react';

export function Retours() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-16 px-4">
      <SEO title="Politique de Retours & Remboursements" description="Politique de retour LuxeSensuel : 30 jours pour retourner vos articles. Processus simple et rapide." />
      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-gray-400 mb-8 flex gap-2">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900">Retours & Remboursements</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#CC0000] to-[#8B0000] rounded-3xl p-8 md:p-14 text-center text-white mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Satisfait ou Remboursé</h1>
          <p className="text-white/80 text-lg">30 jours pour changer d'avis</p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-8">Comment retourner un article ?</h2>
          
          <div className="space-y-6">
            {[
              { icon: <Mail className="w-5 h-5" />, step: '1', title: 'Contactez-nous', desc: 'Envoyez un email à luxesensuel11@gmail.com avec votre numéro de commande et la raison du retour.' },
              { icon: <Package className="w-5 h-5" />, step: '2', title: 'Préparez votre colis', desc: 'Emballez soigneusement l\'article dans son emballage d\'origine. Les produits doivent être non utilisés et en parfait état.' },
              { icon: <Clock className="w-5 h-5" />, step: '3', title: 'Expédiez le retour', desc: 'Envoyez le colis à l\'adresse indiquée dans notre email de confirmation. Les frais de retour sont à votre charge.' },
              { icon: <CheckCircle className="w-5 h-5" />, step: '4', title: 'Remboursement', desc: 'Le remboursement est effectué sous 14 jours après réception et vérification de l\'article retourné, via le même moyen de paiement.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-[#CC0000]">
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded">ÉTAPE {item.step}</span>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-6">Conditions</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>Les articles doivent être retournés dans les <strong>30 jours</strong> suivant la réception.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>Les articles doivent être en <strong>parfait état</strong>, non utilisés et dans leur emballage d'origine.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>Pour des raisons d'hygiène, les <strong>articles d'hygiène intime descellés</strong> ne sont pas éligibles au retour.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>Les <strong>coffrets cadeaux ouverts</strong> et articles personnalisés ne sont pas remboursables.</p>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>En cas de <strong>produit défectueux ou erreur de livraison</strong>, les frais de retour sont pris en charge par LuxeSensuel.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
