"use strict";
const CACHE_NAME = "ornivalis-shell-v2";
const BASE_PATH = new URL("./", self.location).pathname;
const SHELL = [BASE_PATH, BASE_PATH + "index.html", BASE_PATH + "images/logo.png", BASE_PATH + "manifest.json"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(BASE_PATH + "index.html", copy)); }
      return response;
    }).catch(() => caches.match(BASE_PATH + "index.html").then(cached => cached || caches.match(BASE_PATH))));
    return;
  }
  if (url.pathname.startsWith(BASE_PATH + "images/") || url.pathname === BASE_PATH + "manifest.json") {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); }
      return response;
    })));
  }
});
