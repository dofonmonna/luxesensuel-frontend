import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Mail, Send, Sparkles } from 'lucide-react';

export default function Newsletter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 bg-[#0D0D0D] overflow-hidden">
      {/* Animated Glow Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-[600px] h-[600px] bg-gradient-radial from-[sensual]/20 via-[#D4A5A5]/10 to-transparent rounded-full transition-all duration-2000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ animation: 'pulse 4s ease-in-out infinite' }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[sensual] to-[#D4A5A5] mb-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}
        >
          <Mail className="w-8 h-8 text-white" />
        </div>

        {/* Title */}
        <h2
          className={`font-['Cormorant_Garamond'] text-4xl sm:text-5xl text-[#F5F5F5] mb-4 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Rejoignez l'
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[sensual] to-[#D4A5A5]">
            Intimité
          </span>
        </h2>

        {/* Description */}
        <p
          className={`font-['Montserrat'] text-[#F5F5F5]/60 mb-8 max-w-xl mx-auto transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Inscrivez-vous pour recevoir nos offres exclusives et découvrir nos 
          nouveautés en avant-première.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`flex flex-col sm:flex-row gap-4 max-w-md mx-auto transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative flex-1">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 px-6 bg-[#1A1A1A]/80 border-[#F5F5F5]/10 text-[#F5F5F5] placeholder:text-[#F5F5F5]/40 font-['Montserrat'] rounded-xl focus:border-[sensual]/50 focus:ring-[sensual]/20 transition-all duration-300"
              required
            />
            <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]/50" />
          </div>
          <Button
            type="submit"
            disabled={isSubmitted}
            className={`h-14 px-8 font-['Montserrat'] font-medium tracking-wider rounded-xl transition-all duration-500 ${
              isSubmitted
                ? 'bg-green-600 hover:bg-green-600'
                : 'bg-gradient-to-r from-[sensual] to-[#6B1630] hover:from-[#A0244A] hover:to-[sensual]'
            } text-white`}
          >
            {isSubmitted ? (
              <span className="flex items-center gap-2">
                Inscrit !
              </span>
            ) : (
              <span className="flex items-center gap-2">
                S'inscrire
                <Send className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Privacy Note */}
        <p
          className={`mt-6 text-xs text-[#F5F5F5]/40 font-['Montserrat'] transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          En vous inscrivant, vous acceptez notre politique de confidentialité. 
          Vous pouvez vous désinscrire à tout moment.
        </p>
      </div>
    </section>
  );
}
