const CACHE = 'auvix-v1';
const ASSETS = [
  '/auvixchat/',
  '/auvixchat/index.html'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Только GET, не трогаем Firebase запросы
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('firebaseio.com')) return;
  if (e.request.url.includes('googleapis.com')) return;
  if (e.request.url.includes('gstatic.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push-уведомления (для будущего)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'AUVIX', body: 'Новое сообщение' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/auvixchat/icon-192.png',
      badge: '/auvixchat/icon-192.png'
    })
  );
});
