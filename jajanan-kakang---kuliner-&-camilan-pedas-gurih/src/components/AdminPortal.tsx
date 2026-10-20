import React, { useState, useRef } from 'react';
import {
  ShieldCheck, Lock, LogOut, TrendingUp, ShoppingBag, Clock, CheckCircle2,
  AlertCircle, Plus, Edit2, Trash2, Phone, Printer, Search, Eye, EyeOff,
  Store, Calculator, RefreshCw, MessageSquare, Check, X, Layers, Flame,
  Upload, Image as ImageIcon, Camera, Sparkles, QrCode, CreditCard, Copy,
  Building2, CheckCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, MenuItem, ItemCategory } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

export const AdminPortal: React.FC = () => {
  const {
    isAdminLoggedIn,
    loginAdmin,
    logoutAdmin,
    orders,
    updateOrderStatus,
    updatePaymentStatus,
    menu,
    toggleItemAvailability,
    updateItemStock,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    settings,
    updateSettings,
    toggleStoreOpen,
    formatRupiah,
    setCurrentView
  } = useStore();

  // Admin sub-tabs (Default to 'menu' so stock management is immediately accessible)
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'pos' | 'settings'>('menu');
  
  // Login state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Stock & Menu management filters
  const [menuSearch, setMenuSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'available' | 'empty'>('all');

  // Order status filter in admin
  const [orderFilter, setOrderFilter] = useState<'all' | OrderStatus>('all');

  // Menu Modal state
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // New item form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ItemCategory>('pedas');
  const [formPrice, setFormPrice] = useState(15000);
  const [formDesc, setFormDesc] = useState('');
  const [formSpicyAllowed, setFormSpicyAllowed] = useState(true);
  const [formPrepTime, setFormPrepTime] = useState(10);
  const [formStockCount, setFormStockCount] = useState<number | undefined>(25);
  const [formImage, setFormImage] = useState<string>('');
  const [formImageSizeKb, setFormImageSizeKb] = useState<number | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QRIS upload & Bank preview state
  const [isUploadingQris, setIsUploadingQris] = useState<boolean>(false);
  const [qrisUploadSizeKb, setQrisUploadSizeKb] = useState<number | null>(null);
  const [qrisUploadError, setQrisUploadError] = useState<string>('');
  const qrisFileInputRef = useRef<HTMLInputElement>(null);
  const [copiedAccountPreview, setCopiedAccountPreview] = useState(false);

  // POS State
  const [posCart, setPosCart] = useState<{ item: MenuItem; qty: number }[]>([]);
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Walk-In');
  const [posTable, setPosTable] = useState('Meja 01');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      setLoginError('');
      setPassword('');
      setActiveTab('menu');
    } else {
      setLoginError('Kata sandi salah! Gunakan PIN "kakang123" atau klik tombol "Masuk Cepat Demo" di bawah.');
    }
  };

  // If NOT logged in: Show protected Login screen (Next.js middleware redirect replica)
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 bg-stone-100">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 p-7 sm:p-8">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-stone-900">
              Login Admin & Kelola Stok
            </h2>
            <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
              Masuk untuk mengatur ketersediaan stok menu, harga, pesanan, dan WhatsApp toko.
            </p>
          </div>

          {loginError && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                Username Admin:
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1">
                PIN / Password Admin:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan PIN Admin (default: kakang123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Masuk ke Pengelola Stok Menu</span>
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="mt-6 pt-6 border-t border-stone-200 text-center">
            <span className="text-[11px] text-stone-500 block mb-2">Akses Cepat Pengujian:</span>
            <button
              type="button"
              onClick={() => {
                loginAdmin('kakang123');
                setActiveTab('menu');
              }}
              className="w-full px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors border border-stone-300 cursor-pointer"
            >
              🔑 Masuk Otomatis sebagai Admin (kakang123)
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentView('customer')}
              className="text-xs text-stone-500 hover:text-stone-900 underline"
            >
              ← Kembali ke Menu Pembeli
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Stock Stats
  const totalMenuItems = menu.length;
  const availableItemsCount = menu.filter(m => m.isAvailable).length;
  const outOfStockCount = menu.filter(m => !m.isAvailable).length;

  // Filtered menu for stock management
  const displayedMenu = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(menuSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (stockFilter === 'available') return item.isAvailable;
    if (stockFilter === 'empty') return !item.isAvailable;
    return true;
  });

  // Calculate Metrics
  const todayRevenue = orders
    .filter(o => o.orderStatus !== 'dibatalkan')
    .reduce((acc, o) => acc + o.total, 0);

  const activeOrdersCount = orders.filter(o => o.orderStatus === 'menunggu' || o.orderStatus === 'diproses').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'selesai').length;

  // Filtered orders
  const displayedOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  // POS Handlers
  const addPosItem = (item: MenuItem) => {
    setPosCart(prev => {
      const existing = prev.find(p => p.item.id === item.id);
      if (existing) {
        return prev.map(p => p.item.id === item.id ? { ...p, qty: p.qty + 1 } : p);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removePosItem = (itemId: string) => {
    setPosCart(prev => prev.filter(p => p.item.id !== itemId));
  };

  const posTotal = posCart.reduce((acc, p) => acc + p.item.price * p.qty, 0);
  const changeAmount = Math.max(0, cashGiven - posTotal);

  const handlePosCheckout = () => {
    if (posCart.length === 0) return;
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `JK-${randomNum}`,
      customerName: posCustomerName || 'Pelanggan Kasir',
      customerPhone: 'Walk-In Kasir',
      orderType: 'dine-in',
      tableOrAddress: posTable,
      items: posCart.map(p => ({
        cartItemId: 'pos-' + Date.now() + '-' + p.item.id,
        menuItem: p.item,
        quantity: p.qty,
        spicyLevel: 1,
        selectedOptions: [],
        notes: 'Pesanan Kasir POS',
        itemTotal: p.item.price * p.qty
      })),
      subtotal: posTotal,
      deliveryFee: 0,
      discount: 0,
      total: posTotal,
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      orderStatus: 'selesai',
      createdAt: new Date().toISOString(),
      isCashierOrder: true,
      deviceId: 'pos_cashier'
    };

    updateOrderStatus(newOrder.id, 'selesai');
    setPosCart([]);
    setCashGiven(0);
    alert(`Pesanan Kasir ${newOrder.id} berhasil dicatat & lunas! Kembalian: ${formatRupiah(changeAmount)}`);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError('');

    try {
      const { dataUrl, sizeKb } = await compressImageFile(file, 640, 480, 0.82);
      setFormImage(dataUrl);
      setFormImageSizeKb(sizeKb);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses gambar dari perangkat.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // QRIS File Upload Handler
  const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingQris(true);
    setQrisUploadError('');

    try {
      const { dataUrl, sizeKb } = await compressImageFile(file, 640, 640, 0.88);
      setQrisUploadSizeKb(sizeKb);
      updateSettings({ qrisImageUrl: dataUrl });
    } catch (err: any) {
      setQrisUploadError(err.message || 'Gagal memproses gambar QRIS dari perangkat.');
    } finally {
      setIsUploadingQris(false);
      if (qrisFileInputRef.current) {
        qrisFileInputRef.current.value = '';
      }
    }
  };

  // Bank Transfer Setting Handler
  const handleBankChange = (field: 'bank' | 'accountNumber' | 'holderName', value: string) => {
    updateSettings({
      bankAccount: {
        ...(settings.bankAccount || { bank: 'BCA (Bank Central Asia)', accountNumber: '8400192811', holderName: 'Kakang Aditya Pratama' }),
        [field]: value
      }
    });
  };

  // Add/Edit Menu Item Handler
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const fallbackImage = editingItem?.image || menu[0]?.image || '/src/assets/images/snack_cireng_rujak_1792424320121.jpg';
    const finalImage = formImage.trim() || fallbackImage;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDesc.trim(),
        image: finalImage,
        spicyLevelAllowed: formSpicyAllowed,
        prepTimeMinutes: Number(formPrepTime),
        stockCount: formStockCount
      });
      setEditingItem(null);
    } else {
      addMenuItem({
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDesc.trim(),
        image: finalImage,
        isAvailable: (formStockCount === undefined || formStockCount > 0),
        spicyLevelAllowed: formSpicyAllowed,
        defaultSpicyLevel: formSpicyAllowed ? 1 : 0,
        prepTimeMinutes: Number(formPrepTime),
        stockCount: formStockCount,
        options: []
      });
    }

    setIsAddMenuOpen(false);
    setFormName('');
    setFormDesc('');
    setFormImage('');
    setFormImageSizeKb(null);
    setUploadError('');
  };

  const startEditMenu = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormPrice(item.price);
    setFormDesc(item.description);
    setFormSpicyAllowed(item.spicyLevelAllowed);
    setFormPrepTime(item.prepTimeMinutes);
    setFormStockCount(item.stockCount ?? 20);
    setFormImage(item.image || '');
    setFormImageSizeKb(null);
    setUploadError('');
    setIsAddMenuOpen(true);
  };

  const quickAdjustStock = (itemId: string, currentCount: number | undefined, delta: number) => {
    const nextCount = Math.max(0, (currentCount ?? 15) + delta);
    updateItemStock(itemId, nextCount);
  };

  return (
    <div className="bg-stone-100 min-h-screen pb-16">
      
      {/* Top Admin Sub-bar */}
      <div className="bg-stone-900 border-b border-stone-800 text-stone-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Portal Admin & Stok Jajanan Kakang</span>
            </span>

            <button
              onClick={toggleStoreOpen}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                settings.isOpen ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              <span>{settings.isOpen ? 'Toko Buka' : 'Toko Tutup'}</span>
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('customer')}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Lihat Menu Pembeli
            </button>
            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </div>

      {/* Target WhatsApp Integration Banner & Cloud Firebase Sync Banner */}
      <div className="bg-emerald-900 text-emerald-100 px-4 sm:px-6 py-2 border-b border-emerald-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Nomor WhatsApp Kasir: <strong className="text-white font-mono font-bold text-sm">{settings.phoneWhatsapp || '089620012837'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Firebase Firestore Real-Time Aktif
            </span>
            <a
              href={`https://wa.me/${(settings.phoneWhatsapp || '089620012837').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('Halo Admin Jajanan Kakang, tes koneksi WhatsApp checkout berhasil!')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors"
            >
              Tes WhatsApp →
            </a>
          </div>
        </div>
      </div>

      <div className="bg-amber-950/70 text-amber-200 px-4 sm:px-6 py-1.5 border-b border-amber-900/50 text-[11px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span>
            ⚡ <strong>Cloud Real-time:</strong> Setiap perubahan stok, harga, QRIS, rekening bank, atau nomor WhatsApp langsung tersimpan di Firestore dan otomatis muncul di seluruh perangkat pembeli.
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-stone-200/90 p-1.5 rounded-xl mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'menu' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-4 h-4 text-red-600" />
            <span>Kelola Stok Menu ({availableItemsCount}/{totalMenuItems} Siap)</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pesanan & Dapur ({activeOrdersCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pos' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-600" />
            <span>Kasir POS Walk-In</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Pembayaran & Toko</span>
          </button>
        </div>

        {/* TAB 1: KELOLA STOK MENU (Primary Goal) */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            
            {/* Stock Metric Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 block mb-1">Total Variasi Menu</span>
                <span className="text-2xl font-extrabold text-stone-900 tabular-nums">
                  {totalMenuItems} Menu
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 block mb-1">Stok Siap Jual</span>
                <span className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                  {availableItemsCount} Tersedia
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
                <span className="text-xs text-stone-500 block mb-1">Stok Habis / Nonaktif</span>
                <span className="text-2xl font-extrabold text-red-600 tabular-nums">
                  {outOfStockCount} Habis
                </span>
              </div>
            </div>

            {/* Controls Bar: Search, Status Filter & Add Menu */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari menu cireng, seblak, basreng..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    stockFilter === 'all'
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Semua ({totalMenuItems})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('available')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    stockFilter === 'available'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Tersedia ({availableItemsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStockFilter('empty')}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    stockFilter === 'empty'
                      ? 'bg-red-700 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Habis ({outOfStockCount})
                </button>
              </div>

              {/* Add New Menu CTA */}
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setFormName('');
                  setFormCategory('pedas');
                  setFormPrice(15000);
                  setFormDesc('');
                  setFormStockCount(25);
                  setFormImage('');
                  setFormImageSizeKb(null);
                  setUploadError('');
                  setIsAddMenuOpen(true);
                }}
                className="w-full md:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Menu Baru</span>
              </button>

            </div>

            {/* Menu List & Stock Controls */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="divide-y divide-stone-100">
                {displayedMenu.length === 0 ? (
                  <div className="p-8 text-center text-stone-500 text-xs">
                    Tidak ada menu yang sesuai dengan filter pencarian.
                  </div>
                ) : (
                  displayedMenu.map(item => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                      
                      {/* Item Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <img
                          src={item.image || '/src/assets/images/snack_cireng_rujak_1792424320121.jpg'}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/src/assets/images/snack_cireng_rujak_1792424320121.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-stone-900">{item.name}</h4>
                            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-semibold uppercase">
                              {item.category}
                            </span>
                            {item.spicyLevelAllowed && (
                              <span className="text-[10px] text-red-600 font-semibold inline-flex items-center gap-0.5">
                                <Flame className="w-3 h-3" />
                                <span>Level 0-5</span>
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>

                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="font-extrabold text-stone-900 tabular-nums">
                              {formatRupiah(item.price)}
                            </span>
                            <span className="text-stone-400">·</span>
                            <span className={`font-semibold ${item.isAvailable ? 'text-emerald-700' : 'text-red-600'}`}>
                              {item.isAvailable ? `Stok: ${item.stockCount ?? 'Tersedia'}` : 'Habis Terjual'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Adjustment Controls */}
                      <div className="flex items-center gap-2.5 flex-wrap shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                        
                        {/* 1-Click Stock Status Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleItemAvailability(item.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300'
                          }`}
                          title="Klik untuk mengubah status stok menu secara instan"
                        >
                          {item.isAvailable ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Stok Ada</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Stok Habis</span>
                            </>
                          )}
                        </button>

                        {/* Quick Stock Counter Buttons */}
                        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs">
                          <button
                            type="button"
                            onClick={() => quickAdjustStock(item.id, item.stockCount, -1)}
                            className="px-2 py-1 bg-white hover:bg-stone-200 rounded text-stone-700 font-bold tabular-nums cursor-pointer"
                            title="Kurangi stok 1 porsi"
                          >
                            -1
                          </button>
                          <span className="px-2 font-mono font-bold text-stone-800 tabular-nums">
                            {item.stockCount ?? 0}
                          </span>
                          <button
                            type="button"
                            onClick={() => quickAdjustStock(item.id, item.stockCount, 5)}
                            className="px-2 py-1 bg-white hover:bg-stone-200 rounded text-stone-700 font-bold tabular-nums cursor-pointer"
                            title="Tambah stok 5 porsi"
                          >
                            +5
                          </button>
                        </div>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => startEditMenu(item)}
                          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                          title="Edit nama, harga & deskripsi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus menu "${item.name}"?`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-stone-200 cursor-pointer"
                          title="Hapus Menu"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ORDERS & KITCHEN */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter Status Strip */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs">
                {(['all', 'menunggu', 'diproses', 'siap', 'selesai', 'dibatalkan'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize cursor-pointer ${
                      orderFilter === st
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    {st === 'all' ? 'Semua' : st}
                  </button>
                ))}
              </div>

              <span className="text-xs text-stone-500 font-medium">
                Menampilkan {displayedOrders.length} pesanan
              </span>
            </div>

            {/* Orders Table / Cards */}
            <div className="space-y-3">
              {displayedOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold bg-stone-900 text-white px-2 py-0.5 rounded">
                        {order.id}
                      </span>
                      <span className="font-bold text-stone-900 text-sm">
                        {order.customerName}
                      </span>
                      <span className="text-xs text-stone-500">
                        ({order.orderType === 'dine-in' ? 'Dine In' : order.orderType === 'takeaway' ? 'Bungkus' : 'Antar'})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">
                        {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                        {formatRupiah(order.total)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items & Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-stone-700 block mb-1">Pesanan:</span>
                      <ul className="space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="text-stone-800">
                            <span className="font-semibold">{item.quantity}x {item.menuItem.name}</span>
                            {item.menuItem.spicyLevelAllowed && (
                              <span className="text-red-600 font-semibold ml-1">[Lvl {item.spicyLevel}]</span>
                            )}
                            {item.selectedOptions.length > 0 && (
                              <span className="text-stone-500 ml-1">({item.selectedOptions.map(o => o.name).join(', ')})</span>
                            )}
                            {item.notes && (
                              <span className="text-stone-500 italic block pl-3">"{item.notes}"</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold text-stone-700 block mb-1">Tujuan / Meja:</span>
                      <p className="text-stone-600 mb-2">{order.tableOrAddress}</p>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 inline-flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Hubungi {order.customerPhone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Order Status Action Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Status Saat Ini:</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded capitalize ${
                        order.orderStatus === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                        order.orderStatus === 'siap' ? 'bg-blue-100 text-blue-800' :
                        order.orderStatus === 'diproses' ? 'bg-amber-100 text-amber-800' :
                        order.orderStatus === 'dibatalkan' ? 'bg-red-100 text-red-800' :
                        'bg-stone-100 text-stone-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {order.orderStatus === 'menunggu' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'diproses')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mulai Masak
                        </button>
                      )}
                      {order.orderStatus === 'diproses' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'siap')}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Siap Disajikan / Antar
                        </button>
                      )}
                      {order.orderStatus === 'siap' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'selesai')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Tandai Selesai
                        </button>
                      )}
                      {order.orderStatus !== 'dibatalkan' && order.orderStatus !== 'selesai' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'dibatalkan')}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                        >
                          Batalkan
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 3: POS CASHIER MODE */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Quick Menu Selection Grid */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-sm font-bold text-stone-900">
                Pilih Menu untuk Pesanan Kasir (Walk-In):
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {menu.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addPosItem(item)}
                    disabled={!item.isAvailable}
                    className="p-3 bg-white border border-stone-200 rounded-xl text-left hover:border-red-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-stone-900 block line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-stone-500 block capitalize">{item.category}</span>
                    </div>
                    <span className="text-xs font-extrabold text-red-600 tabular-nums mt-2 block">
                      {formatRupiah(item.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* POS Register Panel */}
            <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center justify-between">
                <span>Struk Pesanan Kasir</span>
                {posCart.length > 0 && (
                  <button
                    onClick={() => setPosCart([])}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500 block mb-1">Nama:</span>
                  <input
                    type="text"
                    value={posCustomerName}
                    onChange={(e) => setPosCustomerName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
                  />
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Meja / Bungkus:</span>
                  <input
                    type="text"
                    value={posTable}
                    onChange={(e) => setPosTable(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
                  />
                </div>
              </div>

              {/* Items in register */}
              <div className="max-h-52 overflow-y-auto divide-y divide-stone-100 text-xs">
                {posCart.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    Klik menu di samping untuk menambahkan ke struk
                  </div>
                ) : (
                  posCart.map(p => (
                    <div key={p.item.id} className="py-2 flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-semibold text-stone-900">{p.item.name}</span>
                        <span className="text-stone-500 ml-1.5 tabular-nums">x{p.qty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums">
                          {formatRupiah(p.item.price * p.qty)}
                        </span>
                        <button
                          onClick={() => removePosItem(p.item.id)}
                          className="text-stone-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cash Calculation */}
              <div className="space-y-2 pt-2 border-t border-stone-200 text-xs">
                <div className="flex justify-between font-bold text-sm text-stone-900">
                  <span>Total Tagihan:</span>
                  <span className="tabular-nums text-red-600">{formatRupiah(posTotal)}</span>
                </div>

                <div>
                  <span className="text-stone-500 block mb-1">Uang Diterima (Rp):</span>
                  <input
                    type="number"
                    value={cashGiven || ''}
                    placeholder="Masukkan nominal uang..."
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-sm font-bold tabular-nums"
                  />
                </div>

                {cashGiven > 0 && (
                  <div className="flex justify-between font-bold text-xs p-2 bg-emerald-50 text-emerald-800 rounded">
                    <span>Kembalian:</span>
                    <span className="tabular-nums">{formatRupiah(changeAmount)}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handlePosCheckout}
                disabled={posCart.length === 0}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              >
                Selesaikan Pembayaran & Cetak Struk
              </button>

            </div>

          </div>
        )}

        {/* TAB 4: PENGATURAN PEMBAYARAN & TOKO */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* Header Description */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <span>Pengaturan Pembayaran & Toko</span>
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Atur barcode QRIS, rekening transfer bank, nomor WhatsApp kasir, dan info toko. Seluruh perubahan langsung tersimpan di Cloud Firestore dan muncul seketika di perangkat pembeli.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sinkronisasi Otomatis Aktif
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* SECTION 1: PENGATURAN QRIS INSTANT */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">1. Pengaturan QRIS</h4>
                      <p className="text-[11px] text-stone-500">Upload gambar QRIS toko Anda dari perangkat</p>
                    </div>
                  </div>
                  {settings.qrisImageUrl && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      QRIS Kustom Aktif
                    </span>
                  )}
                </div>

                {/* Upload Buttons & Options */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1.5">
                      Upload Gambar QRIS dari Perangkat Lokal:
                    </label>
                    
                    {/* Hidden Native File Input */}
                    <input
                      ref={qrisFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleQrisFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isUploadingQris}
                        onClick={() => qrisFileInputRef.current?.click()}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingQris ? 'Mengompres & Menyimpan...' : 'Pilih Foto / Gambar QRIS dari HP / Laptop'}</span>
                      </button>

                      {settings.qrisImageUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            updateSettings({ qrisImageUrl: '' });
                            setQrisUploadSizeKb(null);
                          }}
                          className="px-3 py-2.5 bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 font-semibold rounded-xl text-xs transition-colors border border-stone-300 cursor-pointer"
                        >
                          Hapus / Reset QRIS
                        </button>
                      )}
                    </div>

                    {isUploadingQris && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Sedang mengompresi gambar QRIS agar ringan dan instan dimuat di perangkat pembeli...</span>
                      </div>
                    )}

                    {qrisUploadSizeKb !== null && !isUploadingQris && (
                      <span className="text-[11px] text-emerald-600 font-semibold block mt-1.5">
                        ✓ Gambar QRIS berhasil dikompresi (~{qrisUploadSizeKb} KB) & tersimpan ke database cloud.
                      </span>
                    )}

                    {qrisUploadError && (
                      <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{qrisUploadError}</span>
                      </div>
                    )}
                  </div>

                  {/* Alternative URL Input */}
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1">
                      Atau Masukkan URL Gambar QRIS Eksternal:
                    </label>
                    <input
                      type="url"
                      placeholder="https://contoh.com/qris-jajanan-kakang.png"
                      value={settings.qrisImageUrl || ''}
                      onChange={(e) => updateSettings({ qrisImageUrl: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Box of Active QRIS */}
                <div className="pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                      Pratinjau (Preview) Gambar QRIS yang Sedang Aktif:
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Tampilan pembeli saat checkout
                    </span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col items-center text-center space-y-2.5">
                    <span className="text-[11px] font-bold text-stone-700">
                      Scan QRIS via BCA, Gopay, OVO, ShopeePay, DANA, dll:
                    </span>

                    {/* QR Code Container */}
                    <div className="p-3 bg-white rounded-xl border border-stone-300 shadow-xs flex flex-col items-center">
                      {settings.qrisImageUrl ? (
                        <div className="space-y-1">
                          <img
                            src={settings.qrisImageUrl}
                            alt="Pratinjau QRIS Toko"
                            className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1 flex flex-col items-center">
                          <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                            (Pratinjau QRIS Standar Sistem)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500">
                      NMID: ID1020084918239 · {settings.storeName || 'Jajanan Kakang Bandung'}
                    </div>

                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      ✓ Gambar ini otomatis tampil saat pembeli memilih metode <strong>QRIS Instant</strong> di formulir checkout.
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 2: PENGATURAN TRANSFER BANK */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">2. Pengaturan Transfer Bank</h4>
                      <p className="text-[11px] text-stone-500">Konfigurasi rekening tujuan pembayaran pelanggan</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Transfer Bank
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Nama Bank */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Nama Bank:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: BCA / Mandiri / BRI / BNI / BSI"
                      value={settings.bankAccount?.bank || ''}
                      onChange={(e) => handleBankChange('bank', e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />

                    {/* Quick Preset Banks */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-stone-400">Pilihan Cepat:</span>
                      {['BCA (Bank Central Asia)', 'Mandiri', 'BRI', 'BNI', 'BSI'].map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => handleBankChange('bank', b)}
                          className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-medium border border-stone-200 cursor-pointer"
                        >
                          {b.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nomor Rekening */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Nomor Rekening:
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 8400192811"
                      value={settings.bankAccount?.accountNumber || ''}
                      onChange={(e) => handleBankChange('accountNumber', e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Atas Nama */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Atas Nama (Pemilik Rekening):
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Kakang Aditya Pratama"
                      value={settings.bankAccount?.holderName || ''}
                      onChange={(e) => handleBankChange('holderName', e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Preview Box of Bank Transfer info for Customers */}
                <div className="pt-2 border-t border-stone-100">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
                    Pratinjau Tampilan Rekening di Layar Pembeli:
                  </span>

                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900 block text-xs">
                          {settings.bankAccount?.bank || 'BCA (Bank Central Asia)'}
                        </span>
                        <span className="font-mono text-sm text-stone-900 font-bold tabular-nums block">
                          {settings.bankAccount?.accountNumber || '8400192811'}
                        </span>
                        <span className="text-[11px] text-stone-500 block">
                          a.n {settings.bankAccount?.holderName || 'Kakang Aditya Pratama'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(settings.bankAccount?.accountNumber || '8400192811');
                          setCopiedAccountPreview(true);
                          setTimeout(() => setCopiedAccountPreview(false), 2000);
                        }}
                        className="px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedAccountPreview ? 'Tersalin!' : 'Salin Rek'}</span>
                      </button>
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-700 block mt-2">
                    ✓ Pembeli yang memilih metode <strong>Transfer Bank</strong> akan melihat data rekening di atas beserta tombol salin instan.
                  </span>
                </div>

              </div>

              {/* SECTION 3: PENGATURAN KONTAK KASIR & WHATSAPP TOKO */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">3. Pengaturan Kontak Kasir</h4>
                      <p className="text-[11px] text-stone-500">Nomor WhatsApp tujuan order & konfirmasi kasir</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    WhatsApp Dinamis
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">
                      Nomor WhatsApp Kasir / Toko:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Contoh: 089620012837 atau 6289620012837"
                        value={settings.phoneWhatsapp}
                        onChange={(e) => updateSettings({ phoneWhatsapp: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 block mt-1.5">
                      Format dapat diawali <strong>08...</strong> atau <strong>628...</strong>. Sistem otomatis menyesuaikan tautan WhatsApp resmi (<code className="bg-stone-100 px-1 py-0.5 rounded">wa.me/62...</code>).
                    </span>
                  </div>

                  {/* WhatsApp Action Preview */}
                  <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-xs">
                      Tautan Pengujian WhatsApp:
                    </span>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Tombol checkout pembeli <strong>"Kirim & Pesan via WhatsApp"</strong> dan footer modal akan langsung mengirimkan format pesanan lengkap ke nomor:
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="font-mono font-bold text-stone-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 text-xs">
                        {settings.phoneWhatsapp || '089620012837'}
                      </span>
                      <a
                        href={`https://wa.me/${(settings.phoneWhatsapp || '089620012837').replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent('Halo Kasir Jajanan Kakang, saya ingin konfirmasi pesanan...')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Tes Kirim Pesan Sekarang →</span>
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* SECTION 4: PROFIL TOKO & OPERASIONAL (Fitur bawaan tetap terjaga) */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">4. Profil Toko & Pengantaran</h4>
                      <p className="text-[11px] text-stone-500">Logo, alamat outlet, dan pengaturan tarif ongkos kirim</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={toggleStoreOpen}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      settings.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {settings.isOpen ? '● Outlet Buka' : '○ Outlet Tutup'}
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Logo Setting */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-stone-700 block">Logo Toko:</label>
                      {settings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => updateSettings({ logoUrl: '' })}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          Reset Logo (JK)
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-900 flex items-center justify-center p-1 border border-stone-700 shrink-0">
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-white font-bold text-sm">JK</span>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                if (typeof reader.result === 'string') {
                                  updateSettings({ logoUrl: reader.result });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-[11px] text-stone-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nama Toko */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Nama Toko:</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => updateSettings({ storeName: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Alamat Outlet */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Alamat Outlet / Dapur:</label>
                    <input
                      type="text"
                      value={settings.address}
                      onChange={(e) => updateSettings({ address: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Ongkir & Gratis Ongkir */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Ongkir Standar (Rp):</label>
                      <input
                        type="number"
                        value={settings.deliveryFee}
                        onChange={(e) => updateSettings({ deliveryFee: Number(e.target.value) })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-700 block mb-1">Min. Gratis Ongkir (Rp):</label>
                      <input
                        type="number"
                        value={settings.freeDeliveryMin}
                        onChange={(e) => updateSettings({ freeDeliveryMin: Number(e.target.value) })}
                        className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pengumuman Promo */}
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Pengumuman / Promo Banner Berjalan:</label>
                    <textarea
                      rows={2}
                      value={settings.announcement || ''}
                      onChange={(e) => updateSettings({ announcement: e.target.value })}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Real-time Note */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Seluruh pengaturan di atas otomatis tersinkronisasi secara real-time ke Firebase Firestore dan modal pemesanan pembeli.</span>
              </span>
              <span className="font-semibold text-stone-700 hidden sm:inline">
                Jajanan Kakang Cloud System
              </span>
            </div>

          </div>
        )}

      </div>

      {/* Modal Add / Edit Menu Item */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-950/70" onClick={() => setIsAddMenuOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 p-6 z-10 space-y-4">
              <h3 className="text-base font-bold text-stone-900">
                {editingItem ? 'Edit Menu Jajanan' : 'Tambah Menu Baru'}
              </h3>

              <form onSubmit={handleSaveMenu} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nama Menu *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Kategori</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ItemCategory)}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
                    >
                      <option value="pedas">Pedas Gurih</option>
                      <option value="kuah">Kuah Hangat</option>
                      <option value="gorengan">Gorengan Renyah</option>
                      <option value="minuman">Minuman Segar</option>
                      <option value="paket">Paket Hemat</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Harga (Rp)</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs font-bold tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Jumlah Porsi Stok Awal</label>
                  <input
                    type="number"
                    value={formStockCount ?? ''}
                    onChange={(e) => setFormStockCount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Contoh: 25 porsi (kosongkan jika tak terbatas)"
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs tabular-nums"
                  />
                </div>

                {/* Upload Foto Makanan dari Perangkat Lokal (Firebase Firestore Cloud Sync) */}
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                      <Camera className="w-4 h-4 text-red-600" />
                      <span>Upload Foto Makanan *</span>
                    </label>
                    {formImageSizeKb !== null && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                        ✓ Terkompresi ({formImageSizeKb} KB)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-xl bg-stone-200 overflow-hidden shrink-0 border border-stone-300 flex items-center justify-center relative">
                      {formImage ? (
                        <img
                          src={formImage}
                          alt="Preview Menu"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-stone-400 p-1 text-center">
                          <ImageIcon className="w-6 h-6 mb-1 text-stone-300" />
                          <span className="text-[9px] leading-tight">Belum ada foto</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="food-image-file-input"
                      />

                      <label
                        htmlFor="food-image-file-input"
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isUploadingImage ? 'Mengompres Foto...' : formImage ? 'Ganti Foto dari Perangkat' : 'Pilih Foto dari HP / Komputer'}</span>
                      </label>

                      {formImage && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormImage('');
                            setFormImageSizeKb(null);
                          }}
                          className="block text-[11px] text-red-600 hover:text-red-700 underline cursor-pointer"
                        >
                          Hapus foto saat ini
                        </button>
                      )}

                      <span className="text-[10px] text-stone-500 block leading-tight">
                        Foto otomatis dikompresi & disimpan ke database cloud agar langsung muncul di HP pembeli.
                      </span>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Input URL Alternatif */}
                  <div className="pt-1">
                    <span className="text-[10px] text-stone-600 block mb-1">
                      Atau masukkan URL gambar jika ada:
                    </span>
                    <input
                      type="url"
                      placeholder="https://contoh.com/foto-makanan.jpg"
                      value={formImage}
                      onChange={(e) => {
                        setFormImage(e.target.value);
                        setFormImageSizeKb(null);
                      }}
                      className="w-full p-2 bg-white border border-stone-300 rounded text-xs"
                    />
                  </div>

                  {/* Preset Cepat Foto Jajanan */}
                  <div className="pt-1">
                    <span className="text-[10px] text-stone-500 block mb-1 font-medium">
                      Atau pilih foto bawaan:
                    </span>
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setFormImage('/src/assets/images/snack_cireng_rujak_1792424320121.jpg')}
                        className="px-2 py-0.5 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[10px] text-stone-700"
                      >
                        🥟 Cireng
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImage('/src/assets/images/snack_seblak_pedas_1792424321707.jpg')}
                        className="px-2 py-0.5 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[10px] text-stone-700"
                      >
                        🍲 Seblak
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormImage('/src/assets/images/snack_basreng_daun_jeruk_1792424321392.jpg')}
                        className="px-2 py-0.5 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[10px] text-stone-700"
                      >
                        🌶️ Basreng
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-300 rounded text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="spicyAllowed"
                    checked={formSpicyAllowed}
                    onChange={(e) => setFormSpicyAllowed(e.target.checked)}
                    className="rounded text-red-600"
                  />
                  <label htmlFor="spicyAllowed" className="font-medium text-stone-700">
                    Pelanggan bisa memilih level pedas (Level 0 - 5)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setIsAddMenuOpen(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-xs font-bold text-white cursor-pointer"
                  >
                    Simpan Menu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
