// Service Worker for Imaz Dental Push Notifications

// Listen for push events
self.addEventListener("push", (event) => {
  let data = {
    title: "ایماز دنتال",
    body: "نوتیفیکیشن جدید",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    url: "/admin",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    dir: "rtl",
    lang: "fa",
    data: { url: data.url },
    vibrate: [200, 100, 200],
    tag: data.tag || "imaz-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Handle notification click — focus/open the admin page
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/admin";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});
