import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowRight, Gift } from 'lucide-react';

export default function PromoBanner() {
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
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-0 items-center">
          {/* Image Side */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
          >
            <div className="relative aspect-[4/3] lg:aspect-square rounded-2xl lg:rounded-r-none overflow-hidden">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-[sensual]/30 to-[#D4A5A5]/20 blur-3xl opacity-50" />
              
              <img
                src="/promo-banner.jpg"
                alt="Offre spéciale"
                className="relative w-full h-full object-cover"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0D0D0D]/50 lg:to-transparent" />
            </div>
          </div>

          {/* Content Side */}
          <div
            className={`relative lg:-ml-16 z-10 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            <div className="relative p-8 sm:p-12 bg-[#1A1A1A]/90 backdrop-blur-xl rounded-2xl border border-[#F5F5F5]/10">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[sensual]/20 to-transparent rounded-tr-2xl" />
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[sensual] to-[#D4A5A5] flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="relative font-['Cormorant_Garamond'] text-3xl sm:text-4xl lg:text-5xl text-[#F5F5F5] mb-4 leading-tight animate-pulse animate-fade">
                L'Intimité Mérite{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#D4A5A5]">
                  le Luxe
                </span>
              </h2>

              {/* Description */}
              <p className="relative font-['Montserrat'] text-[#F5F5F5]/70 mb-6 leading-relaxed">
                Profitez de <span className="text-[#FFD700] font-semibold">-20%</span> sur votre 
                première commande avec le code ci-dessous. Découvrez notre collection 
                premium et laissez-vous séduire.
              </p>

              {/* Promo Code */}
              <div className="relative mb-8">
                <div className="inline-flex items-center gap-4 px-6 py-4 bg-[#0D0D0D] rounded-xl border border-dashed border-[#FFD700]/50">
                  <span className="text-sm text-[#F5F5F5]/50 font-['Montserrat']">Code:</span>
                  <span className="font-['Montserrat'] font-bold text-lg text-[#FFD700] tracking-wider">
                    BIENVENUE20
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Button className="group relative px-8 py-6 bg-gradient-to-r from-[sensual] to-[#6B1630] hover:from-[#A0244A] hover:to-[sensual] text-white font-['Montserrat'] font-medium tracking-wider overflow-hidden transition-all duration-500">
                <span className="relative z-10 flex items-center gap-2">
                  Découvrir l'Offre
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
