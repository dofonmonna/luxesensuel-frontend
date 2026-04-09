import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { useCart } from '@/hooks/useCart';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice } = useCart();

  const handleCheckout = () => {
    // 1. On ferme le panier proprement
    setIsCartOpen(false);
    // 2. On attend un tout petit peu que l'animation de fermeture se finisse
    setTimeout(() => {
      // 3. On redirige vers la page de paiement
      window.location.hash = "/checkout";
    }, 300);
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg bg-[#0D0D0D] border-l border-[#F5F5F5]/10 flex flex-col z-[101]">
        <SheetHeader className="space-y-2.5 pb-4 text-left">
          <SheetTitle className="font-['Cormorant_Garamond'] text-2xl text-[#F5F5F5] flex items-center gap-3 uppercase tracking-widest">
            <ShoppingBag className="w-6 h-6 text-[sensual]" />
            Votre Panier
          </SheetTitle>
          <SheetDescription className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
            Sélection Privée LuxeSensuel
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <ShoppingBag className="w-12 h-12 text-[#F5F5F5]/10 mb-6" />
            <h3 className="font-['Cormorant_Garamond'] text-xl text-[#F5F5F5] mb-2 animate-pulse animate-fade">Votre panier est vide</h3>
            <Button onClick={() => setIsCartOpen(false)} className="bg-transparent border border-white/10 text-white rounded-full px-8 py-6 text-[10px] tracking-widest uppercase mt-4">
              Découvrir la collection
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5 group">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity animate-float" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-['Cormorant_Garamond'] text-lg text-[#F5F5F5] truncate tracking-wide">{item.product.name}</h4>
                      <p className="text-sm text-[#D4A5A5] font-['Montserrat'] mb-3">{item.product.price.toFixed(2)} €</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-black/60 rounded-full px-3 py-1 border border-white/5">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="text-[#F5F5F5]/30 hover:text-[sensual] transition-colors"><Minus size={12} /></button>
                          <span className="text-[10px] text-[#F5F5F5] font-['Montserrat'] min-w-[12px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="text-[#F5F5F5]/30 hover:text-[sensual] transition-colors"><Plus size={12} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-white/10 hover:text-[sensual] transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-6 space-y-5">
              <div className="flex justify-between items-end px-2">
                <span className="font-['Cormorant_Garamond'] text-xl text-white tracking-[0.2em] uppercase font-light">Total</span>
                <span className="font-['Cormorant_Garamond'] text-4xl text-white italic tracking-tighter">{totalPrice.toFixed(2)} €</span>
              </div>
              <Button 
                onClick={handleCheckout}
                className="w-full py-8 bg-[sensual] hover:bg-[#63142D] text-white font-['Montserrat'] font-bold tracking-[0.4em] uppercase text-[10px] transition-all duration-500 shadow-2xl shadow-[sensual]/20 rounded-2xl"
              >
                <span className="flex items-center justify-center gap-4">
                  Passer la commande
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
