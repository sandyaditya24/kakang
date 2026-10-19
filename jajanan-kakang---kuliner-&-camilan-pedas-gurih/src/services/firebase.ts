import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDocFromServer,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MenuItem, Order, StoreSettings, OrderStatus, PaymentStatus } from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection function as instructed by skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or connecting. Check Firebase configuration.");
    }
  }
}

// Trigger connection verification
testConnection();

// ================= Real-time Subscriptions =================

/**
 * Subscribe to real-time Menu updates from Cloud Firestore
 */
export function subscribeMenu(onUpdate: (items: MenuItem[]) => void): () => void {
  const menuCol = collection(db, 'menu');
  return onSnapshot(
    menuCol,
    (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'pedas',
          price: Number(data.price) || 0,
          description: data.description || '',
          image: data.image || '',
          isAvailable: data.isAvailable ?? true,
          spicyLevelAllowed: data.spicyLevelAllowed ?? true,
          defaultSpicyLevel: data.defaultSpicyLevel ?? 1,
          popular: data.popular ?? false,
          prepTimeMinutes: data.prepTimeMinutes ?? 10,
          badge: data.badge,
          stockCount: data.stockCount !== undefined ? Number(data.stockCount) : 20,
          options: data.options || []
        });
      });
      if (items.length > 0) {
        onUpdate(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'menu');
    }
  );
}

/**
 * Subscribe to real-time Orders updates from Cloud Firestore
 */
export function subscribeOrders(onUpdate: (orders: Order[]) => void): () => void {
  const ordersCol = collection(db, 'orders');
  return onSnapshot(
    ordersCol,
    (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data() as Order);
      });
      // Sort newest first
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(ordersList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    }
  );
}

/**
 * Subscribe to real-time Store Settings & Logo from Cloud Firestore
 */
export function subscribeSettings(onUpdate: (settings: StoreSettings) => void): () => void {
  const settingsDocRef = doc(db, 'settings', 'store');
  return onSnapshot(
    settingsDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        onUpdate({
          ...data,
          phoneWhatsapp: '089620012837' // Ensure WhatsApp checkout is always maintained
        });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/store');
    }
  );
}

// ================= Firestore Cloud Mutations =================

export async function saveMenuItemToFirestore(item: MenuItem): Promise<void> {
  const docRef = doc(db, 'menu', item.id);
  try {
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `menu/${item.id}`);
  }
}

export async function deleteMenuItemFromFirestore(itemId: string): Promise<void> {
  const docRef = doc(db, 'menu', itemId);
  try {
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `menu/${itemId}`);
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const docRef = doc(db, 'orders', order.id);
  try {
    await setDoc(docRef, order);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `orders/${order.id}`);
  }
}

export async function updateOrderStatusInFirestore(
  orderId: string,
  status?: OrderStatus,
  paymentStatus?: PaymentStatus
): Promise<void> {
  const docRef = doc(db, 'orders', orderId);
  try {
    const updates: Record<string, any> = {};
    if (status) updates.orderStatus = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    await updateDoc(docRef, updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
  }
}

export async function saveSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const docRef = doc(db, 'settings', 'store');
  try {
    await setDoc(docRef, { ...settings, phoneWhatsapp: '089620012837' }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/store');
  }
}

/**
 * Seed initial catalog to Firestore if the cloud database is empty on first boot
 */
export async function seedInitialFirestoreData(
  defaultMenu: MenuItem[],
  defaultSettings: StoreSettings,
  defaultOrders: Order[]
): Promise<void> {
  try {
    const menuSnapshot = await getDocs(collection(db, 'menu'));
    if (menuSnapshot.empty) {
      console.log('Seeding initial menu to Firestore cloud database...');
      for (const item of defaultMenu) {
        await setDoc(doc(db, 'menu', item.id), item);
      }
    }

    const settingsDoc = await getDocFromServer(doc(db, 'settings', 'store')).catch(() => null);
    if (!settingsDoc || !settingsDoc.exists()) {
      console.log('Seeding initial store settings & logo to Firestore...');
      await setDoc(doc(db, 'settings', 'store'), {
        ...defaultSettings,
        phoneWhatsapp: '089620012837'
      });
    }

    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    if (ordersSnapshot.empty) {
      console.log('Seeding sample orders to Firestore...');
      for (const ord of defaultOrders) {
        await setDoc(doc(db, 'orders', ord.id), ord);
      }
    }
  } catch (err) {
    console.warn('Initial Firestore seeding check note:', err);
  }
}
