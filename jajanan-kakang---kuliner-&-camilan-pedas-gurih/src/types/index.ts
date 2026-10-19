export type ItemCategory = 'pedas' | 'kuah' | 'gorengan' | 'minuman' | 'paket';
export type CategoryType = 'all' | ItemCategory;

export interface MenuOption {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  description: string;
  image: string;
  isAvailable: boolean;
  spicyLevelAllowed: boolean;
  defaultSpicyLevel?: number;
  options?: MenuOption[];
  popular?: boolean;
  prepTimeMinutes: number;
  badge?: string;
  stockCount?: number;
}

export interface CartItemOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  quantity: number;
  spicyLevel: number;
  selectedOptions: CartItemOption[];
  notes: string;
  itemTotal: number;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';
export type PaymentMethod = 'qris' | 'transfer' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'verified';
export type OrderStatus = 'menunggu' | 'diproses' | 'siap' | 'selesai' | 'dibatalkan';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableOrAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  notes?: string;
  isCashierOrder?: boolean;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  phoneWhatsapp: string;
  address: string;
  isOpen: boolean;
  deliveryFee: number;
  freeDeliveryMin: number;
  bankAccount: {
    bank: string;
    accountNumber: string;
    holderName: string;
  };
  announcement?: string;
  logoUrl?: string;
}
