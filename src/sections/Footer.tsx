import { useEffect, useRef, useState } from 'react';
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  collection: [
    { label: 'Pour Elle', href: '#' },
    { label: 'Pour Lui', href: '#' },
    { label: 'Pour Couples', href: '#' },
    { label: 'Bien-être', href: '#' },
    { label: 'Nouveautés', href: '#' },
  ],
  service: [
    { label: 'Livraison', href: '#' },
    { label: 'Retours', href: '#' },
    { label: 'FAQ', href: '#' },
    { label: 'Guide des tailles', href: '#' },
    { label: 'Conseils', href: '#' },
  ],
  entreprise: [
    { label: 'À propos', href: '#' },
    { label: 'Carrières', href: '#' },
    { label: 'Presse', href: '#' },
    { label: 'Partenaires', href: '#' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative bg-[#0D0D0D] border-t border-[#F5F5F5]/5"
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[sensual]/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div
            className={`lg:col-span-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {/* Logo */}
            <a href="#" className="inline-block mb-6">
              <span className="font-['Cormorant_Garamond'] text-3xl font-light tracking-[0.2em] text-[#F5F5F5]">
                LUXE<span className="text-[sensual]">SENSUEL</span>
              </span>
            </a>

            <p className="font-['Montserrat'] text-sm text-[#F5F5F5]/60 mb-6 max-w-sm leading-relaxed">
              Votre destination privilégiée pour l'intimité de luxe. 
              Découvrez notre collection soigneusement sélectionnée 
              pour éveiller vos sens.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a
                href="mailto:luxesensuel11@gmail.com"
                className="flex items-center gap-3 text-sm text-[#F5F5F5]/60 hover:text-[#D4A5A5] transition-colors duration-300"
              >
                <Mail className="w-4 h-4" />
                luxesensuel11@gmail.com
              </a>
              <a
                href="tel:+33123456789"
                className="flex items-center gap-3 text-sm text-[#F5F5F5]/60 hover:text-[#D4A5A5] transition-colors duration-300"
              >
                <Phone className="w-4 h-4" />
                +33 1 23 45 67 89
              </a>
              <div className="flex items-center gap-3 text-sm text-[#F5F5F5]/60">
                <MapPin className="w-4 h-4" />
                Paris, France
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#F5F5F5]/10 flex items-center justify-center text-[#F5F5F5]/60 hover:text-[#D4A5A5] hover:border-[sensual]/50 hover:rotate-[360deg] transition-all duration-500 ${
                      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                    }`}
                    style={{ transitionDelay: `${600 + index * 100}ms` }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div
            className={`transition-all duration-1000 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h4 className="font-['Cormorant_Garamond'] text-lg text-[#F5F5F5] mb-4">
              Collection
            </h4>
            <ul className="space-y-3">
              {footerLinks.collection.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[#F5F5F5]/60 hover:text-[#D4A5A5] transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#D4A5A5] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h4 className="font-['Cormorant_Garamond'] text-lg text-[#F5F5F5] mb-4">
              Service Client
            </h4>
            <ul className="space-y-3">
              {footerLinks.service.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[#F5F5F5]/60 hover:text-[#D4A5A5] transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#D4A5A5] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h4 className="font-['Cormorant_Garamond'] text-lg text-[#F5F5F5] mb-4">
              Entreprise
            </h4>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-sm text-[#F5F5F5]/60 hover:text-[#D4A5A5] transition-colors duration-300 relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#D4A5A5] transition-all duration-300 group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-[#F5F5F5]/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#F5F5F5]/40 font-['Montserrat']">
            © 2024 LuxeSensuel. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-xs text-[#F5F5F5]/40 hover:text-[#D4A5A5] transition-colors duration-300"
            >
              Mentions légales
            </a>
            <a
              href="#"
              className="text-xs text-[#F5F5F5]/40 hover:text-[#D4A5A5] transition-colors duration-300"
            >
              CGV
            </a>
            <a
              href="#"
              className="text-xs text-[#F5F5F5]/40 hover:text-[#D4A5A5] transition-colors duration-300"
            >
              Confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
