// Firebase Messaging (merged into main service worker to avoid conflicts)
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
    body: payload.notification?.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    dir: 'auto'
  };
  self.registration.showNotification(title, options);
});

const CACHE_NAME = 'sketch-journey-v2';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return; // Skip caching POST/PUT/etc — fixes "Failed to execute 'put' on 'Cache'"
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if(res.ok){const cl=res.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,cl));}
        return res;
      }).catch(()=>cached)
    )
  );
});
