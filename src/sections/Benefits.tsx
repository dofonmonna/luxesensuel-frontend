import { Shield, Truck, RefreshCw, Lock } from 'lucide-react';

const benefits = [
  {
    icon: Truck,
    title: 'Livraison discrète',
    description: 'Colis neutre sans indication du contenu, livraison sous 3-5 jours ouvrés.',
  },
  {
    icon: Shield,
    title: 'Produits certifiés',
    description: 'Tous nos produits sont en silicone médical, ABS et matériaux hypoallergéniques.',
  },
  {
    icon: Lock,
    title: 'Paiement sécurisé',
    description: 'Transactions cryptées SSL. Vos données bancaires ne sont jamais stockées.',
  },
  {
    icon: RefreshCw,
    title: 'Retours faciles',
    description: '30 jours pour changer d\'avis. Remboursement intégral garanti.',
  },
];

export default function Benefits() {
  return (
    <section className="py-16 bg-[#0D0D0D]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center text-center p-6 rounded-xl bg-[#1A1A1A] border border-[#F5F5F5]/5"
            >
              <div className="w-14 h-14 rounded-full bg-[sensual]/20 flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-[#D4A5A5]" />
              </div>
              <h3 className="font-['Cormorant_Garamond'] text-lg text-[#F5F5F5] mb-2 animate-pulse animate-fade">
                {benefit.title}
              </h3>
              <p className="text-[#F5F5F5]/60 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
