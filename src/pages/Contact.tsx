import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { MessageCircle, Mail, Clock, MapPin, ChevronRight, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const WHATSAPP_NUMBER = '2250505409595';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour LUXEDropshoping ! J\'ai une question.')}`;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur inconnue');
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Une erreur est survenue, réessayez plus tard.');
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-16 px-4">
      <SEO
        title="Nous Contacter"
        description="Contactez LUXEDropshoping par WhatsApp ou email. Notre équipe répond en moins de 5 minutes."
      />

      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-2">
          <Link to="/" className="hover:text-[#CC0000]">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900">Contact</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#CC0000] to-[#8B0000] rounded-3xl p-8 md:p-14 text-center text-white mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black mb-3">Nous contacter</h1>
          <p className="text-white/80 text-lg">Une question ? On vous répond en moins de 5 minutes</p>
        </div>

        {/* WhatsApp */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all group flex flex-col sm:flex-row items-center gap-6 mb-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#25D366] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl font-black text-gray-900 mb-1">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-2">La façon la plus rapide de nous joindre. Réponse immédiate.</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-[#25D366] font-bold text-sm">
              <Clock className="w-4 h-4" />
              <span>Lun–Sam · 8h–22h</span>
            </div>
          </div>
          <span className="px-6 py-3 bg-[#25D366] text-white rounded-2xl text-sm font-bold group-hover:bg-[#22c55e] transition-colors shrink-0">
            Ouvrir WhatsApp
          </span>
        </a>

        {/* Formulaire de contact */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#CC0000] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Envoyez-nous un message</h2>
              <p className="text-xs text-gray-400">Réponse sous 24h · contact@luxedropshoping.com</p>
            </div>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="w-14 h-14 text-green-500 mb-4" />
              <h3 className="text-lg font-black text-gray-900 mb-2">Message envoyé !</h3>
              <p className="text-sm text-gray-500 mb-6">Nous vous répondrons dans les 24 heures.</p>
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-2 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Nom <span className="text-[#CC0000]">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Votre nom"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email <span className="text-[#CC0000]">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#CC0000] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Sujet
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="De quoi s'agit-il ?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#CC0000] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Message <span className="text-[#CC0000]">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Décrivez votre question ou demande..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#CC0000] transition-colors resize-none"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 bg-[#CC0000] hover:bg-[#aa0000] disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-sm transition-colors"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Envoyer le message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-black text-gray-900 mb-6">Informations utiles</h2>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Hub logistique</p>
                <p>Abidjan, Côte d'Ivoire · Livraison mondiale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Heures d'ouverture</p>
                <p>Lundi – Samedi : 8h00 – 22h00 (GMT)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageCircle className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Langues</p>
                <p>Français · English · Português</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-3">
            <Link to="/retours" className="text-xs text-[#CC0000] hover:underline font-medium">Politique de retour</Link>
            <span className="text-gray-200">·</span>
            <Link to="/cgv" className="text-xs text-[#CC0000] hover:underline font-medium">CGV</Link>
            <span className="text-gray-200">·</span>
            <Link to="/confidentialite" className="text-xs text-[#CC0000] hover:underline font-medium">Confidentialité</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
