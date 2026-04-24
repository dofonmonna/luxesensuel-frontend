/**
 * Provider Analytics - Intègre GA4 + Meta Pixel + TikTok
 * À placer dans App.tsx pour activer le tracking global
 */
import { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialiser les analytics
  useAnalytics();

  return <>{children}</>;
}

// Composant pour tracker un produit spécifique
export function TrackProductView({ product }: { product: any }) {
  const { trackProductView } = useAnalytics();

  useEffect(() => {
    if (product) {
      trackProductView({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product, trackProductView]);

  return null;
}
