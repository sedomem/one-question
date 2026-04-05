// Firebase Messaging Service Worker
// Bu dosyayı uygulamanızın root dizinine (public/) koyun
// Ekran kapalıyken bile push notification alınmasını sağlar

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAfC9O9Wt_6VZCel9P6CMUlOaKScXowMeU",
  authDomain: "one-question-8e3bc.firebaseapp.com",
  projectId: "one-question-8e3bc",
  storageBucket: "one-question-8e3bc.firebasestorage.app",
  messagingSenderId: "4603457953",
  appId: "1:4603457953:web:d26c47589086ab78559be0"
});

const messaging = firebase.messaging();

// Arka planda (ekran kapalı / uygulama arka planda) bildirim geldiğinde
messaging.onBackgroundMessage(function(payload) {
  console.log('[SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'One Question';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'Yeni bir bildirim var!',
    icon: '/icon-192.png',  // Uygulama ikonunuz
    badge: '/icon-72.png',
    tag: 'oq-notification',  // Aynı tag'li bildirimler üst üste binmez
    renotify: true,          // Aynı tag olsa bile ses çalar
    vibrate: [200, 100, 200, 100, 200],  // Titreşim paterni
    requireInteraction: false,
    data: {
      url: payload.data?.url || '/',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: '🌍 Aç' },
      { action: 'dismiss', title: 'Kapat' }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Bildirime tıklayınca uygulamayı aç
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Zaten açık bir pencere varsa odaklan
      for (const client of clientList) {
        if (client.url.includes('onequest') || client.url.includes('one-question')) {
          return client.focus();
        }
      }
      // Yoksa yeni pencere aç
      return clients.openWindow(urlToOpen);
    })
  );
});

// Service Worker kurulumu
self.addEventListener('install', function(event) {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  event.waitUntil(clients.claim());
});
