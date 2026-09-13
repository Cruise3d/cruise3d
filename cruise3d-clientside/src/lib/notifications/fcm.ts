import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
} from 'firebase/messaging';
import { getApp, getApps, initializeApp } from 'firebase/app';
import axiosClient from '@/api/axiosClient';

const FCM_TOKEN_STORAGE_KEY = 'cruise3d:fcm-token';
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messagingPromise: Promise<ReturnType<typeof getMessaging> | null> | null = null;

async function getBrowserMessaging() {
  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) => {
      if (!supported || !firebaseConfig.apiKey || !import.meta.env.VITE_FIREBASE_VAPID_KEY) {
        return null;
      }

      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      return getMessaging(app);
    });
  }

  return messagingPromise;
}

function getNotificationMessage(payload: MessagePayload) {
  const title = payload.notification?.title?.trim();
  const body = payload.notification?.body?.trim();

  if (title && body) {
    return `${title}\n${body}`;
  }

  return title || body || 'You have a new notification.';
}

export async function registerFcmToken(): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  const messaging = await getBrowserMessaging();
  if (!messaging) return;

  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== 'granted') return;

  const serviceWorkerRegistration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js'
  );
  const token = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });
  if (!token) return;

  const previousToken = window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  if (previousToken === token) return;

  if (previousToken) {
    await axiosClient.delete(`/notification-tokens/${encodeURIComponent(previousToken)}`);
  }

  await axiosClient.post('/notification-tokens', {
    token,
    platform: 'web',
    userAgent: navigator.userAgent,
  });
  window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
}

export async function unregisterFcmToken(): Promise<void> {
  if (typeof window === 'undefined') return;

  const token = window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
  if (token) {
    await axiosClient.delete(`/notification-tokens/${encodeURIComponent(token)}`);
  }

  const messaging = await getBrowserMessaging();
  if (messaging) {
    await deleteToken(messaging);
  }
  window.localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
}

export function onForegroundMessage(handler: (payload: MessagePayload) => void): () => void {
  let unsubscribe: (() => void) | undefined;
  let disposed = false;

  void getBrowserMessaging()
    .then((messaging) => {
      if (!messaging || disposed) return;
      unsubscribe = onMessage(messaging, handler);
    })
    .catch((error) => {
      console.warn('FCM foreground messaging is unavailable.', error);
    });

  return () => {
    disposed = true;
    unsubscribe?.();
  };
}

export { getNotificationMessage };
