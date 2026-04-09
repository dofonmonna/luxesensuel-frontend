import React from "react";

const testimonials = [
  {
    name: "Élodie & Marc",
    text: "Une expérience unique, raffinée et sensuelle. Nous avons trouvé exactement ce que nous cherchions.",
    image: "/images/couple.jpg"
  },
  {
    name: "Sofia",
    text: "Chaque détail respire le luxe. Les produits sont magnifiques et l’ambiance immersive.",
    image: "/images/spa.jpg"
  },
  {
    name: "Julien",
    text: "Un univers élégant qui nous transporte. Je recommande sans hésiter.",
    image: "/images/client.jpg"
  }
];

export default function Home() {
  return (
    <main className="bg-gradient-to-b from-champagne to-rose min-h-screen">
      
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20">
        <h1 className="text-5xl font-garamond text-bordeaux animate-pulse animate-fade mb-6">
          Bienvenue dans l’univers LuxeSensuel
        </h1>
        <p className="text-lg text-sensual max-w-2xl mb-8 animate-fade">
          Découvrez une expérience immersive, élégante et sensuelle, pensée pour éveiller vos désirs.
        </p>
        <button className="px-6 py-3 bg-bordeaux text-ivoire rounded-3xl shadow-lg animate-shimmer hover:scale-105 transition-transform">
          Découvrir la Boutique
        </button>
      </section>

      {/* Galerie d’images */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 py-16">
        <img src="/images/bougie.jpg" alt="Bougie luxueuse" className="rounded-3xl shadow-md animate-float"/>
        <img src="/images/huiles.jpg" alt="Huiles raffinées" className="rounded-3xl shadow-md animate-float"/>
        <img src="/images/objet.jpg" alt="Objet design" className="rounded-3xl shadow-md animate-float"/>
      </section>

      {/* Témoignages */}
      <section className="py-12 px-6 bg-white/60 rounded-3xl shadow-lg w-full max-w-6xl mx-auto mb-20 animate-fade">
        <h2 className="text-center font-garamond text-3xl text-bordeaux mb-10">
          Ils nous ont confié leurs désirs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-md p-6 text-center hover:scale-105 transition-transform duration-500">
              <img src={t.image} alt={t.name} className="w-32 h-32 object-cover rounded-full mx-auto mb-4 animate-float"/>
              <h3 className="font-garamond text-lg text-bordeaux mb-2">{t.name}</h3>
              <p className="text-sensual italic text-sm">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
