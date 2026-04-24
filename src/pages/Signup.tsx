import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, User, Mail, Lock, Phone, MapPin, Globe, ArrowRight, Eye, EyeOff, ShieldCheck, Sparkles, Search } from "lucide-react";
import { COUNTRIES } from "@/utils/countries";
import { SEO } from '@/components/SEO';

export function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [form, setForm] = useState({
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "",
    phonePrefix: "+33",
    phone: "", 
    address: "", 
    city: "", 
    country: "France",
  });

  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    if (k === "country") {
      const country = COUNTRIES.find(c => c.name === val);
      setForm(f => ({ ...f, country: val, phonePrefix: country?.prefix || "" }));
    } else {
      setForm(f => ({ ...f, [k]: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    
    const fullPhone = `${form.phonePrefix}${form.phone}`;

    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const user = cred.user;
      await updateProfile(user, { displayName: `${form.firstName} ${form.lastName}` });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        phone: fullPhone,
        address: form.address,
        city: form.city,
        country: form.country,
        role: "client",
        createdAt: new Date().toISOString(),
      });
      toast.success("Bienvenue chez Luxe Dropshoping ✦");
      setTimeout(() => navigate("/profile"), 500);
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") toast.error("Cet email est déjà utilisé.");
      else if (err.code === "auth/weak-password") toast.error("Mot de passe trop faible (6 caractères min).");
      else toast.error("Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      <SEO title="Créer un compte" description="Inscrivez-vous sur LuxeSensuel pour profiter d'offres exclusives et suivre vos commandes." noindex={true} />
      
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-50 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 opacity-60" />

      <div className="max-w-2xl w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-block mb-6 group">
            <span className="font-[Cormorant_Garamond] text-4xl font-semibold tracking-[0.3em] text-gray-900 group-hover:text-[#CC0000] transition-colors">
              LUXE<span className="text-[#CC0000] italic">Dropshoping</span>
            </span>
          </Link>
          <div className="flex items-center justify-center gap-3 text-[#CC0000] mb-4">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Adhésion Exclusive</span>
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">Créez votre compte</h1>
          <p className="text-gray-400 text-sm mt-3 font-medium">Rejoignez une communauté dédiée à l'élégance et au plaisir.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Identité */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC0000] mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-[#CC0000]" /> Informations personnelles
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input 
                    required type="text" placeholder="Prénom" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                    value={form.firstName} onChange={set("firstName")} 
                  />
                </div>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input 
                    required type="text" placeholder="Nom" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                    value={form.lastName} onChange={set("lastName")} 
                  />
                </div>
              </div>
            </div>

            {/* Section: Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                <input 
                  required type="email" placeholder="Adresse email" 
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                  value={form.email} onChange={set("email")} 
                />
              </div>
              <div className="relative flex gap-2">
                <div className="w-24 shrink-0 relative group">
                  <input 
                    type="text" 
                    value={form.phonePrefix} 
                    onChange={set("phonePrefix")}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-bold text-center"
                  />
                </div>
                <div className="relative flex-1 group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input 
                    required type="tel" placeholder="Téléphone" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                    value={form.phone} onChange={set("phone")} 
                  />
                </div>
              </div>
            </div>

            {/* Section: Livraison */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC0000] mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-[#CC0000]" /> Adresse de livraison
              </p>
              <div className="space-y-5">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                  <input 
                    required type="text" placeholder="Adresse complète (Quartier, Rue, Porte...)" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                    value={form.address} onChange={set("address")} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                    <input 
                      required type="text" placeholder="Ville" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                      value={form.city} onChange={set("city")} 
                    />
                  </div>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                    <select 
                      value={form.country} onChange={set("country")} 
                      className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-bold appearance-none scrollbar-hide"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.prefix})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Sécurité */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC0000] mb-6 flex items-center gap-2">
                <span className="w-5 h-px bg-[#CC0000]" /> Sécurité du compte
              </p>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                <input 
                  required type={showPass ? "text" : "password"} placeholder="Mot de passe (6 car. min)" 
                  className="w-full pl-12 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                  value={form.password} onChange={set("password")} 
                />
                <button 
                  type="button" onClick={() => setShowPass(!showPass)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button 
                type="submit" disabled={loading} 
                className="btn-sensual w-full h-16 rounded-2xl text-base shadow-xl shadow-red-100 flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <span>CRÉER MON COMPTE</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-4">
              Déjà membre de l'univers ?
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-black text-[#CC0000] hover:gap-4 transition-all uppercase tracking-widest"
            >
              Se connecter à mon compte
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Vos données sont protégées et ne seront jamais partagées
          </p>
          <p className="text-[11px] text-gray-400">
            Une question ? <a href="mailto:luxesensuel11@gmail.com" className="text-[#CC0000] font-bold hover:underline transition-all">luxesensuel11@gmail.com</a>
          </p>
        </div>

      </div>
    </div>
  );
}