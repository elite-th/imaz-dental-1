"use client";

import { User, Clock, Save, Send, MessageCircle, Youtube, Instagram } from "lucide-react";
import { BaleIcon } from "@/components/icons/BaleIcon";
import { useI18n } from "@/i18n/context";
import type { SettingsFormData, WorkingHour } from "../../types";

interface SettingsTabProps {
  settingsData: SettingsFormData;
  onSettingsDataChange: (d: SettingsFormData) => void;
  workingHours: WorkingHour[];
  onWorkingHoursChange: (wh: WorkingHour[]) => void;
  adminDisplayName: string;
  adminEmail: string;
  onSaveProfile: () => void;
  onSaveWorkingHours: () => void;
}

export function SettingsTab({
  settingsData,
  onSettingsDataChange,
  workingHours,
  onWorkingHoursChange,
  adminDisplayName,
  adminEmail,
  onSaveProfile,
  onSaveWorkingHours,
}: SettingsTabProps) {
  const { t } = useI18n();

  return (
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-5" style={{ fontFamily: "var(--font-vazirmatn)" }}>
        {t("admin.settings_title")}
      </h3>

      <div className="space-y-5 max-w-2xl">
        {/* Profile section */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            <User className="w-4 h-4 text-teal-500" />{t("admin.settings_profile")}
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.username")}</label>
                <input value={adminDisplayName} readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed" style={{ fontFamily: "var(--font-vazirmatn)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_email")}</label>
                <input value={adminEmail} readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400 cursor-not-allowed" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.settings_clinic_name")}</label>
              <input value={settingsData.clinicName} onChange={(e) => onSettingsDataChange({ ...settingsData, clinicName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }} placeholder="ایماز دنتال" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.settings_clinic_phone")}</label>
                <input value={settingsData.clinicPhone} onChange={(e) => onSettingsDataChange({ ...settingsData, clinicPhone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="025-37401065" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.settings_clinic_address")}</label>
                <input value={settingsData.clinicAddress} onChange={(e) => onSettingsDataChange({ ...settingsData, clinicAddress: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }} placeholder="قم، خیابان شهید فاطمی، میدان رسالت" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onSaveProfile} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
              <Save className="w-3.5 h-3.5" />{t("admin.btn_save")}
            </button>
          </div>
        </div>

        {/* Working Hours section */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            <Clock className="w-4 h-4 text-teal-500" />{t("admin.settings_working_hours")}
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
                      onWorkingHoursChange(updated);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>{wh.day}</span>
                </label>
                {wh.enabled ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={wh.open} onChange={(e) => { const updated = [...workingHours]; updated[i] = { ...updated[i], open: e.target.value }; onWorkingHoursChange(updated); }} className="px-3 py-1.5 rounded-lg border border-gray-100 text-xs outline-none focus:border-teal-200" />
                    <span className="text-xs text-gray-400">تا</span>
                    <input type="time" value={wh.close} onChange={(e) => { const updated = [...workingHours]; updated[i] = { ...updated[i], close: e.target.value }; onWorkingHoursChange(updated); }} className="px-3 py-1.5 rounded-lg border border-gray-100 text-xs outline-none focus:border-teal-200" />
                  </div>
                ) : (
                  <span className="text-xs text-gray-300" style={{ fontFamily: "var(--font-vazirmatn)" }}>تعطیل</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onSaveWorkingHours} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
              <Save className="w-3.5 h-3.5" />{t("admin.btn_save")}
            </button>
          </div>
        </div>

        {/* Social Links section */}
        <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
            <Send className="w-4 h-4 text-teal-500" />لینک شبکه‌های اجتماعی
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <Send className="w-3 h-3 inline-block ml-1" style={{ color: "#2AABEE" }} />تلگرام
                </label>
                <input value={settingsData.socialTelegram} onChange={(e) => onSettingsDataChange({ ...settingsData, socialTelegram: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://t.me/imazdental" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <MessageCircle className="w-3 h-3 inline-block ml-1" style={{ color: "#25D366" }} />واتساپ
                </label>
                <input value={settingsData.socialWhatsapp} onChange={(e) => onSettingsDataChange({ ...settingsData, socialWhatsapp: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://wa.me/989191190995" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <BaleIcon className="w-3 h-3 inline-block ml-1" style={{ color: "#00BFA5" }} />بله
                </label>
                <input value={settingsData.socialBale} onChange={(e) => onSettingsDataChange({ ...settingsData, socialBale: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://ble.ir/imazdental" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <Youtube className="w-3 h-3 inline-block ml-1" style={{ color: "#FF0000" }} />یوتیوب
                </label>
                <input value={settingsData.socialYoutube} onChange={(e) => onSettingsDataChange({ ...settingsData, socialYoutube: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://youtube.com/@imazdental" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <Instagram className="w-3 h-3 inline-block ml-1" style={{ color: "#E4405F" }} />اینستاگرام
                </label>
                <input value={settingsData.socialInstagram} onChange={(e) => onSettingsDataChange({ ...settingsData, socialInstagram: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://instagram.com/imazdental" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={onSaveProfile} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
              <Save className="w-3.5 h-3.5" />{t("admin.btn_save")}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}
