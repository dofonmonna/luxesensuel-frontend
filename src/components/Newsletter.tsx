import { Clock, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Inscription réussie !', {
        description: 'Vérifiez vos emails pour votre code promo de -10%.',
      });
      setEmail('');
    }
  };

  return (
    <section className="py-16 px-4 bg-gray-100">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-sm border border-gray-100">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl opacity-50" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 text-[#CC0000] bg-red-50 px-4 py-1.5 rounded-full">
            <Mail className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Restez connectés</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 font-[Montserrat] leading-tight">
            Prêt pour une expérience <span className="text-[#CC0000]">LuxeSensuel</span> ?
          </h2>
          
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Inscrivez-vous à notre newsletter et recevez immédiatement <span className="font-bold text-gray-900">10% de réduction</span> sur votre première commande ainsi que nos offres exclusives.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="email"
              placeholder="Votre adresse email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-8 py-5 rounded-2xl text-gray-900 bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] transition-all text-base"
            />
            <button 
              type="submit"
              className="bg-[#CC0000] text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#aa0000] transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-100 group"
            >
              M'inscrire 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex items-center justify-center gap-6 text-[11px] text-gray-400 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Vos données sont protégées</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-500" /> Désabonnement en 1 clic</span>
          </div>
        </div>
      </div>
    </section>
  );
}
