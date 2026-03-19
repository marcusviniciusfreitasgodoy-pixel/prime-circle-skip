const CACHE_NAME = 'prime-circle-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request)
    }),
  )
})

self.addEventListener('push', (event) => {
  let data = { title: 'Prime Circle', body: 'Você tem uma nova notificação!' }
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: 'https://img.usecurling.com/i?q=app-icon&color=gradient&shape=fill',
    badge: 'https://img.usecurling.com/i?q=app-icon&color=gradient&shape=fill',
    data: { url: data.url || '/dashboard' },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
