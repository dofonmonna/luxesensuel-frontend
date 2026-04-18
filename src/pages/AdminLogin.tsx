import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Lock, ShieldCheck, ArrowLeft, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Mot de passe incorrect');
        return;
      }

      localStorage.setItem('Luxe_admin_token', data.token);
      toast.success("Accès administrateur autorisé");
      navigate('/admin');
    } catch (err) {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-200 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-30" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block group mb-6">
            <span className="font-[Cormorant_Garamond] text-3xl font-semibold tracking-[0.3em] text-gray-900">
              LUXE<span className="text-[#CC0000] italic">Dropshoping</span>
            </span>
            <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mt-2">
              Backoffice
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1 bg-[#CC0000] opacity-50" />
          
          <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-2xl mx-auto mb-8">
            <ShieldCheck size={32} className="text-[#CC0000]" />
          </div>

          <h1 className="text-2xl font-black text-center text-gray-900 mb-2">Accès Sécurisé</h1>
          <p className="text-center text-xs text-gray-400 font-medium uppercase tracking-widest mb-10">
            Luxe Dropshoping Admin
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                Mot de passe Maître
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-bold tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-sensual w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  DÉVERROUILLER
                  <ShieldCheck size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#CC0000] transition-colors"
            >
              <ArrowLeft size={14} />
              Retour à la boutique
            </Link>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-10 flex items-center justify-center gap-4 opacity-50">
          <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4" />
            Tentative d'accès enregistrée
          </div>
          <div className="w-1 h-1 bg-gray-300 rounded-full" />
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            IP: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}