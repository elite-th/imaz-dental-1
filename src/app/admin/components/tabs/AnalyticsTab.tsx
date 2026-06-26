"use client";

import {
  BarChart3,
  Users,
  Clock,
  CheckCircle2,
  CalendarDays,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../../utils";
import { CHART_COLORS, STATUS_COLORS } from "../../constants";
import type { AnalyticsData } from "@/lib/api";

interface AnalyticsTabProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

export function AnalyticsTab({ analytics, loading }: AnalyticsTabProps) {
  const { t } = useI18n();

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
        <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.loading_bookings")}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-5" style={{ fontFamily: "var(--font-vazirmatn)" }}>
        {t("admin.analytics_title")}
      </h3>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: t("admin.analytics_total_bookings"), value: analytics.overview.totalBookings, icon: BarChart3, color: "text-teal-500", bg: "bg-teal-50" },
          { label: t("admin.analytics_total_patients"), value: analytics.overview.totalPatients, icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
          { label: t("admin.analytics_pending"), value: analytics.overview.pendingBookings, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: t("admin.analytics_confirmed"), value: analytics.overview.confirmedBookings, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: t("admin.analytics_today"), value: analytics.overview.todayBookings, icon: CalendarDays, color: "text-sky-500", bg: "bg-sky-50" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl bg-white border border-gray-100/80 p-4 hover:shadow-lg hover:shadow-gray-100/50 transition-all group">
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{toPersianNum(card.value)}</p>
            <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Service Distribution PieChart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_by_service")}</h4>
          {analytics.bookingsByService.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.bookingsByService.map((s) => ({ name: t(s.service), value: s.count }))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value"
                >
                  {analytics.bookingsByService.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {analytics.bookingsByService.map((s, i) => (
              <span key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {t(s.service)}
              </span>
            ))}
          </div>
        </div>

        {/* Booking Status BarChart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_by_status")}</h4>
          {analytics.bookingsByStatus.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.bookingsByStatus.map((s) => ({ name: t(`admin.status_${s.status}`), count: s.count, fill: STATUS_COLORS[s.status] || "#6b7280" }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {analytics.bookingsByStatus.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLORS[s.status] || "#6b7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly Trend LineChart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_weekly")}</h4>
          {analytics.weeklyTrend.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="bookings" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="confirmed" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Monthly Trend BarChart */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_monthly")}</h4>
          {analytics.monthlyTrend.length === 0 ? (
            <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.monthlyTrend.map((m) => ({ name: m.month, bookings: m.bookings }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="bookings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
