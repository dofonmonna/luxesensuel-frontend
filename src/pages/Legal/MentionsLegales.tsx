import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

export function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-16 px-4">
      <SEO title="Mentions Légales" description="Mentions légales du site LuxeSensuel. Informations sur l'éditeur, l'hébergeur et les droits de propriété intellectuelle." />
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 md:p-14 shadow-sm border border-gray-100">
        <nav className="text-xs text-gray-400 mb-8 flex gap-2">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <span>/</span>
          <span className="text-gray-900">Mentions Légales</span>
        </nav>

        <h1 className="text-3xl font-black text-gray-900 mb-10">Mentions Légales</h1>

        <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Éditeur du site</h2>
            <p>
              <strong>LuxeSensuel</strong><br />
              Boutique en ligne de lingerie & accessoires<br />
              Email : luxesensuel11@gmail.com<br />
              Directeur de la publication : Coulibaly D Ali<br />
              Hébergement des données : UE — Francfort, Allemagne
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Hébergement</h2>
            <p>
              <strong>Netlify, Inc.</strong><br />
              2325 3rd Street, Suite 296<br />
              San Francisco, California 94107, USA<br />
              Site web : netlify.com
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Propriété intellectuelle</h2>
            <p>L'ensemble du contenu de ce site (textes, images, logos, graphismes, icônes, vidéos) est la propriété exclusive de LuxeSensuel ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Données personnelles</h2>
            <p>Les informations collectées sont traitées conformément à notre <Link to="/confidentialite" className="text-[#CC0000] hover:underline">Politique de Confidentialité</Link>. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Cookies</h2>
            <p>Ce site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic et personnaliser les contenus. Vous pouvez gérer vos préférences à tout moment via notre bannière de consentement.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Liens hypertextes</h2>
            <p>Le site peut contenir des liens vers d'autres sites internet. LuxeSensuel n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
