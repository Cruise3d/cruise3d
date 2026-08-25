importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCuhEhPAY02jpTdLsqWA8mcn3Dwpw2jW-g',
  authDomain: 'notification-72dae.firebaseapp.com',
  projectId: 'notification-72dae',
  storageBucket: 'notification-72dae.firebasestorage.app',
  messagingSenderId: '499114428698',
  appId: '1:499114428698:web:c1c8012db6aa9d3d3384a3',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Notification';
  const body = payload.notification?.body || '';

  self.registration.showNotification(title, {
    body,
    icon: '/logo.png',
    data: payload.data || {},
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const route = event.notification?.data?.route || '/admin/orders';

  event.waitUntil(clients.openWindow(route));
});
