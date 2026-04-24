import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export function Confidentialite() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-16 px-4">
      <SEO title="Politique de Confidentialité" description="Découvrez comment LuxeSensuel protège vos données personnelles. Politique conforme au RGPD." />
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100">
        <nav className="text-xs text-gray-400 mb-8 flex gap-2">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900">Politique de Confidentialité</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 mb-10">Politique de Confidentialité</h1>
        <p className="text-xs text-gray-400 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Données d'identification</strong> : nom, prénom, email, téléphone</li>
              <li><strong>Données de livraison</strong> : adresse postale, ville, code postal, pays</li>
              <li><strong>Données de navigation</strong> : pages visitées, produits consultés, durée de visite</li>
              <li><strong>Données de paiement</strong> : traitées directement par nos prestataires sécurisés (PayPal, PayDunya) — nous ne stockons jamais vos données bancaires</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Finalités du traitement</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Traitement et suivi de vos commandes</li>
              <li>Communication concernant vos achats (confirmations, suivi)</li>
              <li>Amélioration de nos services et de votre expérience</li>
              <li>Envoi d'offres commerciales (avec votre consentement)</li>
              <li>Analyse statistique anonymisée du trafic</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Durée de conservation</h2>
            <p>Vos données sont conservées pendant la durée strictement nécessaire à la finalité du traitement. Les données de commande sont conservées 5 ans à des fins comptables. Les données de navigation sont anonymisées au bout de 13 mois.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Partage des données</h2>
            <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Prestataires de paiement</strong> : PayPal, PayDunya (traitement sécurisé)</li>
              <li><strong>Services de livraison</strong> : pour l'acheminement de vos commandes</li>
              <li><strong>Outils d'analyse</strong> : Google Analytics (données anonymisées)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Vos droits (RGPD)</h2>
            <p>Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
              <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
              <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
              <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format lisible</li>
              <li><strong>Droit d'opposition</strong> : vous opposer au traitement à des fins marketing</li>
            </ul>
            <p className="mt-3">Pour exercer vos droits, contactez-nous à : <strong>luxesensuel11@gmail.com</strong></p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cookies</h2>
            <p>Notre site utilise des cookies essentiels au fonctionnement (panier, préférences de langue/devise) et des cookies analytiques (Google Analytics). Vous pouvez configurer vos préférences via la bannière de consentement affichée lors de votre première visite.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Sécurité</h2>
            <p>Nous mettons en œuvre toutes les mesures techniques et organisationnelles appropriées pour protéger vos données : chiffrement SSL/TLS, accès restreints, surveillance des systèmes.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
