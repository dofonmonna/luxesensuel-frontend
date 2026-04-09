import React from 'react';
import { categories } from '../data/products';

export default function Categories() {
  return (
    <section className="py-24 bg-[#0D0D0D] px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['Cormorant_Garamond'] text-4xl text-white mb-16 tracking-[0.2em] text-center uppercase font-light animate-pulse animate-fade">
          NOS <span className="text-[sensual]">UNIVERS</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-white/5 border border-white/10 transition-all duration-700 hover:border-[sensual]/50">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-8 left-8">
                  <h3 className="text-[#F5F5F5] font-light tracking-[0.3em] text-sm uppercase group-hover:text-[#D4A5A5] transition-colors animate-pulse animate-fade">
                    {category.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
