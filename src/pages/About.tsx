// pages/About.tsx
import { useEffect, useRef, useState } from 'react';
import { Heart, Shield, Sparkles, Users, Award, Lock, Star, Package, Clock } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion',
    description: 'Nous croyons que l\'intimité est une forme d\'art qui mérite d\'être célébrée avec passion et respect.',
  },
  {
    icon: Shield,
    title: 'Discrétion',
    description: 'Votre vie privée est sacrée. Nous garantissons une confidentialité totale à chaque étape de votre expérience.',
  },
  {
    icon: Sparkles,
    title: 'Excellence',
    description: 'Nous sélectionnons uniquement des produits de la plus haute qualité pour votre satisfaction garantie.',
  },
  {
    icon: Users,
    title: 'Empowerment',
    description: 'Nous croyons en l\'empowerment personnel et au droit de chacun d\'explorer son plaisir librement.',
  },
];

const stats = [
  { value: '2019', label: 'Année de création', icon: Clock },
  { value: '50K+', label: 'Clients satisfaits', icon: Users },
  { value: '500+', label: 'Produits disponibles', icon: Package },
  { value: '4.9', label: 'Note moyenne', icon: Star },
];

const trustBadges = [
  { icon: Award, title: 'Qualité Garantie', desc: 'Produits certifiés et testés' },
  { icon: Shield, title: 'Paiement Sécurisé', desc: 'Cryptage SSL 256-bit' },
  { icon: Sparkles, title: 'Service Premium', desc: 'Support client 24/7' },
];

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0D] pb-16">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#D4A5A5]/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-6xl lg:text-7xl text-[#F5F5F5] mb-6">
            Notre{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A5A5] to-[#8B6F6F]">
              Histoire
            </span>
          </h1>
          <p className="text-xl text-[#F5F5F5]/70 max-w-2xl mx-auto leading-relaxed">
            LuxeSensuel est née d'une vision simple : créer un espace où l'intimité 
            rencontre le luxe, où chaque produit raconte une histoire de plaisir et de raffinement.
          </p>
        </div>
      </section>

      <section ref={sectionRef} className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#D4A5A5]/20 to-[#8B6F6F]/10 blur-3xl" />
                <div className="relative rounded-2xl w-full aspect-[4/3] bg-gradient-to-br from-[#1A1A1A] to-[#2a2a2a] border border-white/10 overflow-hidden group">
                  <img
                    src="/hero-main.jpg"
                    alt="LuxeSensuel"
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/60 to-transparent" />
                </div>
              </div>
            </div>
            
            <div
              className={`space-y-6 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
            >
              <h2 className="font-['Cormorant_Garamond'] text-4xl text-[#F5F5F5]">
                L'Art de l'Intimité
              </h2>
              <div className="space-y-4 text-[#F5F5F5]/70 leading-relaxed">
                <p>
                  Fondée en 2019 à Paris, LuxeSensuel est rapidement devenue la référence 
                  française pour l'intimité de luxe. Notre mission est de démystifier et 
                  d'élégantismer l'univers des objets pour adultes.
                </p>
                <p>
                  Chaque article de notre collection est choisi avec soin, testé pour sa 
                  qualité et sélectionné pour son design exceptionnel. Nous collaborons 
                  avec les meilleures marques internationales pour vous offrir une 
                  expérience unique.
                </p>
                <p>
                  Notre engagement va au-delà de la simple vente : nous croyons en une 
                  approche éducative et bienveillante de la sexualité, où chacun peut 
                  explorer son plaisir dans un environnement sûr et respectueux.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#D4A5A5]/10 flex items-center justify-center group-hover:bg-[#D4A5A5]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#D4A5A5]" />
                  </div>
                  <div className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#D4A5A5] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-[#F5F5F5]/60 text-sm uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Cormorant_Garamond'] text-4xl text-[#F5F5F5] mb-4">
              Nos Valeurs
            </h2>
            <p className="text-[#F5F5F5]/60 max-w-2xl mx-auto">
              Ces principes guident chacune de nos décisions et façonnent l'expérience LuxeSensuel
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-[#1A1A1A]/50 rounded-xl border border-white/5 hover:border-[#D4A5A5]/30 transition-all duration-500 hover:-translate-y-1 hover:bg-[#1A1A1A]/80"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4A5A5]/20 to-transparent flex items-center justify-center mb-4 group-hover:from-[#D4A5A5]/30 transition-all duration-500">
                    <Icon className="w-6 h-6 text-[#D4A5A5]" />
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-xl text-[#F5F5F5] mb-2">
                    {value.title}
                  </h3>
                  <p className="text-[#F5F5F5]/60 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#D4A5A5]/10 to-transparent rounded-2xl p-8 sm:p-12 border border-white/5">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#D4A5A5]/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#D4A5A5]" />
              </div>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#F5F5F5] text-center mb-8">
              Votre Confiance, Notre Priorité
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              {trustBadges.map((badge, idx) => {
                const Icon = badge.icon;
                return (
                  <div key={idx} className="p-4">
                    <Icon className="w-8 h-8 text-[#D4A5A5] mx-auto mb-3" />
                    <h4 className="text-[#F5F5F5] font-medium mb-1">{badge.title}</h4>
                    <p className="text-[#F5F5F5]/60 text-sm">{badge.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Cormorant_Garamond'] text-4xl text-[#F5F5F5] mb-12">
            Contactez-nous
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="p-6 bg-[#1A1A1A]/30 rounded-xl border border-white/5">
              <h4 className="text-[#D4A5A5] font-medium mb-2">Email</h4>
              <p className="text-[#F5F5F5]/70">luxesensuel11@gmail.com</p>
            </div>
            <div className="p-6 bg-[#1A1A1A]/30 rounded-xl border border-white/5">
              <h4 className="text-[#D4A5A5] font-medium mb-2">Téléphone</h4>
              <p className="text-[#F5F5F5]/70">+33 1 23 45 67 89</p>
            </div>
            <div className="p-6 bg-[#1A1A1A]/30 rounded-xl border border-white/5">
              <h4 className="text-[#D4A5A5] font-medium mb-2">Adresse</h4>
              <p className="text-[#F5F5F5]/70">75008 Paris, France</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}