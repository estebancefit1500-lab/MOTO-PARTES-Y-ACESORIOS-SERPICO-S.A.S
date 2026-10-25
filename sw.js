/**
 * sw.js — Service Worker
 * Moto Partes y Accesorios Serpico S.A.S
 *
 * Estrategia:
 *   - Cache-first para assets estáticos (CSS, JS, imágenes locales)
 *   - Network-first para llamadas a Supabase API
 *   - Stale-while-revalidate para páginas HTML
 */

const CACHE_VERSION  = 'serpico-v3.7';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE  = `${CACHE_VERSION}-dynamic`;

/* Assets to pre-cache on install */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/main.css',
  './js/config.js',
  './js/demo-products.js',
  './js/supabase.js',
  './js/banner.js',
  './js/lightbox.js',
  './js/cart.js',
  './js/catalog.js',
  './assets/logo.jpg',
  './assets/hero-fondo.jpeg',
  './assets/icons/icon-192.jpg',
  './assets/icons/icon-512.jpg',
  './manifest.json',
];

/* ---- INSTALL: pre-cache static assets ---- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ---- ACTIVATE: clean old caches ---- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith('serpico-') && key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---- FETCH: routing strategy ---- */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip Supabase API calls → Network-first (always fresh data)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Skip CDN (Supabase JS, Google Fonts) → Network-first with dynamic cache
  if (
    url.hostname.includes('cdn.jsdelivr.net') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Local static assets → Cache-first
  event.respondWith(cacheFirst(request));
});

/* ---- Strategy: Cache-first ---- */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    // Return offline fallback if available
    return caches.match('./index.html');
  }
}

/* ---- Strategy: Network-first ---- */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    return caches.match(request);
  }
}

/* ---- Strategy: Stale-while-revalidate ---- */
async function staleWhileRevalidate(request) {
  const cache    = await caches.open(DYNAMIC_CACHE);
  const cached   = await cache.match(request);
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || fetchPromise;
}
