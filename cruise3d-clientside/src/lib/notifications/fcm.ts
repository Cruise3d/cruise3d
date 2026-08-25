import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  deleteToken,
  getMessaging,
  getToken,
  onMessage,
  type MessagePayload,
} from 'firebase/messaging';

import axiosClient from '@/api/axiosClient';

const defaultFirebaseConfig = {
  apiKey: 'AIzaSyCuhEhPAY02jpTdLsqWA8mcn3Dwpw2jW-g',
  authDomain: 'notification-72dae.firebaseapp.com',
  projectId: 'notification-72dae',
  storageBucket: 'notification-72dae.firebasestorage.app',
  messagingSenderId: '499114428698',
  appId: '1:499114428698:web:c1c8012db6aa9d3d3384a3',
} as const;

// Keep the browser config aligned with the service worker so local dev still
// works even when Vite env files are incomplete.
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    defaultFirebaseConfig.authDomain,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    defaultFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
};

const vapidKey =
  import.meta.env.VITE_FIREBASE_VAPID_KEY ||
  'BCfLRFOP4GRcqUOCdwKScyq_baJw1dORAsvIvI51e8GQz3pUcrjjohNt9r-wDQGUmREHFeGANDBKFT0KAtKVi2k';

const FCM_TOKEN_STORAGE_KEY = 'cruise3d:fcm-token';

function getFirebaseConfig() {
  return firebaseConfig as typeof firebaseConfig & {
    [K in keyof typeof firebaseConfig]: string;
  };
}

function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config) return null;

  return getApps().length ? getApp() : initializeApp(config);
}

async function getServiceWorkerRegistration() {
  if (!('serviceWorker' in navigator)) return null;

  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}

function getNotificationMessage(payload: MessagePayload) {
  const title = payload.notification?.title?.trim();
  const body = payload.notification?.body?.trim();

  if (title && body) {
    return `${title}\n${body}`;
  }

  return title || body || 'You have a new notification.';
}

export async function registerFcmToken() {
  try {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const app = getFirebaseApp();
    if (!app) return;

    const messaging = getMessaging(app);
    const sw = await getServiceWorkerRegistration();

    if (!sw) return;

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: sw,
    });

    if (!token) return;

    const existingToken = window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY);

    // Always upsert the token server-side; the repository is idempotent and
    // this keeps the backend in sync even after DB resets or token sweeps.
    await axiosClient.post('/notification-tokens', {
      token,
      platform: 'web',
      userAgent: navigator.userAgent,
    });

    if (existingToken !== token) {
      window.localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
    }
  } catch (err) {
    console.warn('FCM registration failed:', err);
  }
}

export async function unregisterFcmToken() {
  try {
    if (!('serviceWorker' in navigator)) return;

    const token = window.localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    if (!token) return;

    await axiosClient.delete(`/notification-tokens/${encodeURIComponent(token)}`);

    const app = getFirebaseApp();
    if (!app) return;

    const messaging = getMessaging(app);

    await deleteToken(messaging);
    window.localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
  } catch (err) {
    console.warn('FCM unregister failed:', err);
  }
}

export function onForegroundMessage(handler: (payload: MessagePayload) => void) {
  const app = getFirebaseApp();
  if (!app) {
    return () => {};
  }

  const messaging = getMessaging(app);
  return onMessage(messaging, handler);
}

export { getNotificationMessage };
