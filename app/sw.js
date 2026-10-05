/**
 * Reactor Service Worker — Offline-first caching.
 *
 * v5.2 (offline contract): external font CDN removed. SHELL_ASSETS now
 * contains everything the app needs for the rendering UI itself.
 *
 * v6.28.1 (fully offline): the networked data-seed sources — and with
 * them the DS_NETWORK_ALLOWLIST / any-host pass-through branches that
 * existed from v6.4.0 — were removed. Every cross-origin request now
 * fails closed (504) so an offline tab never stalls on a 30 s DNS
 * timeout; the page-level CSP (`connect-src 'self' blob:`) blocks such
 * requests before they even reach the SW.
 *
 * Cache-busting: increment CACHE_VERSION when deploying new releases.
 */
'use strict';

// Bump this string on every release — it must change for the browser to
// activate the new service worker and evict stale cached assets.
// Convention: 'reactor-v{major}.{minor}.{patch}' mirrors package.json version.
const CACHE_VERSION = 'reactor-v7.0.2';
// AEON-1349: the shared prefix of every CACHE_VERSION this app has ever used or will use.
// activate() below deletes cache keys by this prefix, not "everything except CACHE_VERSION" —
// on a shared origin (e.g. a GitHub Pages project path) that used to evict sibling apps' caches too.
const CACHE_PREFIX = 'reactor-v';

// AEON-200: reject caching (a) an opaque/opaqueredirect response, and (b) a
// typed-asset URL whose response Content-Type is text/html. response.ok
// already excludes opaque responses in practice (an opaque Response's
// `.status` is 0 by spec, so `.ok` is false) — the explicit type check here
// documents the control rather than depending on that spec detail holding,
// and it also catches `opaqueredirect` (same status-0 shape, distinct type).
// (b) is the concrete cache-poisoning shape this guards against: a static
// host's SPA fallback serving `index.html` (200 OK, `text/html`) for a
// missing or mistyped asset URL, which would otherwise get cached under the
// real asset's key and served as if it were the real file on every later
// load. Scoped to "asset extension served as HTML" rather than an exact
// expected-Content-Type allowlist per extension: hosts legitimately vary
// font/image MIME strings (this repo's own dev server in bin/reactor.js
// serves `.woff2` as `application/octet-stream`, not `font/woff2`), so a
// strict per-extension allowlist would refuse real, harmless responses.
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
  // v5.2 launch: bundled brand fonts (offline-only).
  './assets/fonts/inter-tight-v9-latin-regular.woff2',
  './assets/fonts/fraunces-v38-latin-regular.woff2',
  './assets/fonts/eb-garamond-v32-latin-regular.woff2',
  // v6.27.183 — ESM Phase B. CPU fractal worker module file. Worker is
  // loaded via `new Worker('./workers/cpu-fractal.mjs', {type:'module'})`
  // at runtime; pre-caching here ensures offline-load works as well.
  './workers/cpu-fractal.mjs',
  // v6.27.184 — ESM Phase C. Geo worker module file.
  './workers/geo.mjs',
];

// ── Install: pre-cache app shell ─────────────────────────────
// AEON-836: was `cache.add(u)` -- Cache.add() only rejects on a non-2xx status, so a host's
// SPA-fallback rewrite serving 200 text/html for a missing/mistyped shell asset (a real
// worker file, an icon) passed straight through and got cached under that asset's own key,
// silently. The `fetch` handler below already runs isCachePoisoningRisk before every
// cache.put() for exactly this shape; install wrote into the same cache for the same asset
// types without it. Fetch manually so the same guard applies to both cache-writing sites.
// AEON-928: {cache:'reload'} forces this fetch past the BROWSER's own HTTP cache. Without it,
// a request-mode of 'default' lets an intermediate proxy/CDN or the browser's disk cache serve
// bytes cached from BEFORE this deploy if the origin ever sends any freshness header on these
// paths -- silently defeating the entire point of bumping CACHE_VERSION on release, since the
// "fresh" SW cache would be seeded from stale HTTP-cached bytes. This is the standard
// precache-bypass pattern (same reasoning Workbox's precaching module documents); scoped to
// install only -- the fetch handler's own miss-fallback (below) is a normal runtime request and
// should respect ordinary HTTP caching.
// AEON-928 (update prompt): no longer calls self.skipWaiting() here. skipWaiting()+clients.claim()
// together used to reassign an already-open tab to this new version the INSTANT activate ran, with
// zero signal to the page or the user -- clients.claim() takes over already-loaded clients
// immediately per spec, not merely "on the next reload" as this file's own history assumed
// (see the removed comment on the old skipWaiting call, and sw-depth.mjs's now-updated pin).
// The new worker now installs and WAITS; the page decides when to call skipWaiting (via the
// 'message' handler below), in response to the user accepting the update-available prompt
// (00-all-lp-rail.js's _wireSWUpdatePrompt/_showSWUpdateBanner). This makes the reload
// user-initiated, which is also why option (b) (auto-reload) was ruled out: an automatic
// reload would exercise the AEON-927 corrupt-autosave restore path far more often than a
// user-chosen one.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // Add assets individually so a missing file (e.g. not yet generated
      // icons) does not block the whole install.
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

// ── Message: page-driven activation ──────────────────────────
// AEON-928: the ONLY way this worker skips waiting now. The page posts this after the user
// clicks "Reload" on the update-available banner, once its own work is safely at rest (no
// mid-render/mid-edit interruption the way an automatic reload would risk).
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ── Activate: evict stale caches ────────────────────────────
// clients.claim() here now only matters for the FIRST install of this scope (adopting
// clients that loaded before any service worker controlled them) -- with skipWaiting() no
// longer called unconditionally on install, activate cannot run while an existing controller
// is still in charge of an open tab, so claim() is no longer the instant-reassignment
// mechanism it used to be for an UPDATE (only for genuinely uncontrolled clients).
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        // AEON-1349: only evict THIS app's own prior-version caches. The old
        // `k !== CACHE_VERSION` filter deleted every OTHER cache key on the origin too —
        // fine on a dedicated origin, but on a shared GitHub Pages project path it evicted
        // sibling apps' Cache Storage on every release.
        keys.filter(k => k !== CACHE_VERSION && k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: localhost network-first (dev), reject Google Fonts, cache-first for shell ───
// v6.3.0 — header comment updated. The original v4.x version of this file
// network-fetched Google Fonts; v5.2 (offline-contract launch) replaced
// that path with a closed-fail. The header was never updated to match.
// AEON-1296: shared by both the localhost and production fetch branches below. `fetch()`
// rejects when offline; if the resource also isn't cached, resolving `undefined` here (the
// old localhost-only behavior — `caches.match(request)` resolves undefined on a miss) makes
// respondWith(undefined) a bare network-error page. Serve the cached app shell for a
// navigation, a clean 503 for anything else — the same contract production already gave.
function _offlineFallback(event) {
  return (event.request.mode === 'navigate'
    ? caches.open(CACHE_VERSION).then(c => c.match('./index.html'))
    : Promise.resolve(null)
  ).then(shell => shell || new Response('Offline — resource not cached', { status: 503, statusText: 'Offline', headers: { 'Content-Type': 'text/plain' } }));
}

self.addEventListener('fetch', event => {
  // Only handle GET — never intercept POST/PUT etc.
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Network-first on localhost — eliminates stale-cache friction during development.
  // AEON-1350: WHATWG URL reports an IPv6 loopback hostname WITH brackets, '[::1]', not '::1'
  // (verified directly: `new URL('http://[::1]:8080/').hostname === '[::1]'`) — so a dev server
  // reached over IPv6 loopback fell through to the cache-first branch below, exactly the
  // stale-cache friction this branch exists to remove. Accept both forms; 'localhost' and
  // '127.0.0.1' are untouched by this (bracket notation is IPv6-only), and no other host
  // comparison in this function names an IPv6 literal, so the fix is confined to this one line.
  const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1' ||
    url.hostname === '::1' || url.hostname === '[::1]';
  if (isLocal) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(cached => cached || _offlineFallback(event))));
    return;
  }

  // Any cross-origin request: closed-fail with 504.
  //
  // v5.2 launch: external font CDN removed for offline operation; fonts
  // are bundled inline, so a googleapis.com / gstatic.com request is a
  // misconfiguration (e.g., a contributor accidentally re-introducing a
  // Google Fonts <link>). Fail closed with HTTP 504 so the offline
  // contract holds: with no internet, an unguarded fetch() would hang
  // for 30+ seconds.
  //
  // v6.28.1 — generalized from the fonts-only check to EVERY cross-origin
  // request: the networked data-seed pass-throughs (allowlist + any-host)
  // are gone, so nothing legitimate ever leaves the origin. The page-level
  // CSP already blocks these before the SW sees them; this is belt-and-
  // suspenders for non-CSP request paths.
  // Coverage tag: offline-posture-cross-origin-504 (docs/threat-model.md T6).
  if (url.origin !== self.location.origin) {
    event.respondWith(new Response('', { status: 504, statusText: 'Offline-only build' }));
    return;
  }

  // Cache-first for everything else (app shell assets).
  //
  // v6.27.175 — Phase E race MEDIUM M6. Pre-fix used the global
  // `caches.match(request)` which searches across ALL cache names. During
  // SW version upgrade, the activate handler concurrently deletes the
  // OLD CACHE_VERSION via `caches.delete(k)` while page fetches may still
  // be in flight — that produced a race where a delete-in-progress could
  // make `caches.match()` return undefined for an asset that exists in
  // the NEW cache too. Now we open the canonical cache by name and query
  // only that one, so a concurrent delete of any other cache can't affect
  // resolution of a request the new cache can serve.
  event.respondWith(
    caches.open(CACHE_VERSION)
      .then(cache => cache.match(event.request))
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Only cache successful same-origin responses; never let a write
          // failure (quota exceeded, disk full) bubble up to the page.
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
          // Offline + not cached: fetch() rejects (TypeError). Without this catch
          // the rejection reached respondWith() as a bare network error. Serve the
          // cached app shell for navigations; a clean 503 for other assets. (v6.27.298;
          // AEON-1296: shared with the localhost branch above via _offlineFallback)
          _offlineFallback(event)
        );
      })
  );
});
