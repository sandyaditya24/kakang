/**
 * Persistent device identifier for privacy and order scoping.
 * Stores a unique device UUID in localStorage so buyers only see their own orders.
 */
const DEVICE_ID_KEY = 'jk_device_id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server_generated';
  }
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      const timestamp = Date.now().toString(36);
      const randomHex = Math.random().toString(36).substring(2, 10);
      deviceId = `dev_${timestamp}_${randomHex}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (err) {
    console.warn('LocalStorage not available for deviceId, using memory fallback:', err);
    return `dev_mem_${Date.now()}`;
  }
}
