import React from 'react';
import { testimonials } from '../data/products';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className="py-24 bg-[#0D0D0D] px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['Cormorant_Garamond'] text-4xl text-white mb-16 tracking-[0.2em] text-center uppercase font-light animate-pulse animate-fade">
          VOTRE <span className="text-[sensual]">EXPÉRIENCE</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white/5 p-10 rounded-[2rem] border border-white/10 hover:border-[sensual]/30 transition-all duration-500 group text-center">
              <Quote className="mx-auto mb-6 text-[sensual] opacity-40 group-hover:opacity-100 transition-opacity" size={32} />
              <p className="text-[#F5F5F5]/80 italic font-light leading-relaxed mb-8 tracking-wide">
                "{t.content}"
              </p>
              <div className="mt-auto">
                <p className="text-[#F5F5F5] font-['Montserrat'] text-xs tracking-[0.3em] uppercase">{t.author}</p>
                <p className="text-[sensual] text-[10px] tracking-[0.2em] uppercase mt-2">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
