import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Loader2, LogOut, Package, Truck, UserCircle2, ShoppingBag, MapPin, Calendar, ChevronRight, ShieldCheck, CreditCard, Phone } from 'lucide-react';
import { toast } from 'sonner';

export function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        setUserData(userSnap.exists() ? userSnap.data() : { name: user.displayName, email: user.email });
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const ordersData = querySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        
        // Trier côté client pour éviter l'erreur d'index Firestore
        ordersData.sort((a: any, b: any) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        
        setOrders(ordersData);
      } catch (error) {
        console.error('Erreur de chargement:', error);
        toast.error("Erreur lors de la récupération des informations.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Déconnexion réussie");
      navigate('/');
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#CC0000] mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Chargement de votre univers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-[Montserrat] pb-20 pt-10 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* En-tête du profil */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-[Cormorant_Garamond] text-5xl font-semibold text-gray-900 leading-tight">
              Bonjour, <span className="text-[#CC0000] italic">{userData?.firstName || 'Client'}</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400 font-medium uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Espace Membre Privilège Luxe Dropshoping
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#CC0000] hover:border-[#CC0000]/20 transition-all shadow-sm active:scale-95"
          >
            <LogOut size={14} />
            Se déconnecter
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          
          {/* GAUCHE: Infos & Stats */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 transition-transform group-hover:scale-110" />
              
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                  <UserCircle2 size={48} className="text-[#CC0000]" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-1">{userData?.firstName} {userData?.lastName}</h2>
                <p className="text-sm text-gray-400 font-medium mb-6">{userData?.email}</p>
                
                <div className="space-y-4 pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <Phone size={14} />
                    </div>
                    <span className="font-bold tracking-tight">{userData?.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                      <MapPin size={14} />
                    </div>
                    <span className="font-medium leading-relaxed">
                      {userData?.address ? (
                        <>
                          {userData.address}<br />
                          {userData.city}, {userData.country}
                        </>
                      ) : 'Adresse non renseignée'}
                    </span>
                  </div>
                </div>

                <Link 
                  to="/settings" 
                  className="mt-8 flex items-center justify-between w-full p-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#CC0000] hover:bg-red-50 transition-all group/btn"
                >
                  Modifier mes informations
                  <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#CC0000] mb-6">Avantages Membre</h3>
              <div className="space-y-4">
                {[
                  { icon: <Truck size={16} />, label: 'Livraison Prioritaire' },
                  { icon: <CreditCard size={16} />, label: 'Offres Exclusive' },
                  { icon: <ShieldCheck size={16} />, label: 'Support 24/7' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                    <div className="text-[#CC0000]">{item.icon}</div>
                    {item.label}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* DROITE: Commandes */}
          <div className="lg:col-span-8 space-y-6">
            <section className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[400px]">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <Package size={24} className="text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 leading-tight">Mes commandes</h2>
                </div>
                <span className="px-4 py-1.5 bg-gray-100 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {orders.length} commande(s)
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-medium mb-8">Vous n'avez pas encore passé de commande.</p>
                  <Link to="/shop" className="btn-sensual px-10 h-14 rounded-2xl text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-100 flex items-center gap-3">
                    Découvrir la collection
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order.id} 
                      className="group p-6 rounded-[2rem] border border-gray-50 bg-white hover:border-[#CC0000]/20 hover:shadow-xl hover:shadow-red-500/5 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Package size={24} className="text-gray-400 group-hover:text-[#CC0000] transition-colors" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-black text-gray-900 uppercase">#{order.id.slice(-6)}</span>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                order.status === 'confirmed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                              }`}>
                                {order.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              <Calendar size={12} />
                              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                            <p className="text-lg font-black text-gray-900">{(order.totalAmount || 0).toFixed(2)} €</p>
                          </div>
                          <Link 
                            to={`/order/${order.id}`}
                            className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-[#CC0000] group-hover:text-white transition-all"
                          >
                            <ChevronRight size={20} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}