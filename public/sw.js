const SW_VERSION = "__SW_VERSION__";

const CACHE_PREFIX = "cosmodex-";
const APP_SHELL_CACHE = `${CACHE_PREFIX}shell-${SW_VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}static-${SW_VERSION}`;
const API_CACHE = `${CACHE_PREFIX}api-${SW_VERSION}`;
const PAGES_CACHE = `${CACHE_PREFIX}pages-${SW_VERSION}`;
const META_CACHE = `${CACHE_PREFIX}meta-${SW_VERSION}`;

const ACTIVE_CACHES = [
  APP_SHELL_CACHE,
  STATIC_CACHE,
  API_CACHE,
  PAGES_CACHE,
  META_CACHE
];

const MAX_STATIC_ENTRIES = 80;
const MAX_STATIC_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MAX_API_ENTRIES = 60;
const MAX_API_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_PAGE_ENTRIES = 30;
const MAX_PAGE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const PRECACHE_ASSETS = /*__PRECACHE_URLS__*/[
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
]/*__END_PRECACHE_URLS__*/;

const AUTH_OR_PRIVATE_HOSTS = [
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "accounts.google.com",
  "www.googleapis.com",
  "apis.google.com",
  "firebaseinstallations.googleapis.com",
  "firestore.googleapis.com",
  "firebaseapp.com"
];

const PRIVATE_ROUTE_SEGMENTS = ["/login", "/signup", "/profile"];

function resolveUrl(relativePath) {
  return new URL(relativePath, self.registration.scope).href;
}

function isPrivateOrAuthRequest(request, url) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return true;
  if (AUTH_OR_PRIVATE_HOSTS.some((host) => url.hostname.includes(host))) return true;
  if (request.headers.has("Authorization")) return true;

  const lower = url.pathname.toLowerCase();
  if (lower.includes("/auth/") || lower.includes("token")) return true;
  return false;
}

function isPrivateRoute(url) {
  const path = url.pathname.toLowerCase();
  return PRIVATE_ROUTE_SEGMENTS.some((seg) => path.endsWith(seg) || path.includes(`${seg}/`));
}

function isOfflineRoute(url) {
  const path = url.pathname.toLowerCase();
  return path.endsWith("/offline") || path.endsWith("/offline.html");
}

function isApiRequest(url) {
  return url.pathname.includes("/api/");
}

function isStaticAssetRequest(request, url) {
  if (["image", "font", "style", "script"].includes(request.destination)) {
    return true;
  }
  return /\.(png|jpe?g|svg|webp|gif|ico|woff2?|ttf|eot|css|js)$/i.test(url.pathname);
}

async function setTimestamp(url, timestamp = Date.now()) {
  try {
    const metaCache = await caches.open(META_CACHE);
    const metaReq = new Request(url);
    const metaRes = new Response(JSON.stringify({ cachedAt: timestamp }), {
      headers: { "Content-Type": "application/json" }
    });
    await metaCache.put(metaReq, metaRes);
  } catch {
    // Ignore metadata write errors
  }
}

async function getTimestamp(url) {
  try {
    const metaCache = await caches.open(META_CACHE);
    const res = await metaCache.match(url);
    if (!res) return null;
    const data = await res.json();
    return typeof data.cachedAt === "number" ? data.cachedAt : null;
  } catch {
    return null;
  }
}

async function isExpired(url, maxAgeMs) {
  const cachedAt = await getTimestamp(url);
  if (!cachedAt) return false;
  return Date.now() - cachedAt > maxAgeMs;
}

async function trimCache(cacheName, maxEntries, maxAgeMs) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  for (const req of keys) {
    if (await isExpired(req.url, maxAgeMs)) {
      await cache.delete(req);
    }
  }

  const remaining = await cache.keys();
  if (remaining.length > maxEntries) {
    const overflow = remaining.length - maxEntries;
    for (let i = 0; i < overflow; i++) {
      await cache.delete(remaining[i]);
    }
  }
}

async function putWithLimit(cacheName, request, response, maxEntries, maxAgeMs) {
  const cache = await caches.open(cacheName);
  await cache.put(request, response);
  await setTimestamp(request.url, Date.now());
  await trimCache(cacheName, maxEntries, maxAgeMs);
}

async function createCachedResponseWithHeaders(response, url) {
  const cachedAt = (await getTimestamp(url)) || Date.now();
  const headers = new Headers(response.headers);
  headers.set("X-Cosmodex-Cache", "HIT");
  headers.set("X-Cosmodex-Cached-At", String(cachedAt));

  const body = await response.clone().arrayBuffer();
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Strategy 1: Cache-First (images, icons, fonts, static assets)
async function handleStaticCacheFirst(request) {
  const shellCache = await caches.open(APP_SHELL_CACHE);
  const shellMatch = await shellCache.match(request);
  if (shellMatch) {
    return shellMatch;
  }

  const staticCache = await caches.open(STATIC_CACHE);
  const cached = await staticCache.match(request);
  if (cached && !(await isExpired(request.url, MAX_STATIC_AGE_MS))) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await putWithLimit(
        STATIC_CACHE,
        request,
        networkResponse.clone(),
        MAX_STATIC_ENTRIES,
        MAX_STATIC_AGE_MS
      );
    }
    return networkResponse;
  } catch {
    if (cached) {
      return cached;
    }
    return new Response("", { status: 404, statusText: "Offline Asset Unavailable" });
  }
}

// Strategy 2: Network-First (public API list & details)
async function handleApiNetworkFirst(request) {
  const apiCache = await caches.open(API_CACHE);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      await putWithLimit(
        API_CACHE,
        request,
        networkResponse.clone(),
        MAX_API_ENTRIES,
        MAX_API_AGE_MS
      );
      return networkResponse;
    }
    throw new Error(`HTTP ${networkResponse?.status || 500}`);
  } catch {
    const cached = await apiCache.match(request);
    if (cached && !(await isExpired(request.url, MAX_API_AGE_MS))) {
      return createCachedResponseWithHeaders(cached, request.url);
    }
    return new Response(
      JSON.stringify({
        error: "Нет подключения к сети и кэшированные данные для этого запроса отсутствуют."
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      }
    );
  }
}

// Navigation Strategy: Network-First -> Previously Visited Page -> /offline fallback
async function handleNavigationRequest(request, url) {
  const offlineHtmlUrl = resolveUrl("./offline.html");
  const indexHtmlUrl = resolveUrl("./index.html");
  const scopeUrl = resolveUrl("./");

  if (isOfflineRoute(url)) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse && networkResponse.ok) {
        return networkResponse;
      }
    } catch {
      const shellCache = await caches.open(APP_SHELL_CACHE);
      const offlineFallback = await shellCache.match(offlineHtmlUrl);
      if (offlineFallback) return offlineFallback;
    }
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok && !isPrivateRoute(url)) {
      await putWithLimit(
        PAGES_CACHE,
        request,
        networkResponse.clone(),
        MAX_PAGE_ENTRIES,
        MAX_PAGE_AGE_MS
      );
    }
    return networkResponse;
  } catch {
    if (!isPrivateRoute(url)) {
      const pagesCache = await caches.open(PAGES_CACHE);
      const visitedMatch = await pagesCache.match(request, { ignoreSearch: false });
      if (visitedMatch) {
        return visitedMatch;
      }

      const visitedIgnoreSearch = await pagesCache.match(request, { ignoreSearch: true });
      if (visitedIgnoreSearch) {
        return visitedIgnoreSearch;
      }

      if (url.href === scopeUrl || url.href === indexHtmlUrl) {
        const shellCache = await caches.open(APP_SHELL_CACHE);
        const indexMatch = (await shellCache.match(indexHtmlUrl)) || (await shellCache.match(scopeUrl));
        if (indexMatch) return indexMatch;
      }
    }

    const shellCache = await caches.open(APP_SHELL_CACHE);
    const offlinePage = await shellCache.match(offlineHtmlUrl);
    if (offlinePage) {
      return offlinePage;
    }

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_SHELL_CACHE);
      const urlsToCache = [...new Set(PRECACHE_ASSETS.map(resolveUrl))];
      await Promise.allSettled(
        urlsToCache.map(async (assetUrl) => {
          const req = new Request(assetUrl, { cache: "reload" });
          const res = await fetch(req);
          if (res && res.ok) {
            await cache.put(assetUrl, res);
          }
        })
      );
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !ACTIVE_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isPrivateOrAuthRequest(request, url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request, url));
    return;
  }

  if (isApiRequest(url)) {
    event.respondWith(handleApiNetworkFirst(request));
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(handleStaticCacheFirst(request));
    return;
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "CACHE_ROUTE" && typeof data.url === "string") {
    event.waitUntil(
      (async () => {
        try {
          const targetUrl = new URL(data.url, self.registration.scope);
          if (targetUrl.origin !== self.location.origin || isPrivateRoute(targetUrl) || isOfflineRoute(targetUrl)) {
            return;
          }
          const shellCache = await caches.open(APP_SHELL_CACHE);
          const indexRes =
            (await shellCache.match(resolveUrl("./index.html"))) ||
            (await shellCache.match(resolveUrl("./")));
          if (indexRes) {
            await putWithLimit(
              PAGES_CACHE,
              new Request(targetUrl.href),
              indexRes.clone(),
              MAX_PAGE_ENTRIES,
              MAX_PAGE_AGE_MS
            );
          }
        } catch {
          // Ignore invalid route caching message
        }
      })()
    );
  }
});
