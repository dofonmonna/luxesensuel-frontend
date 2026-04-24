import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export function CGV() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-16 px-4">
      <SEO title="Conditions Générales de Vente" description="Consultez les Conditions Générales de Vente de LuxeSensuel. Informations sur les commandes, livraisons, retours et paiements." />
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100">
        <nav className="text-xs text-gray-400 mb-8 flex gap-2">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900">CGV</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 mb-10">Conditions Générales de Vente</h1>
        <p className="text-xs text-gray-400 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Objet</h2>
            <p>Les présentes CGV régissent les ventes de produits effectuées sur le site LuxeSensuel. Toute commande implique l'acceptation sans réserve de ces conditions.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Produits</h2>
            <p>Les produits proposés sont ceux décrits sur le site au moment de la consultation. Les photographies sont les plus fidèles possibles mais ne constituent pas un engagement contractuel. LuxeSensuel se réserve le droit de modifier l'assortiment à tout moment.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Prix</h2>
            <p>Les prix sont indiqués en euros (EUR) toutes taxes comprises (TTC). Ils peuvent être affichés dans d'autres devises à titre indicatif. Le prix applicable est celui en vigueur au moment de la validation de la commande.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Commande</h2>
            <p>La commande est validée après confirmation du paiement. Un email de confirmation est envoyé à l'adresse indiquée. LuxeSensuel se réserve le droit d'annuler toute commande en cas de problème de paiement ou de suspicion de fraude.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Paiement</h2>
            <p>Le paiement s'effectue en ligne via les moyens sécurisés proposés : PayPal, carte bancaire internationale, Mobile Money (Orange Money, Wave, MTN). Les transactions sont cryptées en SSL 256 bits.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Livraison</h2>
            <p>Les livraisons sont effectuées dans un emballage discret, sans mention du contenu ni du nom de la boutique. Les délais indicatifs sont de 5 à 15 jours ouvrés selon la destination. LuxeSensuel ne peut être tenu responsable des retards imputables au transporteur ou aux services de douane.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Droit de rétractation</h2>
            <p>Conformément à la législation en vigueur, vous disposez d'un délai de 14 jours à compter de la réception pour exercer votre droit de rétractation, sans motif. Les produits doivent être retournés dans leur emballage d'origine, non utilisés et en parfait état. Les articles d'hygiène descellés ne peuvent être retournés.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Garantie</h2>
            <p>Tous les produits bénéficient de la garantie légale de conformité et de la garantie des vices cachés. En cas de produit défectueux, contactez notre service client pour un échange ou un remboursement.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Responsabilité</h2>
            <p>LuxeSensuel ne saurait être tenu responsable de l'utilisation inappropriée des produits. Les produits sont destinés à un usage adulte et conforme à leur destination.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Litiges</h2>
            <p>En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents seront saisis conformément aux règles en vigueur.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
