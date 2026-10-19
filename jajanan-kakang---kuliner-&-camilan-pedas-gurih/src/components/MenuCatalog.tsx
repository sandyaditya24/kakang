import React, { useMemo } from 'react';
import { Search, Flame, Clock, Plus, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CategoryType, MenuItem } from '../types';

export const MenuCatalog: React.FC = () => {
  const {
    menu,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    openCustomize,
    formatRupiah
  } = useStore();

  const categories: { id: CategoryType; label: string }[] = [
    { id: 'all', label: 'Semua Menu' },
    { id: 'pedas', label: 'Pedas Gurih' },
    { id: 'kuah', label: 'Kuah Hangat' },
    { id: 'gorengan', label: 'Gorengan Renyah' },
    { id: 'minuman', label: 'Minuman Segar' },
    { id: 'paket', label: 'Paket Hemat' },
  ];

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [menu, selectedCategory, searchQuery]);

  return (
    <section id="menu-section" className="py-12 bg-stone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-200">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">
              Daftar Menu Pilihan
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Pilihan Jajanan & Camilan Kakang
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari cireng, seblak, es teh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-lg text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                Hapus
              </button>
            )}
          </div>
        </div>

        {/* Category Segmented Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {categories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Menu Grid: 3-column desktop, 2-column tablet, 1-column mobile */}
        {filteredMenu.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-stone-200 my-6">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-stone-800">Menu Tidak Ditemukan</h3>
            <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
              Tidak ada menu yang cocok dengan "{searchQuery}". Silakan coba kata kunci lain atau reset filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Tampilkan Semua Menu
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 pt-4">
            {filteredMenu.map(item => (
              <ProductCard
                key={item.id}
                item={item}
                onSelect={() => openCustomize(item)}
                formatRupiah={formatRupiah}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

interface ProductCardProps {
  item: MenuItem;
  onSelect: () => void;
  formatRupiah: (val: number) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, onSelect, formatRupiah }) => {
  const categoryLabels: Record<string, string> = {
    pedas: 'Pedas Gurih',
    kuah: 'Kuah Hangat',
    gorengan: 'Gorengan Renyah',
    minuman: 'Minuman Segar',
    paket: 'Paket Hemat',
  };

  return (
    <article className={`flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 ${!item.isAvailable ? 'opacity-75' : ''}`}>
      
      {/* Product Image Slot (65-75% visual dominance with solid tone fallback) */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden group">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Subtle Text Badge (Anti-Pill: Single quiet tag) */}
        {item.badge && (
          <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-sm">
            {item.badge}
          </div>
        )}

        {/* Sold out overlay if not available */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-wider uppercase bg-red-600 px-3 py-1 rounded">
              Habis Terjual
            </span>
          </div>
        )}
      </div>

      {/* Card Content & Metadata */}
      <div className="flex-1 flex flex-col p-5">
        
        {/* Unboxed Metadata Line with subtle separators */}
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium">
          <span>{categoryLabels[item.category] || item.category}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-stone-400" />
            <span className="tabular-nums">{item.prepTimeMinutes}m</span>
          </span>
          {item.spicyLevelAllowed && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-0.5 text-red-600 font-semibold">
                <Flame className="w-3 h-3" />
                <span>Bisa Atur Pedas</span>
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-stone-900 line-clamp-1 mb-1">
          {item.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4 flex-1">
          {item.description}
        </p>

        {/* Price & Action Row */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500">Harga</span>
              {item.isAvailable && item.stockCount !== undefined && item.stockCount <= 5 && item.stockCount > 0 && (
                <span className="text-[10px] text-amber-700 font-bold">
                  (Sisa {item.stockCount} porsi)
                </span>
              )}
            </div>
            <span className="text-base font-extrabold text-stone-900 tabular-nums">
              {formatRupiah(item.price)}
            </span>
          </div>

          <button
            onClick={onSelect}
            disabled={!item.isAvailable || (item.stockCount !== undefined && item.stockCount <= 0)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              item.isAvailable && (item.stockCount === undefined || item.stockCount > 0)
                ? 'bg-red-600 text-white hover:bg-red-500 shadow-xs'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {item.isAvailable && (item.stockCount === undefined || item.stockCount > 0) ? (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Pesan</span>
              </>
            ) : (
              <span>Habis</span>
            )}
          </button>
        </div>

      </div>

    </article>
  );
};
