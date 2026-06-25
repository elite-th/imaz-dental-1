"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

export interface NotificationData {
  newBookings: number;
  newPatients: number;
  unreadMessages: number;
  lastChecked: string;
}

const LAST_CHECKED_KEY = "imaz-notify-last-checked";
const PERMISSION_KEY = "imaz-notify-permission-requested";
const SERVICE_WORKER_PATH = "/sw.js";

/* ── Helper: convert base64 string to Uint8Array for PushSubscription ── */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/* ── Helper to read Notification.permission safely ── */
function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "default";
  return Notification.permission as NotificationPermission;
}

export function useBrowserNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [notificationData, setNotificationData] = useState<NotificationData>({
    newBookings: 0,
    newPatients: 0,
    unreadMessages: 0,
    lastChecked: new Date().toISOString(),
  });
  const [totalBadge, setTotalBadge] = useState(0);
  const lastCheckedRef = useRef<string | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  /* ---- Load lastChecked from localStorage ---- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(LAST_CHECKED_KEY);
    if (saved) {
      lastCheckedRef.current = saved;
    }
  }, []);

  /* ---- Register service worker on mount ---- */
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register(SERVICE_WORKER_PATH)
      .then((reg) => {
        swRegistrationRef.current = reg;
      })
      .catch(() => {
        // Service worker registration failed — fallback to in-tab notifications
      });
  }, []);

  /* ---- Send subscription object to backend ---- */
  const sendSubscriptionToBackend = useCallback(async (subscription: PushSubscription) => {
    try {
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
    } catch {
      // Silently ignore — push will still work in-tab via polling
    }
  }, []);

  /* ---- Subscribe to push notifications ---- */
  const subscribeToPush = useCallback(async () => {
    if (!swRegistrationRef.current) return;
    try {
      // Get VAPID public key from backend
      const keyRes = await fetch("/api/notifications/vapid-public-key");
      if (!keyRes.ok) return;
      const { publicKey } = await keyRes.json();
      if (!publicKey) return;

      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      // Check if already subscribed
      const existingSub = await swRegistrationRef.current.pushManager.getSubscription();
      if (existingSub) {
        // Already subscribed — ensure backend knows about it
        await sendSubscriptionToBackend(existingSub);
        return;
      }

      // Create new subscription
      const subscription = await swRegistrationRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to backend
      await sendSubscriptionToBackend(subscription);
    } catch (err) {
      console.warn("[Push] Subscription failed:", err);
    }
  }, [sendSubscriptionToBackend]);

  /* ---- Request permission + subscribe to push ---- */
  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission as NotificationPermission);
      if (nextPermission === "granted") {
        localStorage.setItem(PERMISSION_KEY, "true");
        // Subscribe to push after permission granted
        await subscribeToPush();
      }
    } catch {
      // Browser doesn't support notification request
    }
  }, [subscribeToPush]);

  /* ---- Show a browser notification ---- */
  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;

      try {
        // Prefer service worker notification (works in background)
        if (swRegistrationRef.current) {
          await swRegistrationRef.current.showNotification(title, {
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            data: { url: "/admin" },
            ...options,
          });
          return;
        }

        // Fallback: in-tab notification (only visible when tab is focused)
        const notification = new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close after 8 seconds
        setTimeout(() => {
          notification.close();
        }, 8000);
      } catch {
        // Notification creation failed
      }
    },
    []
  );

  /* ---- Poll for new notifications ---- */
  const pollNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (lastCheckedRef.current) {
        params.set("since", lastCheckedRef.current);
      }
      const res = await fetch(`/api/notifications/check?${params.toString()}`);
      if (!res.ok) return;
      const data: NotificationData = await res.json();

      const total = data.newBookings + data.newPatients + data.unreadMessages;
      setNotificationData(data);
      setTotalBadge(total);

      return data;
    } catch {
      return null;
    }
  }, []);

  /* ---- Update lastChecked timestamp ---- */
  const updateLastChecked = useCallback((timestamp?: string) => {
    const nextChecked = timestamp || new Date().toISOString();
    lastCheckedRef.current = nextChecked;
    localStorage.setItem(LAST_CHECKED_KEY, nextChecked);
  }, []);

  /* ---- Clear badge ---- */
  const clearBadge = useCallback(() => {
    setTotalBadge(0);
  }, []);

  return {
    permission,
    notificationData,
    totalBadge,
    requestPermission,
    showNotification,
    pollNotifications,
    updateLastChecked,
    clearBadge,
    subscribeToPush,
    isSupported: typeof window !== "undefined" && "Notification" in window,
  };
}
