// Sketch Journey — Service Worker
//
// IMPORTANT: bump CACHE_VERSION every time you deploy a real update to the
// app. This is what lets old cached files get cleaned up automatically —
// without it, a service worker can accidentally "trap" users on an old
// version of the app forever, since it would keep serving whatever was
// cached the first time they visited.
const CACHE_VERSION = 'v1';
const CACHE_NAME = `sketch-journey-${CACHE_VERSION}`;
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.warn('SW: pre-cache failed (non-fatal):', err))
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Never intercept Firebase/Google API calls or anything cross-origin —
  // auth, Firestore, and the AI Coach request must always hit the network
  // live. This service worker only ever handles this app's own static files.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Network-first for the main HTML page: always try to fetch the latest
  // version first, and only fall back to the cached copy if the network
  // request fails (i.e. actually offline). This is what makes future
  // updates show up normally instead of getting stuck on old cached code.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }
  // Cache-first for static assets (icons, manifest) — these rarely change,
  // so serving them instantly from cache is safe and fast.
  event.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => cached)
    )
  );
});

// ============================================================
// PUSH NOTIFICATIONS — this is the missing piece: without a 'push'
// listener, the browser receives the push from FCM but has nothing
// telling it to actually display a notification, so it just gets
// silently dropped. This listener reads the incoming message and
// shows it on the phone's notification tray.
// ============================================================
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    try { payload = { notification: { body: event.data.text() } }; } catch (e2) {}
  }
  const notification = payload.notification || payload || {};
  const title = notification.title || 'Sketch Journey';
  const body = notification.body || '';
  const link = (payload.fcmOptions && payload.fcmOptions.link) || './';

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      data: { url: link }
    })
  );
});

// When the user taps the notification, focus the app if it's already
// open in a tab, or open a new one if it isn't.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
