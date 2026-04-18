import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Save, User, Phone, MapPin, Building, Globe } from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      setUserUid(user.uid);
      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            country: data.country || ''
          });
        }
      } catch (error) {
        toast.error("Erreur de chargement des données.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userUid), {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      toast.success("Informations mises à jour !");
      navigate('/profile');
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#CC0000]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/profile')} 
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#CC0000] mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour au profil
        </button>

        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Mes Informations</h1>
            <p className="text-sm text-gray-500">Mettez à jour vos coordonnées pour faciliter vos prochaines commandes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Prénom</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Nom</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+33 6 12 34 56 78"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Adresse</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Ville</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Pays</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.country}
                    onChange={e => setFormData({...formData, country: e.target.value})}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#CC0000] transition-all text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-sensual w-full py-4 rounded-2xl text-base shadow-xl shadow-red-100 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
