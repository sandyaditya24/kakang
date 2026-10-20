import { MenuItem, Order, StoreSettings } from '../types';
import cirengImg from '../assets/images/snack_cireng_rujak_1792424320121.jpg';
import seblakImg from '../assets/images/snack_seblak_pedas_1792424321707.jpg';
import basrengImg from '../assets/images/snack_basreng_daun_jeruk_1792424321392.jpg';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Cireng Salju Bumbu Rujak',
    category: 'gorengan',
    price: 15000,
    description: 'Cireng aci goreng renyah di luar, kenyal lembut di dalam. Disajikan hangat lengkap dengan cocolan bumbu rujak pedas manis asam segar.',
    image: cirengImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 1,
    popular: true,
    prepTimeMinutes: 10,
    badge: 'Terlaris',
    options: [
      { id: 'opt-bumbu-rujak', name: 'Ekstra Bumbu Rujak Cup', price: 3000 },
      { id: 'opt-cireng-keju', name: 'Taburan Keju Parut', price: 3000 },
      { id: 'opt-cireng-limau', name: 'Ekstra Jeruk Limau', price: 1000 }
    ]
  },
  {
    id: 'menu-2',
    name: 'Seblak Komplit Bandung',
    category: 'kuah',
    price: 22000,
    description: 'Seblak kuah merah membara khas Priangan dengan kerupuk kenyal, makaroni, sosis sapi, bakso kenyal, telur orak-arik, dan wangi kencur sedap.',
    image: seblakImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: true,
    prepTimeMinutes: 12,
    badge: 'Favorit',
    options: [
      { id: 'opt-seblak-ceker', name: 'Tambah Ceker Empuk (2 pcs)', price: 5000 },
      { id: 'opt-seblak-cuanki', name: 'Siomay Kering & Batagor Lidah', price: 4000 },
      { id: 'opt-seblak-telur', name: 'Ekstra Telur Ceplok Setengah Matang', price: 4000 },
      { id: 'opt-seblak-keju', name: 'Mozzarella Lumer', price: 6000 }
    ]
  },
  {
    id: 'menu-3',
    name: 'Basreng Pedas Daun Jeruk',
    category: 'pedas',
    price: 16000,
    description: 'Bakso ikan goreng stik garing renyah dilumuri racikan cabai bubuk merah premium dan irisan daun jeruk wangi melimpah.',
    image: basrengImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 3,
    popular: true,
    prepTimeMinutes: 5,
    badge: 'Wajib Coba',
    options: [
      { id: 'opt-basreng-asin', name: 'Bumbu Asin Gurih Tambahan', price: 1000 },
      { id: 'opt-basreng-daun', name: 'Ekstra Daun Jeruk Krispi', price: 2000 },
      { id: 'opt-basreng-keju', name: 'Bumbu Keju Manis', price: 2000 }
    ]
  },
  {
    id: 'menu-4',
    name: 'Cilok Kuah Goang Pedas',
    category: 'kuah',
    price: 14000,
    description: 'Aci dicolok kenyal isi tetelan daging sapi gurih disajikan dengan kuah kaldu goang bening pedas cabe rawit hijau dan daun bawang.',
    image: seblakImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: false,
    prepTimeMinutes: 8,
    options: [
      { id: 'opt-cilok-pilus', name: 'Taburan Pilus Cikur Gurih', price: 2000 },
      { id: 'opt-cilok-tahu', name: 'Tahu Bakso Kuah', price: 3000 },
      { id: 'opt-cilok-limau', name: 'Perasan Jeruk Limau', price: 1000 }
    ]
  },
  {
    id: 'menu-5',
    name: 'Batagor Krispi Bumbu Kacang',
    category: 'gorengan',
    price: 18000,
    description: 'Tahu dan pangsit isi adonan ikan tenggiri gurih digoreng renyah, disiram saus sambal kacang kental khas Bandung plus kecap manis.',
    image: cirengImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 1,
    popular: true,
    prepTimeMinutes: 10,
    options: [
      { id: 'opt-batagor-saus', name: 'Ekstra Saus Kacang Cup', price: 3000 },
      { id: 'opt-batagor-sambal', name: 'Sambal Rawit Merah Terpisah', price: 2000 },
      { id: 'opt-batagor-telur', name: 'Telur Puyuh Rebus (3 butir)', price: 4000 }
    ]
  },
  {
    id: 'menu-6',
    name: 'Cimol Bojot Bumbu Bawang Pedas',
    category: 'pedas',
    price: 13000,
    description: 'Aci digemol tekstur kenyal basah khas Bojot Garut, dilumuri minyak bawang putih gurih melimpah dan taburan cabai kering pedas nagih.',
    image: basrengImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: false,
    prepTimeMinutes: 8,
    options: [
      { id: 'opt-cimol-bawang', name: 'Ekstra Minyak Bawang Gurih', price: 2000 },
      { id: 'opt-cimol-asin', name: 'Taburan Bumbu Balado', price: 2000 }
    ]
  },
  {
    id: 'menu-7',
    name: 'Pisang Goreng Keju Coklat Lumer',
    category: 'gorengan',
    price: 16000,
    description: 'Pisang kepok manis pilihan digoreng tepung renyah keemasan, ditaburi keju cheddar melimpah dan susu kental manis coklat lumer.',
    image: cirengImg,
    isAvailable: true,
    spicyLevelAllowed: false,
    defaultSpicyLevel: 0,
    popular: false,
    prepTimeMinutes: 10,
    options: [
      { id: 'opt-pisang-keju', name: 'Ekstra Keju Cheddar', price: 3000 },
      { id: 'opt-pisang-ceres', name: 'Ekstra Meises Coklat', price: 2000 }
    ]
  },
  {
    id: 'menu-8',
    name: 'Es Cendol Nangka Gula Aren',
    category: 'minuman',
    price: 12000,
    description: 'Cendol kenyal pandan wangi berpadu dengan santan segar gurih, irisan buah nangka manis, dan sirup gula aren murni dingin menyegarkan.',
    image: seblakImg,
    isAvailable: true,
    spicyLevelAllowed: false,
    defaultSpicyLevel: 0,
    popular: true,
    prepTimeMinutes: 4,
    badge: 'Pelepas Dahaga',
    options: [
      { id: 'opt-cendol-nangka', name: 'Ekstra Buah Nangka', price: 3000 },
      { id: 'opt-cendol-es', name: 'Less Ice / Kurang Es', price: 0 }
    ]
  },
  {
    id: 'menu-9',
    name: 'Es Teh Melati Jumbo',
    category: 'minuman',
    price: 6000,
    description: 'Seduhan teh melati wangi khas Solo porsi jumbo 700ml dingin menyegarkan, manis pas pereda rasa pedas.',
    image: seblakImg,
    isAvailable: true,
    spicyLevelAllowed: false,
    defaultSpicyLevel: 0,
    popular: true,
    prepTimeMinutes: 2,
    options: [
      { id: 'opt-teh-tawar', name: 'Es Teh Tawar (Tanpa Gula)', price: 0 },
      { id: 'opt-teh-lemon', name: 'Tambah Irisan Lemon Segar', price: 2000 }
    ]
  },
  {
    id: 'menu-10',
    name: 'Paket Komplit Nongkrong Kakang',
    category: 'paket',
    price: 48000,
    description: 'Paket hemat bertiga: 1 Seblak Komplit + 1 Cireng Salju Rujak + 1 Basreng Daun Jeruk + 2 Es Teh Jumbo. Lebih hemat Rp11.000!',
    image: basrengImg,
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: true,
    prepTimeMinutes: 15,
    badge: 'Hemat Rp11k',
    options: [
      { id: 'opt-paket-teh-up', name: 'Upgrade Minuman ke Es Cendol (2x)', price: 8000 }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'JK-9104',
    customerName: 'Ahmad Fauzi',
    customerPhone: '081298765432',
    orderType: 'delivery',
    tableOrAddress: 'Jl. Surya Sumantri No. 45, RT 02/05 (Rumah Pagar Hitam)',
    items: [
      {
        cartItemId: 'item-demo-1',
        menuItem: INITIAL_MENU[1], // Seblak
        quantity: 1,
        spicyLevel: 3,
        selectedOptions: [{ id: 'opt-seblak-ceker', name: 'Tambah Ceker Empuk (2 pcs)', price: 5000 }],
        notes: 'Kuah jangan terlalu kental ya kak, pedas daun jeruk banyakin',
        itemTotal: 27000
      },
      {
        cartItemId: 'item-demo-2',
        menuItem: INITIAL_MENU[0], // Cireng
        quantity: 1,
        spicyLevel: 1,
        selectedOptions: [],
        notes: 'Bumbu rujak dipisah',
        itemTotal: 15000
      },
      {
        cartItemId: 'item-demo-3',
        menuItem: INITIAL_MENU[8], // Es Teh
        quantity: 2,
        spicyLevel: 0,
        selectedOptions: [],
        notes: '',
        itemTotal: 12000
      }
    ],
    subtotal: 54000,
    deliveryFee: 0, // Free delivery promo >= 50k
    discount: 0,
    total: 54000,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    orderStatus: 'diproses',
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    notes: 'Kirim sebelum jam istirahat ya kak'
  },
  {
    id: 'JK-9103',
    customerName: 'Dina Kusuma',
    customerPhone: '085712348899',
    orderType: 'dine-in',
    tableOrAddress: 'Meja No. 04',
    items: [
      {
        cartItemId: 'item-demo-4',
        menuItem: INITIAL_MENU[2], // Basreng
        quantity: 2,
        spicyLevel: 2,
        selectedOptions: [{ id: 'opt-basreng-daun', name: 'Ekstra Daun Jeruk Krispi', price: 2000 }],
        notes: 'Gorengnya garing banget ya',
        itemTotal: 36000
      },
      {
        cartItemId: 'item-demo-5',
        menuItem: INITIAL_MENU[7], // Es Cendol
        quantity: 2,
        spicyLevel: 0,
        selectedOptions: [],
        notes: 'Esnya dikit aja',
        itemTotal: 24000
      }
    ],
    subtotal: 60000,
    deliveryFee: 0,
    discount: 0,
    total: 60000,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    orderStatus: 'siap',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString()
  },
  {
    id: 'JK-9102',
    customerName: 'Rian Pratama',
    customerPhone: '087822991001',
    orderType: 'takeaway',
    tableOrAddress: 'Ambil di Tempat (Pick Up)',
    items: [
      {
        cartItemId: 'item-demo-6',
        menuItem: INITIAL_MENU[9], // Paket Komplit
        quantity: 1,
        spicyLevel: 2,
        selectedOptions: [],
        notes: 'Bungkus rapi buat oleh-oleh',
        itemTotal: 48000
      }
    ],
    subtotal: 48000,
    deliveryFee: 0,
    discount: 0,
    total: 48000,
    paymentMethod: 'transfer',
    paymentStatus: 'verified',
    orderStatus: 'selesai',
    createdAt: new Date(Date.now() - 85 * 60 * 1000).toISOString()
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Jajanan Kakang',
  tagline: 'Camilan Pedas Gurih Khas Nusantara, Bikin Nagih Tiap Hari!',
  phoneWhatsapp: '089620012837',
  address: 'Jl. Sukajadi No. 108, Sukajadi, Kota Bandung (Depan PVJ)',
  isOpen: true,
  deliveryFee: 6000,
  freeDeliveryMin: 50000,
  bankAccount: {
    bank: 'BCA (Bank Central Asia)',
    accountNumber: '8400192811',
    holderName: 'Kakang Aditya Pratama'
  },
  announcement: '🔥 Promo Spesial: Gratis Ongkir untuk pesanan minimal Rp50.000! Nikmati kriuk basreng & cireng hangat sekarang.',
  logoUrl: '',
  qrisImageUrl: ''
};
