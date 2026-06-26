"use client";

import {
  Settings,
  Clock,
  X,
  Loader2,
  CalendarDays,
  XCircle,
  Save,
} from "lucide-react";
import { useI18n } from "@/i18n/context";
import { toPersianNum } from "../../utils";
import type { UseScheduleReturn } from "../../hooks/useSchedule";
import type { UseSettingsReturn } from "../../hooks/useSettings";

interface ScheduleTabProps {
  schedule: UseScheduleReturn;
  settings: Pick<
    UseSettingsReturn,
    "workingHours" | "setWorkingHours" | "handleSaveWorkingHours"
  >;
}

export function ScheduleTab({ schedule, settings }: ScheduleTabProps) {
  const { t } = useI18n();
  const {
    slotConfig,
    setSlotConfig,
    scheduleDate,
    scheduleSlots,
    scheduleLoading,
    closedSlotsList,
    closeSlotReason,
    setCloseSlotReason,
    showCloseDayModal,
    setShowCloseDayModal,
    handleSaveSlotConfig,
    handleCloseSlot,
    handleReopenSlot,
    handleScheduleDateChange,
  } = schedule;
  const { workingHours, setWorkingHours, handleSaveWorkingHours } = settings;

  return (
    <div>
      {/* ── Slot Configuration ── */}
      <div className="bg-white rounded-2xl border border-gray-100/80 p-5 mb-5">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          <Settings className="w-4 h-4 text-teal-500" />
          تنظیمات زمان‌بندی
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              مدت زمان هر نوبت (دقیقه)
            </label>
            <select
              value={slotConfig.slot_duration}
              onChange={(e) => setSlotConfig({ ...slotConfig, slot_duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {[10, 15, 20, 30, 45, 60].map((d) => (
                <option key={d} value={d}>{toPersianNum(d)} دقیقه</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              فاصله بین نوبت‌ها (دقیقه)
            </label>
            <select
              value={slotConfig.buffer_time}
              onChange={(e) => setSlotConfig({ ...slotConfig, buffer_time: parseInt(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none"
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {[0, 5, 10, 15].map((b) => (
                <option key={b} value={b}>{toPersianNum(b)} دقیقه</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveSlotConfig}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
          >
            <Save className="w-3.5 h-3.5" />ذخیره تنظیمات
          </button>
        </div>
      </div>

      {/* ── Working Hours ── */}
      <div className="bg-white rounded-2xl border border-gray-100/80 p-5 mb-5">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          <Clock className="w-4 h-4 text-teal-500" />
          ساعات کاری
        </h4>
        <div className="space-y-2">
          {workingHours.map((wh, i) => (
            <div key={i} className="flex items-center gap-3">
              <label className="flex items-center gap-2 min-w-[80px]">
                <input
                  type="checkbox"
                  checked={wh.enabled}
                  onChange={() => {
                    const updated = [...workingHours];
                    updated[i] = { ...updated[i], enabled: !updated[i].enabled };
                    setWorkingHours(updated);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>{wh.day}</span>
              </label>
              {wh.enabled ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={wh.open} onChange={(e) => { const updated = [...workingHours]; updated[i] = { ...updated[i], open: e.target.value }; setWorkingHours(updated); }} className="px-3 py-1.5 rounded-lg border border-gray-100 text-xs outline-none focus:border-teal-200" />
                  <span className="text-xs text-gray-400">تا</span>
                  <input type="time" value={wh.close} onChange={(e) => { const updated = [...workingHours]; updated[i] = { ...updated[i], close: e.target.value }; setWorkingHours(updated); }} className="px-3 py-1.5 rounded-lg border border-gray-100 text-xs outline-none focus:border-teal-200" />
                </div>
              ) : (
                <span className="text-xs text-gray-300" style={{ fontFamily: "var(--font-vazirmatn)" }}>تعطیل</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSaveWorkingHours} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
            <Save className="w-3.5 h-3.5" />ذخیره ساعات کاری
          </button>
        </div>
      </div>

      {/* ── Slot Viewer ── */}
      <div className="bg-white rounded-2xl border border-gray-100/80 p-5 mb-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h4 className="text-sm font-bold text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            <CalendarDays className="w-4 h-4 text-teal-500" />
            مشاهده اسلات‌ها
          </h4>
          <div className="flex-1" />
          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => handleScheduleDateChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none"
          />
          <button
            onClick={() => setShowCloseDayModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            <XCircle className="w-3.5 h-3.5" />تعطیل کردن روز
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
            <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> آزاد
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
            <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> رزرو شده
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
            <span className="w-3 h-3 rounded bg-gray-200 border border-gray-300" /> بسته
          </span>
        </div>

        {/* Loading */}
        {scheduleLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        )}

        {/* Slots Grid */}
        {!scheduleLoading && scheduleSlots.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>این روز کاری نیست یا اسلاتی وجود ندارد</p>
          </div>
        )}

        {!scheduleLoading && scheduleSlots.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {scheduleSlots.map((slot) => {
              const isAvailable = slot.status === "available";
              const isBooked = slot.status === "booked";
              const isClosed = slot.status === "closed";

              return (
                <div
                  key={slot.time}
                  className={`relative rounded-xl p-2.5 text-center transition-all duration-200 border cursor-pointer group ${
                    isAvailable
                      ? "bg-emerald-50 border-emerald-200/60 hover:bg-emerald-100 hover:border-emerald-300 hover:shadow-md"
                      : isBooked
                      ? "bg-amber-50 border-amber-200/60 hover:bg-amber-100"
                      : "bg-gray-100 border-gray-200/60 hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    if (isAvailable) {
                      handleCloseSlot(scheduleDate, slot.time);
                    } else if (isClosed && slot.closed_id) {
                      handleReopenSlot(slot.closed_id);
                    }
                  }}
                >
                  <span className={`text-xs font-bold ${isAvailable ? "text-emerald-700" : isBooked ? "text-amber-700" : "text-gray-400"}`} dir="ltr">
                    {slot.time}
                  </span>
                  {isBooked && slot.patient_name && (
                    <p className="text-[9px] text-amber-600 truncate mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{slot.patient_name}</p>
                  )}
                  {isClosed && slot.close_reason && (
                    <p className="text-[9px] text-gray-400 truncate mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{slot.close_reason}</p>
                  )}
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-gray-900 text-white text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    {isAvailable ? "کلیک: بستن اسلات" : isClosed ? "کلیک: باز کردن" : `${slot.patient_name} — ${slot.service ? t(slot.service) : ""}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Slot count summary */}
        {!scheduleLoading && scheduleSlots.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
            <span className="text-[11px] font-bold text-emerald-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              آزاد: {toPersianNum(scheduleSlots.filter(s => s.status === "available").length)}
            </span>
            <span className="text-[11px] font-bold text-amber-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              رزرو شده: {toPersianNum(scheduleSlots.filter(s => s.status === "booked").length)}
            </span>
            <span className="text-[11px] font-bold text-gray-400" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              بسته: {toPersianNum(scheduleSlots.filter(s => s.status === "closed").length)}
            </span>
          </div>
        )}
      </div>

      {/* ── Closed Slots List ── */}
      <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
        <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          <XCircle className="w-4 h-4 text-rose-500" />
          اسلات‌ها و روزهای بسته
        </h4>
        {closedSlotsList.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-300 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هیچ اسلات بسته‌ای وجود ندارد</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {closedSlotsList.map((cs) => (
              <div key={cs.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                  {cs.time ? <Clock className="w-4 h-4 text-rose-400" /> : <CalendarDays className="w-4 h-4 text-rose-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-700" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    {cs.time ? `اسلات ${cs.time}` : "کل روز تعطیل"} — {cs.date}
                  </p>
                  {cs.reason && <p className="text-[10px] text-gray-400" style={{ fontFamily: "var(--font-vazirmatn)" }}>{cs.reason}</p>}
                </div>
                <button
                  onClick={() => handleReopenSlot(cs.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 hover:bg-emerald-100 transition-all"
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  باز کردن
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Close Day Modal */}
      {showCloseDayModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCloseDayModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>تعطیل کردن روز</h3>
              <button onClick={() => setShowCloseDayModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-3" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              آیا می‌خواهید تمام اسلات‌های روز {toPersianNum(scheduleDate)} را ببندید؟
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>دلیل (اختیاری)</label>
              <input
                value={closeSlotReason}
                onChange={(e) => setCloseSlotReason(e.target.value)}
                placeholder="مثلاً: تعطیلی رسمی"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCloseSlot(scheduleDate, null)}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #f43f5e, #e11d48)", fontFamily: "var(--font-vazirmatn)" }}
              >
                بستن کل روز
              </button>
              <button
                onClick={() => setShowCloseDayModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
