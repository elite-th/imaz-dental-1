"use client";

import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Phone,
  Mail,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Loader2,
  BarChart3,
  Search,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { Booking, BookingStats } from "@/lib/api";
import type { BookingStatus } from "../../types";
import type { StatusConfig } from "../BookingStatusBadge";
import { Pagination } from "../Pagination";

interface AppointmentsTabProps {
  stats: BookingStats;
  filterStatus: "all" | BookingStatus;
  onFilterStatusChange: (s: "all" | BookingStatus) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  isDesktop: boolean;
  bookings: Booking[];
  paginatedBookings: Booking[];
  bookingsPage: number;
  totalPagesBookings: number;
  totalBookingsCount: number;
  onPageChange: (p: number) => void;
  actionLoading: string | null;
  statusConfig: StatusConfig;
  onSelectBooking: (b: Booking) => void;
  onUpdateStatus: (id: string, s: BookingStatus) => void;
  onDelete: (id: string) => void;
  onNewBooking: () => void;
  bookingsLoading: boolean;
  bookingsError: string | null;
  onRetry: () => void;
}

export function AppointmentsTab({
  stats,
  filterStatus,
  onFilterStatusChange,
  searchQuery,
  onSearchChange,
  isDesktop,
  bookings,
  paginatedBookings,
  bookingsPage,
  totalPagesBookings,
  totalBookingsCount,
  onPageChange,
  actionLoading,
  statusConfig,
  onSelectBooking,
  onUpdateStatus,
  onDelete,
  onNewBooking,
  bookingsLoading,
  bookingsError,
  onRetry,
}: AppointmentsTabProps) {
  const { t } = useI18n();
  void isDesktop; // kept for API parity

  /* ── Mobile search bar (originally inside parent <main>) ── */
  const mobileSearch = (
    <div className="md:hidden mb-4">
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("admin.search_placeholder")}
          className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all"
          style={{ fontFamily: "var(--font-vazirmatn)" }}
        />
      </div>
    </div>
  );

  /* ── Loading state (originally inside parent <main>) ── */
  if (bookingsLoading && bookings.length === 0) {
    return (
      <>
        {mobileSearch}
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 font-medium text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.loading_bookings")}</p>
        </div>
      </>
    );
  }

  /* ── Error state ── */
  if (bookingsError && !bookingsLoading) {
    return (
      <>
        {mobileSearch}
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <p className="text-gray-600 font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.load_error_title")}</p>
          <p className="text-gray-400 text-xs mb-4 text-center max-w-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{bookingsError}</p>
          <button onClick={onRetry} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg active:scale-95" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
            <RefreshCw className="w-4 h-4" />{t("admin.retry")}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {mobileSearch}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: t("admin.stat_total"), value: stats.total, icon: BarChart3, gradient: "from-gray-700 to-gray-900", lightBg: "bg-gray-50", lightIcon: "text-gray-400" },
          { label: t("admin.stat_pending"), value: stats.pending, icon: Clock, gradient: "from-amber-500 to-amber-600", lightBg: "bg-amber-50", lightIcon: "text-amber-500" },
          { label: t("admin.stat_confirmed"), value: stats.confirmed, icon: CheckCircle2, gradient: "from-emerald-500 to-emerald-600", lightBg: "bg-emerald-50", lightIcon: "text-emerald-500" },
          { label: t("admin.stat_rejected"), value: stats.rejected, icon: XCircle, gradient: "from-rose-400 to-rose-500", lightBg: "bg-rose-50", lightIcon: "text-rose-400" },
        ].map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{card.label}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${card.lightBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.lightIcon}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* New Booking Button + Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={onNewBooking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />
          {t("admin.btn_new_booking")}
        </button>
        <div className="flex-1" />
        {(["all", "pending", "confirmed", "rejected", "rescheduled"] as const).map((s) => {
          const isActive = filterStatus === s;
          const count = s === "all" ? stats.total : stats[s];
          return (
            <button
              key={s}
              onClick={() => onFilterStatusChange(s)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                  : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200 hover:text-gray-600"
              }`}
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {s === "all" ? t("admin.filter_all") : t(`admin.status_${s}`)}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.no_bookings")}</p>
            <p className="text-gray-300 text-xs mt-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.no_bookings_sub")}</p>
          </div>
        ) : (
          paginatedBookings.map((b, idx) => {
            const sc = statusConfig[b.status];
            const initials = b.full_name.charAt(0);
            const avatarColors = ["from-teal-400 to-teal-600","from-amber-400 to-amber-600","from-sky-400 to-sky-600","from-rose-400 to-rose-600","from-violet-400 to-violet-600","from-emerald-400 to-emerald-600"];
            const color = avatarColors[idx % avatarColors.length];
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100/80 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 overflow-hidden group">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{b.full_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text} border ${sc.border} shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t(b.service)}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-xs font-bold text-gray-500" dir="ltr">{b.time}</span>
                    </div>
                    <button
                      onClick={() => onSelectBooking(b)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Info row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{b.date}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{b.phone}</span>
                    {b.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{b.email}</span>}
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => onUpdateStatus(b.id, "confirmed")} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />{t("admin.btn_confirm")}
                        </button>
                        <button onClick={() => onUpdateStatus(b.id, "rejected")} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <XCircle className="w-3.5 h-3.5" />{t("admin.btn_reject")}
                        </button>
                      </>
                    )}
                    {(b.status === "rejected" || b.status === "rescheduled") && (
                      <button onClick={() => onUpdateStatus(b.id, "pending")} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        <RefreshCw className="w-3.5 h-3.5" />{t("admin.btn_restore")}
                      </button>
                    )}
                    <button onClick={() => onDelete(b.id)} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-400 border border-gray-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all disabled:opacity-50 ms-auto" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <Trash2 className="w-3.5 h-3.5" />{t("admin.btn_delete")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Pagination
        currentPage={bookingsPage}
        totalPages={totalPagesBookings}
        totalItems={totalBookingsCount}
        onPageChange={onPageChange}
      />
    </>
  );
}
