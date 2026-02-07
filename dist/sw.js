const CACHE_NAME = 'bear-phone-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/bear-logo.png',
  '/bear-claw.png',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.error('Error caching static assets:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        fetch(request)
          .then((response) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response);
            });
          })
          .catch(() => {
            // Network failed, but we have cached response
          });
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request)
        .then((response) => {
          // Clone and cache the response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch((error) => {
          console.error('Fetch failed:', error);
          // Return offline fallback if available
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          throw error;
        });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-forms') {
    event.waitUntil(syncFormSubmissions());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification from BEAR PHONE',
    icon: '/bear-logo.png',
    badge: '/bear-logo.png',
    tag: 'bear-phone-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'فتح',
      },
      {
        action: 'close',
        title: 'إغلاق',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('BEAR PHONE - دب فون', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function to sync form submissions
async function syncFormSubmissions() {
  // This would typically sync queued form submissions
  console.log('Syncing form submissions...');
}
