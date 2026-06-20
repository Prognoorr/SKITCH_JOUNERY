// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDdL9Nu3PMEXBPm_b744zEeoQo-M1CSGw8",
  authDomain: "sketch-journey-29416.firebaseapp.com",
  projectId: "sketch-journey-29416",
  storageBucket: "sketch-journey-29416.firebasestorage.app",
  messagingSenderId: "868327118468",
  appId: "1:868327118468:web:9e783cc027d0302d6894d1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Sketch Journey';
  const options = {
    body: payload.notification?.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    dir: 'auto'
  };
  self.registration.showNotification(title, options);
});
