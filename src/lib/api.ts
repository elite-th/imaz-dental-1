/**
 * ایماز دنتال — API Utility
 * ============================================================
 * لایه ارتباطی فرانت‌اند با بک‌اند (PHP API در پروداکشن،
 * Next.js API Routes در توسعه)
 *
 * تمام درخواست‌ها از این ماژول عبور می‌کنند تا:
 *  - URL یکپارچه باشه
 *  - هدرها و credentials یکسان باشن
 *  - خطاهای رایج مدیریت بشن
 */

// ── آدرس پایه API ──
// در توسعه: Next.js API routes (نسبی)
// در پروداکشن: PHP API (نسبی — روی همون دامنه)
const API_BASE = "/api";

// ── Auth token management ──
const AUTH_TOKEN_KEY = "imaz-admin-token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// ── انواع و اینترفیس‌ها ──
export interface Booking {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  service: string;
  date: string;
  time: string;
  notes: string | null;
  status: "pending" | "confirmed" | "rejected" | "rescheduled";
  created_at: string;
  updated_at: string;
}

export interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  rejected: number;
  rescheduled: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  stats: BookingStats;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
}

export interface CreateBookingData {
  fullName: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

// ── Patient interfaces ──
export interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientDetail {
  patient: Patient;
  bookings: Booking[];
}

// ── Message interfaces ──
export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessagesResponse {
  messages: Message[];
  stats: { total: number; unread: number };
}

// ── Analytics interfaces ──
export interface AnalyticsOverview {
  totalBookings: number;
  totalPatients: number;
  pendingBookings: number;
  confirmedBookings: number;
  todayBookings: number;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  bookingsByService: { service: string; count: number }[];
  bookingsByStatus: { status: string; count: number }[];
  bookingsByDate: { date: string; count: number }[];
  weeklyTrend: { day: string; bookings: number; confirmed: number }[];
  monthlyTrend: { month: string; bookings: number }[];
}



// ── Clinic settings interfaces ──
export interface ClinicSettings {
  clinic_name: string;
  clinic_phone: string;
  clinic_address: string;
  working_hours: string; // JSON string of working hours array
  social_telegram: string;
  social_whatsapp: string;
  social_bale: string;
  social_youtube: string;
  social_instagram: string;
}

// ── توابع کمکی داخلی ──

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  // Attach auth token if available
  const token = getAuthToken();
  if (token) {
    const h = headers as Record<string, string>; h["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  try {
    const response = await fetch(url, config);

    // پردازش JSON
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMessage =
        data.error || `خطای سرور (${response.status})`;
      const error = new ApiError(errorMessage, response.status, data);
      
      // Auto-logout on 401 (token expired or unauthorized)
      if (response.status === 401 && typeof window !== "undefined") {
        clearAuthToken();
        localStorage.removeItem("imaz-admin-logged-in");
        // Redirect to admin login if on admin page
        if (window.location.pathname === "/admin") {
          window.location.reload();
        }
      }
      
      throw error;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.", 0);
  }
}

// ── کلاس خطای سفارشی ──
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// ══════════════════════════════════════════════════════════════
//  Bookings API
// ══════════════════════════════════════════════════════════════

export const bookingsApi = {
  /** ایجاد نوبت جدید (عمومی — از فرم رزرو سایت) */
  create: (data: CreateBookingData) =>
    request<{ booking: Booking; message: string }>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** لیست نوبت‌ها (ادمین) */
  list: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<BookingsResponse>(`/bookings${qs ? `?${qs}` : ""}`);
  },

  /** تغییر وضعیت نوبت (ادمین) */
  updateStatus: (id: string, status: Booking["status"]) =>
    request<{ booking: Booking; message: string }>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  /** ویرایش کامل نوبت (ادمین) */
  update: (id: string, data: { date?: string; time?: string; notes?: string; fullName?: string; phone?: string; email?: string; service?: string; status?: Booking["status"] }) =>
    request<{ booking: Booking; message: string }>(`/bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** حذف نوبت (ادمین) */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/bookings/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Patients API
// ══════════════════════════════════════════════════════════════

export const patientsApi = {
  /** لیست بیماران */
  list: (params?: { search?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    return request<{ patients: Patient[] }>(`/patients${qs ? `?${qs}` : ""}`);
  },

  /** جزئیات بیمار با تاریخچه نوبت‌ها */
  get: (id: string) =>
    request<PatientDetail>(`/patients/${id}`),

  /** ایجاد بیمار جدید */
  create: (data: { fullName: string; phone: string; email?: string; notes?: string; dateOfBirth?: string }) =>
    request<{ patient: Patient; message: string }>("/patients", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** ویرایش بیمار */
  update: (id: string, data: { fullName?: string; phone?: string; email?: string; notes?: string; dateOfBirth?: string }) =>
    request<{ patient: Patient; message: string }>(`/patients/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** حذف بیمار */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/patients/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Messages API
// ══════════════════════════════════════════════════════════════

export const messagesApi = {
  /** لیست پیام‌ها */
  list: (params?: { search?: string; unread?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.unread) query.set("unread", "true");
    const qs = query.toString();
    return request<MessagesResponse>(`/messages${qs ? `?${qs}` : ""}`);
  },

  /** ایجاد پیام جدید */
  create: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
    request<{ message: Message; info: string }>("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** تغییر وضعیت خوانده‌شده */
  markRead: (id: string, isRead: boolean) =>
    request<{ message: Message; info: string }>(`/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isRead }),
    }),

  /** حذف پیام */
  delete: (id: string) =>
    request<{ success: boolean; info: string }>(`/messages/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Analytics API
// ══════════════════════════════════════════════════════════════

export const analyticsApi = {
  /** دریافت داده‌های آماری */
  get: () =>
    request<AnalyticsData>("/analytics"),
};

// ══════════════════════════════════════════════════════════════
//  Settings API
// ══════════════════════════════════════════════════════════════

export const settingsApi = {
  /** دریافت تنظیمات کلینیک (عمومی) */
  get: () =>
    request<{ settings: ClinicSettings }>("/settings"),

  /** بروزرسانی تنظیمات کلینیک (ادمین) */
  update: (data: Partial<ClinicSettings>) =>
    request<{ settings: ClinicSettings; message: string }>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ══════════════════════════════════════════════════════════════
//  FAQ API
// ══════════════════════════════════════════════════════════════

export interface FaqItem {
  id: string;
  question_fa: string;
  answer_fa: string;
  question_en: string;
  answer_en: string;
  question_ar: string;
  answer_ar: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const faqApi = {
  /** لیست سوالات متداول (ادمین) */
  listAdmin: () =>
    request<{ faqs: FaqItem[] }>("/faq?admin=true"),

  /** ایجاد سوال متداول جدید */
  create: (data: { questionFa: string; answerFa: string; questionEn: string; answerEn: string; questionAr: string; answerAr: string; sortOrder?: number; isActive?: boolean }) =>
    request<{ faq: FaqItem; message: string }>("/faq", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** ویرایش سوال متداول */
  update: (id: string, data: Partial<{ questionFa: string; answerFa: string; questionEn: string; answerEn: string; questionAr: string; answerAr: string; sortOrder: number; isActive: boolean }>) =>
    request<{ faq: FaqItem; message: string }>(`/faq/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** حذف سوال متداول */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/faq/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Gallery API
// ══════════════════════════════════════════════════════════════

export interface GalleryItemAdmin {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export const galleryApi = {
  /** لیست آیتم‌های گالری (ادمین) */
  listAdmin: () =>
    request<{ items: GalleryItemAdmin[] }>("/gallery?admin=true"),

  /** ایجاد آیتم گالری جدید */
  create: (data: { titleFa: string; subtitleFa: string; titleEn: string; subtitleEn: string; titleAr: string; subtitleAr: string; beforeImage: string; afterImage: string; sortOrder?: number; isActive?: boolean }) =>
    request<{ item: GalleryItemAdmin; message: string }>("/gallery", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** ویرایش آیتم گالری */
  update: (id: string, data: Partial<{ titleFa: string; subtitleFa: string; titleEn: string; subtitleEn: string; titleAr: string; subtitleAr: string; beforeImage: string; afterImage: string; sortOrder: number; isActive: boolean }>) =>
    request<{ item: GalleryItemAdmin; message: string }>(`/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** حذف آیتم گالری */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/gallery/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Site Text API
// ══════════════════════════════════════════════════════════════

export interface SiteTextItem {
  id: string;
  key: string;
  value_fa: string;
  value_en: string;
  value_ar: string;
  group: string;
  created_at: string;
  updated_at: string;
}

export const siteTextApi = {
  /** لیست متن‌های سایت */
  list: (params?: { group?: string }) => {
    const query = new URLSearchParams();
    if (params?.group) query.set("group", params.group);
    const qs = query.toString();
    return request<{ texts: SiteTextItem[] }>(`/site-text${qs ? `?${qs}` : ""}`);
  },

  /** بروزرسانی دسته‌ای متن‌ها */
  bulkUpdate: (items: { id: string; valueFa?: string; valueEn?: string; valueAr?: string }[]) =>
    request<{ updated: number; message: string }>("/site-text", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),

  /** ایجاد متن جدید */
  create: (data: { key: string; valueFa: string; valueEn: string; valueAr: string; group?: string }) =>
    request<{ text: SiteTextItem; message: string }>("/site-text", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** ویرایش متن */
  update: (id: string, data: Partial<{ valueFa: string; valueEn: string; valueAr: string; key: string; group: string }>) =>
    request<{ text: SiteTextItem; message: string }>(`/site-text/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** حذف متن */
  delete: (id: string) =>
    request<{ success: boolean; info: string }>(`/site-text/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Slot Config API
// ══════════════════════════════════════════════════════════════

export interface SlotConfigData {
  id: string;
  slot_duration: number;
  buffer_time: number;
  updated_at: string;
}

export const slotConfigApi = {
  /** دریافت تنظیمات اسلات */
  get: () =>
    request<{ config: SlotConfigData }>("/slot-config"),

  /** بروزرسانی تنظیمات اسلات */
  update: (data: { slotDuration?: number; bufferTime?: number }) =>
    request<{ config: SlotConfigData; message: string }>("/slot-config", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ══════════════════════════════════════════════════════════════
//  Slots API
// ══════════════════════════════════════════════════════════════

export interface TimeSlot {
  time: string;
  status: "available" | "booked" | "closed";
  // booked fields
  booking_id?: string;
  patient_name?: string;
  service?: string;
  booking_status?: string;
  // closed fields
  close_reason?: string | null;
  closed_id?: string;
}

export interface SlotsResponse {
  date: string;
  persian_day: string;
  is_working_day: boolean;
  is_full_day_closed?: boolean;
  full_day_close_reason?: string | null;
  working_hours?: { open: string; close: string };
  slots: TimeSlot[];
  config: { slot_duration: number; buffer_time: number };
}

export const slotsApi = {
  /** دریافت اسلات‌های یک تاریخ */
  get: (date: string) =>
    request<SlotsResponse>(`/slots?date=${date}`),
};

// ══════════════════════════════════════════════════════════════
//  Closed Slots API
// ══════════════════════════════════════════════════════════════

export interface ClosedSlotItem {
  id: string;
  date: string;
  time: string | null;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export const closedSlotsApi = {
  /** لیست اسلات‌های بسته */
  list: (params?: { date?: string; month?: string }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.month) query.set("month", params.month);
    const qs = query.toString();
    return request<{ closed_slots: ClosedSlotItem[] }>(`/closed-slots${qs ? `?${qs}` : ""}`);
  },

  /** بستن اسلات یا روز کامل */
  close: (data: { date: string; time?: string | null; reason?: string }) =>
    request<{ closed_slot: ClosedSlotItem; message: string }>("/closed-slots", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** باز کردن اسلات (حذف بسته‌شدن) */
  reopen: (id: string) =>
    request<{ success: boolean; message: string }>(`/closed-slots/${id}`, {
      method: "DELETE",
    }),
};

// ══════════════════════════════════════════════════════════════
//  Auth API
// ══════════════════════════════════════════════════════════════

export const authApi = {
  /** ورود به پنل مدیریت */
  login: (username: string, password: string) => {
    // Clear any existing token first
    clearAuthToken();
    return request<{ success: boolean; token: string; username: string; displayName: string }>("/auth", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  /** بررسی وضعیت ورود */
  check: () =>
    request<{ authenticated: boolean; username?: string; displayName?: string }>("/auth"),

  /** خروج */
  logout: () => {
    clearAuthToken();
    return Promise.resolve({ success: true });
  },
};

// ══════════════════════════════════════════════════════════════
//  Collaboration API
// ══════════════════════════════════════════════════════════════

export interface CollaborationItem {
  id: string;
  name_fa: string;
  name_en: string;
  name_ar: string;
  image: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const collaborationApi = {
  /** لیست همکاری‌ها (ادمین) */
  listAdmin: () =>
    request<{ items: CollaborationItem[] }>("/collaborations?admin=true"),

  /** ایجاد همکاری جدید */
  create: (data: { nameFa: string; nameEn: string; nameAr: string; image?: string; sortOrder?: number; isActive?: boolean }) =>
    request<{ item: CollaborationItem; message: string }>("/collaborations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** ویرایش همکاری */
  update: (id: string, data: Partial<{ nameFa: string; nameEn: string; nameAr: string; image: string; sortOrder: number; isActive: boolean }>) =>
    request<{ item: CollaborationItem; message: string }>(`/collaborations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** حذف همکاری */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/collaborations/${id}`, {
      method: "DELETE",
    }),
};
