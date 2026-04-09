import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("BIENVENUE CHEZ LUXESENSUEL");
      navigate('/profile');
    } catch (error) {
      toast.error("Identifiants incorrects.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-6 pt-20">
      <div className="max-w-md w-full bg-white/[0.02] border border-white/5 p-12 rounded-[3rem] backdrop-blur-xl">
        <h2 className="font-['Cormorant_Garamond'] text-4xl text-white tracking-widest uppercase italic text-center mb-10 text-center animate-pulse animate-fade">Connexion</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="email" placeholder="EMAIL" className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-8 text-white text-[10px] tracking-widest focus:border-[#D4A5A5] outline-none" onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" placeholder="MOT DE PASSE" className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-8 text-white text-[10px] tracking-widest focus:border-[#D4A5A5] outline-none" onChange={(e)=>setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-[sensual] text-white py-5 rounded-full text-[10px] tracking-widest uppercase font-bold shadow-xl">Se Connecter</button>
        </form>
        <p className="text-white/40 text-[9px] text-center mt-8 uppercase tracking-widest">
          Pas encore membre ? <Link to="/signup" className="text-[#D4A5A5]">Rejoignez-nous</Link>
        </p>
      </div>
    </div>
  );
}
