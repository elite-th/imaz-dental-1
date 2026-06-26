import type { Booking } from "@/lib/api";

/* ══════════════════════════════════════════════════════════════════════════
   LOCAL-ONLY TYPES
   ══════════════════════════════════════════════════════════════════════════ */

export type BookingStatus = Booking["status"];

export type TabKey =
  | "appointments"
  | "schedule"
  | "analytics"
  | "faq"
  | "gallery"
  | "collaborations"
  | "site_text"
  | "settings";

export type FormLang = "fa" | "en" | "ar";

export interface NewBookingFormData {
  fullName: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

export interface EditBookingData {
  date: string;
  time: string;
  notes: string;
}

export interface SettingsFormData {
  clinicName: string;
  clinicPhone: string;
  clinicAddress: string;
  socialTelegram: string;
  socialWhatsapp: string;
  socialBale: string;
  socialYoutube: string;
  socialInstagram: string;
}

export interface WorkingHour {
  day: string;
  open: string;
  close: string;
  enabled: boolean;
}

export interface FaqFormData {
  question_fa: string;
  answer_fa: string;
  question_en: string;
  answer_en: string;
  question_ar: string;
  answer_ar: string;
  sort_order: number;
  is_active: boolean;
}

export interface GalleryFormData {
  title_fa: string;
  subtitle_fa: string;
  title_en: string;
  subtitle_en: string;
  title_ar: string;
  subtitle_ar: string;
  before_image: string;
  after_image: string;
  sort_order: number;
  is_active: boolean;
}

export interface CollabFormData {
  name_fa: string;
  name_en: string;
  name_ar: string;
  image: string;
  sort_order: number;
  is_active: boolean;
}

export interface SlotConfigForm {
  slot_duration: number;
  buffer_time: number;
}

export interface EditingTextData {
  value_fa: string;
  value_en: string;
  value_ar: string;
}
