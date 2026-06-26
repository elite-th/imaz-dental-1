"use client";

import {
  Bell,
  BellRing,
  Search,
  RefreshCw,
  Menu,
  X,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  UserPlus,
} from "lucide-react";
import type { NotificationPermission } from "@/hooks/use-browser-notifications";
import type { NotificationData } from "@/hooks/use-browser-notifications";
import { useI18n } from "@/i18n/context";
import type { TabKey } from "../types";

interface AdminHeaderProps {
  activeTab: TabKey;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  // notifications:
  notifySupported: boolean;
  notifyPermission: NotificationPermission;
  notifyBadge: number;
  notificationData: NotificationData;
  showNotifyDropdown: boolean;
  onToggleNotifyDropdown: () => void;
  onRequestNotifyPermission: () => Promise<void>;
  pendingCount: number; // stats.pending — used as fallback badge
  isRTL: boolean;
  isDesktop: boolean;
  onOpenMobileMenu: () => void;
  mobileMenuOpen: boolean;
}

export function AdminHeader({
  activeTab,
  searchQuery,
  onSearchChange,
  onRefresh,
  refreshing,
  notifySupported,
  notifyPermission,
  notifyBadge,
  notificationData,
  showNotifyDropdown,
  onToggleNotifyDropdown,
  onRequestNotifyPermission,
  pendingCount,
  isRTL,
  onOpenMobileMenu,
  mobileMenuOpen,
}: AdminHeaderProps) {
  const { t } = useI18n();
  void isRTL; // kept for API parity; unused inside header

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
      <div className="flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onOpenMobileMenu} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
            {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
          </button>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              {activeTab === "appointments" && t("admin.nav_appointments")}
              {activeTab === "analytics" && t("admin.nav_analytics")}
              {activeTab === "faq" && "سوالات متداول"}
              {activeTab === "gallery" && "گالری"}
              {activeTab === "collaborations" && "دندانپزشکان"}
              {activeTab === "site_text" && "متن سایت"}
              {activeTab === "settings" && t("admin.nav_settings")}
              {activeTab === "schedule" && "زمان‌بندی"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.dashboard_subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "appointments" && (
            <div className="hidden md:flex items-center relative">
              <Search className="absolute start-3 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t("admin.search_placeholder")}
                className="w-64 ps-10 pe-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              />
            </div>
          )}
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
            title={t("admin.refresh")}
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="relative">
            <button
              onClick={onToggleNotifyDropdown}
              className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label={t("admin.notify_bell_title")}
            >
              {notifyBadge > 0 ? (
                <BellRing className="w-5 h-5 text-teal-600" />
              ) : (
                <Bell className="w-5 h-5 text-gray-400" />
              )}
              {(notifyBadge > 0 || pendingCount > 0) && (
                <span className="absolute top-1.5 end-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifyBadge > 0 ? (notifyBadge > 9 ? "9+" : notifyBadge) : pendingCount}
                </span>
              )}
            </button>

            {showNotifyDropdown && (
              <div className="absolute end-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 min-w-[230px]">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    {t("admin.notify_bell_title")}
                  </p>
                </div>

                {notifySupported && notifyPermission !== "granted" && (
                  <button
                    onClick={onRequestNotifyPermission}
                    className="w-full text-start px-3 py-2.5 text-xs text-teal-700 hover:bg-teal-50 transition-all flex items-center gap-2"
                    style={{ fontFamily: "var(--font-vazirmatn)" }}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    {t("admin.notify_enable")}
                  </button>
                )}

                {notifySupported && notifyPermission === "granted" && (
                  <div className="px-3 py-2 text-[11px] text-emerald-600 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    <BellRing className="w-3.5 h-3.5" />
                    {t("admin.notify_enabled")}
                  </div>
                )}

                <div className="border-t border-gray-100 mt-1 pt-1">
                  {notifyBadge === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-gray-400 text-center" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      {t("admin.notify_no_new")}
                    </div>
                  ) : (
                    <>
                      {notificationData.newBookings > 0 && (
                        <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
                          <span>{notificationData.newBookings} {t("admin.notify_new_bookings_count")}</span>
                        </div>
                      )}
                      {notificationData.newPatients > 0 && (
                        <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <UserPlus className="w-3.5 h-3.5 text-teal-500" />
                          <span>{notificationData.newPatients} {t("admin.notify_new_patients_count")}</span>
                        </div>
                      )}
                      {notificationData.unreadMessages > 0 && (
                        <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <Mail className="w-3.5 h-3.5 text-teal-500" />
                          <span>{notificationData.unreadMessages} {t("admin.notify_new_messages_count")}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <a href="/" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            {t("admin.back_to_site")}
          </a>
        </div>
      </div>
    </header>
  );
}
