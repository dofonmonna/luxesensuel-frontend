import React from "react";

export default function Apropos() {
  return (
    <main className="bg-gradient-to-b from-champagne to-rose min-h-screen py-20 px-10 text-center animate-fade">
      <h1 className="text-4xl font-garamond text-bordeaux mb-6">À propos de LuxeSensuel</h1>
      <p className="text-lg text-sensual max-w-3xl mx-auto">
        LuxeSensuel est né de la passion pour l’élégance et la sensualité. 
        Nous créons une expérience immersive où chaque détail respire le raffinement.
      </p>
      <img src="/images/couple.jpg" alt="Notre univers" className="rounded-3xl shadow-md animate-float mt-10 mx-auto"/>
    </main>
  );
}
