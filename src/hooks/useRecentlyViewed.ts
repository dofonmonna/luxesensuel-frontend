/**
 * Hook pour gérer les produits récemment consultés
 * Stocke les 10 derniers produits vus dans localStorage
 */
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'luxe_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [products, setProducts] = useState<RecentProduct[]>([]);

  // Charger depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentProduct[];
        // Garder uniquement ceux des 7 derniers jours
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setProducts(parsed.filter(p => p.viewedAt > oneWeekAgo));
      }
    } catch {
      // ignore
    }
  }, []);

  // Ajouter un produit vu
  const addProduct = useCallback((product: Omit<RecentProduct, 'viewedAt'>) => {
    setProducts(prev => {
      // Retirer le doublon s'il existe
      const filtered = prev.filter(p => p.id !== product.id);
      // Ajouter en premier
      const updated = [{ ...product, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      // Sauvegarder
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Vider l'historique
  const clear = useCallback(() => {
    setProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentProducts: products,
    addViewed: addProduct,
    clearViewed: clear,
  };
}
