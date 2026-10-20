import React, { useState } from 'react';
import { X, QrCode, CreditCard, Banknote, MessageSquare, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { OrderType, PaymentMethod } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    cartTotalCount,
    settings,
    formatRupiah,
    placeOrder,
    generateWhatsAppUrl,
    setCurrentView
  } = useStore();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCheckoutOpen || cart.length === 0) return null;

  // Delivery fee calculation
  const deliveryFee = orderType === 'delivery'
    ? (cartSubtotal >= settings.freeDeliveryMin ? 0 : settings.deliveryFee)
    : 0;

  const totalPayment = cartSubtotal + deliveryFee;

  const handleCopy = (text: string, type: 'bank' | 'nominal') => {
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedNominal(true);
      setTimeout(() => setCopiedNominal(false), 2000);
    }
  };

  const handleSubmitOrder = (andOpenWhatsapp: boolean) => {
    if (!customerName.trim()) {
      setErrorMsg('Silakan masukkan nama pemesan.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setErrorMsg('Silakan masukkan nomor WhatsApp yang valid.');
      return;
    }
    if (!tableOrAddress.trim()) {
      setErrorMsg(orderType === 'dine-in' ? 'Silakan masukkan nomor meja.' : 'Silakan masukkan alamat lengkap pengiriman.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const newOrder = placeOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        orderType,
        tableOrAddress: tableOrAddress.trim(),
        items: cart,
        subtotal: cartSubtotal,
        deliveryFee,
        discount: 0,
        total: totalPayment,
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        orderStatus: 'menunggu',
        notes: orderNotes.trim()
      });

      if (andOpenWhatsapp) {
        const waUrl = generateWhatsAppUrl(newOrder);
        window.open(waUrl, '_blank');
      }

      setIsCheckoutOpen(false);
      setCurrentView('tracking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCheckoutOpen(false)}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 z-10 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="p-4 bg-stone-900 text-stone-100 flex items-center justify-between shrink-0">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
                Formulir Pemesanan
              </span>
              <h3 className="text-base font-bold text-white">
                Konfirmasi & Pembayaran
              </h3>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Scrollable Body */}
          <div className="p-5 overflow-y-auto space-y-5 text-xs text-stone-800 flex-1">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Tipe Pesanan */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-900 uppercase tracking-wider block">
                1. Tipe Pemesanan:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                    orderType === 'delivery'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Pesan Antar
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('dine-in')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                    orderType === 'dine-in'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Makan di Tempat
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`p-2.5 rounded-lg border text-center font-semibold transition-all cursor-pointer ${
                    orderType === 'takeaway'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  Bungkus (Ambil)
                </button>
              </div>
            </div>

            {/* 2. Informasi Pemesan */}
            <div className="space-y-3">
              <label className="font-bold text-stone-900 uppercase tracking-wider block">
                2. Data Pemesan:
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Nama Lengkap *</span>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Aditya Sandy"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1">Nomor WhatsApp *</span>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block mb-1">
                  {orderType === 'dine-in' ? 'Nomor Meja *' : 'Alamat Lengkap / Patokan Pengantaran *'}
                </span>
                <input
                  type="text"
                  required
                  placeholder={orderType === 'dine-in' ? 'Contoh: Meja 04 atau Meja Outdoor' : 'Contoh: Jl. Anggrek No. 12, Pagar Putih, depan minimarket'}
                  value={tableOrAddress}
                  onChange={(e) => setTableOrAddress(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-[11px] text-stone-500 block mb-1">Catatan Tambahan (Opsional)</span>
                <input
                  type="text"
                  placeholder="Contoh: Titip di pos satpam, sambal dibungkus rapat"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 3. Metode Pembayaran */}
            <div className="space-y-2">
              <label className="font-bold text-stone-900 uppercase tracking-wider block">
                3. Metode Pembayaran:
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS Instant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'transfer'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Transfer Bank</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-lg border flex flex-col items-center justify-center gap-1 font-semibold transition-all cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai / COD</span>
                </button>
              </div>

              {/* Dynamic Payment Details Display */}
              {paymentMethod === 'qris' && (
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center text-center space-y-2">
                  <span className="text-[11px] font-bold text-stone-700">
                    Scan QRIS via BCA, Gopay, OVO, ShopeePay, DANA, dll:
                  </span>
                  
                  {/* Dynamic Uploaded QRIS Image or Crisp SVG Fallback */}
                  {settings.qrisImageUrl ? (
                    <div className="p-2.5 bg-white rounded-lg border border-stone-300 shadow-xs flex flex-col items-center">
                      <img
                        src={settings.qrisImageUrl}
                        alt="QRIS Pembayaran Toko"
                        className="max-w-[200px] max-h-[200px] sm:max-w-[220px] sm:max-h-[220px] w-auto h-auto object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <div className="p-2.5 bg-white rounded-lg border border-stone-300 shadow-xs">
                      <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="white"/>
                        {/* Top-left marker */}
                        <rect x="10" y="10" width="24" height="24" fill="#1c1917"/>
                        <rect x="14" y="14" width="16" height="16" fill="white"/>
                        <rect x="18" y="18" width="8" height="8" fill="#1c1917"/>
                        {/* Top-right marker */}
                        <rect x="66" y="10" width="24" height="24" fill="#1c1917"/>
                        <rect x="70" y="14" width="16" height="16" fill="white"/>
                        <rect x="74" y="18" width="8" height="8" fill="#1c1917"/>
                        {/* Bottom-left marker */}
                        <rect x="10" y="66" width="24" height="24" fill="#1c1917"/>
                        <rect x="14" y="70" width="16" height="16" fill="white"/>
                        <rect x="18" y="74" width="8" height="8" fill="#1c1917"/>
                        {/* Pattern dots */}
                        <rect x="40" y="12" width="6" height="6" fill="#1c1917"/>
                        <rect x="52" y="16" width="6" height="6" fill="#1c1917"/>
                        <rect x="42" y="26" width="8" height="6" fill="#1c1917"/>
                        <rect x="14" y="42" width="6" height="8" fill="#1c1917"/>
                        <rect x="26" y="46" width="6" height="6" fill="#1c1917"/>
                        <rect x="40" y="40" width="20" height="20" fill="#dc2626"/>
                        <rect x="45" y="45" width="10" height="10" fill="white"/>
                        <rect x="68" y="44" width="8" height="8" fill="#1c1917"/>
                        <rect x="80" y="52" width="6" height="6" fill="#1c1917"/>
                        <rect x="42" y="68" width="8" height="6" fill="#1c1917"/>
                        <rect x="56" y="74" width="6" height="8" fill="#1c1917"/>
                        <rect x="68" y="68" width="18" height="6" fill="#1c1917"/>
                        <rect x="74" y="80" width="12" height="6" fill="#1c1917"/>
                      </svg>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm tabular-nums">
                      {formatRupiah(totalPayment)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(totalPayment.toString(), 'nominal')}
                      className="px-2 py-0.5 bg-stone-200 text-stone-700 rounded text-[10px] font-semibold hover:bg-stone-300 cursor-pointer"
                    >
                      {copiedNominal ? 'Tersalin!' : 'Salin Nominal'}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    NMID: ID1020084918239 · {settings.storeName || 'Jajanan Kakang Bandung'}
                  </span>
                </div>
              )}

              {paymentMethod === 'transfer' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 block">{settings.bankAccount?.bank || 'BCA (Bank Central Asia)'}</span>
                      <span className="font-mono text-sm text-stone-900 tabular-nums">
                        {settings.bankAccount?.accountNumber || '8400192811'}
                      </span>
                      <span className="text-[11px] text-stone-500 block">
                        a.n {settings.bankAccount?.holderName || 'Kakang Aditya Pratama'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bankAccount?.accountNumber || '8400192811', 'bank')}
                      className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded text-xs font-semibold hover:bg-stone-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedBank ? 'Tersalin' : 'Salin Rek'}</span>
                    </button>
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600">
                  Bayar langsung ke kurir (COD) saat makanan tiba atau bayar di kasir Jajanan Kakang. Siapkan uang pas ya Kak!
                </div>
              )}
            </div>

            {/* 4. Rincian Pembayaran */}
            <div className="pt-3 border-t border-stone-200 space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({cartTotalCount} item)</span>
                <span className="tabular-nums font-semibold">{formatRupiah(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Ongkos Kirim</span>
                <span className="tabular-nums font-semibold">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">GRATIS</span>
                  ) : (
                    formatRupiah(deliveryFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-stone-900 text-sm font-extrabold pt-1 border-t border-stone-100">
                <span>Total Pembayaran</span>
                <span className="tabular-nums text-red-600">{formatRupiah(totalPayment)}</span>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col gap-2 shrink-0">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              {/* Primary WhatsApp Order Option */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitOrder(true)}
                className="w-full sm:flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm text-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Kirim & Pesan via WhatsApp ({settings.phoneWhatsapp || '089620012837'})</span>
              </button>

              {/* Standard Confirmation Option */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitOrder(false)}
                className="w-full sm:w-auto px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer whitespace-nowrap"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Konfirmasi Langsung</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-500 text-center">
              Pesanan otomatis diteruskan ke WhatsApp Kasir {settings.storeName || 'Jajanan Kakang'} di <strong className="text-emerald-700 font-bold">{settings.phoneWhatsapp || '089620012837'}</strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
