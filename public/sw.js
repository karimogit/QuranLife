/**
 * QuranLife Service Worker
 * Provides offline functionality for the PWA
 * Author: Karim Osman (https://kar.im)
 */

const CACHE_NAME = 'quranlife-v1';
const STATIC_CACHE = 'quranlife-static-v1';

// Assets to cache for offline use
const CACHE_ASSETS = [
  '/',
  '/habits', 
  '/settings',
  '/privacy',
  '/terms',
  '/manifest.json',
  '/favicon.svg',
  '/data/enhanced-quran.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('QuranLife SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('QuranLife SW: Caching assets...');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        console.log('QuranLife SW: Assets cached successfully');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('QuranLife SW: Error caching assets:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('QuranLife SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('QuranLife SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('QuranLife SW: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // For navigation requests (pages), try network first, fallback to cache
        if (event.request.mode === 'navigate') {
          return fetch(event.request)
            .then(response => {
              // Cache successful responses
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Offline fallback - serve cached page or offline page
              return caches.match('/') || new Response(
                '<html><body><h1>QuranLife - Offline</h1><p>You are currently offline. Please check your connection and try again.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        }

        // For other requests, try network first
        return fetch(event.request)
          .then(response => {
            // Cache successful responses for static assets
            if (response.status === 200 && 
                (event.request.url.includes('.json') || 
                 event.request.url.includes('.js') || 
                 event.request.url.includes('.css') ||
                 event.request.url.includes('.svg'))) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then(cache => cache.put(event.request, responseClone));
            }
            return response;
          })
          .catch(() => {
            // Return a basic offline response for failed requests
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle background sync for data persistence
self.addEventListener('sync', (event) => {
  console.log('QuranLife SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  console.log('QuranLife SW: Performing background sync...');
  // In a real implementation, this would sync offline data changes
  // For QuranLife, this is mainly for future server sync capabilities
  return Promise.resolve();
}

// Send message to clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 