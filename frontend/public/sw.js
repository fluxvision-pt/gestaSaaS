const CACHE_NAME = 'gestasaas-v1.0.0'
const STATIC_CACHE_URLS = [
  '/',
  '/dashboard',
  '/financeiro',
  '/relatorios',
  '/configuracoes',
  '/manifest.json',
  '/icons/icon.svg'
]

// Instalar o service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('Service Worker: Installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error)
      })
  )
})

// Ativar o service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated successfully')
        return self.clients.claim()
      })
  )
})

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Só interceptar requisições GET
  if (event.request.method !== 'GET') {
    return
  }

  // Estratégia: Cache First para assets estáticos, Network First para API
  if (event.request.url.includes('/api/')) {
    // Network First para API
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Se a resposta for válida, cache ela
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Se falhar, tenta buscar no cache
          return caches.match(event.request)
        })
    )
  } else {
    // Cache First para assets estáticos
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          return fetch(event.request)
            .then((response) => {
              // Se a resposta for válida, cache ela
              if (response.status === 200) {
                const responseClone = response.clone()
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, responseClone)
                  })
              }
              return response
            })
        })
        .catch(() => {
          // Fallback para páginas offline
          if (event.request.destination === 'document') {
            return caches.match('/')
          }
        })
    )
  }
})

// Escutar mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Notificações push (para futuras implementações)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver detalhes',
          icon: '/icons/icon.svg'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/icon.svg'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Clique em notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})