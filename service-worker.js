const CACHE_NAME = 'vakit-sayaci-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Network first strategy to ensure we always try to get fresh timings 
    // and freshest PWA files, fallback to cache if offline.
    event.respondWith(
        fetch(event.request)
            .then(res => {
                // If the response is valid, clone it and cache it.
                if (res && res.status === 200 && res.type === 'basic') {
                    const resClone = res.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, resClone);
                    });
                }
                return res;
            })
            .catch(() => caches.match(event.request))
    );
});
