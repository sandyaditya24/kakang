import React from 'react';
import { Phone, MapPin, Clock, Heart, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { settings, setCurrentView } = useStore();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  className="w-7 h-7 rounded object-cover bg-stone-800 border border-stone-700"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.footer-logo-fallback')?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-7 h-7 rounded bg-red-600 text-white font-bold flex items-center justify-center text-sm footer-logo-fallback ${settings.logoUrl ? 'hidden' : ''}`}>
                JK
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                {settings.storeName}
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed text-xs">
              {settings.tagline}
            </p>
            <div className="pt-1 text-[11px] text-stone-400">
              Menerima pesanan untuk acara kumpul, kantor, ulang tahun, dan arisan.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Menu Favorit
            </h4>
            <ul className="space-y-1.5 text-stone-400">
              <li>Cireng Salju Bumbu Rujak</li>
              <li>Seblak Komplit Bandung</li>
              <li>Basreng Pedas Daun Jeruk</li>
              <li>Cilok Kuah Goang</li>
              <li>Es Cendol Gula Aren</li>
            </ul>
          </div>

          {/* Lokasi & Jam Operasional */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Outlet & Jam Buka
            </h4>
            <div className="flex items-start gap-2 text-stone-400">
              <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-start gap-2 text-stone-400">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Buka Setiap Hari: 10.00 - 22.00 WIB</span>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Layanan Pelanggan
            </h4>
            <a
              href={`https://wa.me/${settings.phoneWhatsapp.startsWith('0') ? '62' + settings.phoneWhatsapp.slice(1) : settings.phoneWhatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Chat WhatsApp (089620012837)</span>
            </a>
            <p className="text-[11px] text-stone-400">
              Hubungi WhatsApp kami untuk konsultasi pesanan, info katering, atau pertanyaan seputar menu.
            </p>
          </div>

        </div>

        {/* Copyright Line with Discreet Admin Access */}
        <div className="pt-8 border-t border-stone-800 text-center sm:flex sm:justify-between sm:items-center sm:text-left text-[11px] text-stone-400">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <p>© {new Date().getFullYear()} Jajanan Kakang. Seluruh hak cipta dilindungi.</p>
            {/* Discreet hidden admin entry link */}
            <button
              onClick={() => {
                setCurrentView('admin');
                window.history.pushState({}, '', '/admin');
              }}
              className="text-stone-700 hover:text-stone-400 transition-colors cursor-pointer text-[10px] inline-flex items-center justify-center gap-1 opacity-70 hover:opacity-100"
              title="Akses Rahasia Pengelola (/admin)"
            >
              <span>•</span>
              <span>Akses Pengelola</span>
            </button>
          </div>
          <p className="mt-2 sm:mt-0 flex items-center justify-center sm:justify-start gap-1">
            <span>Dibuat dengan rasa cinta untuk kuliner nusantara</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
          </p>
        </div>

      </div>
    </footer>
  );
};
