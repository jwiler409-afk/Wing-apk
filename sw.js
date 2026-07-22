/* sw.js — Mòd Lokal pou Wing APK Downloader
   Objektif: kenbe yon kopi lokal (cache) de paj la ak eleman prensipal yo,
   pou si rezo a tonbe, app la kontinye louvri nòmalman olye pou l montre
   yon paj erè sèvè (500). Depi rezo a retounen, tout bagay resenkronize
   otomatikman ak Firebase san bezwen rechaje app la manyèlman. */

const CACHE_NAME = 'wing-apk-local-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth-compat.js'
];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return Promise.all(
        CORE_ASSETS.map(function(url){
          return cache.add(url).catch(function(){ /* si youn pa disponib kounye a, kontinye ak lòt yo */ });
        })
      );
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(key){ return key !== CACHE_NAME; })
            .map(function(key){ return caches.delete(key); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(function(cached){
      const networkFetch = fetch(event.request).then(function(response){
        if(response && response.status === 200){
          const clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      }).catch(function(){
        /* Rezo a pa disponib: sèvi ak vèsyon lokal la si nou genyen l */
        return cached;
      });

      /* Si nou gen yon kopi lokal, montre l touswit (rapid + fonksyone san rezo),
         epi mete l ajou an background lè rezo a disponib. */
      return cached || networkFetch;
    })
  );
});
