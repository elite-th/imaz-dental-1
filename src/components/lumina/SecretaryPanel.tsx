"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Search,
  Filter,
  CalendarDays,
  Phone,
  Mail,
  Stethoscope,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Loader2,
  Plus,
  Edit3,
  Save,
  Info,
  Settings,
  Bell,
  BellRing,
  UserPlus,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import {
  bookingsApi,
  authApi,
  setAuthToken,
  clearAuthToken,
  ApiError,
  Booking,
  BookingStats,
} from "@/lib/api";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type BookingStatus = Booking["status"];

const SERVICE_OPTIONS = [
  { value: "booking.svc_implants", label: "ایمپلنت دیجیتال و پیوند استخوان" },
  { value: "booking.svc_rootcanal", label: "درمان تخصصی ریشه" },
  { value: "booking.svc_makeover", label: "طراحی لبخند و زیبایی" },
  { value: "booking.svc_ortho", label: "ارتودنسی" },
  { value: "booking.svc_prosthetics", label: "پروتزهای ثابت و متحرک" },
  { value: "booking.svc_pediatric", label: "دندانپزشکی اطفال" },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function SecretaryPanel() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  /* ---- Panel state ---- */
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ---- Auth state ---- */
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  /* ---- Bookings state ---- */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apiStats, setApiStats] = useState<BookingStats | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ---- Edit booking state ---- */
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ date: "", time: "", notes: "", fullName: "", phone: "", email: "", service: "" });
  const [editLoading, setEditLoading] = useState(false);

  /* ---- Create booking state ---- */
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({ fullName: "", phone: "", email: "", service: "", date: "", time: "", notes: "" });
  const [creatingBooking, setCreatingBooking] = useState(false);

  /* ---- Toast state ---- */
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  /* ---- Notification state ---- */
  const {
    permission: notifyPermission,
    notificationData,
    totalBadge: notifyBadge,
    requestPermission: requestNotifyPermission,
    showNotification: showBrowserNotification,
    pollNotifications,
    updateLastChecked,
    clearBadge,
    isSupported: notifySupported,
  } = useBrowserNotifications();
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  /* ---- Hardcoded admin credentials (frontend-only auth) ---- */
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "Imaz@2026";

  /* ---- Check auth on mount ---- */
  useEffect(() => {
    if (!isOpen) return;
    const loggedIn = localStorage.getItem("imaz-admin-logged-in");
    if (loggedIn === "true") {
      queueMicrotask(() => setIsLoggedIn(true));
    }
  }, [isOpen]);

  /* ================================================================ */
  /*  Data Fetching                                                    */
  /* ================================================================ */

  const fetchBookings = useCallback(async (showLoading = true) => {
    if (showLoading) setBookingsLoading(true);
    setBookingsError(null);
    try {
      const result = await bookingsApi.list();
      setBookings(result.bookings);
      setApiStats(result.stats);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.load_error");
      setBookingsError(message);
    } finally {
      if (showLoading) setBookingsLoading(false);
    }
  }, [t]);

  /* ---- Fetch data on login ---- */
  useEffect(() => {
    if (!isLoggedIn || !isOpen) return;
    queueMicrotask(() => fetchBookings(true));
  }, [isLoggedIn, isOpen, fetchBookings]);

  /* ---- Auto-refresh bookings every 30s ---- */
  useEffect(() => {
    if (!isLoggedIn || !isOpen) return;
    const interval = setInterval(() => fetchBookings(false), 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isOpen, fetchBookings]);

  /* ---- Poll for notifications every 5s ---- */
  useEffect(() => {
    if (!isLoggedIn || !isOpen) return;
    // Initial poll
    pollNotifications().then((data) => {
      if (data) updateLastChecked(data.lastChecked);
    });
    const interval = setInterval(async () => {
      const data = await pollNotifications();
      if (!data) return;
      // Show browser notification for new bookings
      if (data.newBookings > 0) {
        showBrowserNotification(t("admin.notify_new_booking"), {
          body: `${data.newBookings} ${t("admin.notify_new_bookings_count")}`,
          tag: "new-bookings",
        });
      }
      if (data.newPatients > 0) {
        showBrowserNotification(t("admin.notify_new_patient"), {
          body: `${data.newPatients} ${t("admin.notify_new_patients_count")}`,
          tag: "new-patients",
        });
      }
      // Show browser notification for new messages
      if (data.unreadMessages > 0) {
        showBrowserNotification(t("admin.notify_new_message"), {
          body: `${data.unreadMessages} ${t("admin.notify_new_messages_count")}`,
          tag: "new-messages",
        });
      }
      updateLastChecked(data.lastChecked);
    }, 5000);
    return () => clearInterval(interval);
  }, [isLoggedIn, isOpen, pollNotifications, showBrowserNotification, updateLastChecked, t]);

  /* ================================================================ */
  /*  Auth Actions                                                     */
  /* ================================================================ */

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    // Frontend credential check — no backend auth needed
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      localStorage.setItem("imaz-admin-logged-in", "true");
      setLoginLoading(false);
      return;
    }

    setLoginError("نام کاربری یا رمز عبور اشتباه است");
    setLoginLoading(false);
  };

  const handleLogout = () => {
    clearAuthToken();
    localStorage.removeItem("imaz-admin-logged-in");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setBookings([]);
    setApiStats(null);
  };

  /* ================================================================ */
  /*  Booking Actions                                                  */
  /* ================================================================ */

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    setActionLoading(id);
    try {
      await bookingsApi.updateStatus(id, newStatus);
      showToast(t("admin.status_updated"), "success");
      await fetchBookings(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("admin.action_error"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm(t("admin.confirm_delete"))) return;
    setActionLoading(id);
    try {
      await bookingsApi.delete(id);
      showToast(t("admin.booking_deleted"), "success");
      await fetchBookings(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("admin.action_error"), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const startEdit = (b: Booking) => {
    setEditingBookingId(b.id);
    setEditData({
      date: b.date,
      time: b.time,
      notes: b.notes || "",
      fullName: b.full_name,
      phone: b.phone,
      email: b.email || "",
      service: b.service,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBookingId) return;
    setEditLoading(true);
    try {
      await bookingsApi.update(editingBookingId, {
        fullName: editData.fullName,
        phone: editData.phone,
        email: editData.email || undefined,
        service: editData.service,
        date: editData.date,
        time: editData.time,
        notes: editData.notes || undefined,
      });
      showToast(t("admin.status_updated"), "success");
      setEditingBookingId(null);
      await fetchBookings(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("admin.action_error"), "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!newBooking.fullName || !newBooking.phone || !newBooking.service || !newBooking.date || !newBooking.time) {
      showToast(t("admin.action_error"), "error");
      return;
    }
    setCreatingBooking(true);
    try {
      await bookingsApi.create({
        fullName: newBooking.fullName,
        phone: newBooking.phone,
        email: newBooking.email || undefined,
        service: newBooking.service,
        date: newBooking.date,
        time: newBooking.time,
        notes: newBooking.notes || undefined,
      });
      showToast(t("admin.status_updated"), "success");
      setShowCreateBooking(false);
      setNewBooking({ fullName: "", phone: "", email: "", service: "", date: "", time: "", notes: "" });
      await fetchBookings(false);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : t("admin.action_error"), "error");
    } finally {
      setCreatingBooking(false);
    }
  };

  /* ================================================================ */
  /*  Computed                                                         */
  /* ================================================================ */

  const stats: BookingStats = apiStats || {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
    rescheduled: bookings.filter((b) => b.status === "rescheduled").length,
  };

  const filteredBookings = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const matchSearch =
      !searchQuery ||
      b.full_name.includes(searchQuery) ||
      b.phone.includes(searchQuery) ||
      b.service.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  /* ---- Status badge ---- */
  const statusBadge = (status: BookingStatus) => {
    const map = {
      pending: { label: t("admin.status_pending"), cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
      confirmed: { label: t("admin.status_confirmed"), cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
      rejected: { label: t("admin.status_rejected"), cls: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
      rescheduled: { label: t("admin.status_rescheduled"), cls: "bg-blue-50 text-blue-700 border-blue-200", icon: RefreshCw },
    };
    const s = map[status];
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${s.cls}`}>
        <Icon className="w-3 h-3" />
        {s.label}
      </span>
    );
  };

  /* ---- Action buttons for each status ---- */
  const actionButtons = (b: Booking) => {
    const btnBase = "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95";
    const isLoading = actionLoading === b.id;
    if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-teal-500" />;

    switch (b.status) {
      case "pending":
        return (
          <>
            <button onClick={() => updateStatus(b.id, "confirmed")} className={`${btnBase} bg-emerald-500 text-white hover:bg-emerald-600`}>
              {t("admin.btn_confirm")}
            </button>
            <button onClick={() => updateStatus(b.id, "rejected")} className={`${btnBase} bg-red-500 text-white hover:bg-red-600`}>
              {t("admin.btn_reject")}
            </button>
            <button onClick={() => updateStatus(b.id, "rescheduled")} className={`${btnBase} bg-blue-500 text-white hover:bg-blue-600`}>
              {t("admin.btn_reschedule")}
            </button>
          </>
        );
      case "confirmed":
        return (
          <>
            <button onClick={() => updateStatus(b.id, "rescheduled")} className={`${btnBase} bg-blue-500 text-white hover:bg-blue-600`}>
              {t("admin.btn_reschedule")}
            </button>
            <button onClick={() => updateStatus(b.id, "rejected")} className={`${btnBase} bg-red-100 text-red-600 hover:bg-red-200`}>
              {t("admin.btn_reject")}
            </button>
          </>
        );
      case "rescheduled":
        return (
          <>
            <button onClick={() => updateStatus(b.id, "confirmed")} className={`${btnBase} bg-emerald-500 text-white hover:bg-emerald-600`}>
              {t("admin.btn_confirm")}
            </button>
            <button onClick={() => updateStatus(b.id, "rejected")} className={`${btnBase} bg-red-100 text-red-600 hover:bg-red-200`}>
              {t("admin.btn_reject")}
            </button>
          </>
        );
      case "rejected":
        return (
          <button onClick={() => updateStatus(b.id, "pending")} className={`${btnBase} bg-amber-100 text-amber-700 hover:bg-amber-200`}>
            {t("admin.btn_restore")}
          </button>
        );
    }
  };

  /* ---- Input class ---- */
  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 text-xs outline-none transition-all";
  const btnPrimary = "px-4 py-2 rounded-lg text-white font-bold text-xs transition-all hover:shadow-lg active:scale-95";
  const btnSecondary = "px-3 py-2 rounded-lg text-xs font-bold transition-all border border-gray-200 hover:bg-gray-50";

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <>
      {/* ════ Trigger Button ════ */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 hover:bg-teal-50"
        style={{ color: "rgba(13,58,53,0.5)" }}
        aria-label={t("admin.open_panel")}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{t("admin.open_panel")}</span>
      </button>

      {/* ════ Full-Screen Panel ════ */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className={`relative w-full max-w-2xl ${isRTL ? "mr-auto" : "ml-auto"} bg-[#f0f5f3] shadow-2xl flex flex-col overflow-hidden`}>

            {/* ── Login Screen ── */}
            {!isLoggedIn ? (
              <div className="flex-1 flex items-center justify-center p-6" style={{ background: "linear-gradient(135deg,#092824 0%,#0D3A35 40%,#1B7A6E 100%)" }}>
                <div className="w-full max-w-sm">
                  <button onClick={() => setIsOpen(false)} className="absolute top-4 start-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all">
                    <X className="w-4 h-4" />
                  </button>

                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-teal-300" />
                    </div>
                    <h2 className="text-xl font-extrabold text-white mb-1">{t("admin.title")}</h2>
                    <p className="text-teal-300/60 text-xs">{t("admin.subtitle")}</p>
                  </div>

                  <form onSubmit={handleLogin} className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl shadow-black/20">
                    {loginError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs mb-4 font-medium">
                        {loginError}
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{t("admin.username")}</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} disabled={loginLoading} className={inputCls} placeholder={t("admin.username_placeholder")} />
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">{t("admin.password")}</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loginLoading} className={inputCls} placeholder={t("admin.password_placeholder")} />
                    </div>
                    <button type="submit" disabled={loginLoading} className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:shadow-lg hover:shadow-teal-500/25 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: "linear-gradient(135deg,#1B7A6E,#2DA89E)" }}>
                      {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("admin.login_btn")}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-3">{t("admin.login_hint")}</p>
                  </form>
                </div>
              </div>
            ) : (
              <>
                {/* ── Top Bar ── */}
                <div className="bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#1B7A6E,#2DA89E)" }}>
                      <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-gray-900 text-xs">{t("admin.dashboard_title")}</h2>
                      <p className="text-[9px] text-gray-400">ایماز دنتال</p>
                    </div>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t("admin.online_status")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Notification Bell */}
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowNotifyDropdown(!showNotifyDropdown);
                          clearBadge();
                        }}
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 transition-all"
                        aria-label={t("admin.notify_bell_title")}
                      >
                        {notifyBadge > 0 ? (
                          <BellRing className="w-4 h-4 text-teal-600" />
                        ) : (
                          <Bell className="w-4 h-4 text-gray-400" />
                        )}
                        {notifyBadge > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                            {notifyBadge > 9 ? "9+" : notifyBadge}
                          </span>
                        )}
                      </button>

                      {/* Notification Dropdown */}
                      {showNotifyDropdown && (
                        <div className="absolute end-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20 min-w-[200px]">
                          <div className="px-3 py-1.5 border-b border-gray-100">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{t("admin.notify_bell_title")}</p>
                          </div>

                          {notifyPermission !== "granted" && notifySupported && (
                            <button
                              onClick={requestNotifyPermission}
                              className="w-full text-start px-3 py-2.5 text-xs text-teal-700 hover:bg-teal-50 transition-all flex items-center gap-2"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              {t("admin.notify_enable")}
                            </button>
                          )}

                          {notifyPermission === "granted" && (
                            <div className="px-3 py-1.5 text-[10px] text-emerald-600 font-semibold flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {t("admin.notify_enabled")}
                            </div>
                          )}

                          {notifyPermission === "denied" && (
                            <div className="px-3 py-1.5 text-[10px] text-amber-600 font-semibold">
                              {t("admin.notify_disabled")}
                            </div>
                          )}

                          <div className="border-t border-gray-100 mt-1 pt-1">
                            {notifyBadge === 0 ? (
                              <div className="px-3 py-3 text-[11px] text-gray-400 text-center">
                                {t("admin.notify_no_new")}
                              </div>
                            ) : (
                              <>
                                {notificationData.newBookings > 0 && (
                                  <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2">
                                    <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
                                    <span>{notificationData.newBookings} {t("admin.notify_new_bookings_count")}</span>
                                  </div>
                                )}
                                {notificationData.newPatients > 0 && (
                                  <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2">
                                    <UserPlus className="w-3.5 h-3.5 text-teal-500" />
                                    <span>{notificationData.newPatients} {t("admin.notify_new_patients_count")}</span>
                                  </div>
                                )}
                                {notificationData.unreadMessages > 0 && (
                                  <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2">
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

                    <button onClick={handleLogout} className="text-[10px] text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition-all flex items-center gap-1">
                      <LogOut className="w-3 h-3" />
                      {t("admin.logout")}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">

                  {/* ════════════════════════════════════════════════════════
                       APPOINTMENTS
                       ════════════════════════════════════════════════════════ */}
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { label: t("admin.stat_total"), value: stats.total, c1: "#374151", c2: "#1f2937", icon: "📋" },
                        { label: t("admin.stat_pending"), value: stats.pending, c1: "#f59e0b", c2: "#b45309", icon: "⏳" },
                        { label: t("admin.stat_confirmed"), value: stats.confirmed, c1: "#10b981", c2: "#047857", icon: "✅" },
                      ].map((c) => (
                        <div key={c.label} className="rounded-xl p-3 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg,${c.c1},${c.c2})` }}>
                          <span className="absolute top-1 start-1 text-lg opacity-20">{c.icon}</span>
                          <p className="text-[9px] font-medium opacity-80">{c.label}</p>
                          <p className="text-xl font-extrabold">{c.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Search + Filter + Create */}
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("admin.search_placeholder")} className="w-full ps-9 pe-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all" />
                      </div>
                      <div className="relative">
                        <button onClick={() => setShowFilterDropdown(!showFilterDropdown)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:border-teal-300 transition-all">
                          <Filter className="w-3 h-3" />
                          {filterStatus === "all" ? t("admin.filter_all") : t(`admin.status_${filterStatus}`)}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                        {showFilterDropdown && (
                          <div className="absolute end-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-10 min-w-[140px]">
                            {(["all", "pending", "confirmed", "rejected", "rescheduled"] as const).map((s) => (
                              <button key={s} onClick={() => { setFilterStatus(s); setShowFilterDropdown(false); }} className={`w-full text-start px-3 py-2 text-xs transition-all ${filterStatus === s ? "bg-teal-50 text-teal-700 font-bold" : "text-gray-600 hover:bg-gray-50"}`}>
                                {s === "all" ? t("admin.filter_all") : t(`admin.status_${s}`)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button onClick={() => setShowCreateBooking(true)} className="flex items-center gap-1 px-3 py-2 rounded-lg text-white text-xs font-bold" style={{ background: "linear-gradient(135deg,#1B7A6E,#2DA89E)" }}>
                        <Plus className="w-3 h-3" />
                        {t("admin.btn_new_booking")}
                      </button>
                    </div>

                    {/* Loading/Error */}
                    {bookingsLoading && (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                      </div>
                    )}
                    {bookingsError && !bookingsLoading && (
                      <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                        <Info className="w-4 h-4 shrink-0" />
                        {bookingsError}
                        <button onClick={() => fetchBookings(true)} className="ms-auto text-red-500 hover:text-red-700 font-bold">{t("admin.retry")}</button>
                      </div>
                    )}

                    {/* Bookings List */}
                    {!bookingsLoading && !bookingsError && (
                      <div className="space-y-3">
                        {filteredBookings.length === 0 ? (
                          <div className="text-center py-12">
                            <span className="text-4xl opacity-30">📭</span>
                            <p className="text-gray-400 font-medium text-sm mt-2">{t("admin.no_bookings")}</p>
                          </div>
                        ) : (
                          filteredBookings.map((b) => (
                            <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                              {editingBookingId === b.id ? (
                                /* ── Edit Mode ── */
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                      <Edit3 className="w-3.5 h-3.5 text-teal-500" />
                                      {t("admin.edit_booking_title")}
                                    </h3>
                                    <button onClick={() => setEditingBookingId(null)} className="text-xs text-gray-400 hover:text-gray-600">
                                      {t("admin.btn_cancel")}
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_name")}</label>
                                      <input value={editData.fullName} onChange={(e) => setEditData((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_phone")}</label>
                                      <input value={editData.phone} onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))} className={inputCls} dir="ltr" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_date")}</label>
                                      <input type="text" value={editData.date} onChange={(e) => setEditData((p) => ({ ...p, date: e.target.value }))} className={inputCls} placeholder="1404/03/15" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_time")}</label>
                                      <input type="time" value={editData.time} onChange={(e) => setEditData((p) => ({ ...p, time: e.target.value }))} className={inputCls} dir="ltr" />
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_service")}</label>
                                      <select value={editData.service} onChange={(e) => setEditData((p) => ({ ...p, service: e.target.value }))} className={inputCls}>
                                        {SERVICE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_email")}</label>
                                      <input value={editData.email} onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))} className={inputCls} dir="ltr" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_notes")}</label>
                                    <input value={editData.notes} onChange={(e) => setEditData((p) => ({ ...p, notes: e.target.value }))} className={inputCls} />
                                  </div>
                                  <div className="flex justify-end gap-2 pt-1">
                                    <button onClick={() => setEditingBookingId(null)} className={btnSecondary}>{t("admin.btn_cancel")}</button>
                                    <button onClick={handleSaveEdit} disabled={editLoading} className={`${btnPrimary} flex items-center gap-1.5 disabled:opacity-60`} style={{ background: "linear-gradient(135deg,#1B7A6E,#2DA89E)" }}>
                                      {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                      {t("admin.btn_save")}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* ── View Mode ── */
                                <>
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm" style={{ background: "linear-gradient(135deg,#e0f2f1,#b2dfdb)" }}>🦷</div>
                                      <div>
                                        <h3 className="font-bold text-gray-900 text-sm">{b.full_name}</h3>
                                        <p className="text-[10px] text-gray-400">{b.created_at}</p>
                                      </div>
                                    </div>
                                    {statusBadge(b.status)}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                                      <Stethoscope className="w-3 h-3 text-teal-500 shrink-0" />
                                      <span className="text-[11px] font-medium text-gray-700 truncate">{t(b.service)}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                                      <CalendarDays className="w-3 h-3 text-teal-500 shrink-0" />
                                      <span className="text-[11px] font-medium text-gray-700" dir="ltr">{b.date} · {b.time}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                                      <Phone className="w-3 h-3 text-teal-500 shrink-0" />
                                      <span className="text-[11px] font-medium text-gray-700" dir="ltr">{b.phone}</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-2 flex items-center gap-2">
                                      <Mail className="w-3 h-3 text-teal-500 shrink-0" />
                                      <span className="text-[11px] font-medium text-gray-700 truncate" dir="ltr">{b.email || "—"}</span>
                                    </div>
                                  </div>

                                  {b.notes && (
                                    <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-2 mb-3">
                                      <p className="text-[10px] text-amber-600 font-bold mb-0.5">{t("admin.notes")}</p>
                                      <p className="text-[11px] text-amber-800">{b.notes}</p>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                                    {actionButtons(b)}
                                    <button onClick={() => startEdit(b)} className="p-1.5 rounded-lg text-gray-300 hover:text-teal-500 hover:bg-teal-50 transition-all" title={t("admin.btn_edit")}>
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => deleteBooking(b.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all" title={t("admin.btn_delete")}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                </div>
              </>
            )}
          </div>

          {/* ── Create Booking Modal ── */}
          {showCreateBooking && isLoggedIn && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateBooking(false)} />
              <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-teal-500" />
                    {t("admin.create_booking_title")}
                  </h3>
                  <button onClick={() => setShowCreateBooking(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_name")} *</label>
                    <input value={newBooking.fullName} onChange={(e) => setNewBooking((p) => ({ ...p, fullName: e.target.value }))} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_phone")} *</label>
                    <input value={newBooking.phone} onChange={(e) => setNewBooking((p) => ({ ...p, phone: e.target.value }))} className={inputCls} dir="ltr" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_service")} *</label>
                    <select value={newBooking.service} onChange={(e) => setNewBooking((p) => ({ ...p, service: e.target.value }))} className={inputCls}>
                      <option value="">{t("booking.select_service")}</option>
                      {SERVICE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_date")} *</label>
                      <input type="text" value={newBooking.date} onChange={(e) => setNewBooking((p) => ({ ...p, date: e.target.value }))} placeholder="1404/03/15" className={inputCls} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_time")} *</label>
                      <input type="time" value={newBooking.time} onChange={(e) => setNewBooking((p) => ({ ...p, time: e.target.value }))} className={inputCls} dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_email")}</label>
                    <input value={newBooking.email} onChange={(e) => setNewBooking((p) => ({ ...p, email: e.target.value }))} className={inputCls} dir="ltr" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 mb-1 block">{t("admin.detail_notes")}</label>
                    <input value={newBooking.notes} onChange={(e) => setNewBooking((p) => ({ ...p, notes: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setShowCreateBooking(false)} className={btnSecondary}>{t("admin.btn_cancel")}</button>
                    <button onClick={handleCreateBooking} disabled={creatingBooking} className={`${btnPrimary} flex items-center gap-1.5 disabled:opacity-60`} style={{ background: "linear-gradient(135deg,#1B7A6E,#2DA89E)" }}>
                      {creatingBooking ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      {t("admin.btn_new_booking")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Toast ── */}
          {toast && (
            <div className={`fixed bottom-6 start-1/2 -translate-x-1/2 z-[120] px-5 py-3 rounded-xl shadow-2xl text-sm font-bold transition-all ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
              {toast.message}
            </div>
          )}
        </div>
      )}
    </>
  );
}
