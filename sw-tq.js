/* الإصدار 6.8.1 – منصة أحمد فقير
   عند وصول إصدار جديد: يعيد عامل الخدمة تحميل صفحات التطبيق المفتوحة وحده، حتى الهواتف التي عليها إصدار قديم
   لا يعيد التحميل بنفسه. لا يمس البيانات المحفوظة في الهاتف (النقاط غير المرسلة تبقى وتُرسل بعد التحميل).
   صفحة واجهة الطباعة (print.html) تُترك: تعيد التحميل بنفسها بعد 4 ثوانٍ. */
(function () {
  var META = 'tq-meta', KEY = 'tq-update-pending';
  self.addEventListener('install', function (e) {
    // يوجد عامل خدمة سابق: هذا تحديث (وليس أول تثبيت في الهاتف)
    if (self.registration && self.registration.active) {
      e.waitUntil(caches.open(META).then(function (c) { return c.put(KEY, new Response(String(Date.now()))); }));
    }
  });
  self.addEventListener('activate', function (e) {
    e.waitUntil(caches.open(META).then(function (c) {
      return c.match(KEY).then(function (hit) {
        if (!hit) return null;
        return c.delete(KEY)
          .then(function () { return self.clients.claim(); })
          .then(function () { return self.clients.matchAll({ type: 'window', includeUncontrolled: true }); })
          .then(function (list) {
            // لا ننتظر انتهاء التحميل هنا: الصفحة تُحمَّل من عامل الخدمة نفسه بعد أن يكتمل تفعيله
            list.forEach(function (cl) {
              var u;
              try { u = new URL(cl.url); } catch (err) { return; }
              if (/print\.html$/.test(u.pathname)) return;
              // رابط مختلف (?tqr=…) حتى يكون تحميلاً كاملاً لا انتقالاً داخل الصفحة نفسها، مع الإبقاء على الشاشة المفتوحة (#…)
              u.searchParams.set('tqr', String(Date.now()));
              try { cl.postMessage({ type: 'tq-reload' }); } catch (err2) {}
              setTimeout(function () { cl.navigate(u.href).catch(function () {}); }, 0);
            });
          });
      });
    }));
  });
})();
