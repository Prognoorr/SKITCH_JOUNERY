importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDdL9Nu3PMEXBPm_b744zEeoQo-M1CSGw8",
  authDomain: "sketch-journey-29416.firebaseapp.com",
  projectId: "sketch-journey-29416",
  storageBucket: "sketch-journey-29416.appspot.com",
  messagingSenderId: "868327118468",
  appId: "1:868327118468:web:9e783cc027d0302d6894d1",
  measurementId: "G-9F00CVZJHN"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
