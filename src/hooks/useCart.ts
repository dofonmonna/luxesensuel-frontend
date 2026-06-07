import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;          // product UUID
  cartKey: string;     // unique key: "{id}" or "{id}_{sku_attr}" for variants
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedSkuAttr?: string | null;   // ex: "14:1254#Coffee"
  selectedSkuLabel?: string | null;  // ex: "Coffee"
  shippingFee?: number | null;       // frais de livraison du produit
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'cartKey'> & { quantity?: number }) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  shippingTotal: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const cartKey = product.selectedSkuAttr
          ? `${product.id}_${product.selectedSkuAttr}`
          : product.id;
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.cartKey === cartKey);
        const qty = product.quantity ?? 1;

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item.cartKey === cartKey ? { ...item, quantity: item.quantity + qty } : item
            ),
          });
        } else {
          set({ items: [...currentItems, { ...product, cartKey, quantity: qty }] });
        }
      },
      removeItem: (cartKey) => set({ items: get().items.filter((item) => item.cartKey !== cartKey) }),
      updateQuantity: (cartKey, quantity) =>
        set({
          items: get().items.map((item) =>
            item.cartKey === cartKey ? { ...item, quantity: Math.max(1, quantity) } : item
          ),
        }),
      clearCart: () => set({ items: [] }),
      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
      // Somme des frais de livraison (une fois par ligne de panier, pas par quantité)
      shippingTotal: () => get().items.reduce((acc, item) => acc + (item.shippingFee ?? 15), 0),
    }),
    { name: 'luxesensuel-cart' }
  )
);
