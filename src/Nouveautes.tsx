import React from "react";

export default function Nouveautes() {
  return (
    <main className="bg-gradient-to-b from-rose to-champagne min-h-screen py-20 px-10">
      <h1 className="text-4xl font-garamond text-bordeaux text-center mb-12 animate-fade">
        Nos Nouveautés
      </h1>
      <section className="flex overflow-x-scroll gap-8 px-6">
        <div className="min-w-[250px] bg-white rounded-3xl shadow-md p-6 text-center animate-fade">
          <img src="/images/huiles.jpg" alt="Huile" className="rounded-3xl shadow-md animate-float mb-4"/>
          <span className="bg-rose text-ivoire px-3 py-1 rounded-full text-xs">Nouveau</span>
          <h3 className="font-garamond text-lg text-bordeaux mt-2">Huile Sensuelle</h3>
        </div>
      </section>
    </main>
  );
}
