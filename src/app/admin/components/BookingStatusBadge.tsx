"use client";

import { Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "@/i18n/context";
import type { BookingStatus } from "../types";

export interface StatusConfigEntry {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  icon: LucideIcon;
}

export type StatusConfig = Record<BookingStatus, StatusConfigEntry>;

/* ---- Status config (built from useI18n so labels are translated) ---- */
export function useStatusConfig(): StatusConfig {
  const { t } = useI18n();
  return {
    pending: {
      label: t("admin.status_pending"),
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200/60",
      dot: "bg-amber-400",
      icon: Clock,
    },
    confirmed: {
      label: t("admin.status_confirmed"),
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200/60",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
    rejected: {
      label: t("admin.status_rejected"),
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200/60",
      dot: "bg-rose-500",
      icon: XCircle,
    },
    rescheduled: {
      label: t("admin.status_rescheduled"),
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200/60",
      dot: "bg-sky-500",
      icon: RefreshCw,
    },
  };
}

/* ---- Inline status badge (used in bookings list + detail panel) ---- */
export function BookingStatusBadge({
  status,
  config,
}: {
  status: BookingStatus;
  config: StatusConfigEntry;
}) {
  const sc = config;
  const StatusIcon = sc.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${sc.bg} ${sc.text} border ${sc.border}`}
    >
      <StatusIcon className="w-3.5 h-3.5" />
      {sc.label}
    </span>
  );
}

/* ---- Variant used inside the bookings list rows (compact, no icon) ---- */
export function BookingStatusDot({
  status,
  config,
}: {
  status: BookingStatus;
  config: StatusConfigEntry;
}) {
  void status;
  const sc = config;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text} border ${sc.border} shrink-0`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
      {sc.label}
    </span>
  );
}
