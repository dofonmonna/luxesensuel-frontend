import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  count?: string;
  icon: LucideIcon;
  gradient?: string;
  image?: string;
  slug?: string;
}

export function CategoryCard({ title, count, icon: Icon, gradient = 'bg-white', image, slug }: CategoryCardProps) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    const searchParam = slug || title.toLowerCase();
    navigate(`/shop?cat=${searchParam}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`group relative flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-[#CC0000] hover:bg-red-50/50 hover:shadow-sm ${gradient}`}
    >
      {/* Icon Wrapper */}
      <div className="relative mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 group-hover:bg-[#CC0000]/10 transition-colors duration-300">
        <Icon className="w-7 h-7 text-gray-700 group-hover:text-[#CC0000] transition-colors duration-300" />
        
        {/* Subtle Background Shape */}
        <div className="absolute -z-10 w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-transparent opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
      </div>
      
      {/* Text Info */}
      <div className="text-center">
        <h3 className="text-xs font-bold text-gray-800 group-hover:text-[#CC0000] transition-colors line-clamp-1">
          {title}
        </h3>
        {count && (
          <p className="text-[10px] text-gray-400 mt-0.5 group-hover:text-gray-500">
            {count}
          </p>
        )}
      </div>
      
      {/* Little Arrow on Hover */}
      <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-300">
        <svg className="w-3 h-3 text-[#CC0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}