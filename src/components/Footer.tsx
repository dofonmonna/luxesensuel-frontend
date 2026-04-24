import { Instagram, Facebook, Mail, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useT } from '@/i18n/I18nProvider';
import type { LocaleKey } from '@/i18n/locales';

interface FooterLink { key: LocaleKey; href: string; }

const footerLinks: { shop: FooterLink[]; service: FooterLink[]; legal: FooterLink[] } = {
  shop: [
    { key: 'cat.lingerie', href: '/shop?cat=lingerie' },
    { key: 'cat.soins', href: '/shop?cat=soins' },
    { key: 'cat.parfums', href: '/shop?cat=parfums' },
    { key: 'cat.bijoux', href: '/shop?cat=bijoux' },
    { key: 'cat.new', href: '/shop?cat=new' },
  ],
  service: [
    { key: 'nav.account', href: '/profile' },
    { key: 'footer.returns', href: '/retours' },
    { key: 'footer.shipping_discreet', href: '/cgv' },
    { key: 'footer.payment_secure', href: '/cgv' },
    { key: 'footer.contact', href: 'mailto:luxesensuel11@gmail.com' },
  ],
  legal: [
    { key: 'footer.legal', href: '/mentions-legales' },
    { key: 'footer.cgv', href: '/cgv' },
    { key: 'footer.privacy', href: '/confidentialite' },
    { key: 'footer.returns', href: '/retours' },
  ],
};

export const Footer = () => {
  const { t } = useT();
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
              <h4 className="font-bold text-gray-900 mb-1">{t('footer.shipping_discreet')}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{t('promo.shipping_discreet')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{t('footer.payment_secure')}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{t('promo.secure')}</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gray-50/50">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6 text-[#CC0000]" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{t('footer.returns')}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{t('promo.satisfied')}</p>
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
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">{t('nav.shop')}</h4>
            <ul className="space-y-4">
              {footerLinks.shop.map((link) => (
                <li key={link.key}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">{t('footer.help')}</h4>
            <ul className="space-y-4">
              {footerLinks.service.map((link, idx) => (
                <li key={`svc-${idx}`}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-widest">{t('footer.legal')}</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link, idx) => (
                <li key={`leg-${idx}`}>
                  <Link to={link.href} className="text-sm text-gray-500 hover:text-[#CC0000] transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} LuxeSensuel. {t('footer.copyright')}.
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