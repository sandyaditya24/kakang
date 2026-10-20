import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MenuItem, CartItem, Order, StoreSettings, CategoryType, OrderStatus, PaymentStatus } from '../types';
import { INITIAL_MENU, INITIAL_ORDERS, INITIAL_SETTINGS } from '../data/initialData';
import { api } from '../services/api';
import { getOrCreateDeviceId } from '../utils/deviceId';
import {
  subscribeMenu,
  subscribeOrders,
  subscribeCustomerOrders,
  getCustomerOrderById,
  subscribeSettings,
  saveMenuItemToFirestore,
  deleteMenuItemFromFirestore,
  saveOrderToFirestore,
  updateOrderStatusInFirestore,
  saveSettingsToFirestore,
  seedInitialFirestoreData,
  auth
} from '../services/firebase';

interface StoreContextType {
  menu: MenuItem[];
  setMenu: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  cart: CartItem[];
  orders: Order[];
  myOrders: Order[];
  deviceId: string;
  lookupCustomerOrder: (orderId: string) => Promise<Order | null>;
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  toggleStoreOpen: () => void;
  
  // Cart Actions
  addToCart: (item: MenuItem, quantity: number, spicyLevel: number, selectedOptions: any[], notes: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotalCount: number;
  cartSubtotal: number;
  
  // Order Actions
  placeOrder: (orderData: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus) => void;
  
  // Menu Admin Actions
  toggleItemAvailability: (itemId: string) => void;
  updateItemStock: (itemId: string, count: number) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (itemId: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (itemId: string) => void;
  
  // Navigation & Modals
  currentView: 'customer' | 'admin' | 'tracking';
  setCurrentView: (view: 'customer' | 'admin' | 'tracking') => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCustomizeOpen: boolean;
  customizingItem: MenuItem | null;
  openCustomize: (item: MenuItem) => void;
  closeCustomize: () => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  
  // Admin Auth (matching admin_token middleware concept)
  adminToken: string | null;
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  
  // Helpers
  formatRupiah: (amount: number) => string;
  getSpicyLevelLabel: (level: number) => { label: string; color: string; desc: string };
  generateWhatsAppUrl: (order: Order) => string;
  getDirectWhatsAppCartUrl: (customerName?: string, notes?: string) => string;
  isSyncing: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage state hydration with fallbacks
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('jk_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jk_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Unique persistent deviceId for buyer privacy
  const [deviceId] = useState<string>(() => getOrCreateDeviceId());

  // Private orders made on this specific device
  const [myOrders, setMyOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jk_my_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Global orders (populated for Admin / Kitchen / POS)
  const [orders, setOrders] = useState<Order[]>(() => {
    const hasAdmin = Boolean(localStorage.getItem('admin_token'));
    if (hasAdmin) {
      const saved = localStorage.getItem('jk_admin_orders');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('jk_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          phoneWhatsapp: parsed.phoneWhatsapp || '089620012837',
          bankAccount: {
            ...INITIAL_SETTINGS.bankAccount,
            ...(parsed.bankAccount || {})
          }
        };
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  // Admin token simulating cookie 'admin_token'
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    // Check cookie or localStorage
    const match = document.cookie.match(new RegExp('(^| )admin_token=([^;]+)'));
    if (match) return match[2];
    return localStorage.getItem('admin_token') || null;
  });

  // Check URL pathname for /admin or #admin on initialization
  const [currentView, setCurrentViewState] = useState<'customer' | 'admin' | 'tracking'>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/admin' || h === '#admin' || p.startsWith('/admin')) {
        return 'admin';
      }
    }
    return 'customer';
  });

  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Synchronized view routing
  const setCurrentView = useCallback((view: 'customer' | 'admin' | 'tracking') => {
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      if (view === 'admin') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
      } else if (view === 'customer') {
        if (window.location.pathname === '/admin') {
          window.history.pushState({}, '', '/');
        }
      }
    }
  }, []);

  // Listen to popstate & hashchange (e.g. user entering /admin or clicking back)
  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/admin' || h === '#admin' || p.startsWith('/admin')) {
        setCurrentViewState('admin');
      } else if (p === '/' && currentView === 'admin') {
        setCurrentViewState('customer');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [currentView]);

  // Sync state to localStorage as fast client cache
  useEffect(() => {
    localStorage.setItem('jk_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('jk_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jk_my_orders', JSON.stringify(myOrders));
  }, [myOrders]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('jk_admin_orders', JSON.stringify(orders));
    }
  }, [orders, adminToken]);

  useEffect(() => {
    localStorage.setItem('jk_settings', JSON.stringify(settings));
  }, [settings]);

  // Connect to Firebase Firestore Real-Time listeners + Seed if empty
  useEffect(() => {
    setIsSyncing(true);

    // Seed initial menu & settings to Firestore if newly created database
    seedInitialFirestoreData(INITIAL_MENU, INITIAL_SETTINGS, INITIAL_ORDERS).finally(() => {
      setIsSyncing(false);
    });

    // 1. Real-time Firebase Firestore Menu & Stock listener
    const unsubMenu = subscribeMenu((firebaseMenuItems) => {
      if (Array.isArray(firebaseMenuItems) && firebaseMenuItems.length > 0) {
        setMenu(firebaseMenuItems);
      }
    });

    // 2. Real-time Firebase Firestore Private Customer Orders listener (scoped to deviceId)
    const unsubCustomerOrders = subscribeCustomerOrders(deviceId, (deviceOrders) => {
      if (Array.isArray(deviceOrders)) {
        setMyOrders(deviceOrders);
        // Automatically sync active tracking order status if present
        setActiveTrackingOrder(prev => {
          if (!prev) return null;
          const updated = deviceOrders.find(o => o.id === prev.id);
          return updated || prev;
        });
      }
    });

    // 3. Real-time Firebase Firestore All Orders listener (Only active when Admin is logged in)
    let unsubAdminOrders: (() => void) | null = null;
    if (adminToken) {
      unsubAdminOrders = subscribeOrders((firebaseOrders) => {
        if (Array.isArray(firebaseOrders)) {
          setOrders(firebaseOrders);
        }
      });
    }

    // 4. Real-time Firebase Firestore Store Settings & Logo listener
    const unsubSettings = subscribeSettings((firebaseSettings) => {
      if (firebaseSettings) {
        setSettings(prev => ({
          ...prev,
          ...firebaseSettings,
          phoneWhatsapp: firebaseSettings.phoneWhatsapp || prev.phoneWhatsapp || '089620012837',
          bankAccount: firebaseSettings.bankAccount ? { ...prev.bankAccount, ...firebaseSettings.bankAccount } : prev.bankAccount
        }));
      }
    });

    // Secondary fallback SSE / local API
    const unsubSSE = api.subscribeSync((evt) => {
      if (evt.entity === 'stock' || evt.entity === 'menu' || evt.entity === 'all') {
        api.getMenu().then(data => {
          if (Array.isArray(data) && data.length > 0) setMenu(data);
        }).catch(() => {});
      }
      if (evt.entity === 'settings' || evt.entity === 'all') {
        api.getSettings().then(data => {
          if (data) setSettings(prev => ({
            ...prev,
            ...data,
            phoneWhatsapp: data.phoneWhatsapp || prev.phoneWhatsapp || '089620012837',
            bankAccount: data.bankAccount ? { ...prev.bankAccount, ...data.bankAccount } : prev.bankAccount
          }));
        }).catch(() => {});
      }
      if (evt.entity === 'orders' || evt.entity === 'all') {
        if (adminToken) {
          api.getOrders().then(data => {
            if (Array.isArray(data)) setOrders(data);
          }).catch(() => {});
        } else {
          api.getOrders(deviceId).then(data => {
            if (Array.isArray(data)) setMyOrders(data);
          }).catch(() => {});
        }
      }
    });

    return () => {
      unsubMenu();
      unsubCustomerOrders();
      if (unsubAdminOrders) unsubAdminOrders();
      unsubSettings();
      unsubSSE();
    };
  }, [deviceId, adminToken]);

  // Admin Authentication
  const loginAdmin = (pinOrPass: string): boolean => {
    if (pinOrPass === 'kakang123' || pinOrPass === '1234' || pinOrPass === 'admin') {
      const token = 'token_jk_admin_' + Date.now();
      setAdminToken(token);
      localStorage.setItem('admin_token', token);
      document.cookie = `admin_token=${token}; path=/; max-age=86400`;
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminToken(null);
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; max-age=0';
    setCurrentView('customer');
  };

  const isAdminLoggedIn = !!adminToken;

  // Cart Management
  const addToCart = (
    item: MenuItem,
    quantity: number,
    spicyLevel: number,
    selectedOptions: any[],
    notes: string
  ) => {
    const optionsTotal = selectedOptions.reduce((acc, opt) => acc + opt.price, 0);
    const unitPrice = item.price + optionsTotal;
    const itemTotal = unitPrice * quantity;

    const optionsKey = selectedOptions.map(o => o.id).sort().join(',');
    const existingIndex = cart.findIndex(c => 
      c.menuItem.id === item.id &&
      c.spicyLevel === spicyLevel &&
      c.notes === notes &&
      c.selectedOptions.map(o => o.id).sort().join(',') === optionsKey
    );

    if (existingIndex > -1) {
      setCart(prev => {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          itemTotal: unitPrice * newQty
        };
        return updated;
      });
    } else {
      const newCartItem: CartItem = {
        cartItemId: 'ci-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        menuItem: item,
        quantity,
        spicyLevel,
        selectedOptions,
        notes,
        itemTotal
      };
      setCart(prev => [...prev, newCartItem]);
    }

    setIsCustomizeOpen(false);
    setCustomizingItem(null);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.cartItemId === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          const optionsTotal = item.selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
          const unitPrice = item.menuItem.price + optionsTotal;
          return {
            ...item,
            quantity: newQty,
            itemTotal: unitPrice * newQty
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.itemTotal, 0);

  // Orders Management with backend sync & private deviceId scoping
  const placeOrder = (orderData: Omit<Order, 'id' | 'createdAt'>): Order => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const currentDeviceId = getOrCreateDeviceId();
    const currentUserId = auth.currentUser?.uid;

    const newOrder: Order = {
      ...orderData,
      id: `JK-${randomNum}`,
      createdAt: new Date().toISOString(),
      deviceId: currentDeviceId,
      userId: currentUserId || undefined
    };

    setMyOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
    clearCart();
    setActiveTrackingOrder(newOrder);

    // Save to Firebase Firestore cloud database (including deviceId)
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('Firestore order sync:', err);
    });

    // Save to backend database
    api.createOrder(newOrder).catch((err) => {
      console.warn('Backend order sync queued:', err);
    });

    return newOrder;
  };

  const lookupCustomerOrder = async (orderId: string): Promise<Order | null> => {
    const cleanId = orderId.trim().toUpperCase();
    // 1. Search in existing private device orders
    const localMatch = myOrders.find(o => 
      o.id.toUpperCase() === cleanId || o.customerPhone.includes(cleanId)
    );
    if (localMatch) {
      setActiveTrackingOrder(localMatch);
      return localMatch;
    }

    // 2. Query Firestore with strict device ownership check
    const currentDeviceId = getOrCreateDeviceId();
    const remoteOrder = await getCustomerOrderById(cleanId, currentDeviceId);
    if (remoteOrder) {
      setMyOrders(prev => [remoteOrder, ...prev.filter(o => o.id !== remoteOrder.id)]);
      setActiveTrackingOrder(remoteOrder);
      return remoteOrder;
    }

    return null;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
    setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: status } : o));
    if (activeTrackingOrder?.id === orderId) {
      setActiveTrackingOrder(prev => prev ? { ...prev, orderStatus: status } : null);
    }
    updateOrderStatusInFirestore(orderId, status).catch(() => {});
    api.updateOrderStatus(orderId, status).catch(() => {});
  };

  const updatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    setMyOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: status } : o));
    if (activeTrackingOrder?.id === orderId) {
      setActiveTrackingOrder(prev => prev ? { ...prev, paymentStatus: status } : null);
    }
    updateOrderStatusInFirestore(orderId, undefined, status).catch(() => {});
    api.updateOrderStatus(orderId, undefined as any, status).catch(() => {});
  };

  // Menu Admin with Real-Time Backend & Firebase Sync
  const toggleItemAvailability = (itemId: string) => {
    const current = menu.find(m => m.id === itemId);
    if (!current) return;
    const nextStatus = !current.isAvailable;
    const updated = { ...current, isAvailable: nextStatus };
    setMenu(prev => prev.map(m => m.id === itemId ? updated : m));
    saveMenuItemToFirestore(updated).catch(() => {});
    api.updateStock(itemId, nextStatus, current.stockCount).catch(() => {});
  };

  const updateItemStock = (itemId: string, count: number) => {
    const current = menu.find(m => m.id === itemId);
    const isAvail = count > 0;
    const updated = current ? {
      ...current,
      stockCount: Math.max(0, count),
      isAvailable: isAvail
    } : null;

    setMenu(prev => prev.map(m => m.id === itemId ? (updated || { ...m, stockCount: Math.max(0, count), isAvailable: isAvail }) : m));
    if (updated) {
      saveMenuItemToFirestore(updated).catch(() => {});
    }
    api.updateStock(itemId, isAvail, count).catch(() => {});
  };

  const addMenuItem = (newItem: Omit<MenuItem, 'id'>) => {
    const item: MenuItem = {
      ...newItem,
      id: 'menu-' + Date.now()
    };
    setMenu(prev => [item, ...prev]);
    saveMenuItemToFirestore(item).catch(() => {});
    api.addMenuItem(item).catch(() => {});
  };

  const updateMenuItem = (itemId: string, updated: Partial<MenuItem>) => {
    let fullItem: MenuItem | undefined;
    setMenu(prev => prev.map(m => {
      if (m.id === itemId) {
        fullItem = { ...m, ...updated };
        return fullItem;
      }
      return m;
    }));
    if (fullItem) {
      saveMenuItemToFirestore(fullItem).catch(() => {});
    }
    api.updateMenuItem(itemId, updated).catch(() => {});
  };

  const deleteMenuItem = (itemId: string) => {
    setMenu(prev => prev.filter(m => m.id !== itemId));
    deleteMenuItemFromFirestore(itemId).catch(() => {});
    api.deleteMenuItem(itemId).catch(() => {});
  };

  // Store Settings with Real-Time Backend & Firebase Sync (including QRIS, Bank, Logo & WhatsApp)
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    const merged: StoreSettings = {
      ...settings,
      ...newSettings,
      phoneWhatsapp: newSettings.phoneWhatsapp !== undefined
        ? newSettings.phoneWhatsapp
        : (settings.phoneWhatsapp || '089620012837'),
      bankAccount: newSettings.bankAccount
        ? { ...settings.bankAccount, ...newSettings.bankAccount }
        : settings.bankAccount
    };
    setSettings(merged);
    saveSettingsToFirestore(merged).catch(() => {});
    api.updateSettings(merged).catch(() => {});
  };

  const toggleStoreOpen = () => {
    const nextOpen = !settings.isOpen;
    updateSettings({ isOpen: nextOpen });
  };

  // Modal handlers
  const openCustomize = (item: MenuItem) => {
    setCustomizingItem(item);
    setIsCustomizeOpen(true);
  };

  const closeCustomize = () => {
    setCustomizingItem(null);
    setIsCustomizeOpen(false);
  };

  // Format IDR currency
  const formatRupiah = (amount: number): string => {
    return 'Rp' + amount.toLocaleString('id-ID');
  };

  // Spicy Level Descriptor
  const getSpicyLevelLabel = (level: number) => {
    switch (level) {
      case 0:
        return { label: 'Level 0: Manis / Gurih', color: 'text-amber-700', desc: 'Bebas pedas, aman untuk anak-anak' };
      case 1:
        return { label: 'Level 1: Pedas Santai', color: 'text-orange-600', desc: 'Hangat nikmat di lidah' };
      case 2:
        return { label: 'Level 2: Pedas Nampol', color: 'text-red-500', desc: 'Favorit pelanggan, pas pedasnya' };
      case 3:
        return { label: 'Level 3: Pedas Daun Jeruk', color: 'text-red-600', desc: 'Cabe rawit merah + daun jeruk melimpah' };
      case 4:
        return { label: 'Level 4: Super Pedas', color: 'text-red-700', desc: 'Bikin bibir jontor dan keringatan' };
      case 5:
        return { label: 'Level 5: Pedas Mampus', color: 'text-red-900', desc: 'Tantangan pedas ekstrem!' };
      default:
        return { label: `Level ${level}`, color: 'text-stone-700', desc: 'Pilihan racikan cabe Kakang' };
    }
  };

  // Format WhatsApp message for a placed order
  const generateWhatsAppUrl = (order: Order): string => {
    let storePhone = (settings.phoneWhatsapp || '089620012837').replace(/[^0-9]/g, '');
    if (storePhone.startsWith('0')) {
      storePhone = '62' + storePhone.slice(1);
    }
    const itemsList = order.items.map((item, idx) => {
      const opts = item.selectedOptions.length > 0
        ? ` (${item.selectedOptions.map(o => o.name).join(', ')})`
        : '';
      const spice = item.menuItem.spicyLevelAllowed ? ` [Lvl ${item.spicyLevel}]` : '';
      const notes = item.notes ? `\n   Catatan: _"${item.notes}"_` : '';
      return `${idx + 1}. *${item.menuItem.name}* x${item.quantity}${spice}${opts} = ${formatRupiah(item.itemTotal)}${notes}`;
    }).join('\n');

    const paymentText = order.paymentMethod === 'qris' 
      ? 'QRIS (Sudah transfer/scan)' 
      : order.paymentMethod === 'transfer' 
      ? 'Transfer Bank' 
      : 'Bayar Tunai / COD';

    const orderTypeText = order.orderType === 'dine-in'
      ? 'Makan di Tempat (Dine In)'
      : order.orderType === 'takeaway'
      ? 'Bungkus / Ambil Sendiri'
      : 'Pesan Antar (Delivery)';

    const text = `Halo Admin *${settings.storeName}*, saya mau pesan nih!\n\n` +
      `🧾 *ID Pesanan:* ${order.id}\n` +
      `👤 *Nama:* ${order.customerName}\n` +
      `📱 *No. HP/WA:* ${order.customerPhone}\n` +
      `📍 *Tipe & Alamat/Meja:* ${orderTypeText} - ${order.tableOrAddress}\n\n` +
      `🛒 *Rincian Pesanan:*\n${itemsList}\n\n` +
      `💰 *Subtotal:* ${formatRupiah(order.subtotal)}\n` +
      (order.deliveryFee > 0 ? `🛵 *Ongkir:* ${formatRupiah(order.deliveryFee)}\n` : '') +
      `🏷️ *Total Bayar:* *${formatRupiah(order.total)}*\n` +
      `💳 *Metode Pembayaran:* ${paymentText}\n\n` +
      `Mohon segera diproses ya Kakang, terima kasih! 🙏🔥`;

    return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
  };

  // Direct 1-Click WhatsApp Cart Checkout URL
  const getDirectWhatsAppCartUrl = (customerName?: string, notes?: string): string => {
    let storePhone = (settings.phoneWhatsapp || '089620012837').replace(/[^0-9]/g, '');
    if (storePhone.startsWith('0')) {
      storePhone = '62' + storePhone.slice(1);
    }
    const itemsList = cart.map((item, idx) => {
      const opts = item.selectedOptions.length > 0
        ? ` (+${item.selectedOptions.map(o => o.name).join(', ')})`
        : '';
      const spice = item.menuItem.spicyLevelAllowed ? ` [Lvl ${item.spicyLevel}]` : '';
      const itemNote = item.notes ? `\n   Catatan: _"${item.notes}"_` : '';
      return `${idx + 1}. *${item.menuItem.name}* x${item.quantity}${spice}${opts} = ${formatRupiah(item.itemTotal)}${itemNote}`;
    }).join('\n');

    const text = `Halo Admin *${settings.storeName}*, saya ingin order langsung via WhatsApp:\n\n` +
      (customerName ? `👤 *Nama:* ${customerName}\n` : '') +
      `🛒 *Rincian Pesanan:*\n${itemsList}\n\n` +
      `💰 *Total Belanja:* *${formatRupiah(cartSubtotal)}*\n` +
      (notes ? `📝 *Catatan:* ${notes}\n\n` : '\n') +
      `Mohon konfirmasi pesanan & rincian pembayaran ke nomor ${settings.phoneWhatsapp || '089620012837'} ya Kakang. Terima kasih! 🙏🔥`;

    return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <StoreContext.Provider
      value={{
        menu,
        setMenu,
        cart,
        orders,
        myOrders,
        deviceId,
        lookupCustomerOrder,
        settings,
        updateSettings,
        toggleStoreOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartSubtotal,
        placeOrder,
        updateOrderStatus,
        updatePaymentStatus,
        toggleItemAvailability,
        updateItemStock,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        currentView,
        setCurrentView,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        isCartOpen,
        setIsCartOpen,
        isCustomizeOpen,
        customizingItem,
        openCustomize,
        closeCustomize,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeTrackingOrder,
        setActiveTrackingOrder,
        adminToken,
        isAdminLoggedIn,
        loginAdmin,
        logoutAdmin,
        formatRupiah,
        getSpicyLevelLabel,
        generateWhatsAppUrl,
        getDirectWhatsAppCartUrl,
        isSyncing
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
