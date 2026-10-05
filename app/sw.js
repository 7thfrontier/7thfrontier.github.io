
'use strict';




const CACHE_VERSION = 'reactor-v7.0.2';



const CACHE_PREFIX = 'reactor-v';
















const HTML_POISON_EXT_RE = /\.(?:m?js|json|png|svg|woff2?|webmanifest)$/i;
function isCachePoisoningRisk(url, response) {
  if (response.type === 'opaque' || response.type === 'opaqueredirect') return true;
  const contentType = (response.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  return HTML_POISON_EXT_RE.test(url.pathname) && contentType === 'text/html';
}

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  
  './assets/fonts/inter-tight-v9-latin-regular.woff2',
  './assets/fonts/fraunces-v38-latin-regular.woff2',
  './assets/fonts/eb-garamond-v32-latin-regular.woff2',
  
  
  
  './workers/cpu-fractal.mjs',
  
  './workers/geo.mjs',
];



























self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      
      
      .then(cache => Promise.all(
        SHELL_ASSETS.map(u =>
          fetch(u, { cache: 'reload' }).then(response => {
            if (!response.ok) { console.warn('SW pre-cache skip (not ok)', u, response.status); return; }
            const url = new URL(u, self.location.href);
            if (isCachePoisoningRisk(url, response)) {
              console.warn('SW pre-cache skip (cache-poisoning guard):', u, response.type, response.headers.get('Content-Type'));
              return;
            }
            return cache.put(u, response);
          }).catch(err => console.warn('SW pre-cache skip', u, err))
        )
      ))
  );
});





self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});







self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        
        
        
        
        keys.filter(k => k !== CACHE_VERSION && k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});










function _offlineFallback(event) {
  return (event.request.mode === 'navigate'
    ? caches.open(CACHE_VERSION).then(c => c.match('./index.html'))
    : Promise.resolve(null)
  ).then(shell => shell || new Response('Offline — resource not cached', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } }));
}

self.addEventListener('fetch', event => {
  
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  
  
  
  
  
  
  
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1' ||
    url.hostname === '::1' || url.hostname === '[::1]';
  if (isLocal) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || _offlineFallback(event))));
    return;
  }

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  if (url.origin !== self.location.origin) {
    event.respondWith(new Response('', { status: 504, statusText: 'Offline-only build' }));
    return;
  }

  
  
  
  
  
  
  
  
  
  
  
  event.respondWith(
    caches.open(CACHE_VERSION)
      .then(cache => cache.match(event.request))
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          
          
          if (response.ok && url.origin === self.location.origin) {
            if (isCachePoisoningRisk(url, response)) {
              console.warn('SW cache.put skipped (cache-poisoning guard):', url.pathname, response.type, response.headers.get('Content-Type'));
            } else {
              const clone = response.clone();
              caches.open(CACHE_VERSION)
                .then(c => c.put(event.request, clone))
                .catch(err => console.warn('SW cache.put failed:', err));
            }
          }
          return response;
        }).catch(() =>
          
          
          
          
          _offlineFallback(event)
        );
      })
  );
});
