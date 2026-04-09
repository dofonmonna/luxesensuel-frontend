import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Nouvel utilisateur :", formData);
    // Simulation d'inscription réussie
    alert("Bienvenue dans l'univers LuxeSensuel ! Votre compte a été créé.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[sensual]/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4A5A5]/5 rounded-full blur-[100px]" />

      <div className="max-w-md w-full space-y-8 bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#F5F5F5] tracking-[0.25em] animate-pulse animate-fade">
            LUXE<span className="text-[sensual]">SENSUEL</span>
          </h2>
          <p className="text-[10px] text-[#D4A5A5] font-['Montserrat'] tracking-[0.4em] uppercase opacity-80">
            Maison de Beauté & Prestige
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[sensual] group-focus-within:text-[#D4A5A5] transition-colors" />
              <Input
                placeholder="Nom Complet"
                className="pl-12 h-14 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-[sensual] rounded-2xl transition-all duration-300"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[sensual] group-focus-within:text-[#D4A5A5] transition-colors" />
              <Input
                type="email"
                placeholder="Adresse Email"
                className="pl-12 h-14 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-[sensual] rounded-2xl transition-all duration-300"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[sensual] group-focus-within:text-[#D4A5A5] transition-colors" />
              <Input
                type="password"
                placeholder="Mot de passe"
                className="pl-12 h-14 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:border-[sensual] rounded-2xl transition-all duration-300"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-14 bg-[sensual] hover:bg-[#63142D] text-white rounded-2xl transition-all duration-500 flex items-center justify-center gap-3 group border-none shadow-xl shadow-[sensual]/10">
            <span className="font-['Montserrat'] tracking-widest font-light text-sm">CRÉER MON COMPTE</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />
          </Button>
        </form>

        <div className="pt-8 border-t border-white/5 text-center space-y-4">
          <p className="text-[#F5F5F5]/30 text-[10px] flex items-center justify-center gap-2 tracking-widest uppercase">
            <ShieldCheck className="h-3.5 w-3.5 text-[#D4A5A5]" />
            Paiement & Données Sécurisés
          </p>
          <Link to="/" className="inline-block text-xs text-[#D4A5A5] hover:text-white transition-colors font-['Montserrat'] tracking-widest uppercase">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
