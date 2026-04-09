import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="accueil"
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D]"
    >
      {/* Animated Background Gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(139, 30, 63, 0.4) 0%, transparent 50%)`,
          transition: 'background 0.3s ease-out',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#FFD700]/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 7}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[sensual]/20 border border-[sensual]/30 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '0.2s' }}
              >
                <Sparkles className="w-4 h-4 text-[#FFD700]" />
                <span className="text-sm font-['Montserrat'] text-[#D4A5A5]">
                  Collection Exclusive 2024
                </span>
              </div>

              {/* Title */}
              <h1
                className={`font-['Cormorant_Garamond'] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-tight transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.4s' }}
              >
                <span className="text-[#F5F5F5] block">L'Art du</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[sensual] via-[#D4A5A5] to-[#FFD700] block mt-2">
                  Plaisir
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className={`font-['Montserrat'] text-base sm:text-lg text-[#F5F5F5]/70 max-w-xl leading-relaxed transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                }`}
                style={{ transitionDelay: '0.6s' }}
              >
                Découvrez notre collection exclusive d'objets d'art pour adultes, 
                où chaque pièce est conçue pour éveiller vos sens et sublimer 
                vos moments d'intimité.
              </p>

              {/* CTAs */}
              <div
                className={`flex flex-wrap gap-4 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '0.8s' }}
              >
                <Button
                  onClick={() => scrollToSection('#collection')}
                  className="group relative px-8 py-6 bg-gradient-to-r from-[sensual] to-[#6B1630] hover:from-[#A0244A] hover:to-[sensual] text-white font-['Montserrat'] font-medium tracking-wider overflow-hidden transition-all duration-500"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Explorer la Collection
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Button>
                <Button
                  onClick={() => scrollToSection('#nouveautes')}
                  variant="outline"
                  className="px-8 py-6 border-[#F5F5F5]/30 text-[#F5F5F5] hover:bg-[#F5F5F5]/10 hover:border-[#D4A5A5]/50 font-['Montserrat'] font-medium tracking-wider transition-all duration-500"
                >
                  Nouveautés
                </Button>
              </div>

              {/* Stats */}
              <div
                className={`flex gap-8 pt-8 border-t border-[#F5F5F5]/10 transition-all duration-1000 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: '1s' }}
              >
                <div>
                  <div className="font-['Cormorant_Garamond'] text-3xl text-[#FFD700]">500+</div>
                  <div className="text-sm text-[#F5F5F5]/50 font-['Montserrat']">Produits</div>
                </div>
                <div>
                  <div className="font-['Cormorant_Garamond'] text-3xl text-[#FFD700]">50k+</div>
                  <div className="text-sm text-[#F5F5F5]/50 font-['Montserrat']">Clients</div>
                </div>
                <div>
                  <div className="font-['Cormorant_Garamond'] text-3xl text-[#FFD700]">4.9</div>
                  <div className="text-sm text-[#F5F5F5]/50 font-['Montserrat']">Note moyenne</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div
              className={`relative transition-all duration-1000 ${
                isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: '0.5s' }}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[sensual]/30 via-[#D4A5A5]/20 to-[#FFD700]/20 blur-3xl opacity-60" />
                
                {/* Image Container */}
                <div className="relative h-full rounded-2xl overflow-hidden border border-[#F5F5F5]/10">
                  <img
                    src="/hero-main.jpg"
                    alt="Collection LuxeSensuel"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Card */}
                  <div className="absolute bottom-6 left-6 right-6 p-4 bg-[#1A1A1A]/80 backdrop-blur-xl rounded-xl border border-[#F5F5F5]/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[sensual] to-[#D4A5A5] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-['Cormorant_Garamond'] text-lg text-[#F5F5F5]">
                          Livraison Discrète
                        </div>
                        <div className="text-sm text-[#F5F5F5]/60 font-['Montserrat']">
                          Emballage neutre garanti
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0D0D0D] to-transparent" />
    </section>
  );
}
