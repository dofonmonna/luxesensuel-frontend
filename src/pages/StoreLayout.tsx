import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WelcomePopup } from '../components/WelcomePopup';
import { ExitIntentPopup } from '../components/ExitIntentPopup';
import { SocialProofToast } from '../components/SocialProof';
import { WhatsAppButton } from '../components/WhatsAppButton';

export const StoreLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={`min-h-screen flex flex-col ${isAuthPage ? 'bg-[#f5f5f5]' : 'bg-gray-50'}`}>
      {!isAuthPage && <Header />}
      
      <main className="flex-1 w-full flex flex-col relative">
        <Outlet />
      </main>
      
      {!isAuthPage && <Footer />}

      {/* Conversion Boosters */}
      <WelcomePopup />
      <ExitIntentPopup />
      <SocialProofToast />
      {!isAuthPage && <WhatsAppButton />}
    </div>
  );
};