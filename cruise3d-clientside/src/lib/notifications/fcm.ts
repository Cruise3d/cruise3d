import type { MessagePayload } from 'firebase/messaging';

const FCM_TOKEN_STORAGE_KEY = 'cruise3d:fcm-token';

function getNotificationMessage(payload: MessagePayload) {
  const title = payload.notification?.title?.trim();
  const body = payload.notification?.body?.trim();

  if (title && body) {
    return `${title}\n${body}`;
  }

  return title || body || 'You have a new notification.';
}

export async function registerFcmToken(): Promise<void> {
  // FCM is currently disabled
  return;
}

export async function unregisterFcmToken(): Promise<void> {
  // FCM is currently disabled; clean up any stored token key
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore cleanup errors
  }
}

export function onForegroundMessage(_handler: (payload: MessagePayload) => void): () => void {
  // FCM is currently disabled
  return () => {};
}

export { getNotificationMessage };

