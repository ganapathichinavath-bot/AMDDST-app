/* eslint-disable no-restricted-globals */

// Service worker cleanup & safe caching
const CACHE_NAME = 'amddst-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }

  // Never return index.html for scripts, stylesheets, or assets
  event.respondWith(
    fetch(event.request).catch((err) => {
      // Do not return index.html for scripts/styles
      return caches.match(event.request);
    })
  );
});
