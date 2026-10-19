import React, { useState } from 'react';
import { Search, Clock, CheckCircle2, ChefHat, Bike, AlertCircle, MessageSquare, Printer, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus } from '../types';

export const OrderTracker: React.FC = () => {
  const {
    orders,
    activeTrackingOrder,
    setActiveTrackingOrder,
    setCurrentView,
    formatRupiah,
    generateWhatsAppUrl
  } = useStore();

  const [searchId, setSearchId] = useState('');
  const [searched, setSearched] = useState(false);

  // If there's an active tracking order (just placed), default to it
  const selectedOrder = activeTrackingOrder || (orders.length > 0 ? orders[0] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const cleaned = searchId.trim().toUpperCase();
    const found = orders.find(o => o.id.toUpperCase() === cleaned || o.customerPhone.includes(cleaned));
    if (found) {
      setActiveTrackingOrder(found);
    } else {
      setActiveTrackingOrder(null);
    }
  };

  const getStatusStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'menunggu': return 1;
      case 'diproses': return 2;
      case 'siap': return 3;
      case 'selesai': return 4;
      case 'dibatalkan': return -1;
      default: return 1;
    }
  };

  const steps = [
    { step: 1, label: 'Menunggu', desc: 'Pesanan masuk', icon: Clock },
    { step: 2, label: 'Dimasak', desc: 'Dapur menyiapkan', icon: ChefHat },
    { step: 3, label: 'Siap / Diantar', desc: 'Siap dinikmati', icon: Bike },
    { step: 4, label: 'Selesai', desc: 'Pesanan tuntas', icon: CheckCircle2 },
  ];

  const currentStep = selectedOrder ? getStatusStepIndex(selectedOrder.orderStatus) : 1;

  return (
    <div className="py-10 bg-stone-100 min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Back to Menu Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentView('customer')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Menu Jajanan</span>
          </button>

          <span className="text-xs text-stone-500 font-medium">
            Live Tracking Dapur Kakang
          </span>
        </div>

        {/* Search Order Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-stone-200 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Masukkan ID Pesanan (misal: JK-9104) atau No. HP..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Cek Status Pesanan
            </button>
          </form>

          {/* Quick Recent Orders Chip List */}
          {orders.length > 0 && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 overflow-x-auto text-xs text-stone-500">
              <span className="font-semibold text-stone-700 shrink-0">Pesanan Terakhir:</span>
              {orders.slice(0, 4).map(o => (
                <button
                  key={o.id}
                  onClick={() => {
                    setActiveTrackingOrder(o);
                    setSearchId(o.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors shrink-0 ${
                    selectedOrder?.id === o.id
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  {o.id} ({o.customerName})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Order Details View */}
        {!selectedOrder ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <AlertCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">Pesanan Tidak Ditemukan</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Periksa kembali ID pesanan atau nomor WhatsApp yang Anda masukkan.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden space-y-6">
            
            {/* Header Status Strip */}
            <div className="bg-stone-900 text-white p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase bg-red-600 px-2.5 py-0.5 rounded font-bold">
                      {selectedOrder.id}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(selectedOrder.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold mt-1 text-white">
                    Pesanan a.n. {selectedOrder.customerName}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-stone-400 block">Total Tagihan:</span>
                  <span className="text-xl font-extrabold text-amber-400 tabular-nums">
                    {formatRupiah(selectedOrder.total)}
                  </span>
                </div>
              </div>

              {/* Progress Steps Indicator */}
              {selectedOrder.orderStatus !== 'dibatalkan' ? (
                <div className="mt-8 pt-6 border-t border-stone-800">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {steps.map((st) => {
                      const isCompleted = currentStep >= st.step;
                      const isCurrent = currentStep === st.step;
                      const Icon = st.icon;

                      return (
                        <div key={st.step} className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mb-2 ${
                              isCurrent
                                ? 'bg-red-600 text-white ring-4 ring-red-900/50'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-stone-800 text-stone-500 border border-stone-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-bold ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-400' : 'text-stone-500'}`}>
                            {st.label}
                          </span>
                          <span className="text-[10px] text-stone-400 hidden sm:block">
                            {st.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Pesanan ini telah dibatalkan. Silakan hubungi kasir jika ada pertanyaan.</span>
                </div>
              )}
            </div>

            {/* Receipt & Delivery Info Body */}
            <div className="p-6 pt-0 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block mb-0.5">Tipe & Tujuan:</span>
                  <span className="font-bold text-stone-900 block">
                    {selectedOrder.orderType === 'dine-in' ? 'Makan di Tempat' : selectedOrder.orderType === 'takeaway' ? 'Bawa Pulang (Takeaway)' : 'Pesan Antar (Delivery)'}
                  </span>
                  <span className="text-stone-600 block mt-0.5">
                    {selectedOrder.tableOrAddress}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-0.5">Metode Pembayaran:</span>
                  <span className="font-bold text-stone-900 block uppercase">
                    {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus === 'paid' ? 'Lunas' : selectedOrder.paymentStatus === 'verified' ? 'Terverifikasi' : 'Belum Lunas'})
                  </span>
                  <span className="text-stone-600 block mt-0.5">
                    No. WhatsApp: {selectedOrder.customerPhone}
                  </span>
                </div>
              </div>

              {/* Itemized Order List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Rincian Menu yang Dipesan:
                </h3>
                <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-stone-50">
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900">{item.menuItem.name}</span>
                          <span className="text-stone-500 tabular-nums">x{item.quantity}</span>
                          {item.menuItem.spicyLevelAllowed && (
                            <span className="text-red-600 font-semibold text-[11px]">
                              [Lvl {item.spicyLevel}]
                            </span>
                          )}
                        </div>
                        {item.selectedOptions.length > 0 && (
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            + {item.selectedOptions.map(o => o.name).join(', ')}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[11px] text-stone-500 italic mt-0.5">
                            Catatan: "{item.notes}"
                          </div>
                        )}
                      </div>
                      <span className="font-bold text-stone-900 tabular-nums shrink-0">
                        {formatRupiah(item.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Strip */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal Menu</span>
                  <span className="tabular-nums font-semibold">{formatRupiah(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span className="tabular-nums font-semibold">
                    {selectedOrder.deliveryFee === 0 ? 'Gratis' : formatRupiah(selectedOrder.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-stone-900 text-sm font-extrabold pt-2 border-t border-stone-200">
                  <span>Total Tagihan</span>
                  <span className="tabular-nums text-red-600">{formatRupiah(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Struk Pesanan</span>
                </button>

                <a
                  href={generateWhatsAppUrl(selectedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Tanya Status ke Kasir (WhatsApp)</span>
                </a>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
