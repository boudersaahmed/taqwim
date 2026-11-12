/* منصة التقويم المستمر – يعمل دون إنترنت، ويجلب التحديثات عند توفر الاتصال */
const CACHE = 'taqwim-platform-v1';
const ASSETS = ['./', 'index.html', 'manifest.json', 'jspdf.umd.min.js', 'html2canvas.min.js', 'exceljs.min.js', 'qrcode.js',
  'cairo-ar-400.woff2', 'cairo-ar-600.woff2', 'cairo-ar-800.woff2', 'cairo-la-400.woff2', 'cairo-la-600.woff2', 'cairo-la-800.woff2',
  'amiri-ar-700.woff2', 'amiri-la-700.woff2', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // طلبات جدول المدرسة لا تمر من هنا
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.json');
  if (isPage){
    e.respondWith(fetch(req).then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })));
});
