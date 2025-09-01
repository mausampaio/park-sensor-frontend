const CACHE = 'esp32-radar-v1';
const ASSETS = [
  '/', // use raiz
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Não cachear SSE
  if (url.pathname.endsWith('/stream')) {
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
