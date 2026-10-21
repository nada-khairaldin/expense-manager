/**
 * Masroofi (مصروفي) - Service Worker
 * Secure Static Asset Caching & Offline Detection
 * 
 * IMPORTANT PRIVACY GUARANTEE:
 * Because Masroofi handles private personal financial data:
 * - API requests (/auth, /settings, /categories, /expenses, /budget-cycles) are NEVER cached.
 * - Dynamic data is never served from stale caches across sessions or users.
 * - Only static visual assets (icons, fonts, stylesheets) are cached for smooth app loading.
 */

const CACHE_NAME = "masroofi-static-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon.png",
];

// Install Event - Pre-cache static shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Continue even if some optional assets are missed in dev
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Safe strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. NEVER intercept non-GET requests (mutations must always hit server)
  if (request.method !== "GET") {
    return;
  }

  // 2. NEVER cache authenticated or financial API endpoints (Privacy First)
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/auth") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/budget-cycles") ||
    url.pathname.startsWith("/expenses") ||
    url.pathname.startsWith("/categories") ||
    url.port === "5000"
  ) {
    // Network-only for API calls
    return;
  }

  // 3. For Next.js static files and fonts, use Cache-First / Stale-While-Revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch updated version in background
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse);
                });
              }
            })
            .catch(() => {});
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Default: Network with graceful fallback
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request).then((cached) => {
        return cached || new Response("غير متصل بالإنترنت", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      });
    })
  );
});
