"use client";

import { useState, useCallback } from "react";
import {
  slotConfigApi,
  slotsApi,
  closedSlotsApi,
  ApiError,
  TimeSlot,
  ClosedSlotItem,
} from "@/lib/api";
import { toast } from "sonner";
import type { SlotConfigForm } from "../types";

export function useSchedule() {
  const [slotConfig, setSlotConfig] = useState<SlotConfigForm>({ slot_duration: 20, buffer_time: 0 });
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [scheduleSlots, setScheduleSlots] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [closedSlotsList, setClosedSlotsList] = useState<ClosedSlotItem[]>([]);
  const [closeSlotReason, setCloseSlotReason] = useState("");
  const [showCloseDayModal, setShowCloseDayModal] = useState(false);

  /* ---- Fetch slot config ---- */
  const fetchSlotConfig = useCallback(async () => {
    try {
      const result = await slotConfigApi.get();
      setSlotConfig({ slot_duration: result.config.slot_duration, buffer_time: result.config.buffer_time });
    } catch {
      // use defaults
    }
  }, []);

  /* ---- Fetch schedule slots ---- */
  const fetchScheduleSlots = useCallback(async (date?: string) => {
    const d = date || scheduleDate;
    if (!d) return;
    setScheduleLoading(true);
    try {
      const result = await slotsApi.get(d);
      setScheduleSlots(result.slots);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری اسلات‌ها";
      toast.error(message);
    } finally {
      setScheduleLoading(false);
    }
  }, [scheduleDate]);

  /* ---- Fetch closed slots ---- */
  const fetchClosedSlots = useCallback(async (month?: string) => {
    try {
      const result = await closedSlotsApi.list(month ? { month } : undefined);
      setClosedSlotsList(result.closed_slots);
    } catch {
      // ignore
    }
  }, []);

  /* ---- Schedule actions ---- */
  const handleSaveSlotConfig = async () => {
    try {
      await slotConfigApi.update({
        slotDuration: slotConfig.slot_duration,
        bufferTime: slotConfig.buffer_time,
      });
      toast.success("تنظیمات زمان‌بندی ذخیره شد");
      await fetchScheduleSlots(); // refresh slots with new config
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره تنظیمات";
      toast.error(message);
    }
  };

  const handleCloseSlot = async (date: string, time?: string | null) => {
    try {
      await closedSlotsApi.close({
        date,
        time: time || null,
        reason: closeSlotReason || undefined,
      });
      toast.success(time ? "اسلات بسته شد" : "روز کامل بسته شد");
      setCloseSlotReason("");
      setShowCloseDayModal(false);
      await fetchScheduleSlots();
      await fetchClosedSlots();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بستن اسلات";
      toast.error(message);
    }
  };

  const handleReopenSlot = async (id: string) => {
    try {
      await closedSlotsApi.reopen(id);
      toast.success("اسلات باز شد");
      await fetchScheduleSlots();
      await fetchClosedSlots();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در باز کردن اسلات";
      toast.error(message);
    }
  };

  const handleScheduleDateChange = (newDate: string) => {
    setScheduleDate(newDate);
    fetchScheduleSlots(newDate);
  };

  return {
    slotConfig,
    setSlotConfig,
    scheduleDate,
    setScheduleDate,
    scheduleSlots,
    scheduleLoading,
    closedSlotsList,
    closeSlotReason,
    setCloseSlotReason,
    showCloseDayModal,
    setShowCloseDayModal,
    fetchSlotConfig,
    fetchScheduleSlots,
    fetchClosedSlots,
    handleSaveSlotConfig,
    handleCloseSlot,
    handleReopenSlot,
    handleScheduleDateChange,
  };
}

export type UseScheduleReturn = ReturnType<typeof useSchedule>;
