// ============================================
// نور | Service Worker - العمل بدون إنترنت
// ============================================

const CACHE_NAME = 'noor-cache-v2';
const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ===== التثبيت =====
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE).catch(() => {});
        })
    );
    self.skipWaiting();
});

// ===== التنشيط =====
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// ===== الجلب =====
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    
    // الصفحة الرئيسية دائماً من الشبكة
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('./index.html'))
        );
        return;
    }
    
    // باقي الملفات: cache أولاً، ثم network
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request).then((response) => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            }).catch(() => cached);
            
            return cached || fetchPromise;
        })
    );
});