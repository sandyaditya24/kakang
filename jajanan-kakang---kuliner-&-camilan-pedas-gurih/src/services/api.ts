import { MenuItem, Order, StoreSettings } from '../types';

const BASE_URL = '/api';

export const api = {
  // 1. Menu & Stock
  async getMenu(): Promise<MenuItem[]> {
    const res = await fetch(`${BASE_URL}/menu`);
    if (!res.ok) throw new Error('Failed to fetch menu');
    const json = await res.json();
    return json.data;
  },

  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    const json = await res.json();
    return json.data;
  },

  async updateStock(id: string, isAvailable?: boolean, stockCount?: number): Promise<MenuItem> {
    const res = await fetch(`${BASE_URL}/menu/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable, stockCount }),
    });
    if (!res.ok) throw new Error('Failed to update stock');
    const json = await res.json();
    return json.data;
  },

  async addMenuItem(data: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const res = await fetch(`${BASE_URL}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add menu item');
    const json = await res.json();
    return json.data;
  },

  async deleteMenuItem(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete menu item');
  },

  // 2. Orders
  async getOrders(): Promise<Order[]> {
    const res = await fetch(`${BASE_URL}/orders`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return json.data;
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to create order');
    const json = await res.json();
    return json.data;
  },

  async updateOrderStatus(id: string, status: string, paymentStatus?: string): Promise<Order> {
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, paymentStatus }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const json = await res.json();
    return json.data;
  },

  // 3. Settings (including Logo)
  async getSettings(): Promise<StoreSettings> {
    const res = await fetch(`${BASE_URL}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    const json = await res.json();
    return json.data;
  },

  async updateSettings(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const res = await fetch(`${BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    const json = await res.json();
    return json.data;
  },

  // 4. Real-time Synchronization (SSE + polling fallback)
  subscribeSync(onUpdate: (data: { entity: string; data?: any }) => void): () => void {
    let eventSource: EventSource | null = null;
    let pollTimer: any = null;
    let lastVersion = 0;

    // A. Real-time Server-Sent Events (SSE)
    if (typeof EventSource !== 'undefined') {
      try {
        eventSource = new EventSource(`${BASE_URL}/sync/events`);
        eventSource.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.version && parsed.version !== lastVersion) {
              lastVersion = parsed.version;
              onUpdate(parsed);
            }
          } catch (err) {
            console.error('Error parsing SSE sync message:', err);
          }
        };

        eventSource.onerror = () => {
          // Fallback to polling if connection drops
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
        };
      } catch (e) {
        console.warn('SSE not supported or failed to initialize, relying on polling:', e);
      }
    }

    // B. Periodic Polling fallback (every 3 seconds) for robust cross-device syncing
    pollTimer = setInterval(async () => {
      try {
        const res = await fetch(`${BASE_URL}/sync/version`);
        if (res.ok) {
          const { version } = await res.json();
          if (version > lastVersion) {
            lastVersion = version;
            onUpdate({ entity: 'all' });
          }
        }
      } catch (err) {
        // network silent ignore
      }
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      if (pollTimer) clearInterval(pollTimer);
    };
  }
};
