// ✅ Utilisation de 'import type' pour éviter l'erreur au runtime
import type { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  count: string;
  icon: LucideIcon;
  gradient: string;
  image?: string;
}

// ✅ On garde l'export nommé pour la cohérence du projet
export const CategoryCard = ({ title, count, icon: Icon, gradient, image }: CategoryCardProps) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-6 h-64 cursor-pointer hover-lift group`}>
      {/* Background Image with Overlay */}
      {image && (
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end text-white">
        <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{count}</p>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};