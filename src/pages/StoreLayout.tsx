import { Outlet, useLocation } from 'react-router-dom';
// ✅ Utilisation des imports nommés
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// ✅ Changement en export nommé
export const StoreLayout = () => {
  const location = useLocation();
  const isCart = location.pathname === '/cart';

  return (
    <div className={`min-h-screen flex flex-col ${isCart ? 'bg-[#f5f5f5]' : 'bg-gray-100'}`}>
      {/* Rendu conditionnel du Header */}
      {!isCart && <Header />}
      
      <main className={`flex-1 w-full ${isCart ? '' : 'max-w-[1400px] mx-auto px-4'}`}>
        <Outlet />
      </main>
      
      {/* Rendu conditionnel du Footer */}
      {!isCart && <Footer />}
    </div>
  );
};