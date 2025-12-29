// ============================================
// SERVICE WORKER OPTIMISÉ POUR L'AFRIQUE
// Cache agressif pour usage 100% offline
// Version : 7.1-africa
// ============================================

const CACHE_VERSION = 'v7.1-africa';
const CACHE_NAME = `paiecashfan-${CACHE_VERSION}`;

// Assets critiques (< 50 KB total)
const CRITICAL_ASSETS = [
  '/',
  '/index-v7.0-MEGA-SCALE.html',
  '/app-universal-simple.html',
  '/manifest.json',
  '/offline.html'
];

// Données des clubs (pré-cachées pour offline)
const CLUBS_DATA = [
  '/clubs-football-complet.js',
  '/clubs-national-3-data.js',
  '/equipes-nationales-internationales.js',
  '/🏀_BASKET_FEDERATIONS_CLUBS.js',
  '/🤾_HANDBALL_FEDERATIONS_CLUBS.js',
  '/🏉_RUGBY_VOLLEY_FEDERATIONS_CLUBS.js'
];

// Tous les assets à cacher
const ALL_ASSETS = [
  ...CRITICAL_ASSETS,
  ...CLUBS_DATA
];

// ============================================
// INSTALLATION
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW-AFRICA] 🚀 Installation...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW-AFRICA] 📦 Cache ouvert, ajout de', ALL_ASSETS.length, 'fichiers');
        
        // Cacher les assets critiques en priorité
        return cache.addAll(CRITICAL_ASSETS)
          .then(() => {
            console.log('[SW-AFRICA] ✅ Assets critiques cachés');
            // Puis cacher les données (moins prioritaire)
            return cache.addAll(CLUBS_DATA);
          })
          .then(() => {
            console.log('[SW-AFRICA] ✅ Données clubs cachées');
          });
      })
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('[SW-AFRICA] ❌ Erreur installation:', err);
        // Continuer même en cas d'erreur (mode dégradé)
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATION
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW-AFRICA] ⚡ Activation...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // Supprimer tous les anciens caches
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME && name.startsWith('paiecashfan-'))
            .map(name => {
              console.log('[SW-AFRICA] 🗑️ Suppression ancien cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW-AFRICA] ✅ Activation terminée');
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH - Stratégie CACHE-FIRST (Offline-First)
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // ========================================
  // RÈGLE 1 : Assets locaux → CACHE-FIRST
  // ========================================
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW-AFRICA] 💾 Servi depuis cache:', url.pathname);
            return cachedResponse;
          }
          
          // Pas en cache → fetch et cache
          console.log('[SW-AFRICA] 🌐 Fetch depuis réseau:', url.pathname);
          return fetch(request)
            .then(response => {
              // Ne pas cacher les erreurs
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              
              // Clone pour cacher
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, responseToCache);
                  console.log('[SW-AFRICA] ✅ Ajouté au cache:', url.pathname);
                });
              
              return response;
            })
            .catch(err => {
              console.error('[SW-AFRICA] ❌ Fetch échoué:', err);
              
              // Fallback : page offline
              if (request.destination === 'document') {
                return caches.match('/offline.html');
              }
              
              // Pour les autres : réponse vide
              return new Response('Offline', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        })
    );
    return;
  }
  
  // ========================================
  // RÈGLE 2 : CDN/External → NETWORK-FIRST avec timeout court
  // ========================================
  event.respondWith(
    Promise.race([
      fetch(request).then(response => {
        // Cacher les ressources CDN réussies
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseToCache));
        }
        return response;
      }),
      // Timeout 3 secondes (connexion lente)
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout CDN')), 3000)
      )
    ])
    .catch(() => {
      // Fallback : cache si disponible
      return caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[SW-AFRICA] 💾 CDN depuis cache:', url.href);
            return cachedResponse;
          }
          
          // Pas de cache : retour vide
          return new Response('', {
            status: 200,
            statusText: 'OK (Offline)'
          });
        });
    })
  );
});

// ============================================
// BACKGROUND SYNC - Sync data quand WiFi
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW-AFRICA] 🔄 Background Sync:', event.tag);
  
  if (event.tag === 'sync-clubs-data') {
    event.waitUntil(syncClubsData());
  }
  
  if (event.tag === 'sync-user-actions') {
    event.waitUntil(syncUserActions());
  }
});

async function syncClubsData() {
  console.log('[SW-AFRICA] 🔄 Synchronisation données clubs...');
  
  try {
    // Vérifier le type de connexion
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      // Sync seulement si WiFi ou 4G
      if (connection.effectiveType !== 'wifi' && connection.effectiveType !== '4g') {
        console.log('[SW-AFRICA] ⚠️ Connexion trop lente, sync annulée');
        return;
      }
    }
    
    // Fetch dernières données
    const response = await fetch('/api/clubs/latest', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Sync failed: ' + response.status);
    }
    
    const data = await response.json();
    
    // Mettre à jour le cache
    const cache = await caches.open(CACHE_NAME);
    await cache.put('/api/clubs/latest', new Response(JSON.stringify(data)));
    
    // Notifier les clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_SUCCESS',
        data: {
          clubsCount: data.clubs.length,
          timestamp: Date.now()
        }
      });
    });
    
    console.log('[SW-AFRICA] ✅ Sync réussie:', data.clubs.length, 'clubs');
    
  } catch (err) {
    console.error('[SW-AFRICA] ❌ Erreur sync:', err);
    
    // Notifier les clients de l'erreur
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_ERROR',
        error: err.message
      });
    });
  }
}

async function syncUserActions() {
  console.log('[SW-AFRICA] 🔄 Synchronisation actions utilisateur...');
  
  try {
    // Récupérer actions en attente depuis IndexedDB
    // (à implémenter selon votre structure)
    
    // Envoyer au serveur
    const response = await fetch('/api/user/actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // actions pending
      })
    });
    
    if (response.ok) {
      console.log('[SW-AFRICA] ✅ Actions sync réussie');
    }
    
  } catch (err) {
    console.error('[SW-AFRICA] ❌ Erreur sync actions:', err);
  }
}

// ============================================
// MESSAGES - Communication avec l'app
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW-AFRICA] 📨 Message reçu:', event.data);
  
  // Skip waiting (forcer nouvelle version)
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  
  // Obtenir taille du cache
  if (event.data.action === 'getCacheSize') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({
        type: 'CACHE_SIZE',
        size: size
      });
    });
    return;
  }
  
  // Vider le cache
  if (event.data.action === 'clearCache') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({
        type: 'CACHE_CLEARED'
      });
    });
    return;
  }
  
  // Forcer sync
  if (event.data.action === 'forceSync') {
    syncClubsData().then(() => {
      event.ports[0].postMessage({
        type: 'SYNC_FORCED'
      });
    });
    return;
  }
});

// Calculer taille du cache
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    let totalSize = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
    
    return {
      bytes: totalSize,
      kb: Math.round(totalSize / 1024),
      mb: (totalSize / 1024 / 1024).toFixed(2),
      filesCount: keys.length
    };
  } catch (err) {
    console.error('[SW-AFRICA] ❌ Erreur calcul taille:', err);
    return { bytes: 0, kb: 0, mb: '0', filesCount: 0 };
  }
}

// ============================================
// PUSH NOTIFICATIONS (optionnel)
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW-AFRICA] 📬 Push notification reçue');
  
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nouvelle notification PaieCashFan',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: [
      { action: 'open', title: 'Ouvrir' },
      { action: 'close', title: 'Fermer' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'PaieCashFan',
      options
    )
  );
});

// Clic sur notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW-AFRICA] 🔔 Notification cliquée:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// ============================================
// ERROR HANDLING
// ============================================
self.addEventListener('error', (event) => {
  console.error('[SW-AFRICA] ❌ Erreur globale:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW-AFRICA] ❌ Promise rejetée:', event.reason);
});

// ============================================
// LOG INITIAL
// ============================================
console.log('[SW-AFRICA] 🌍 Service Worker Afrique chargé - Version:', CACHE_VERSION);
console.log('[SW-AFRICA] 📦 Assets à cacher:', ALL_ASSETS.length);
console.log('[SW-AFRICA] 🎯 Stratégie: Cache-First (Offline-First)');
console.log('[SW-AFRICA] 📶 Optimisé pour: 2G/3G/4G + connexions lentes');
