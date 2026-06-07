import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { MessageCircle, Mail, Clock, MapPin, ChevronRight } from 'lucide-react';

const WHATSAPP_NUMBER = '2250505409595';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour LuxeDropShopping ! J\'ai une question.')}`;

export function Contact() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-16 px-4">
      <SEO
        title="Nous Contacter"
        description="Contactez LuxeDropShopping par WhatsApp ou email. Notre équipe répond en moins de 5 minutes."
      />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">Contact</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#CC0000] to-[#8B0000] rounded-3xl p-8 md:p-14 text-center text-white mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Nous contacter</h1>
          <p className="text-white/80 text-lg">Une question ? On vous répond en moins de 5 minutes</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* WhatsApp */}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-4">La façon la plus rapide de nous joindre. Réponse immédiate.</p>
            <div className="flex items-center gap-2 text-[#25D366] font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>Lun–Sam · 8h–22h</span>
            </div>
            <span className="mt-5 px-6 py-3 bg-[#25D366] text-white rounded-2xl text-sm font-bold group-hover:bg-[#22c55e] transition-colors">
              Ouvrir WhatsApp
            </span>
          </a>

          {/* Email */}
          <a
            href="mailto:luxesensuel11@gmail.com"
            className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all group flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#CC0000] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Email</h3>
            <p className="text-sm text-gray-500 mb-4">Pour toute question détaillée, retour ou réclamation.</p>
            <div className="flex items-center gap-2 text-gray-400 font-medium text-sm">
              <Clock className="w-4 h-4" />
              <span>Réponse sous 24h</span>
            </div>
            <span className="mt-5 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold group-hover:bg-black transition-colors">
              luxesensuel11@gmail.com
            </span>
          </a>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-6">Informations utiles</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Hub logistique</p>
                <p>Abidjan, Côte d'Ivoire · Livraison mondiale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Heures d'ouverture</p>
                <p>Lundi – Samedi : 8h00 – 22h00 (GMT)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Langues</p>
                <p>Français · English · Português</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
            <Link to="/retours" className="text-xs text-[#CC0000] hover:underline font-medium">Politique de retour</Link>
            <span className="text-gray-200">·</span>
            <Link to="/cgv" className="text-xs text-[#CC0000] hover:underline font-medium">CGV</Link>
            <span className="text-gray-200">·</span>
            <Link to="/confidentialite" className="text-xs text-[#CC0000] hover:underline font-medium">Confidentialité</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
