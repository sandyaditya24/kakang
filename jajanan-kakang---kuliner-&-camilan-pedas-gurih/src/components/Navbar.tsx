import React from 'react';
import { ShoppingBag, ShieldCheck, Search, PhoneCall } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Navbar: React.FC = () => {
  const {
    cartTotalCount,
    setIsCartOpen,
    currentView,
    setCurrentView,
    isAdminLoggedIn,
    settings
  } = useStore();

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      {/* Top Notice Bar */}
      {settings.announcement && (
        <div className="bg-amber-600/90 text-amber-50 px-4 py-1.5 text-xs text-center font-medium tracking-wide">
          <span>{settings.announcement}</span>
        </div>
      )}

      {/* Strict One-Row Three-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Wordmark (Single text element with dynamic logo support) */}
          <button
            onClick={() => {
              setCurrentView('customer');
              if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
                window.history.pushState({}, '', '/');
              }
            }}
            className="flex items-center gap-2.5 text-left cursor-pointer group shrink-0"
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-8 h-8 rounded-lg object-cover bg-stone-800 border border-stone-700 shadow-sm"
                onError={(e) => {
                  // Fallback to red JK block if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.logo-fallback')?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white text-base shadow-sm group-hover:bg-red-500 transition-colors logo-fallback ${settings.logoUrl ? 'hidden' : ''}`}>
              JK
            </div>
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
              {settings.storeName || 'Jajanan Kakang'}
            </span>
          </button>

          {/* Zone 2: 4-5 Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-300">
            <button
              onClick={() => {
                setCurrentView('customer');
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
            >
              Menu Jajanan
            </button>
            <button
              onClick={() => {
                setCurrentView('customer');
                const el = document.getElementById('menu-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer"
            >
              Paket Hemat
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className={`transition-colors whitespace-nowrap shrink-0 text-left cursor-pointer ${currentView === 'tracking' ? 'text-amber-400 font-semibold' : 'hover:text-white'}`}
            >
              Lacak Pesanan
            </button>
            <a
              href={`https://wa.me/${settings.phoneWhatsapp.startsWith('0') ? '62' + settings.phoneWhatsapp.slice(1) : settings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5 text-stone-400" />
              <span>WA 089620012837</span>
            </a>
          </nav>

          {/* Zone 3: Primary Customer Action Only (No Admin Button) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Shopping Bag Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {cartTotalCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-bold text-red-700 bg-white rounded-full tabular-nums">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
