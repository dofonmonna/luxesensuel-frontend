import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function StoreLayout() {
  const location = useLocation();
  const isCart = location.pathname === '/cart';

  return (
    <div className={`min-h-screen flex flex-col ${isCart ? 'bg-[#f5f5f5]' : 'bg-gray-100'}`}>
      {!isCart && <Header />}
      
      <main className={`flex-1 w-full ${isCart ? '' : 'max-w-[1400px] mx-auto px-4'}`}>
        <Outlet />
      </main>
      
      {!isCart && <Footer />}
    </div>
  );
}