import React, { useState, useEffect } from 'react';
import { X, Flame, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MenuOption } from '../types';

export const CustomizeModal: React.FC = () => {
  const {
    isCustomizeOpen,
    customizingItem,
    closeCustomize,
    addToCart,
    formatRupiah,
    getSpicyLevelLabel
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [spicyLevel, setSpicyLevel] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<MenuOption[]>([]);
  const [notes, setNotes] = useState('');

  // Reset state when opening a new item
  useEffect(() => {
    if (customizingItem) {
      setQuantity(1);
      setSpicyLevel(customizingItem.defaultSpicyLevel ?? (customizingItem.spicyLevelAllowed ? 1 : 0));
      setSelectedOptions([]);
      setNotes('');
    }
  }, [customizingItem]);

  if (!isCustomizeOpen || !customizingItem) return null;

  const toggleOption = (opt: MenuOption) => {
    setSelectedOptions(prev => {
      const exists = prev.some(o => o.id === opt.id);
      if (exists) {
        return prev.filter(o => o.id !== opt.id);
      } else {
        return [...prev, opt];
      }
    });
  };

  const optionsTotal = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
  const unitPrice = customizingItem.price + optionsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(customizingItem, quantity, spicyLevel, selectedOptions, notes.trim());
  };

  const spicyLevels = [
    { level: 0, label: 'Lvl 0 (Ori)', desc: 'Tidak Pedas / Manis Gurih' },
    { level: 1, label: 'Lvl 1 (Sedang)', desc: 'Pedas Santai' },
    { level: 2, label: 'Lvl 2 (Nampol)', desc: 'Pedas Pas & Sedap' },
    { level: 3, label: 'Lvl 3 (Daun Jeruk)', desc: 'Pedas Rawit Daun Jeruk' },
    { level: 4, label: 'Lvl 4 (Super)', desc: 'Ekstra Pedas Membara' },
    { level: 5, label: 'Lvl 5 (Mampus)', desc: 'Level Juara Ekstrem' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={closeCustomize}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 z-10 flex flex-col max-h-[90vh]">
          
          {/* Header Bar with Image Preview */}
          <div className="relative h-44 bg-stone-900 overflow-hidden shrink-0">
            <img
              src={customizingItem.image || '/src/assets/images/snack_cireng_rujak_1792424320121.jpg'}
              alt={customizingItem.name}
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/snack_cireng_rujak_1792424320121.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
            
            <button
              onClick={closeCustomize}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-4 right-4">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Sesuaikan Pesanan
              </span>
              <h3 className="text-xl font-bold text-white">
                {customizingItem.name}
              </h3>
              <p className="text-xs text-stone-300 line-clamp-1 mt-0.5">
                {customizingItem.description}
              </p>
            </div>
          </div>

          {/* Modal Body / Scrollable Controls */}
          <div className="p-5 space-y-6 overflow-y-auto flex-1">
            
            {/* Level Pedas Selector (if item allows) */}
            {customizingItem.spicyLevelAllowed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-red-600" />
                    <span>Pilih Level Pedas:</span>
                  </label>
                  <span className="text-xs font-semibold text-red-600">
                    {getSpicyLevelLabel(spicyLevel).label}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {spicyLevels.map(item => {
                    const isSelected = spicyLevel === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setSpicyLevel(item.level)}
                        className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 border-red-600 text-white shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                        title={item.desc}
                      >
                        <div>Lvl {item.level}</div>
                        <div className="text-[10px] font-normal opacity-90 truncate">
                          {item.level === 0 ? 'Ori' : item.level === 5 ? 'Ekstrem' : `${item.level} Cabai`}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-stone-500 italic">
                  💡 {getSpicyLevelLabel(spicyLevel).desc}
                </p>
              </div>
            )}

            {/* Extra Toppings / Addons */}
            {customizingItem.options && customizingItem.options.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Topping & Ekstra Tambahan:</span>
                  </label>
                  <span className="text-[11px] text-stone-500">Opsional</span>
                </div>

                <div className="space-y-2">
                  {customizingItem.options.map(opt => {
                    const isChecked = selectedOptions.some(o => o.id === opt.id);
                    return (
                      <label
                        key={opt.id}
                        onClick={() => toggleOption(opt)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors text-xs ${
                          isChecked
                            ? 'bg-red-50/60 border-red-300 text-stone-900 font-medium'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-stone-300 bg-white'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <span>{opt.name}</span>
                        </div>
                        <span className="font-semibold text-stone-800 tabular-nums">
                          +{formatRupiah(opt.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Catatan Khusus untuk Dapur:
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Bumbu rujak dipisah, kuah banyakin daun bawang, jangan pakai seledri..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Jumlah Porsi:
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 flex items-center justify-center hover:bg-stone-100 disabled:opacity-40 transition-colors cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold text-stone-900 w-6 text-center tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-stone-300 text-stone-700 flex items-center justify-center hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Bar with Price and Submit */}
          <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-4 shrink-0">
            <div>
              <span className="text-[11px] text-stone-500 block">Total Pesanan Ini</span>
              <span className="text-lg font-extrabold text-stone-900 tabular-nums">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors shadow-sm text-xs sm:text-sm cursor-pointer whitespace-nowrap"
            >
              Masukkan ke Keranjang
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
