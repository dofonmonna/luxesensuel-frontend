import React from "react";

export default function Collection() {
  return (
    <main className="bg-gradient-to-b from-champagne to-rose min-h-screen py-20 px-10">
      <h1 className="text-4xl font-garamond text-bordeaux text-center mb-12 animate-fade">
        Notre Collection
      </h1>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white rounded-3xl shadow-md p-6 text-center hover:scale-105 transition-transform">
          <img src="/images/bougie.jpg" alt="Bougie" className="rounded-3xl shadow-md animate-float mb-4"/>
          <h3 className="font-garamond text-lg text-bordeaux">Bougie Luxe</h3>
          <p className="text-sensual">29,90 €</p>
          <button className="mt-4 px-4 py-2 bg-bordeaux text-ivoire rounded-3xl animate-shimmer">Découvrir</button>
        </div>
      </section>
    </main>
  );
}
