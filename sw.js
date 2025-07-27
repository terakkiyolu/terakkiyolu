const CACHE_NAME = "sadecekuran-cache-v1";
const urlsToCache = [
  "/ertek.html",                  // ana sayfa
  "/index.html",        // varsa
  "/manifest.json",
  "/sdc1.PNG",
  "/sdc5.PNG",
  "/style.css",         // varsa
  "/kuran_mealleri.json", 
  "/all_surahs_data.json",         // varsa
  "/main.js"            // varsa
];

// Kurulumda dosyaları önbelleğe al
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log("Cache açıldı");
        return cache.addAll(urlsToCache);
      })
  );
});

// İstek geldiğinde önbellekten döndür
self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Eğer cache'de varsa onu döndür
        if (response) {
          return response;
        }
        // Yoksa normal isteği yap
        return fetch(event.request);
      })
  );
});
