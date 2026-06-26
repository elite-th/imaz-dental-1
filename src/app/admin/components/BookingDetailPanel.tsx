"use client";

import {
  X,
  Edit3,
  Save,
  Stethoscope,
  CalendarDays,
  Clock,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../utils";
import type { BookingStatus, EditBookingData } from "../types";
import type { Booking } from "@/lib/api";
import type { StatusConfig } from "./BookingStatusBadge";

interface BookingDetailPanelProps {
  booking: Booking;
  editing: boolean;
  editData: EditBookingData;
  statusConfig: StatusConfig;
  actionLoading: string | null;
  onEditDataChange: (d: EditBookingData) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onClose: () => void;
  onUpdateStatus: (id: string, s: BookingStatus) => void;
  onDelete: (id: string) => void;
}

export function BookingDetailPanel({
  booking,
  editing,
  editData,
  statusConfig,
  actionLoading,
  onEditDataChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onClose,
  onUpdateStatus,
  onDelete,
}: BookingDetailPanelProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-end" onClick={onClose}>
      <div className="bg-white h-full w-full max-w-lg overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_title")}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Status & Edit */}
          <div className="flex items-center gap-2">
            {(() => {
              const sc = statusConfig[booking.status];
              const StatusIcon = sc.icon;
              return (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${sc.bg} ${sc.text} border ${sc.border}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {sc.label}
                </span>
              );
            })()}
            <div className="flex-1" />
            {!editing && (
              <button
                onClick={onStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                <Edit3 className="w-3.5 h-3.5" />{t("admin.btn_edit")}
              </button>
            )}
          </div>

          {/* Patient info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
              {booking.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{booking.full_name}</p>
              <p className="text-xs text-gray-400" dir="ltr">{booking.phone}</p>
            </div>
          </div>

          {/* Detail fields */}
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_date")}</label>
                <input type="date" value={editData.date} onChange={(e) => onEditDataChange({ ...editData, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_time")}</label>
                <input type="time" value={editData.time} onChange={(e) => onEditDataChange({ ...editData, time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_notes")}</label>
                <textarea value={editData.notes} onChange={(e) => onEditDataChange({ ...editData, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
              </div>
              <div className="flex gap-2">
                <button onClick={onSaveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
                  <Save className="w-3.5 h-3.5" />{t("admin.btn_save")}
                </button>
                <button onClick={onCancelEdit} className="px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold hover:bg-gray-100" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Stethoscope className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_service")}:</span>
                <span className="font-bold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t(booking.service)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_date")}:</span>
                <span className="font-bold text-gray-900">{toPersianNum(booking.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_time")}:</span>
                <span className="font-bold text-gray-900" dir="ltr">{booking.time}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_phone")}:</span>
                <span className="font-bold text-gray-900" dir="ltr">{booking.phone}</span>
              </div>
              {booking.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                  <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_email")}:</span>
                  <span className="font-bold text-gray-900" dir="ltr">{booking.email}</span>
                </div>
              )}
              {booking.notes && (
                <div className="flex items-start gap-3 text-sm">
                  <FileText className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                  <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_notes")}:</span>
                  <span className="font-bold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{booking.notes}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-50">
                <span style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.created_at")}: {toPersianNum(new Date(booking.created_at).toLocaleDateString("fa-IR"))}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!editing && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              {booking.status === "pending" && (
                <>
                  <button onClick={() => onUpdateStatus(booking.id, "confirmed")} disabled={actionLoading === booking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />{t("admin.btn_confirm")}
                  </button>
                  <button onClick={() => onUpdateStatus(booking.id, "rejected")} disabled={actionLoading === booking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    <XCircle className="w-3.5 h-3.5" />{t("admin.btn_reject")}
                  </button>
                </>
              )}
              {(booking.status === "rejected" || booking.status === "rescheduled") && (
                <button onClick={() => onUpdateStatus(booking.id, "pending")} disabled={actionLoading === booking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <RefreshCw className="w-3.5 h-3.5" />{t("admin.btn_restore")}
                </button>
              )}
              <button onClick={() => onDelete(booking.id)} disabled={actionLoading === booking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-500 border border-rose-200/60 hover:bg-rose-100 transition-all disabled:opacity-50 ms-auto" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                <Trash2 className="w-3.5 h-3.5" />{t("admin.btn_delete")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
