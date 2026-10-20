import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent database storage path
const DB_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DB_DIR, 'database.json');

// Initial Seed Data
const DEFAULT_MENU = [
  {
    id: 'menu-1',
    name: 'Cireng Salju Bumbu Rujak',
    category: 'gorengan',
    price: 15000,
    description: 'Cireng aci goreng renyah di luar, kenyal lembut di dalam. Disajikan hangat lengkap dengan cocolan bumbu rujak pedas manis asam segar.',
    image: '/src/assets/images/snack_cireng_rujak_1792424320121.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 1,
    popular: true,
    prepTimeMinutes: 10,
    badge: 'Terlaris',
    stockCount: 30,
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
    image: '/src/assets/images/snack_seblak_pedas_1792424321707.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: true,
    prepTimeMinutes: 12,
    badge: 'Favorit',
    stockCount: 25,
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
    image: '/src/assets/images/snack_basreng_daun_jeruk_1792424321392.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 3,
    popular: true,
    prepTimeMinutes: 5,
    badge: 'Wajib Coba',
    stockCount: 40,
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
    image: '/src/assets/images/snack_seblak_pedas_1792424321707.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: false,
    prepTimeMinutes: 8,
    stockCount: 20,
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
    image: '/src/assets/images/snack_cireng_rujak_1792424320121.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 1,
    popular: true,
    prepTimeMinutes: 10,
    stockCount: 15,
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
    image: '/src/assets/images/snack_basreng_daun_jeruk_1792424321392.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: false,
    prepTimeMinutes: 8,
    stockCount: 25,
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
    image: '/src/assets/images/snack_cireng_rujak_1792424320121.jpg',
    isAvailable: true,
    spicyLevelAllowed: false,
    defaultSpicyLevel: 0,
    popular: false,
    prepTimeMinutes: 10,
    stockCount: 18,
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
    image: '/src/assets/images/snack_seblak_pedas_1792424321707.jpg',
    isAvailable: true,
    spicyLevelAllowed: false,
    defaultSpicyLevel: 0,
    popular: true,
    prepTimeMinutes: 4,
    badge: 'Pelepas Dahaga',
    stockCount: 35,
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
    image: '/src/assets/images/snack_seblak_pedas_1792424321707.jpg',
    isAvailable: true,
    spicyLevelAllowed: false,
    defaultSpicyLevel: 0,
    popular: true,
    prepTimeMinutes: 2,
    stockCount: 80,
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
    image: '/src/assets/images/snack_basreng_daun_jeruk_1792424321392.jpg',
    isAvailable: true,
    spicyLevelAllowed: true,
    defaultSpicyLevel: 2,
    popular: true,
    prepTimeMinutes: 15,
    badge: 'Hemat Rp11k',
    stockCount: 15,
    options: [
      { id: 'opt-paket-teh-up', name: 'Upgrade Minuman ke Es Cendol (2x)', price: 8000 }
    ]
  }
];

const DEFAULT_SETTINGS = {
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

interface DatabaseState {
  version: number;
  lastUpdated: number;
  settings: typeof DEFAULT_SETTINGS;
  menu: typeof DEFAULT_MENU;
  orders: any[];
}

function loadDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(content);
      // Ensure phoneWhatsapp is always 089620012837
      data.settings.phoneWhatsapp = '089620012837';
      return data;
    }
  } catch (err) {
    console.error('Error reading database file, resetting to default:', err);
  }

  const initial: DatabaseState = {
    version: 1,
    lastUpdated: Date.now(),
    settings: DEFAULT_SETTINGS,
    menu: DEFAULT_MENU,
    orders: []
  };
  saveDatabase(initial);
  return initial;
}

let db = loadDatabase();

function saveDatabase(state: DatabaseState) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

// SSE Clients for Real-Time synchronization
const sseClients = new Set<express.Response>();

function broadcastSync(entity: string, data?: any) {
  db.version += 1;
  db.lastUpdated = Date.now();
  saveDatabase(db);

  const payload = JSON.stringify({
    version: db.version,
    lastUpdated: db.lastUpdated,
    entity,
    data
  });

  for (const client of sseClients) {
    client.write(`data: ${payload}\n\n`);
  }
}

// ======================= REST API ROUTES =======================

// 1. SSE Real-Time Stream
app.get('/api/sync/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'handshake', version: db.version, lastUpdated: db.lastUpdated })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// 2. Database Version Check (for fast polling fallback)
app.get('/api/sync/version', (req, res) => {
  res.json({
    version: db.version,
    lastUpdated: db.lastUpdated
  });
});

// 3. Menu API
app.get('/api/menu', (req, res) => {
  res.json({ success: true, data: db.menu });
});

app.post('/api/menu', (req, res) => {
  const newItem = {
    ...req.body,
    id: req.body.id || 'menu-' + Date.now()
  };
  db.menu.unshift(newItem);
  broadcastSync('menu', newItem);
  res.status(201).json({ success: true, data: newItem });
});

app.put('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  const index = db.menu.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
  }

  db.menu[index] = { ...db.menu[index], ...req.body };
  broadcastSync('menu', db.menu[index]);
  res.json({ success: true, data: db.menu[index] });
});

// Stock status & count patch
app.patch('/api/menu/:id/stock', (req, res) => {
  const { id } = req.params;
  const index = db.menu.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
  }

  const { isAvailable, stockCount } = req.body;
  if (isAvailable !== undefined) {
    db.menu[index].isAvailable = isAvailable;
  }
  if (stockCount !== undefined) {
    db.menu[index].stockCount = Math.max(0, stockCount);
    db.menu[index].isAvailable = stockCount > 0;
  }

  broadcastSync('stock', db.menu[index]);
  res.json({ success: true, data: db.menu[index] });
});

app.delete('/api/menu/:id', (req, res) => {
  const { id } = req.params;
  db.menu = db.menu.filter(m => m.id !== id);
  broadcastSync('menu');
  res.json({ success: true, message: 'Menu berhasil dihapus' });
});

// 4. Orders API (with optional private deviceId filter)
app.get('/api/orders', (req, res) => {
  const { deviceId } = req.query;
  if (deviceId && typeof deviceId === 'string') {
    const filtered = db.orders.filter(o => o.deviceId === deviceId);
    return res.json({ success: true, data: filtered });
  }
  res.json({ success: true, data: db.orders });
});

app.post('/api/orders', (req, res) => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newOrder = {
    ...req.body,
    id: req.body.id || `JK-${randomNum}`,
    createdAt: new Date().toISOString()
  };
  db.orders.unshift(newOrder);

  // Auto-deduct stock for items ordered
  if (Array.isArray(newOrder.items)) {
    for (const orderItem of newOrder.items) {
      const mIdx = db.menu.findIndex(m => m.id === orderItem.menuItem.id);
      if (mIdx > -1 && db.menu[mIdx].stockCount !== undefined) {
        db.menu[mIdx].stockCount = Math.max(0, (db.menu[mIdx].stockCount ?? 0) - orderItem.quantity);
        if (db.menu[mIdx].stockCount === 0) {
          db.menu[mIdx].isAvailable = false;
        }
      }
    }
  }

  broadcastSync('orders', newOrder);
  res.status(201).json({ success: true, data: newOrder });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const index = db.orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
  }

  if (status) db.orders[index].orderStatus = status;
  if (paymentStatus) db.orders[index].paymentStatus = paymentStatus;

  broadcastSync('orders', db.orders[index]);
  res.json({ success: true, data: db.orders[index] });
});

// 5. Store Settings API (including logoUrl)
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: db.settings });
});

app.put('/api/settings', (req, res) => {
  db.settings = {
    ...db.settings,
    ...req.body,
    phoneWhatsapp: req.body.phoneWhatsapp || db.settings.phoneWhatsapp || '089620012837',
    bankAccount: req.body.bankAccount ? { ...db.settings.bankAccount, ...req.body.bankAccount } : db.settings.bankAccount
  };
  broadcastSync('settings', db.settings);
  res.json({ success: true, data: db.settings });
});

// 6. Admin Authentication endpoint
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === 'kakang123' || password === '1234' || password === 'admin') {
    const token = 'token_jk_admin_' + Date.now();
    return res.json({ success: true, token });
  }
  return res.status(401).json({ success: false, message: 'PIN atau Password Admin salah' });
});

// ======================= VITE & STATIC HANDLING =======================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jajanan Kakang Backend Service running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server error:', err);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
