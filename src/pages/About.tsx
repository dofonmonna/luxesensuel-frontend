import { useEffect, useRef, useState } from 'react';
import { Heart, Shield, Sparkles, Users, Award, Lock } from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Passion',
    description: 'Nous croyons que l\'intimité est une forme d\'art qui mérite d\'être célébrée avec passion et respect.',
  },
  {
    icon: Shield,
    title: 'Discrétion',
    description: 'Votre vie privée est sacrée. Nous garantissons une confidentialité totale à chaque étape.',
  },
  {
    icon: Sparkles,
    title: 'Excellence',
    description: 'Nous sélectionnons uniquement des produits de la plus haute qualité pour votre satisfaction.',
  },
  {
    icon: Users,
    title: 'Empowerment',
    description: 'Nous croyons en l\'empowerment personnel et au droit de chacun d\'explorer son plaisir.',
  },
];

const stats = [
  { value: '2019', label: 'Année de création' },
  { value: '50K+', label: 'Clients satisfaits' },
  { value: '500+', label: 'Produits disponibles' },
  { value: '4.9', label: 'Note moyenne' },
];

export default function About() {
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
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-16">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[sensual]/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <h1 className="font-['Cormorant_Garamond'] text-5xl sm:text-6xl lg:text-7xl text-[#F5F5F5] mb-6 animate-pulse animate-fade">
            Notre{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[sensual] to-[#D4A5A5]">
              Histoire
            </span>
          </h1>
          <p className="text-xl text-[#F5F5F5]/70 max-w-2xl mx-auto leading-relaxed">
            LuxeSensuel est née d'une vision simple : créer un espace où l'intimité 
            rencontre le luxe, où chaque produit raconte une histoire de plaisir et de raffinement.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section ref={sectionRef} className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className={`transition-all duration-1000 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
              }`}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[sensual]/20 to-[#D4A5A5]/20 blur-3xl" />
                <img
                  src="/hero-main.jpg"
                  alt="LuxeSensuel"
                  className="relative rounded-2xl w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
            <div
              className={`space-y-6 transition-all duration-1000 delay-300 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
              }`}
            >
              <h2 className="font-['Cormorant_Garamond'] text-4xl text-[#F5F5F5] animate-pulse animate-fade">
                L'Art de l'Intimité
              </h2>
              <p className="text-[#F5F5F5]/70 leading-relaxed">
                Fondée en 2019 à Paris, LuxeSensuel est rapidement devenue la référence 
                française pour l'intimité de luxe. Notre mission est de démystifier et 
                d'élégantismer l'univers des objets pour adultes, en proposant une sélection 
                rigoureuse de produits haut de gamme.
              </p>
              <p className="text-[#F5F5F5]/70 leading-relaxed">
                Chaque article de notre collection est choisi avec soin, testé pour sa 
                qualité et sélectionné pour son design exceptionnel. Nous collaborons 
                avec les meilleures marques internationales pour vous offrir une 
                expérience unique.
              </p>
              <p className="text-[#F5F5F5]/70 leading-relaxed">
                Notre engagement va au-delà de la simple vente : nous croyons en une 
                approche éducative et bienveillante de la sexualité, où chacun peut 
                explorer son plaisir dans un environnement sûr et respectueux.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center"
              >
                <div className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#FFD700] mb-2">
                  {stat.value}
                </div>
                <div className="text-[#F5F5F5]/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-['Cormorant_Garamond'] text-4xl text-[#F5F5F5] mb-4 animate-pulse animate-fade">
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
                  className="group p-6 bg-[#1A1A1A]/50 rounded-xl border border-[#F5F5F5]/5 hover:border-[sensual]/30 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[sensual]/20 to-[#D4A5A5]/10 flex items-center justify-center mb-4 group-hover:from-[sensual]/30 group-hover:to-[#D4A5A5]/20 transition-all duration-500">
                    <Icon className="w-6 h-6 text-[#D4A5A5]" />
                  </div>
                  <h3 className="font-['Cormorant_Garamond'] text-xl text-[#F5F5F5] mb-2 animate-pulse animate-fade">
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

      {/* Trust Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[sensual]/10 to-[#D4A5A5]/10 rounded-2xl p-8 sm:p-12 border border-[#F5F5F5]/5">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[sensual]/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#D4A5A5]" />
              </div>
            </div>
            <h2 className="font-['Cormorant_Garamond'] text-3xl text-[#F5F5F5] text-center mb-6 animate-pulse animate-fade">
              Votre Confiance, Notre Priorité
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <Award className="w-8 h-8 text-[#FFD700] mx-auto mb-3" />
                <h4 className="text-[#F5F5F5] font-medium mb-1">Qualité Garantie</h4>
                <p className="text-[#F5F5F5]/60 text-sm">Tous nos produits sont certifiés et testés</p>
              </div>
              <div>
                <Shield className="w-8 h-8 text-[#FFD700] mx-auto mb-3" />
                <h4 className="text-[#F5F5F5] font-medium mb-1">Paiement Sécurisé</h4>
                <p className="text-[#F5F5F5]/60 text-sm">Cryptage SSL 256-bit</p>
              </div>
              <div>
                <Sparkles className="w-8 h-8 text-[#FFD700] mx-auto mb-3" />
                <h4 className="text-[#F5F5F5] font-medium mb-1">Service Premium</h4>
                <p className="text-[#F5F5F5]/60 text-sm">Support client disponible 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-['Cormorant_Garamond'] text-4xl text-[#F5F5F5] mb-8 animate-pulse animate-fade">
            Contactez-nous
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            <div>
              <h4 className="text-[#D4A5A5] font-medium mb-2">Email</h4>
              <p className="text-[#F5F5F5]/70">luxesensuel11@gmail.com</p>
            </div>
            <div>
              <h4 className="text-[#D4A5A5] font-medium mb-2">Téléphone</h4>
              <p className="text-[#F5F5F5]/70">+33 1 23 45 67 89</p>
            </div>
            <div>
              <h4 className="text-[#D4A5A5] font-medium mb-2">Adresse</h4>
              <p className="text-[#F5F5F5]/70">75008 Paris, France</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
