import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MenuCatalog } from './components/MenuCatalog';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTracker } from './components/OrderTracker';
import { WaitingPaymentView } from './components/WaitingPaymentView';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';

const MainLayout: React.FC = () => {
  const { currentView } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-red-500 selection:text-white">
      {currentView !== 'admin' && <Navbar />}

      <main className="flex-1">
        {currentView === 'customer' && (
          <>
            <Hero />
            <MenuCatalog />
          </>
        )}

        {currentView === 'waiting_payment' && (
          <WaitingPaymentView />
        )}

        {currentView === 'tracking' && (
          <OrderTracker />
        )}

        {currentView === 'admin' && (
          <AdminPortal />
        )}
      </main>

      {currentView !== 'admin' && <Footer />}

      {/* Global Modals & Drawers */}
      <CustomizeModal />
      <CartDrawer />
      <CheckoutModal />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}
