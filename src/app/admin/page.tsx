"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  BarChart3,
  HelpCircle,
  Image as ImageIcon,
  Stethoscope,
  Type,
  Settings as SettingsIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/context";

import { useAdminAuth } from "./hooks/useAdminAuth";
import { useBookings } from "./hooks/useBookings";
import { useAnalytics } from "./hooks/useAnalytics";
import { useFaqs } from "./hooks/useFaqs";
import { useGallery } from "./hooks/useGallery";
import { useCollaborations } from "./hooks/useCollaborations";
import { useSiteTexts } from "./hooks/useSiteTexts";
import { useSchedule } from "./hooks/useSchedule";
import { useSettings } from "./hooks/useSettings";
import { useAdminNotifications } from "./hooks/useAdminNotifications";

import { AdminLogin } from "./components/AdminLogin";
import { AdminSidebar, getSidebarWidth, type SidebarItem } from "./components/AdminSidebar";
import { AdminHeader } from "./components/AdminHeader";
import { BookingDetailPanel } from "./components/BookingDetailPanel";
import { CreateBookingModal } from "./components/CreateBookingModal";
import { useStatusConfig } from "./components/BookingStatusBadge";

import { AppointmentsTab } from "./components/tabs/AppointmentsTab";
import { AnalyticsTab } from "./components/tabs/AnalyticsTab";
import { SettingsTab } from "./components/tabs/SettingsTab";
import { FaqTab } from "./components/tabs/FaqTab";
import { GalleryTab } from "./components/tabs/GalleryTab";
import { CollaborationsTab } from "./components/tabs/CollaborationsTab";
import { SiteTextTab } from "./components/tabs/SiteTextTab";
import { ScheduleTab } from "./components/tabs/ScheduleTab";

import type { TabKey } from "./types";

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT (slim orchestrator)
   ══════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  /* ---- Responsive check (kept inline — small effect) ---- */
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ---- UI state (page-level only) ---- */
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("appointments");
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  /* ---- Domain hooks ---- */
  const auth = useAdminAuth();
  const bookings = useBookings();
  const analytics = useAnalytics();
  const faqs = useFaqs();
  const gallery = useGallery();
  const collabs = useCollaborations();
  const siteTexts = useSiteTexts();
  const schedule = useSchedule();
  const settings = useSettings();
  const notifications = useAdminNotifications(auth.isLoggedIn, bookings.fetchBookings);
  const statusConfig = useStatusConfig();

  /* ---- Sidebar items (built here so labels re-render on locale change) ---- */
  const sidebarItems: SidebarItem[] = [
    { key: "appointments", icon: CalendarDays, label: t("admin.nav_appointments") },
    { key: "schedule", icon: Clock, label: "زمان‌بندی" },
    { key: "analytics", icon: BarChart3, label: t("admin.nav_analytics") },
    { key: "faq", icon: HelpCircle, label: "سوالات متداول" },
    { key: "gallery", icon: ImageIcon, label: "گالری" },
    { key: "collaborations", icon: Stethoscope, label: "دندانپزشکان" },
    { key: "site_text", icon: Type, label: "متن سایت" },
    { key: "settings", icon: SettingsIcon, label: t("admin.nav_settings") },
  ];

  /* ---- Refresh button dispatcher ---- */
  const handleRefresh = () => {
    bookings.fetchBookings(true);
    if (activeTab === "analytics") analytics.fetchAnalytics();
    if (activeTab === "faq") faqs.fetchFaqs();
    if (activeTab === "gallery") gallery.fetchGallery();
    if (activeTab === "collaborations") collabs.fetchCollabs();
    if (activeTab === "site_text") siteTexts.fetchSiteTexts();
    if (activeTab === "schedule") {
      schedule.fetchSlotConfig();
      schedule.fetchScheduleSlots();
      schedule.fetchClosedSlots();
    }
  };

  /* ---- Logout (orchestrates cross-domain reset) ---- */
  const handleLogout = () => {
    auth.handleLogout();
    bookings.reset();
    analytics.reset();
  };

  /* ════════════════════════════════════════════════════════════════════════
     EFFECTS (page-level only — fetch on login, fetch on tab change, auto-refresh 30s)
     ════════════════════════════════════════════════════════════════════════ */

  /* ---- Fetch bookings on login ---- */
  useEffect(() => {
    if (auth.isLoggedIn) {
      queueMicrotask(() => bookings.fetchBookings(true));
      // Subscribe to push notifications on login (if permission already granted)
      if (notifications.permission === "granted") {
        notifications.subscribeToPush();
      }
    }
  }, [auth.isLoggedIn, bookings, notifications.permission, notifications.subscribeToPush]);

  /* ---- Fetch data on tab change ---- */
  useEffect(() => {
    if (!auth.isLoggedIn) return;
    queueMicrotask(() => {
      if (activeTab === "analytics") analytics.fetchAnalytics();
      if (activeTab === "faq") faqs.fetchFaqs();
      if (activeTab === "gallery") gallery.fetchGallery();
      if (activeTab === "collaborations") collabs.fetchCollabs();
      if (activeTab === "site_text") siteTexts.fetchSiteTexts();
      if (activeTab === "schedule") { schedule.fetchSlotConfig(); schedule.fetchScheduleSlots(); schedule.fetchClosedSlots(); }
    });
  }, [activeTab, auth.isLoggedIn, analytics, faqs, gallery, collabs, siteTexts, schedule]);

  /* ---- Auto-refresh every 30s (bookings only) ---- */
  useEffect(() => {
    if (!auth.isLoggedIn) return;
    const id = setInterval(() => bookings.fetchBookings(false), 30000);
    return () => clearInterval(id);
  }, [auth.isLoggedIn, bookings]);

  /* ════════════════════════════════════════════════════════════════════════
     AUTH GATE
     ════════════════════════════════════════════════════════════════════════ */
  if (auth.authChecking || !auth.isLoggedIn) {
    return (
      <AdminLogin
        authChecking={auth.authChecking}
        username={auth.username}
        password={auth.password}
        loginError={auth.loginError}
        loginLoading={auth.loginLoading}
        onUsernameChange={auth.setUsername}
        onPasswordChange={auth.setPassword}
        onSubmit={auth.handleLogin}
      />
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     DASHBOARD SHELL
     ════════════════════════════════════════════════════════════════════════ */
  const sidebarWidth = getSidebarWidth(sidebarCollapsed);

  return (
    <div className="min-h-screen bg-[#F7F9FB] flex" dir={dir}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => { setActiveTab(tab); setMobileMenuOpen(false); }}
        sidebarItems={sidebarItems}
        adminInitial={auth.adminInitial}
        adminDisplayName={auth.adminDisplayName}
        adminEmail={auth.adminEmail}
        onLogout={handleLogout}
        isRTL={isRTL}
        isDesktop={isDesktop}
      />

      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginInlineStart: isDesktop ? sidebarWidth : 0 }}
      >
        <AdminHeader
          activeTab={activeTab}
          searchQuery={bookings.searchQuery}
          onSearchChange={bookings.setSearchQuery}
          onRefresh={handleRefresh}
          refreshing={bookings.bookingsLoading}
          notifySupported={notifications.isSupported}
          notifyPermission={notifications.permission}
          notifyBadge={notifications.totalBadge}
          notificationData={notifications.notificationData}
          showNotifyDropdown={showNotifyDropdown}
          onToggleNotifyDropdown={async () => {
            setShowNotifyDropdown((p) => !p);
            if (notifications.isSupported && notifications.permission !== "granted") {
              await notifications.requestPermission();
            }
            notifications.clearBadge();
          }}
          onRequestNotifyPermission={notifications.requestPermission}
          pendingCount={bookings.stats.pending}
          isRTL={isRTL}
          isDesktop={isDesktop}
          onOpenMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === "appointments" && (
            <AppointmentsTab
              stats={bookings.stats}
              filterStatus={bookings.filterStatus}
              onFilterStatusChange={(s) => { bookings.setFilterStatus(s); bookings.setBookingsPage(1); }}
              searchQuery={bookings.searchQuery}
              onSearchChange={bookings.setSearchQuery}
              isDesktop={isDesktop}
              bookings={bookings.bookings}
              paginatedBookings={bookings.paginatedBookings}
              bookingsPage={bookings.bookingsPage}
              totalPagesBookings={bookings.totalPagesBookings}
              totalBookingsCount={bookings.filteredBookings.length}
              onPageChange={bookings.setBookingsPage}
              actionLoading={bookings.actionLoading}
              statusConfig={statusConfig}
              onSelectBooking={(b) => { bookings.setSelectedBooking(b); bookings.setShowDetailPanel(true); }}
              onUpdateStatus={bookings.updateStatus}
              onDelete={bookings.deleteBooking}
              onNewBooking={() => {
                bookings.setShowCreateBooking(true);
                if (bookings.newBookingData.date) bookings.fetchAvailableSlots(bookings.newBookingData.date);
              }}
              bookingsLoading={bookings.bookingsLoading}
              bookingsError={bookings.bookingsError}
              onRetry={() => bookings.fetchBookings(true)}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsTab analytics={analytics.analytics} loading={analytics.analyticsLoading} />
          )}

          {activeTab === "faq" && <FaqTab faqs={faqs} />}

          {activeTab === "gallery" && <GalleryTab gallery={gallery} />}

          {activeTab === "collaborations" && <CollaborationsTab collabs={collabs} />}

          {activeTab === "site_text" && <SiteTextTab siteTexts={siteTexts} />}

          {activeTab === "settings" && (
            <SettingsTab
              settingsData={settings.settingsData}
              onSettingsDataChange={settings.setSettingsData}
              workingHours={settings.workingHours}
              onWorkingHoursChange={settings.setWorkingHours}
              adminDisplayName={auth.adminDisplayName}
              adminEmail={auth.adminEmail}
              onSaveProfile={settings.handleSaveProfile}
              onSaveWorkingHours={settings.handleSaveWorkingHours}
            />
          )}

          {activeTab === "schedule" && (
            <ScheduleTab
              schedule={schedule}
              settings={{
                workingHours: settings.workingHours,
                setWorkingHours: settings.setWorkingHours,
                handleSaveWorkingHours: settings.handleSaveWorkingHours,
              }}
            />
          )}
        </main>
      </div>

      {/* ══════════ Booking Detail Panel ══════════ */}
      {bookings.showDetailPanel && bookings.selectedBooking && (
        <BookingDetailPanel
          booking={bookings.selectedBooking}
          editing={bookings.editingBooking}
          editData={bookings.editBookingData}
          statusConfig={statusConfig}
          actionLoading={bookings.actionLoading}
          onEditDataChange={bookings.setEditBookingData}
          onStartEdit={() => {
            bookings.setEditingBooking(true);
            bookings.setEditBookingData({
              date: bookings.selectedBooking!.date,
              time: bookings.selectedBooking!.time,
              notes: bookings.selectedBooking!.notes || "",
            });
          }}
          onCancelEdit={() => bookings.setEditingBooking(false)}
          onSaveEdit={bookings.handleSaveEdit}
          onClose={() => { bookings.setShowDetailPanel(false); bookings.setEditingBooking(false); }}
          onUpdateStatus={bookings.updateStatus}
          onDelete={bookings.deleteBooking}
        />
      )}

      {/* ══════════ Create Booking Modal ══════════ */}
      {bookings.showCreateBooking && (
        <CreateBookingModal
          data={bookings.newBookingData}
          onDataChange={bookings.setNewBookingData}
          availableSlots={bookings.availableSlots}
          loadingSlots={bookings.loadingSlots}
          creating={bookings.creatingBooking}
          onClose={() => bookings.setShowCreateBooking(false)}
          onCreate={bookings.handleCreateBooking}
          onDateChange={(date) => {
            bookings.setNewBookingData({ ...bookings.newBookingData, date, time: "" });
            bookings.fetchAvailableSlots(date);
          }}
        />
      )}
    </div>
  );
}

/* ── Unused-but-required import to satisfy `LucideIcon` type re-export ── */
export type { LucideIcon };
