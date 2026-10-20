import React, { useState, useEffect, useRef } from 'react';
import {
  Clock, ArrowLeft, QrCode, CreditCard, Copy, CheckCircle2,
  AlertCircle, Sparkles, MessageSquare, ShieldCheck, RefreshCw,
  Building2, ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Order } from '../types';

export const WaitingPaymentView: React.FC = () => {
  const {
    waitingPaymentOrder,
    myOrders,
    settings,
    formatRupiah,
    setCurrentView,
    setActiveTrackingOrder,
    simulatePaymentSuccess
  } = useStore();

  // Find the target order: either waitingPaymentOrder or latest unpaid order in myOrders
  const targetOrder: Order | undefined = waitingPaymentOrder || myOrders.find(
    o => o.orderStatus === 'menunggu_pembayaran'
  );

  const [copiedNominal, setCopiedNominal] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 mins default
  const hasRedirectedRef = useRef(false);

  // Countdown timer effect
  useEffect(() => {
    if (!targetOrder) return;
    const calculateSeconds = () => {
      if (targetOrder.paymentExpiry) {
        const diff = Math.floor((new Date(targetOrder.paymentExpiry).getTime() - Date.now()) / 1000);
        return Math.max(0, diff);
      }
      return 900;
    };

    setSecondsRemaining(calculateSeconds());
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetOrder]);

  // Real-Time Cloud Firestore Listener on the active Order
  // When Firestore reports orderStatus === 'menunggu' (Menunggu Proses) or paymentStatus === 'paid',
  // automatically transition without page refresh!
  useEffect(() => {
    if (!targetOrder || hasRedirectedRef.current) return;

    // Local check in case already updated in context
    if (targetOrder.orderStatus !== 'menunggu_pembayaran' || targetOrder.paymentStatus === 'paid') {
      handleSuccessTransition(targetOrder);
      return;
    }

    const orderDocRef = doc(db, 'orders', targetOrder.id);
    const unsubscribe = onSnapshot(orderDocRef, (snap) => {
      if (!snap.exists()) return;
      const data = snap.data() as Order;
      if (data.orderStatus !== 'menunggu_pembayaran' || data.paymentStatus === 'paid') {
        handleSuccessTransition(data);
      }
    });

    return () => unsubscribe();
  }, [targetOrder?.id]);

  const handleSuccessTransition = (updatedOrder: Order) => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    setIsPaidSuccess(true);
    setActiveTrackingOrder(updatedOrder);

    // Subtle Web Audio API chime sound
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      // Audio autoplay gracefully suppressed
    }

    // Auto redirect to Lacak Pesanan after 1.5 seconds
    setTimeout(() => {
      setCurrentView('tracking');
    }, 1500);
  };

  const handleCopy = (text: string, type: 'nominal' | 'account' | 'va') => {
    navigator.clipboard.writeText(text);
    if (type === 'nominal') {
      setCopiedNominal(true);
      setTimeout(() => setCopiedNominal(false), 2000);
    } else if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedVa(true);
      setTimeout(() => setCopiedVa(false), 2000);
    }
  };

  const handleTriggerSimulateSuccess = async () => {
    if (!targetOrder || isSimulating) return;
    setIsSimulating(true);
    try {
      await simulatePaymentSuccess(targetOrder.id);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!targetOrder) {
    return (
      <div className="py-16 bg-stone-100 min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-stone-900">
            Tidak Ada Pembayaran Tertunda
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Semua pesanan di perangkat ini telah terverifikasi atau Anda belum melakukan checkout pemesanan.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('customer')}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Lihat Menu Jajanan
            </button>
            <button
              onClick={() => setCurrentView('tracking')}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Lacak Pesanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatMinutesSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isQris = targetOrder.paymentMethod === 'qris';

  return (
    <div className="py-8 sm:py-12 bg-stone-100 min-h-[85vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <button
            onClick={() => setCurrentView('tracking')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Lacak Pesanan</span>
          </button>

          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payment Gateway Aman</span>
          </span>
        </div>

        {/* Success Alert Banner when payment confirmed */}
        {isPaidSuccess && (
          <div className="mb-6 p-4 bg-emerald-600 text-white rounded-2xl shadow-lg border border-emerald-500 animate-bounce flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shrink-0 font-bold">
              ✓
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base">
                Pembayaran Sukses Diterima!
              </h4>
              <p className="text-xs text-emerald-100">
                Status pesanan otomatis berubah ke <strong>Menunggu Proses</strong>. Mengalihkan ke halaman Lacak Pesanan...
              </p>
            </div>
          </div>
        )}

        {/* Main Payment Container Card */}
        <div className="bg-white rounded-2xl shadow-md border border-stone-200 overflow-hidden">
          
          {/* Header Strip with Order ID & Countdown */}
          <div className="bg-stone-900 text-white p-5 sm:p-6 border-b border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold bg-amber-500 text-stone-950 px-2.5 py-0.5 rounded">
                    {targetOrder.id}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(targetOrder.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold mt-1 text-white">
                  Menunggu Pembayaran
                </h1>
                <p className="text-xs text-stone-400">
                  Pesanan a.n. <strong className="text-stone-200">{targetOrder.customerName}</strong>
                </p>
              </div>

              {/* Countdown Expiry Box */}
              <div className="bg-stone-800/90 border border-stone-700/80 px-4 py-2.5 rounded-xl flex items-center gap-2.5 self-start sm:self-auto">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <div>
                  <span className="text-[10px] text-stone-400 block uppercase font-semibold">
                    Batas Waktu Bayar:
                  </span>
                  <span className="font-mono font-extrabold text-amber-400 text-base sm:text-lg tabular-nums">
                    {formatMinutesSeconds(secondsRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Payment Bar */}
            <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-400 block">Total yang Harus Dibayar:</span>
                <span className="text-2xl font-black text-amber-400 tabular-nums">
                  {formatRupiah(targetOrder.total)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(targetOrder.total.toString(), 'nominal')}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNominal ? 'Tersalin!' : 'Salin Nominal'}</span>
              </button>
            </div>
          </div>

          {/* Payment Instructions Body */}
          <div className="p-5 sm:p-7 space-y-6">

            {/* QRIS PAYMENT SECTION */}
            {isQris && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      Scan QRIS Instant (BCA / GoPay / OVO / Dana / ShopeePay / m-Banking)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Pindai QR Code di bawah menggunakan aplikasi e-Wallet atau perbankan Anda
                    </p>
                  </div>
                </div>

                {/* QR Code Presentation Box */}
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-white rounded-xl border border-stone-300 shadow-sm flex flex-col items-center">
                    {settings.qrisImageUrl ? (
                      <img
                        src={settings.qrisImageUrl}
                        alt="QRIS Pembayaran Toko"
                        className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <svg className="w-44 h-44 sm:w-48 sm:h-48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="100" fill="white"/>
                          <rect x="10" y="10" width="24" height="24" fill="#1c1917"/>
                          <rect x="14" y="14" width="16" height="16" fill="white"/>
                          <rect x="18" y="18" width="8" height="8" fill="#1c1917"/>
                          <rect x="66" y="10" width="24" height="24" fill="#1c1917"/>
                          <rect x="70" y="14" width="16" height="16" fill="white"/>
                          <rect x="74" y="18" width="8" height="8" fill="#1c1917"/>
                          <rect x="10" y="66" width="24" height="24" fill="#1c1917"/>
                          <rect x="14" y="70" width="16" height="16" fill="white"/>
                          <rect x="18" y="74" width="8" height="8" fill="#1c1917"/>
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
                        <span className="text-[10px] text-stone-500 font-medium">QRIS Standar Jajanan Kakang</span>
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-stone-600 font-mono">
                    NMID: ID1020084918239 · {settings.storeName || 'Jajanan Kakang Bandung'}
                  </span>

                  {/* Step Instructions */}
                  <div className="w-full text-left bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                    <span className="font-bold text-stone-900 block mb-1">Cara Pembayaran QRIS:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-stone-600">
                      <li>Buka aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana, ShopeePay).</li>
                      <li>Pilih menu <strong>Scan / Bayar QR</strong> lalu arahkan kamera ke barcode di atas.</li>
                      <li>Pastikan nama merchant adalah <strong>{settings.storeName || 'Jajanan Kakang'}</strong> dan nominal bayar tepat <strong>{formatRupiah(targetOrder.total)}</strong>.</li>
                      <li>Konfirmasi pembayaran dengan PIN Anda. Sistem akan mendeteksi status pembayaran secara otomatis.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* BANK TRANSFER / VA SECTION */}
            {!isQris && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-sm">
                      Instruksi Transfer Bank & Rekening Tujuan
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Transfer tepat sesuai jumlah tagihan ke rekening kasir toko berikut
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                  {/* Account Card */}
                  <div className="bg-white p-4 rounded-xl border border-stone-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider block">
                        Bank Tujuan:
                      </span>
                      <span className="font-extrabold text-stone-900 text-base block">
                        {settings.bankAccount?.bank || 'BCA (Bank Central Asia)'}
                      </span>
                      <span className="font-mono text-lg font-black text-stone-900 tabular-nums block mt-0.5">
                        {settings.bankAccount?.accountNumber || '8400192811'}
                      </span>
                      <span className="text-xs text-stone-600 block mt-0.5">
                        a.n <strong>{settings.bankAccount?.holderName || 'Kakang Aditya Pratama'}</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(settings.bankAccount?.accountNumber || '8400192811', 'account')}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap self-end sm:self-auto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedAccount ? 'Tersalin!' : 'Salin No. Rekening'}</span>
                    </button>
                  </div>

                  {/* Virtual Account Reference */}
                  {targetOrder.vaNumber && (
                    <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold uppercase block">
                          Kode Virtual Account (Otomatis):
                        </span>
                        <span className="font-mono font-bold text-stone-900">
                          {targetOrder.vaNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(targetOrder.vaNumber || '', 'va')}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-[11px] font-semibold cursor-pointer"
                      >
                        {copiedVa ? 'Tersalin' : 'Salin VA'}
                      </button>
                    </div>
                  )}

                  {/* Transfer Guide */}
                  <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
                    <span className="font-bold text-stone-900 block mb-1">Panduan Transfer:</span>
                    <ol className="list-decimal pl-4 space-y-1 text-[11px] text-stone-600">
                      <li>Buka Mobile Banking / ATM bank Anda (BCA, Mandiri, BRI, BNI, dll).</li>
                      <li>Pilih menu <strong>Transfer ke Rekening Bank</strong> atau <strong>Virtual Account</strong>.</li>
                      <li>Masukkan nomor rekening di atas dan nominal tepat <strong>{formatRupiah(targetOrder.total)}</strong>.</li>
                      <li>Setelah transfer berhasil, sistem gateway akan otomatis memverifikasi pembayaran Anda tanpa perlu konfirmasi manual.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* REAL-TIME STATUS PULSING RADAR */}
            <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200/90 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping absolute"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 relative"></span>
                </div>
                <div>
                  <span className="font-extrabold text-amber-950 block">
                    Menunggu Pembayaran Terverifikasi...
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Sistem mendeteksi mutasi dan barcode QRIS secara real-time. Layar ini akan berganti otomatis saat pembayaran berhasil.
                  </span>
                </div>
              </div>

              <RefreshCw className="w-4 h-4 text-amber-700 animate-spin shrink-0 hidden sm:block" />
            </div>

            {/* PAYMENT GATEWAY SIMULATION & DEMO WEBHOOK BOX (MIDTRANS / XENDIT) */}
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Simulasi Payment Gateway (Webhook Otomatis):</span>
                </span>
                <span className="text-[10px] text-stone-400">
                  Real-time Firestore Listener
                </span>
              </div>

              <div className="p-4 bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-amber-400 block text-xs">
                    ⚡ Uji Coba Pembayaran Sukses Instan
                  </span>
                  <span className="text-[11px] text-stone-300">
                    Klik tombol ini untuk mensimulasikan notifikasi sukses dari Payment Gateway (Midtrans Snap / Xendit). Status pesanan di Firestore akan otomatis berubah ke <strong>Menunggu Proses</strong> dan mengalihkan halaman ini seketika.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isSimulating || isPaidSuccess}
                  onClick={handleTriggerSimulateSuccess}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0 disabled:opacity-50 whitespace-nowrap self-end sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                  <span>{isSimulating ? 'Memverifikasi...' : '⚡ Simulasi Bayar Berhasil'}</span>
                </button>
              </div>
            </div>

            {/* Footer Auxiliary Actions */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => setCurrentView('tracking')}
                className="w-full sm:w-auto px-4 py-2 text-stone-600 hover:text-stone-900 underline cursor-pointer text-center"
              >
                ← Cek Riwayat di Lacak Pesanan
              </button>

              <a
                href={`https://wa.me/${(settings.phoneWhatsapp || '089620012837').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo Kasir Jajanan Kakang, saya sudah bayar untuk pesanan ID ${targetOrder.id} (${formatRupiah(targetOrder.total)}). Mohon konfirmasi.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Konfirmasi via WhatsApp Kasir</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
