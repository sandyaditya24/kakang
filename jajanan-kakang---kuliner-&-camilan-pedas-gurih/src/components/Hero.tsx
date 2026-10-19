import React from 'react';
import { ArrowRight, Flame, Sparkles, Clock, MapPin } from 'lucide-react';
import heroImg from '../assets/images/hero_jajanan_kakang_1792424318958.jpg';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { settings, setCurrentView, setSelectedCategory } = useStore();

  const scrollToMenu = () => {
    const el = document.getElementById('menu-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-stone-900 text-stone-100 border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Unboxed Metadata Kicker (Anti-Pill) */}
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <span>Kuliner Sunda Autentik</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>Digoreng Hangat Setiap Pesanan</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span>Level 0 - 5</span>
            </div>

            {/* Main Headline with text-wrap: balance */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ textWrap: 'balance' }}>
              Camilan Pedas Gurih Khas Nusantara, Bikin Nagih Tiap Gigitan.
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-stone-300 leading-relaxed max-w-2xl">
              Nikmati renyahnya Cireng Salju bumbu rujak legit, Seblak Komplit kuah kencur merah membara, Basreng renyah aroma daun jeruk, dan aneka minuman segar pereda dahaga.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={scrollToMenu}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>Lihat Menu & Pesan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentView('tracking')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-stone-200 bg-stone-800 border border-stone-700 rounded-lg hover:bg-stone-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Lacak Pesanan Saya</span>
              </button>
            </div>

            {/* Adjacency Proof Points Strip */}
            <div className="pt-4 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-400">
              <div>
                <span className="block font-bold text-stone-200 text-sm tabular-nums">100% Halal</span>
                <span>Bahan higienis & segar</span>
              </div>
              <div>
                <span className="block font-bold text-stone-200 text-sm tabular-nums">&lt; 15 Menit</span>
                <span>Waktu persiapan cepat</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block font-bold text-stone-200 text-sm tabular-nums">Gratis Ongkir</span>
                <span>Min. order Rp50.000</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Showcase Image with Resilient Scrim */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
              <img
                src={heroImg}
                alt="Jajanan Kakang Spesial Cireng Seblak Basreng"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />
              
              {/* Floating Caption inside image */}
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-stone-900/90 backdrop-blur-md border border-stone-700/60 rounded-xl text-xs text-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-500" />
                  <span className="font-semibold text-white">Menu Favorit Hari Ini:</span>
                  <span className="text-stone-300">Seblak Komplit & Cireng Rujak</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('paket');
                    scrollToMenu();
                  }}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer underline text-[11px]"
                >
                  Pilih Paket
                </button>
              </div>
            </div>

            {/* Store Location Marker */}
            <div className="mt-3 flex items-center gap-2 text-xs text-stone-400 px-1">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="truncate">{settings.address}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
