import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Connexion réussie ! Bienvenue dans votre espace Luxe.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[sensual]/10 rounded-full blur-[120px]" />
      <div className="max-w-md w-full space-y-8 bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl relative z-10">
        <div className="text-center">
          <h2 className="font-['Cormorant_Garamond'] text-4xl font-light text-[#F5F5F5] tracking-[0.25em] animate-pulse animate-fade">LUXE<span className="text-[sensual]">LOGIN</span></h2>
          <p className="text-[10px] text-[#D4A5A5] font-['Montserrat'] tracking-[0.4em] uppercase mt-2">Accès Privé</p>
        </div>
        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[sensual]" />
              <Input type="email" placeholder="Email" className="pl-12 h-14 bg-white/[0.05] border-white/10 text-white rounded-2xl" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[sensual]" />
              <Input type="password" placeholder="Mot de passe" className="pl-12 h-14 bg-white/[0.05] border-white/10 text-white rounded-2xl" required />
            </div>
          </div>
          <Button type="submit" className="w-full h-14 bg-[sensual] hover:bg-[#63142D] text-white rounded-2xl transition-all duration-500 tracking-widest uppercase text-xs">Se Connecter</Button>
        </form>
        <p className="text-center text-xs text-[#F5F5F5]/40 mt-6 font-['Montserrat']">Pas encore membre ? <Link to="/signup" className="text-[#D4A5A5] hover:text-white transition-colors uppercase ml-1">S'inscrire</Link></p>
      </div>
    </div>
  );
}
