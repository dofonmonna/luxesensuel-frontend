import { Instagram, Facebook, Mail, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const footerLinks = {
  shop: [
    { label: 'Lingerie', href: '/shop?cat=lingerie' },
    { label: 'Soins & Huiles', href: '/shop?cat=soins' },
    { label: 'Parfums', href: '/shop?cat=parfums' },
    { label: 'Accessoires', href: '/shop?cat=accessoires' },
    { label: 'Nouveautés', href: '/shop?cat=new' },
  ],
  service: [
    { label: 'Suivre ma commande', href: '/profile' },
    { label: 'Retours & Remboursements', href: '/retours' },
    { label: 'Livraison & Délais', href: '/cgv' },
    { label: 'Paiement sécurisé', href: '/cgv' },
    { label: 'Nous contacter', href: 'mailto:luxesensuel11@gmail.com' },
  ],
  legal: [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'CGV', href: '/cgv' },
    { label: 'Politique de confidentialité', href: '/confidentialite' },
    { label: 'Politique de retour', href: '/retours' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 font-[Montserrat]">
      <div className="max-w-[1440px] mx-auto px-4">
        
        {/* Features Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 pb-12 border-b border-gray-50">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Livraison Discrète</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Colis neutre sans mention du contenu. Votre vie privée est notre priorité.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Paiement Sécurisé</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Transactions 100% cryptées SSL. PayPal, Stripe & Cryptos acceptés.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">Satisfait ou Remboursé</h4>
              <p className="text-xs text-gray-500 leading-relaxed">30 jours pour changer d'avis. Retours simples et rapides garantis.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <span className="font-[Cormorant_Garamond] text-3xl font-bold tracking-tight text-gray-900">
                LUXE<span className="text-[#CC0000] italic">Dropshoping</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
              Votre destination privilégiée pour le dropshipping de produits premium. 
              Des articles sélectionnés avec soin pour sublimer votre quotidien.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/luxesensuel11" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000] hover:bg-red-50 transition-all duration-300" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/luxesensuel11" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000] hover:bg-red-50 transition-all duration-300" aria-label="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@luxesensuel11" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000] hover:bg-red-50 transition-all duration-300" aria-label="TikTok">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/></svg>
              </a>
              <a href="mailto:luxesensuel11@gmail.com" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000] hover:bg-red-50 transition-all duration-300" aria-label="Email">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Boutique</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Assistance</h4>
            <ul className="space-y-4">
              {footerLinks.service.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">Informations</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} LuxeSensuel. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
          </div>
        </div>
      </div>
    </footer>
  );
};