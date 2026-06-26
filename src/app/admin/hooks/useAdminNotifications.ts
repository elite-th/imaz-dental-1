"use client";

import { useEffect } from "react";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { useI18n } from "@/i18n/context";

/**
 * Wraps `useBrowserNotifications()` so it is invoked exactly once at the
 * admin-page level, and runs the 30-second `pollNotifications` loop that
 * fires `showBrowserNotification` for new bookings/patients/messages and
 * triggers a `fetchBookings(false)` callback when new bookings arrive.
 *
 * NOTE: the bookings auto-refresh interval (separate, 30s) lives in
 * `page.tsx`. The two intervals stay separate to preserve the original
 * behavior exactly.
 */
export function useAdminNotifications(
  isLoggedIn: boolean,
  fetchBookings: (showLoading?: boolean) => Promise<void>,
) {
  const { t } = useI18n();

  const {
    permission,
    notificationData,
    totalBadge,
    requestPermission,
    showNotification: showBrowserNotification,
    pollNotifications,
    updateLastChecked,
    clearBadge,
    subscribeToPush,
    isSupported,
  } = useBrowserNotifications();

  /* ---- Browser/system notifications for the full admin page ---- */
  useEffect(() => {
    if (!isLoggedIn) return;

    pollNotifications().then((data) => {
      if (data) updateLastChecked(data.lastChecked);
    });

    const interval = setInterval(async () => {
      const data = await pollNotifications();
      if (!data) return;

      if (data.newBookings > 0) {
        showBrowserNotification(t("admin.notify_new_booking"), {
          body: `${data.newBookings} ${t("admin.notify_new_bookings_count")}`,
          tag: "admin-new-bookings",
        });
        fetchBookings(false);
      }

      if (data.newPatients > 0) {
        showBrowserNotification(t("admin.notify_new_patient"), {
          body: `${data.newPatients} ${t("admin.notify_new_patients_count")}`,
          tag: "admin-new-patients",
        });
      }

      if (data.unreadMessages > 0) {
        showBrowserNotification(t("admin.notify_new_message"), {
          body: `${data.unreadMessages} ${t("admin.notify_new_messages_count")}`,
          tag: "admin-new-messages",
        });
      }

      updateLastChecked(data.lastChecked);
    }, 30000);

    return () => clearInterval(interval);
  }, [
    isLoggedIn,
    pollNotifications,
    showBrowserNotification,
    updateLastChecked,
    fetchBookings,
    t,
  ]);

  return {
    permission,
    notificationData,
    totalBadge,
    requestPermission,
    showBrowserNotification,
    pollNotifications,
    updateLastChecked,
    clearBadge,
    subscribeToPush,
    isSupported,
  };
}

export type UseAdminNotificationsReturn = ReturnType<typeof useAdminNotifications>;
