import React from "react";

export default function Apropos() {
  return (
    <main className="bg-gradient-to-b from-champagne to-rose min-h-screen py-20 px-10 text-center animate-fade">
      <h1 className="text-4xl font-garamond text-bordeaux mb-6">À propos de LuxeDropShopping</h1>
      <p className="text-lg text-sensual max-w-3xl mx-auto">
        LuxeDropShopping est né de la passion pour le commerce en ligne accessible à tous.
        Nous sélectionnons des milliers de produits — mode, beauté, électronique, bijoux — livrés partout dans le monde.
      </p>
      <img src="/images/couple.jpg" alt="Notre univers" className="rounded-3xl shadow-md animate-float mt-10 mx-auto"/>
    </main>
  );
}
