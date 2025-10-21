// Service Worker for handling push notifications

self.addEventListener('install', (event) => {
    console.log('Service Worker: Installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
    event.waitUntil(clients.claim());
});

// Handle push events
self.addEventListener('push', (event) => {
    console.log('Push notification received');

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { notification: { title: 'New Notification', body: event.data.text() } };
        }
    }

    const options = {
        body: data.notification.body,
        icon: data.notification.icon || '/icon.png',
        badge: data.notification.badge || '/badge.png',
        vibrate: data.notification.vibrate || [200, 100, 200],
        data: data.notification.data,
        actions: data.notification.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(data.notification.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'done') {
        console.log('Task marked as done');
    } else if (event.action === 'snooze') {
        console.log('Task snoozed');
        // Could trigger another notification after 10 minutes
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
