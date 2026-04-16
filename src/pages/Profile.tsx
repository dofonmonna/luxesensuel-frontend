import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, LogOut, Package, Truck, UserCircle2 } from 'lucide-react';

// ✅ CHANGEMENT : export default → export function
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
        setOrders(ordersData);
      } catch (error) {
        console.error('Erreur de chargement:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0D0D0D]">
        <Loader2 size={28} className="animate-spin text-[#FFD700]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] px-6 pb-20 pt-10 text-white lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[30px] border border-white/8 bg-[#141414] p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#FFD700]">Mon compte</p>
            <div className="mt-5 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#8B1E3F]/30">
                  <UserCircle2 size={40} className="text-[#FFD700]" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{userData?.name || 'Cliente LuxeSensuel'}</h1>
                  <p className="mt-2 text-sm text-white/50">{userData?.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => auth.signOut()}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-white/70 transition-colors hover:text-white"
              >
                <LogOut size={14} />
                Deconnexion
              </button>
            </div>
          </section>

          <aside className="rounded-[30px] border border-white/8 bg-[#141414] p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#FFD700]">Services client</p>
            <div className="mt-5 space-y-4">
              {[
                'Suivi des commandes depuis votre espace client.',
                'Livraison discrete et informations de statut.',
                'Compte client aligne sur le nouveau parcours marchand.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} className="mt-1 text-[#FFD700]" />
                  <p className="text-sm leading-7 text-white/55">{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>

        <section className="rounded-[30px] border border-white/8 bg-[#141414] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#FFD700]">Mes commandes</p>
              <h2 className="mt-2 text-3xl font-bold text-white">Historique client</h2>
            </div>
            <div className="text-sm text-white/45">{orders.length} commande(s)</div>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-10 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-white/30">Aucune commande enregistree pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <article key={order.id} className="grid gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B1E3F]/20">
                      <Package size={22} className="text-[#FFD700]" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-white/40">Commande #{order.id.slice(0, 8)}</p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {order.total} EUR - {order.items?.length || 0} article(s)
                      </p>
                      <p className="mt-2 text-sm text-white/50">
                        Suivi destination: {order.shippingAddress?.city || 'Ville inconnue'}, {order.shippingAddress?.country || 'Pays inconnu'}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-green-400">
                      <Truck size={12} />
                      {order.status === 'pending' ? 'En preparation' : 'Expedie'}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}