// Service Worker for Magic Learning Web Push Notifications & Background Sync
const CACHE_NAME = 'magic-learning-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Magic Learning – Portal Escolar',
    body: 'Você possui uma nova atualização escolar.',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'magic-school-notification',
    data: { url: '/', tab: 'comunicados' }
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    vibrate: [100, 50, 100],
    tag: payload.tag || 'magic-school-push',
    data: payload.data || { url: '/' },
    actions: payload.actions || [
      { action: 'open', title: 'Abrir no App' },
      { action: 'dismiss', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// Handle notification click by focusing existing tab or opening a new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          // Post message to client so it can navigate to the specific tab
          if (event.notification.data?.targetTab) {
            client.postMessage({
              type: 'NAVIGATE_TO_TAB',
              tab: event.notification.data.targetTab,
              notificationId: event.notification.data.notificationId
            });
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
