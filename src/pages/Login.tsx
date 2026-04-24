import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, UserCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { useT } from '@/i18n/I18nProvider';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useT();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('LuxeSensuel ✦');
      navigate('/profile');
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <SEO title={t('auth.login')} description={t('auth.login')} noindex={true} />
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-50" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <span className="font-[Cormorant_Garamond] text-4xl font-semibold tracking-widest text-gray-900 select-none">
              LUXE<span className="text-[#CC0000] italic">Dropshoping</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{t('auth.login')}</h1>
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mt-2">{t('auth.signin')}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
              <input 
                type="email" 
                placeholder={t('auth.email')}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-xs font-bold tracking-widest placeholder:text-gray-300 placeholder:font-medium" 
                onChange={(e)=>setEmail(e.target.value)} 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#CC0000] transition-colors" />
              <input 
                type="password" 
                placeholder={t('auth.password')}
                required
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-xs font-bold tracking-widest placeholder:text-gray-300 placeholder:font-medium" 
                onChange={(e)=>setPassword(e.target.value)} 
              />
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[10px] font-black uppercase tracking-widest text-[#CC0000] hover:underline">
                {t('auth.forgot_password')}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="btn-sensual w-full h-14 rounded-2xl text-xs shadow-xl shadow-red-100 flex items-center justify-center gap-3 active:scale-[0.98] transition-all uppercase tracking-[0.2em]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t('auth.signin')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
              {t('auth.no_account')}
            </p>
            <Link 
              to="/signup" 
              className="inline-flex items-center gap-2 text-xs font-black text-[#CC0000] hover:gap-3 transition-all uppercase tracking-widest"
            >
              {t('auth.create_account')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {t('footer.payment_secure')}
          </div>
          <div className="w-px h-3 bg-gray-200" />
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            <UserCircle className="w-4 h-4 text-blue-500" />
            {t('footer.privacy')}
          </div>
        </div>
      </div>
    </div>
  );
}
