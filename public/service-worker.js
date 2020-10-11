const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// we use relative paths instead of hardcoded ones so that it will work in develoment and production
const FILES_TO_CACHE = [
    "/index.html",
    "/css/styles.css",
    "/js/idb.js",
    "/js/index.js",
    "/manifest.json",
    "/icons/icon-72x72.png",
    "/icons/icon-96x96.png",
    "/icons/icon-128x128.png",
    "/icons/icon-144x144.png",
    "/icons/icon-152x152.png",
    "/icons/icon-192x192.png",
    "/icons/icon-384x384.png",
    "/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0",
    // "/api/transaction"
];

// e.waitUntil tells the browser to wait until the work is complete before terminating the service worker
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
})

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            // return Promise.all() doesn't return until all of the promises are resolved or rejected
            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    if (e.request.url.includes("/api/")) {
        e.respondWith(
            caches.match(e.request).then(function (request) {
                if (request) { // if cache is available, respond with cache
                    console.log('responding with cache : ' + e.request.url)
                    return request
                } else {       // if there are no cache, try fetching request
                    console.log('file is not cached, fetching : ' + e.request.url)
                    return fetch(e.request)
                }

                // You can omit if/else for console.log & put one line below like this too.
                // return request || fetch(e.request)
            })
        )
    }
    return;
})