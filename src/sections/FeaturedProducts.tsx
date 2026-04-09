import React from 'react';
import { products } from '../data/products';
import { useCart } from '@/hooks/useCart';
import { ShoppingBag } from 'lucide-react';

export default function FeaturedProducts() {
  // On utilise addToCart car c'est le nom dans ton hook useCart
  const { addToCart, setIsCartOpen } = useCart();
  const featured = products.filter(p => p.isNew);

  const handleAdd = (product: any) => {
    if (typeof addToCart === 'function') {
      addToCart(product);
      setIsCartOpen(true); // Ouvre le panier pour montrer que ça a marché
    } else {
      console.error("La fonction d'ajout au panier est introuvable");
    }
  };

  return (
    <section className="py-24 bg-[#0D0D0D] px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['Cormorant_Garamond'] text-4xl text-white mb-12 tracking-[0.2em] text-center uppercase animate-pulse animate-fade">
          NOS <span className="text-[sensual]">NOUVEAUTÉS</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featured.map((product) => (
            <div key={product.id} className="group relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 border border-white/10 relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                />
                <button 
                  onClick={() => handleAdd(product)}
                  className="absolute bottom-6 right-6 p-4 bg-[sensual] text-white rounded-full translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl z-10"
                >
                  <ShoppingBag size={20} />
                </button>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-[#F5F5F5] font-light tracking-widest text-sm uppercase animate-pulse animate-fade">{product.name}</h3>
                <p className="text-[#D4A5A5] mt-2 font-['Montserrat']">{product.price}€</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
