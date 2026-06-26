"use client";

import { X, Plus, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { SERVICE_OPTIONS } from "../constants";
import type { NewBookingFormData } from "../types";
import type { TimeSlot } from "@/lib/api";

interface CreateBookingModalProps {
  data: NewBookingFormData;
  onDataChange: (d: NewBookingFormData) => void;
  availableSlots: TimeSlot[];
  loadingSlots: boolean;
  creating: boolean;
  onClose: () => void;
  onCreate: () => void;
  onDateChange: (date: string) => void;
}

export function CreateBookingModal({
  data,
  onDataChange,
  availableSlots,
  loadingSlots,
  creating,
  onClose,
  onCreate,
  onDateChange,
}: CreateBookingModalProps) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.create_booking_title")}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_name")} *</label>
            <input value={data.fullName} onChange={(e) => onDataChange({ ...data, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_phone")} *</label>
            <input value={data.phone} onChange={(e) => onDataChange({ ...data, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_email")}</label>
            <input value={data.email} onChange={(e) => onDataChange({ ...data, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_service")} *</label>
            <select value={data.service} onChange={(e) => onDataChange({ ...data, service: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              <option value="">{t("booking.select_service")}</option>
              {SERVICE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_date")} *</label>
              <input type="date" value={data.date} onChange={(e) => onDateChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_time")} *</label>
              {availableSlots.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => onDataChange({ ...data, time: slot.time })}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                          data.time === slot.time
                            ? "bg-teal-600 text-white shadow-md"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100"
                        }`}
                        dir="ltr"
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400" style={{ fontFamily: "var(--font-vazirmatn)" }}>یا ورود دستی:</span>
                    <input type="time" value={data.time} onChange={(e) => onDataChange({ ...data, time: e.target.value })} className="px-3 py-1.5 rounded-lg border border-gray-100 text-xs outline-none focus:border-teal-200" />
                  </div>
                </div>
              ) : (
                <div>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span style={{ fontFamily: "var(--font-vazirmatn)" }}>بارگذاری ساعات...</span>
                    </div>
                  ) : (
                    <input type="time" value={data.time} onChange={(e) => onDataChange({ ...data, time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_notes")}</label>
            <textarea value={data.notes} onChange={(e) => onDataChange({ ...data, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onCreate} disabled={creating} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {t("admin.btn_new_booking")}
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
        </div>
      </div>
    </div>
  );
}
