const CACHE_NAME = "mi-entrenamiento-v2"
const urlsToCache = [
  "/",
  "/manifest.json",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/_next/static/css/app/layout.css",
  "/_next/static/chunks/webpack.js",
  "/_next/static/chunks/main.js",
  "/favicon.ico",
]

// Instalar el service worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Cache opened")
      return cache.addAll(urlsToCache).catch((error) => {
        console.error("[SW] Failed to cache resources:", error)
        // Cache essential resources only if full cache fails
        return cache.addAll(["/", "/manifest.json"])
      })
    }),
  )
  self.skipWaiting()
})

// Interceptar las peticiones de red
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.startsWith("chrome-extension://")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - devolver respuesta
      if (response) {
        console.log("[SW] Serving from cache:", event.request.url)
        return response
      }

      if (event.request.url.includes("/api/")) {
        return fetch(event.request).catch(() => {
          // Return offline page or cached response for API failures
          return new Response(JSON.stringify({ error: "Offline" }), {
            headers: { "Content-Type": "application/json" },
          })
        })
      }

      // For other requests, try network first, then cache
      return fetch(event.request).catch(() => {
        console.log("[SW] Network failed, checking cache for:", event.request.url)
        return caches.match("/") // Fallback to cached homepage
      })
    }),
  )
})

// Actualizar el service worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
