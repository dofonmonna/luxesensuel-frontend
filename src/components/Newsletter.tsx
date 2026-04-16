import { Clock, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function Newsletter() {
  const [email, setEmail] = useState('');

  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto bg-gradient-luxe rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4 text-white/90">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">Soyez les premiers informés</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ne manquez aucune nouveauté !
          </h2>
          
          <p className="text-white/90 mb-8 max-w-lg mx-auto">
            Inscrivez-vous à notre newsletter et recevez 10% de réduction sur votre première commande
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Votre email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button 
              type="submit"
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              S'inscrire <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
