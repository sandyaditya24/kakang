import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, MessageSquare } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalCount,
    formatRupiah,
    settings,
    setIsCheckoutOpen,
    getDirectWhatsAppCartUrl
  } = useStore();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = settings.freeDeliveryMin;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, (cartSubtotal / freeDeliveryThreshold) * 100);

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          
          {/* Drawer Header */}
          <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-bold text-white">
                Keranjang Pesanan ({cartTotalCount})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-stone-400 hover:text-red-400 cursor-pointer transition-colors"
                >
                  Kosongkan
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Delivery Banner / Progress Bar */}
          <div className="bg-amber-50 border-b border-amber-200/80 p-3 text-xs">
            <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-1.5">
              <Truck className="w-4 h-4 text-amber-700" />
              <span>
                {remainingForFreeDelivery === 0
                  ? '🎉 Selamat! Pesanan kamu dapat Gratis Ongkir!'
                  : `Tambah ${formatRupiah(remainingForFreeDelivery)} lagi untuk Gratis Ongkir!`}
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500">
                <ShoppingBag className="w-12 h-12 text-stone-300 mb-3 stroke-[1.5]" />
                <h3 className="text-sm font-bold text-stone-800">Keranjang Masih Kosong</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Yuk pilih aneka cireng, seblak hangat, atau basreng pedas daun jeruk untuk mulai memesan!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Lihat Menu Jajanan
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} className="py-3 flex gap-3">
                  {/* Thumbnail */}
                  <img
                    src={item.menuItem.image}
                    alt={item.menuItem.name}
                    className="w-16 h-16 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                    referrerPolicy="no-referrer"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.menuItem.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-stone-400 hover:text-red-500 p-0.5 transition-colors"
                        title="Hapus menu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Metadata line: Spicy & Toppings */}
                    <div className="text-[11px] text-stone-500 space-y-0.5 mt-0.5">
                      {item.menuItem.spicyLevelAllowed && (
                        <div className="text-red-600 font-medium">
                          Level Pedas: {item.spicyLevel}
                        </div>
                      )}
                      {item.selectedOptions.length > 0 && (
                        <div className="text-stone-600 truncate">
                          + {item.selectedOptions.map(o => o.name).join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-stone-500 italic truncate">
                          "{item.notes}"
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper & Item Total */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-50">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, -1)}
                          className="w-6 h-6 rounded bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-stone-900 w-4 text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.cartItemId, 1)}
                          className="w-6 h-6 rounded bg-stone-100 text-stone-700 flex items-center justify-center hover:bg-stone-200 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-stone-900 tabular-nums">
                        {formatRupiah(item.itemTotal)}
                      </span>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer with Subtotal & Proceed CTA */}
          {cart.length > 0 && (
            <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span>Subtotal ({cartTotalCount} item)</span>
                <span className="text-sm font-bold text-stone-900 tabular-nums">
                  {formatRupiah(cartSubtotal)}
                </span>
              </div>

              <div className="text-[11px] text-stone-500">
                * Ongkos kirim dihitung berdasarkan pilihan antar/ambil di langkah selanjutnya.
              </div>

              <div className="space-y-2">
                {/* Direct WhatsApp Checkout Button */}
                <a
                  href={getDirectWhatsAppCartUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Checkout (089620012837)</span>
                </a>

                {/* Regular In-App Checkout */}
                <button
                  onClick={handleProceedCheckout}
                  className="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 shadow-xs text-xs cursor-pointer"
                >
                  <span>Formulir Alamat & QRIS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
