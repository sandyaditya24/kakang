import React, { useState } from 'react';
import {
  ShieldCheck, Lock, LogOut, TrendingUp, ShoppingBag, Clock, CheckCircle2,
  AlertCircle, Plus, Edit2, Trash2, Phone, Printer, Search, Eye, EyeOff,
  Store, Calculator, RefreshCw, MessageSquare, Check, X, Layers, Flame
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order, OrderStatus, MenuItem, ItemCategory } from '../types';

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
      isCashierOrder: true
    };

    updateOrderStatus(newOrder.id, 'selesai');
    setPosCart([]);
    setCashGiven(0);
    alert(`Pesanan Kasir ${newOrder.id} berhasil dicatat & lunas! Kembalian: ${formatRupiah(changeAmount)}`);
  };

  // Add/Edit Menu Item Handler
  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name: formName.trim(),
        category: formCategory,
        price: Number(formPrice),
        description: formDesc.trim(),
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
        image: menu[0]?.image || '',
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
              Nomor WhatsApp Checkout: <strong className="text-white font-mono font-bold text-sm">089620012837</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Firebase Firestore Real-Time Aktif
            </span>
            <a
              href={`https://wa.me/6289620012837?text=${encodeURIComponent('Halo Admin Jajanan Kakang, tes koneksi WhatsApp checkout berhasil!')}`}
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
            ⚡ <strong>Cloud Real-time:</strong> Setiap perubahan stok, harga, penambahan menu, atau logo langsung ter-update di layar pembeli secara otomatis tanpa perlu redeploy.
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
            <Store className="w-4 h-4 text-stone-600" />
            <span>Pengaturan Toko & WA</span>
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
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
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

        {/* TAB 4: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
              Pengaturan Toko, Logo & Kontak
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* Logo Setting Section */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 uppercase tracking-wider block">
                    Logo Toko (Tampilan Header & Footer):
                  </label>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => updateSettings({ logoUrl: '' })}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Reset ke Logo Awal (JK)
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Live Preview of Current Logo */}
                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-stone-500 font-medium">Pratinjau Logo</span>
                    <div className="w-16 h-16 rounded-xl bg-stone-900 flex items-center justify-center p-1.5 border border-stone-700 shadow-sm relative overflow-hidden">
                      {settings.logoUrl ? (
                        <img
                          src={settings.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white font-extrabold text-lg">
                          JK
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Input Options: Upload File or URL */}
                  <div className="flex-1 w-full space-y-2">
                    <div>
                      <span className="text-[11px] text-stone-600 block mb-1">
                        1. Upload Foto Logo dari HP / Komputer:
                      </span>
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
                        className="w-full text-xs text-stone-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-stone-900 file:text-white hover:file:bg-stone-800 cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-stone-600 block mb-1">
                        2. Atau Masukkan URL Gambar Logo:
                      </span>
                      <input
                        type="url"
                        placeholder="https://contoh.com/logo-jajanan.png"
                        value={settings.logoUrl || ''}
                        onChange={(e) => updateSettings({ logoUrl: e.target.value })}
                        className="w-full p-2 bg-white border border-stone-300 rounded-lg text-xs"
                      />
                    </div>

                    {/* Quick Preset Logos */}
                    <div className="pt-1">
                      <span className="text-[10px] text-stone-500 block mb-1">
                        Pilihan Cepat Ikon Logo:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => updateSettings({ logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=128&auto=format&fit=crop&q=80' })}
                          className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[11px] font-medium text-stone-700 cursor-pointer"
                        >
                          🥘 Kuali Masakan
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ logoUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=128&auto=format&fit=crop&q=80' })}
                          className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[11px] font-medium text-stone-700 cursor-pointer"
                        >
                          🥟 Dimsum & Aci
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=128&auto=format&fit=crop&q=80' })}
                          className="px-2 py-1 bg-white border border-stone-200 hover:bg-stone-100 rounded text-[11px] font-medium text-stone-700 cursor-pointer"
                        >
                          🏮 Gerobak Kuliner
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSettings({ logoUrl: '' })}
                          className="px-2 py-1 bg-stone-200 hover:bg-stone-300 rounded text-[11px] font-medium text-stone-800 cursor-pointer"
                        >
                          Badge Standar (JK)
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Toko:</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => updateSettings({ storeName: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Nomor WhatsApp Kasir & Checkout:</label>
                <input
                  type="text"
                  value={settings.phoneWhatsapp}
                  onChange={(e) => updateSettings({ phoneWhatsapp: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                />
                <span className="text-[11px] text-emerald-700 block mt-1">
                  ✓ Nomor WhatsApp ini digunakan untuk seluruh tombol "WhatsApp Checkout" pelanggan.
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Alamat Outlet / Dapur:</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => updateSettings({ address: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ongkir Standar (Rp):</label>
                  <input
                    type="number"
                    value={settings.deliveryFee}
                    onChange={(e) => updateSettings({ deliveryFee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min. Belanja Gratis Ongkir (Rp):</label>
                  <input
                    type="number"
                    value={settings.freeDeliveryMin}
                    onChange={(e) => updateSettings({ freeDeliveryMin: Number(e.target.value) })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Pengumuman / Promo Banner Berjalan:</label>
                <textarea
                  rows={2}
                  value={settings.announcement || ''}
                  onChange={(e) => updateSettings({ announcement: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              <span className="text-xs text-emerald-600 font-semibold">
                ✓ Perubahan tersimpan secara otomatis
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
