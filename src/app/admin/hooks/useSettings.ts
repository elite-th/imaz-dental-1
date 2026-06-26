"use client";

import { useState, useEffect } from "react";
import { settingsApi, ApiError } from "@/lib/api";
import { useI18n } from "@/i18n/context";
import { toast } from "sonner";
import type { SettingsFormData, WorkingHour } from "../types";

export function useSettings() {
  const { t } = useI18n();

  const [settingsData, setSettingsData] = useState<SettingsFormData>({
    clinicName: "",
    clinicPhone: "",
    clinicAddress: "",
    socialTelegram: "",
    socialWhatsapp: "",
    socialBale: "",
    socialYoutube: "",
    socialInstagram: "",
  });

  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([
    { day: "شنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "یکشنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "دوشنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "سه‌شنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "چهارشنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "پنجشنبه", open: "09:00", close: "14:00", enabled: true },
    { day: "جمعه", open: "", close: "", enabled: false },
  ]);

  /* ---- Load settings from database ---- */
  useEffect(() => {
    (async () => {
      try {
        const result = await settingsApi.get();
        const s = result.settings;
        setSettingsData({
          clinicName: s.clinic_name || "",
          clinicPhone: s.clinic_phone || "",
          clinicAddress: s.clinic_address || "",
          socialTelegram: s.social_telegram || "",
          socialWhatsapp: s.social_whatsapp || "",
          socialBale: s.social_bale || "",
          socialYoutube: s.social_youtube || "",
          socialInstagram: s.social_instagram || "",
        });
        if (s.working_hours) {
          try {
            setWorkingHours(JSON.parse(s.working_hours));
          } catch {
            // ignore invalid JSON
          }
        }
      } catch {
        // ignore — use defaults
      }
    })();
  }, []);

  /* ---- Settings save ---- */
  const handleSaveProfile = async () => {
    try {
      await settingsApi.update({
        clinic_name: settingsData.clinicName,
        clinic_phone: settingsData.clinicPhone,
        clinic_address: settingsData.clinicAddress,
        social_telegram: settingsData.socialTelegram,
        social_whatsapp: settingsData.socialWhatsapp,
        social_bale: settingsData.socialBale,
        social_youtube: settingsData.socialYoutube,
        social_instagram: settingsData.socialInstagram,
      });
      toast.success(t("admin.settings_saved"));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره تنظیمات";
      toast.error(message);
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      await settingsApi.update({
        working_hours: JSON.stringify(workingHours),
      });
      toast.success(t("admin.settings_saved"));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره ساعات کاری";
      toast.error(message);
    }
  };

  return {
    settingsData,
    setSettingsData,
    workingHours,
    setWorkingHours,
    handleSaveProfile,
    handleSaveWorkingHours,
  };
}

export type UseSettingsReturn = ReturnType<typeof useSettings>;
