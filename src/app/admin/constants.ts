/* ══════════════════════════════════════════════════════════════════════════
   CHART COLORS
   ══════════════════════════════════════════════════════════════════════════ */
export const CHART_COLORS = ["#14b8a6", "#f59e0b", "#10b981", "#f43f5e", "#0ea5e9", "#8b5cf6"];
export const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  rejected: "#f43f5e",
  rescheduled: "#0ea5e9",
};

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE OPTIONS
   ══════════════════════════════════════════════════════════════════════════ */
export const SERVICE_OPTIONS = [
  { value: "booking.svc_implants", label: "ایمپلنت دیجیتال و پیوند استخوان" },
  { value: "booking.svc_rootcanal", label: "درمان تخصصی ریشه" },
  { value: "booking.svc_makeover", label: "طراحی لبخند و زیبایی" },
  { value: "booking.svc_ortho", label: "ارتودنسی" },
  { value: "booking.svc_prosthetics", label: "پروتزهای ثابت و متحرک" },
  { value: "booking.svc_pediatric", label: "دندانپزشکی اطفال" },
];

/* ══════════════════════════════════════════════════════════════════════════
   PAGINATION
   ══════════════════════════════════════════════════════════════════════════ */
export const ITEMS_PER_PAGE = 10;

/* ══════════════════════════════════════════════════════════════════════════
   HARDCODED ADMIN CREDENTIALS (frontend-only auth)
   ══════════════════════════════════════════════════════════════════════════ */
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "Imaz@2026";

/* ══════════════════════════════════════════════════════════════════════════
   SITE TEXT GROUP LABELS (Persian)
   ══════════════════════════════════════════════════════════════════════════ */
export const GROUP_LABELS_FA: Record<string, string> = {
  about: "درباره ما",
  admin: "پنل مدیریت",
  booking: "نوبت‌دهی",
  faq: "سوالات متداول",
  floating: "دکمه شناور",
  footer: "فوتر",
  gallery: "گالری",
  header: "هدر",
  hero: "بخش اصلی",
  meta: "متا",
  mobileCta: "دکمه موبایل",
  process: "مراحل درمان",
  services: "خدمات",
  whyimaz: "چرا ایماز",
};

/* ══════════════════════════════════════════════════════════════════════════
   SITE TEXT KEY TRANSLATIONS TO PERSIAN
   ══════════════════════════════════════════════════════════════════════════ */
export const KEY_LABELS_FA: Record<string, string> = {
  // Hero
  "hero.title": "عنوان اصلی",
  "hero.subtitle": "زیرعنوان اصلی",
  "hero.cta": "دکمه اقدام",
  "hero.cta_secondary": "دکمه ثانویه",
  "hero.badge": "نشان بالای عنوان",
  "hero.stats_patients": "آمار بیماران",
  "hero.stats_experience": "آمار تجربه",
  "hero.stats_rating": "آمار امتیاز",
  // About
  "about.title": "عنوان درباره ما",
  "about.subtitle": "زیرعنوان درباره ما",
  "about.description": "توضیحات درباره ما",
  "about.feature_1_title": "ویژگی اول",
  "about.feature_1_desc": "توضیح ویژگی اول",
  "about.feature_2_title": "ویژگی دوم",
  "about.feature_2_desc": "توضیح ویژگی دوم",
  "about.feature_3_title": "ویژگی سوم",
  "about.feature_3_desc": "توضیح ویژگی سوم",
  // Services
  "services.title": "عنوان خدمات",
  "services.subtitle": "زیرعنوان خدمات",
  "services.svc_implants_title": "ایمپلنت - عنوان",
  "services.svc_implants_desc": "ایمپلنت - توضیح",
  "services.svc_rootcanal_title": "درمان ریشه - عنوان",
  "services.svc_rootcanal_desc": "درمان ریشه - توضیح",
  "services.svc_makeover_title": "طراحی لبخند - عنوان",
  "services.svc_makeover_desc": "طراحی لبخند - توضیح",
  "services.svc_ortho_title": "ارتودنسی - عنوان",
  "services.svc_ortho_desc": "ارتودنسی - توضیح",
  "services.svc_prosthetics_title": "پروتز - عنوان",
  "services.svc_prosthetics_desc": "پروتز - توضیح",
  "services.svc_pediatric_title": "اطفال - عنوان",
  "services.svc_pediatric_desc": "اطفال - توضیح",
  // Process
  "process.title": "عنوان مراحل درمان",
  "process.subtitle": "زیرعنوان مراحل",
  "process.step1_title": "مرحله ۱ - عنوان",
  "process.step1_desc": "مرحله ۱ - توضیح",
  "process.step2_title": "مرحله ۲ - عنوان",
  "process.step2_desc": "مرحله ۲ - توضیح",
  "process.step3_title": "مرحله ۳ - عنوان",
  "process.step3_desc": "مرحله ۳ - توضیح",
  "process.step4_title": "مرحله ۴ - عنوان",
  "process.step4_desc": "مرحله ۴ - توضیح",
  // Why Imaz
  "whyimaz.title": "عنوان چرا ایماز",
  "whyimaz.subtitle": "زیرعنوان چرا ایماز",
  "whyimaz.reason1_title": "دلیل اول - عنوان",
  "whyimaz.reason1_desc": "دلیل اول - توضیح",
  "whyimaz.reason2_title": "دلیل دوم - عنوان",
  "whyimaz.reason2_desc": "دلیل دوم - توضیح",
  "whyimaz.reason3_title": "دلیل سوم - عنوان",
  "whyimaz.reason3_desc": "دلیل سوم - توضیح",
  "whyimaz.reason4_title": "دلیل چهارم - عنوان",
  "whyimaz.reason4_desc": "دلیل چهارم - توضیح",
  // Gallery
  "gallery.title": "عنوان گالری",
  "gallery.subtitle": "زیرعنوان گالری",
  "gallery.hover_reveal": "متن نمایش هاور",
  // Booking
  "booking.title": "عنوان نوبت‌دهی",
  "booking.subtitle": "زیرعنوان نوبت‌دهی",
  "booking.name_label": "برچسب نام",
  "booking.phone_label": "برچسب تلفن",
  "booking.email_label": "برچسب ایمیل",
  "booking.service_label": "برچسب خدمت",
  "booking.date_label": "برچسب تاریخ",
  "booking.time_label": "برچسب ساعت",
  "booking.notes_label": "برچسب یادداشت",
  "booking.submit_btn": "دکمه ارسال",
  "booking.success_msg": "پیام موفقیت",
  "booking.svc_implants": "ایمپلنت",
  "booking.svc_rootcanal": "درمان ریشه",
  "booking.svc_makeover": "طراحی لبخند",
  "booking.svc_ortho": "ارتودنسی",
  "booking.svc_prosthetics": "پروتز",
  "booking.svc_pediatric": "اطفال",
  // FAQ
  "faq.title": "عنوان سوالات متداول",
  "faq.subtitle": "زیرعنوان سوالات متداول",
  // Footer
  "footer.about": "درباره ما - فوتر",
  "footer.address": "آدرس",
  "footer.phone": "تلفن",
  "footer.email": "ایمیل",
  "footer.copyright": "کپی‌رایت",
  "footer.quick_links": "لینک‌های سریع",
  "footer.contact_us": "تماس با ما",
  // Header
  "header.logo_alt": "متن لوگو",
  "header.nav_home": "منو - خانه",
  "header.nav_services": "منو - خدمات",
  "header.nav_about": "منو - درباره ما",
  "header.nav_gallery": "منو - گالری",
  "header.nav_faq": "منو - سوالات",
  "header.nav_booking": "منو - نوبت‌دهی",
  "header.nav_contact": "منو - تماس",
  // Meta
  "meta.title": "عنوان صفحه",
  "meta.description": "توضیحات متا",
  // Floating CTA
  "floating.book_text": "متن دکمه شناور",
  // Mobile CTA
  "mobileCta.book_text": "متن دکمه موبایل",
  // Admin
  "admin.login_title": "عنوان ورود مدیریت",
  "admin.dashboard": "داشبورد",
  "admin.appointments": "نوبت‌ها",
  "admin.analytics": "آمار",
  "admin.settings": "تنظیمات",
};
