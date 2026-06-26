import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── i18n Data (sourced from src/i18n/fa.json, en.json, ar.json) ────────────

const faData: Record<string, Record<string, string>> = {
  meta: { locale: "fa", dir: "rtl" },
  header: {
    nav_about: "درباره ما", nav_services: "خدمات", nav_process: "فرآیند",
    nav_results: "نتایج", nav_contact: "تماس", logo_sub: "کلینیک دندانپزشکی",
    book_now: "رزرو آنلاین", book_consultation: "رزرو مشاوره",
    menu_aria: "منو", switch_lang: "تغییر زبان"
  },
  hero: {
    badge: "کلینیک دندانپزشکی ایماز دنتال",
    heading_l1: "ایمپلنت و درمان", heading_l2: "ریشه", heading_l3: "تخصصی", heading_l4: "ایماز دنتال",
    subtitle: "دکتر ایمان سیاه‌نوری، جراح دندانپزشک با بیش از ۱۰ سال سابقه حرفه‌ای. درمان‌های تخصصی ایمپلنت، عصب‌کشی و زیبایی با تجهیزات مدرن و روش‌های علمی به‌روز.",
    cta_book: "رزرو مشاوره", cta_explore: "مشاهده خدمات",
    stat_years: "سال تجربه", stat_patients: "بیمار راضی",
    img_alt: "کلینیک دندانپزشکی ایماز دنتال",
    badge_safe: "نظام پزشکی ۱۷۴۲۹۱", badge_safe_sub: "جراح دندانپزشک",
    badge_trusted: "بیش از ۸۰۰۰ بیمار", badge_trusted_sub: "تجربه درمان موفق",
    scroll_down: "اسکرول کنید"
  },
  about: {
    label: "درباره دکتر ایمان سیاه‌نوری",
    heading_l1: "جراح دندانپزشک", heading_l2: "با رویکرد تشخیص دقیق",
    description: "دکتر ایمان سیاه‌نوری، جراح دندانپزشک (شماره نظام پزشکی ۱۷۴۲۹۱)، با بیش از ۱۰ سال سابقه حرفه‌ای یکی از گزینه‌های قابل اعتماد در شهر قم می‌باشند. رویکرد درمانی در این مجموعه بر پایه تشخیص دقیق، استفاده از تجهیزات مدرن و بهره‌گیری از جدیدترین متدهای علمی دندانپزشکی است تا بیماران با آرامش و اطمینان کامل روند درمان خود را طی کنند.",
    feature_1_title: "تشخیص دقیق و تجهیزات مدرن", feature_1_desc: "بهره‌گیری از جدیدترین تجهیزات و روش‌های علمی برای تشخیص و درمان دقیق.",
    feature_2_title: "طرح درمان اختصاصی", feature_2_desc: "ارائه طرح درمان شخصی‌سازی‌شده متناسب با شرایط هر بیمار.",
    feature_3_title: "آرامش و اطمینان کامل", feature_3_desc: "محیطی آرام و حرفه‌ای برای تجربه‌ای بدون استرس از درمان.",
    cta: "آشنایی با دکتر سیاه‌نوری", img_alt: "دکتر ایمان سیاه‌نوری",
    badge_name: "دکتر ایمان سیاه‌نوری، جراح دندانپزشک", badge_sub: "شماره نظام پزشکی ۱۷۴۲۹۱ · ۱۰+ سال تجربه"
  },
  services: {
    label: "خدمات تخصصی", heading: "خدمات دندانپزشکی تخصصی",
    subtitle: "ایمپلنت دیجیتال، درمان ریشه، زیبایی و بیشتر — همه در یک مرکز معتبر.",
    svc_1_title: "ایمپلنت دیجیتال و پیوند استخوان", svc_1_desc: "کاشت ایمپلنت با تکنیک‌های نوین و در صورت نیاز همراه با پیوند استخوان برای دوام طولانی‌مدت.",
    svc_2_title: "درمان تخصصی ریشه (اندودانتیکس)", svc_2_desc: "درمان‌های پیشرفته ریشه با تجهیزات دقیق برای حفظ ساختار طبیعی دندان و جلوگیری از کشیدن.",
    svc_3_title: "طراحی لبخند و درمان‌های زیبایی", svc_3_desc: "اصلاح طرح لبخند و درمان‌های زیبایی برای لبخندی طبیعی و متناسب با چهره.",
    svc_4_title: "ارتودنسی", svc_4_desc: "اصلاح نامرتبی دندان‌ها با روش‌های مدرن برای داشتن لبخندی منظم.",
    svc_5_title: "پروتزهای ثابت و متحرک", svc_5_desc: "پروتزهای ثابت و متحرک با کیفیت بالا برای بازسازی عملکرد و زیبایی لبخند.",
    svc_6_title: "دندانپزشکی اطفال", svc_6_desc: "خدمات دندانپزشکی کودکان با رویکردی صبورانه و آرام برای تجربه‌ای بدون استرس.",
    learn_more: "بیشتر بدانید", play_video: "پخش ویدیو", watch_video: "تماشای ویدیو"
  },
  process: {
    label: "نحوه کار", heading: "سه مرحله ساده", subtitle: "رزرو نوبت مشاوره هرگز آسان‌تر نبوده.",
    step_1_title: "رزرو آنلاین", step_1_desc: "فرم ساده ما را پر کنید — کمتر از ۶۰ ثانیه طول می‌کشد.",
    step_2_title: "مشاوره تخصصی", step_2_desc: "دکتر سیاه‌نوری طرح درمان اختصاصی شما را تعیین می‌کند.",
    step_3_title: "با اعتماد لبخند بزنید", step_3_desc: "درمان اصولی و ماندگار برای لبخندی زیبا و اعتمادبه‌نفس بیشتر."
  },
  gallery: {
    label: "گالری لبخند", heading: "تحول را ببینید",
    subtitle: "اسلایدر را بکشید تا نتایج قبل و بعد را مقایسه کنید.",
    before: "قبل", after: "بعد",
    item_1_title: "ایمپلنت دیجیتال", item_1_sub: "نتیجه طبیعی و ماندگار",
    item_2_title: "درمان ریشه", item_2_sub: "نجات دندان طبیعی",
    item_3_title: "طراحی لبخند", item_3_sub: "تحول کامل لبخند",
    drag_hint: "بکشید و مقایسه کنید", cta: "تحول خود را آغاز کنید"
  },
  booking: {
    label: "رزرو نوبت", heading_l1: "لبخند کامل شما", heading_l2: "از اینجا شروع می‌شود",
    subtitle: "فرم زیر را پر کنید، ظرف ۳۰ دقیقه تأیید می‌شود.",
    step_details: "جزئیات", step_schedule: "زمان‌بندی", step_confirm: "تأیید",
    lbl_name: "نام کامل *", lbl_phone: "شماره تلفن *", lbl_email: "آدرس ایمیل",
    lbl_service: "خدمات مورد نیاز *", lbl_date: "تاریخ مورد نظر *", lbl_time: "ساعت مورد نظر *",
    lbl_notes: "توضیحات اضافی", select_service: "یک خدمت انتخاب کنید",
    svc_implants: "ایمپلنت دیجیتال و پیوند استخوان", svc_rootcanal: "درمان تخصصی ریشه (اندودانتیکس)",
    svc_makeover: "طراحی لبخند و درمان‌های زیبایی", svc_ortho: "ارتودنسی",
    svc_prosthetics: "پروتزهای ثابت و متحرک", svc_pediatric: "دندانپزشکی اطفال",
    btn_next: "مرحله بعد", btn_back: "بازگشت", btn_review: "بررسی",
    btn_confirm: "تأیید نوبت", btn_processing: "در حال پردازش...",
    summary_title: "خلاصه نوبت", summary_patient: "بیمار", summary_phone: "تلفن",
    summary_service: "خدمت", summary_date: "تاریخ", summary_time: "ساعت",
    info_callout: "هماهنگ‌کننده ما ظرف ۳۰ دقیقه برای تأیید نوبت تماس خواهد گرفت.",
    success_title: "نوبت رزرو شد!", success_thankyou: "تشکر،",
    success_message: "درخواست شما دریافت شد. هماهنگ‌کننده ما به زودی تماس خواهد گرفت.",
    success_home: "بازگشت به صفحه اصلی",
    err_name: "لطفاً نام کامل خود را وارد کنید", err_phone: "لطفاً شماره تلفن معتبر وارد کنید",
    err_service: "لطفاً یک خدمت انتخاب کنید", err_date: "لطفاً تاریخ انتخاب کنید",
    err_time: "لطفاً ساعت انتخاب کنید", err_required: "لطفاً تمام فیلدهای الزامی را پر کنید",
    toast_success: "نوبت با موفقیت رزرو شد!",
    slot_available: "آزاد", slot_booked: "رزرو شده",
    slot_count_before: "", slot_count_after: "زمان آزاد موجود",
    holiday_notice: "این روز تعطیل است", holiday_closed: "کلینیک در این روز تعطیل می‌باشد",
    dayoff_notice: "کلینیک در این روز تعطیل است", no_slots: "هیچ زمان آزادی برای این تاریخ وجود ندارد"
  },
  footer: {
    logo_sub: "کلینیک دندانپزشکی",
    about: "ایماز دنتال — تجربه‌ای متفاوت از دندانپزشکی مدرن در قم. از سال ۱۳۹۸ با هدف ارائه خدمات دقیق، دیجیتال و قابل اعتماد.",
    col_links: "لینک‌های سریع", link_about: "درباره ما", link_services: "خدمات تخصصی",
    link_gallery: "گالری لبخند", link_booking: "رزرو نوبت",
    col_contact: "تماس با ما", address: "قم، خیابان شهید فاطمی، میدان رسالت، کوچه فاطمی ۲۹، پلاک ۴۰، طبقه ۷، واحد ۷۱۳", phone: "۰۲۵۳۷۴۰۱۰۶۵",
    email: "info@imazdental.com",
    col_hours: "ساعات کاری", day_mon_thu: "دوشنبه – پنجشنبه", day_fri: "جمعه",
    day_sat: "شنبه", day_sun: "یکشنبه", hours_closed: "تعطیل",
    emergency: "خط اضطراری ۲۴/۷",
    cta_heading: "آماده‌اید لبخند رویایی‌تان را داشته باشید؟",
    cta_sub: "همین حالا نوبت مشاوره رایگان خود را رزرو کنید.", cta_btn: "رزرو مشاوره",
    copyright: "© ۲۰۲۵ کلینیک دندانپزشکی ایماز دنتال. تمامی حقوق محفوظ است.",
    legal_privacy: "حریم خصوصی", legal_terms: "شرایط استفاده", legal_hipaa: "حریم اطلاعات پزشکی",
    admin_link: "ورود منشی"
  },
  faq: {
    label: "— سوالات متداول —", heading: "سوالات رایج شما",
    q1: "ایمپلنت دندان چقدر طول می‌کشد؟",
    a1: "کل فرآیند ایمپلنت دیجیتال بسته به شرایط بیمار متفاوت است. دکتر سیاه‌نوری پس از مشاوره و بررسی، زمان دقیق درمان را مشخص می‌کند.",
    q2: "آیا درمان ریشه دردناک است؟",
    a2: "درمان ریشه پیشرفته در این مرکز با تجهیزات دقیق و بی‌حسی موضعی انجام می‌شود و بیشتر بیماران درد کمی گزارش می‌دهند.",
    q3: "تفاوت ایمپلنت دیجیتال با معمولی چیست؟",
    a3: "ایمپلنت دیجیتال با راهنمایی کامپیوتری انجام می‌شود که دقت بالاتر، زمان کوتاه‌تر و بهبودی سریع‌تری دارد.",
    q4: "آیا برای درمان اطفال تجربه کافی دارید؟",
    a4: "بله، خدمات دندانپزشکی اطفال با رویکردی صبورانه و آرام انجام می‌شود تا کودکان تجربه‌ای بدون استرس داشته باشند.",
    q5: "آیا بیمه دندانپزشکی را قبول می‌کنید؟",
    a5: "بله، با اکثر شرکت‌های بیمه دندانپزشکی اصلی همکاری داریم. برای جزئیات پوشش با ما تماس بگیرید.",
    q6: "چرا باید دکتر سیاه‌نوری را انتخاب کنم؟",
    a6: "بیش از ۱۰ سال تجربه حرفه‌ای، تمرکز ویژه بر ایمپلنت و درمان ریشه، تجهیزات مدرن، و طرح درمان اختصاصی برای هر بیمار."
  },
  whyimaz: {
    label: "— چرا ایماز دنتال —", heading: "چرا دکتر ایمان سیاه‌نوری؟",
    stat_years: "سال تجربه حرفه‌ای", stat_patients: "بیمار راضی", stat_services: "خدمت تخصصی", stat_success: "درمان موفق",
    feat1_title: "بیش از ۱۰ سال تجربه", feat1_desc: "تمرکز ویژه بر ایمپلنت و درمان‌های پیشرفته ریشه",
    feat2_title: "تجهیزات مدرن", feat2_desc: "استفاده از جدیدترین تجهیزات و روش‌های علمی به‌روز",
    feat3_title: "طرح درمان اختصاصی", feat3_desc: "ارائه طرح درمان شخصی‌سازی‌شده برای هر بیمار",
    feat4_title: "رضایت درمانی بالا", feat4_desc: "رضایت بیش از هزار مراجعه‌کننده از کیفیت درمان"
  },
  mobileCta: { book: "رزرو مشاوره" },
  floating: {
    whatsapp: "واتساپ", call: "تماس تلفنی", open: "باز کردن منوی تماس",
    close: "بستن", tooltip: "با ما در تماس باشید"
  },
  admin: {
    open_panel: "پنل منشی", title: "پنل مدیریت ایماز دنتال",
    subtitle: "مدیریت نوبت‌دهی و هماهنگی کلینیک دندانپزشکی",
    username: "نام کاربری", password: "رمز عبور",
    username_placeholder: "نام کاربری را وارد کنید", password_placeholder: "رمز عبور را وارد کنید",
    login_btn: "ورود به پنل", login_error: "نام کاربری یا رمز عبور اشتباه است",
    login_hint: "نام کاربری: admin · رمز عبور: 1234",
    login_welcome: "خوش آمدید", login_subtitle: "برای دسترسی به پنل مدیریت وارد شوید",
    dashboard_title: "مدیریت نوبت‌دهی", dashboard_subtitle: "نظارت و مدیریت نوبت‌های کلینیک",
    logout: "خروج", back_to_site: "بازگشت به سایت", collapse_sidebar: "بستن منو",
    stat_total: "کل نوبت‌ها", stat_pending: "در انتظار", stat_confirmed: "تأیید شده", stat_rejected: "رد شده",
    status_pending: "در انتظار", status_confirmed: "تأیید شده", status_rejected: "رد شده", status_rescheduled: "جابجا شده",
    filter_all: "همه", search_placeholder: "جستجوی نام، تلفن، خدمت...",
    no_bookings: "نوبتی یافت نشد", no_bookings_sub: "نوبت‌های جدید اینجا نمایش داده می‌شوند",
    notes: "توضیحات",
    btn_confirm: "تأیید", btn_reject: "رد", btn_reschedule: "جابجایی", btn_restore: "بازگرداندن", btn_delete: "حذف",
    view_details: "مشاهده جزئیات", detail_title: "جزئیات نوبت",
    detail_service: "خدمت", detail_date: "تاریخ", detail_time: "ساعت", detail_phone: "تلفن",
    online_status: "سیستم آنلاین",
    feature_appointments: "مدیریت و پیگیری نوبت‌دهی بیماران",
    feature_notifications: "اعلان‌های فوری برای نوبت‌های جدید",
    feature_analytics: "آمار و گزارش‌های کلینیک",
    nav_appointments: "نوبت‌ها", nav_calendar: "تقویم", nav_patients: "بیماران",
    nav_analytics: "آمار", nav_messages: "پیام‌ها", nav_settings: "تنظیمات",
    loading_bookings: "در حال بارگذاری نوبت‌ها...",
    load_error: "خطا در دریافت اطلاعات. لطفاً اتصال اینترنت خود را بررسی کنید.",
    load_error_title: "خطا در بارگذاری", retry: "تلاش مجدد", refresh: "بازنشانی",
    confirm_delete: "آیا از حذف این نوبت اطمینان دارید؟",
    status_updated: "وضعیت با موفقیت تغییر کرد", booking_deleted: "نوبت با موفقیت حذف شد",
    action_error: "خطا در انجام عملیات",
    created_at: "ایجاد شده", updated_at: "آخرین بروزرسانی",
    btn_new_booking: "ثبت نوبت جدید", btn_edit: "ویرایش", btn_save: "ذخیره",
    btn_cancel: "انصراف", btn_close: "بستن", btn_add_patient: "افزودن بیمار",
    btn_send: "ارسال", btn_mark_read: "خوانده شد", btn_mark_unread: "خوانده نشده",
    detail_email: "ایمیل", detail_notes: "توضیحات",
    calendar_title: "تقویم نوبت‌ها", calendar_today: "امروز",
    calendar_no_appointments: "نوبتی در این روز نیست", calendar_appointments_on: "نوبت‌های روز",
    patients_title: "مدیریت بیماران", patients_search: "جستجوی بیمار...",
    patients_no_results: "بیماری یافت نشد",
    patients_no_results_sub: "بیماران جدید با ثبت نوبت اضافه می‌شوند",
    patients_booking_history: "تاریخچه نوبت‌ها", patients_total_bookings: "کل نوبت‌ها",
    patients_last_visit: "آخرین مراجعه", patients_add_notes: "افزودن یادداشت",
    analytics_title: "آمار و گزارش‌ها", analytics_overview: "نمای کلی",
    analytics_total_bookings: "کل نوبت‌ها", analytics_total_patients: "کل بیماران",
    analytics_pending: "در انتظار", analytics_confirmed: "تأیید شده", analytics_today: "نوبت‌های امروز",
    analytics_by_service: "توزیع خدمات", analytics_by_status: "وضعیت نوبت‌ها",
    analytics_weekly: "روند هفتگی", analytics_monthly: "روند ماهانه",
    analytics_no_data: "داده‌ای موجود نیست",
    messages_title: "صندوق پیام‌ها", messages_search: "جستجوی پیام...",
    messages_inbox: "صندوق ورودی", messages_unread: "خوانده نشده",
    messages_no_results: "پیامی یافت نشد",
    messages_no_results_sub: "پیام‌های جدید از فرم تماس اینجا نمایش داده می‌شوند",
    messages_from: "از", messages_date: "تاریخ", messages_subject: "موضوع",
    messages_delete_confirm: "آیا از حذف این پیام اطمینان دارید؟",
    settings_title: "تنظیمات", settings_profile: "پروفایل",
    settings_working_hours: "ساعات کاری", settings_password: "تغییر رمز عبور",
    settings_current_password: "رمز عبور فعلی", settings_new_password: "رمز عبور جدید",
    settings_confirm_password: "تکرار رمز عبور",
    settings_password_changed: "رمز عبور با موفقیت تغییر کرد",
    settings_password_error: "رمز عبور فعلی اشتباه است",
    settings_clinic_name: "نام کلینیک", settings_clinic_phone: "تلفن کلینیک",
    settings_clinic_address: "آدرس کلینیک", settings_saved: "تنظیمات ذخیره شد",
    create_booking_title: "ثبت نوبت جدید", edit_booking_title: "ویرایش نوبت",
    reschedule_title: "جابجایی نوبت", reschedule_new_date: "تاریخ جدید", reschedule_new_time: "ساعت جدید",
    pagination_prev: "قبلی", pagination_next: "بعدی",
    pagination_showing: "نمایش", pagination_of: "از", pagination_results: "نتیجه",
    detail_name: "نام کامل", btn_add: "افزودن",
    hours_open: "باز", hours_closed: "بسته", hours_open_time: "ساعت شروع",
    hours_close_time: "ساعت پایان", hours_slot_duration: "مدت هر نوبت",
    holidays_tab: "روزهای تعطیل", holiday_date: "تاریخ", holiday_title: "عنوان",
    holiday_title_ph: "نام مناسبت", holidays_empty: "هیچ تعطیلی ثبت نشده",
    reserved_tab: "زمان‌های بسته", reserved_date: "تاریخ", reserved_time: "ساعت",
    reserved_reason: "دلیل", reserved_reason_ph: "دلیل بستن زمان",
    reserved_empty: "هیچ زمان بسته‌ای ثبت نشده", reserved_manual: "رزرو دستی"
  }
};

const enData: Record<string, Record<string, string>> = {
  meta: { locale: "en", dir: "ltr" },
  header: {
    nav_about: "About", nav_services: "Services", nav_process: "Process",
    nav_results: "Results", nav_contact: "Contact", logo_sub: "Dental Clinic",
    book_now: "Book Now", book_consultation: "Book Your Consultation",
    menu_aria: "Menu", switch_lang: "Switch language"
  },
  hero: {
    badge: "Imaz Dental Clinic",
    heading_l1: "Dental Implants &", heading_l2: "Root Canal", heading_l3: "Specialist", heading_l4: "Care",
    subtitle: "Dr. Iman Siahnouri, dental surgeon with over 10 years of professional experience. Specializing in implants, root canals, and cosmetic treatments using modern equipment and evidence-based methods.",
    cta_book: "Book Your Consultation", cta_explore: "Explore Services",
    stat_years: "Years Exp.", stat_patients: "Happy Patients",
    img_alt: "Imaz Dental Clinic",
    badge_safe: "Medical License 174291", badge_safe_sub: "Dental Surgeon",
    badge_trusted: "Over 8,000 Patients", badge_trusted_sub: "Successful Treatments",
    scroll_down: "Scroll Down"
  },
  about: {
    label: "About Dr. Iman Siahnouri",
    heading_l1: "Dental Surgeon with", heading_l2: "Precision Diagnosis Approach",
    description: "Dr. Iman Siahnouri, dental surgeon (Medical License No. 174291), with over 10 years of professional experience, is one of the most trusted dental practitioners in Qom. The treatment approach at this clinic is based on precise diagnosis, modern equipment, and the latest evidence-based dental methods, ensuring patients can undergo treatment with complete peace of mind.",
    feature_1_title: "Precise Diagnosis & Modern Equipment", feature_1_desc: "Utilizing the latest equipment and scientific methods for accurate diagnosis and treatment.",
    feature_2_title: "Customized Treatment Plans", feature_2_desc: "Providing personalized treatment plans tailored to each patient's condition.",
    feature_3_title: "Complete Peace of Mind", feature_3_desc: "A calm, professional environment for a stress-free treatment experience.",
    cta: "Meet Dr. Siahnouri", img_alt: "Dr. Iman Siahnouri",
    badge_name: "Dr. Iman Siahnouri, Dental Surgeon", badge_sub: "Medical License No. 174291 · 10+ Years Experience"
  },
  services: {
    label: "Specialist Services", heading: "Specialist Dental Services",
    subtitle: "Digital implants, root canal treatment, cosmetics and more — all in one trusted center.",
    svc_1_title: "Digital Implants & Bone Grafting", svc_1_desc: "Implant placement using modern techniques, with bone grafting if needed, for long-lasting results.",
    svc_2_title: "Endodontics (Root Canal)", svc_2_desc: "Advanced root canal therapy with precision equipment to preserve natural tooth structure.",
    svc_3_title: "Smile Design & Cosmetic Treatments", svc_3_desc: "Smile correction and cosmetic treatments for a natural, face-proportioned smile.",
    svc_4_title: "Orthodontics", svc_4_desc: "Correcting dental misalignment with modern methods for a well-aligned smile.",
    svc_5_title: "Fixed & Removable Prosthetics", svc_5_desc: "High-quality fixed and removable prosthetics for restoring function and smile aesthetics.",
    svc_6_title: "Pediatric Dentistry", svc_6_desc: "Children's dental services with a patient, gentle approach for a stress-free experience.",
    learn_more: "Learn more", play_video: "Play Video", watch_video: "Watch Video"
  },
  process: {
    label: "How It Works", heading: "Three Simple Steps",
    subtitle: "Booking your consultation has never been easier.",
    step_1_title: "Book Online", step_1_desc: "Fill out our simple form — it takes less than 60 seconds.",
    step_2_title: "Specialist Consultation", step_2_desc: "Dr. Siahnouri will determine your customized treatment plan.",
    step_3_title: "Smile Confidently", step_3_desc: "Principled, lasting treatment for a beautiful smile and more confidence."
  },
  gallery: {
    label: "Smile Gallery", heading: "See the Transformation",
    subtitle: "Drag the slider to compare before and after results.",
    before: "Before", after: "After",
    item_1_title: "Digital Implant", item_1_sub: "Natural, lasting result",
    item_2_title: "Root Canal Treatment", item_2_sub: "Natural tooth saved",
    item_3_title: "Smile Design", item_3_sub: "Complete smile transformation",
    drag_hint: "Drag to compare", cta: "Start Your Transformation"
  },
  booking: {
    label: "Book Your Appointment", heading_l1: "Your Perfect Smile", heading_l2: "Starts Here",
    subtitle: "Fill out the form below and we'll confirm within 30 minutes.",
    step_details: "Details", step_schedule: "Schedule", step_confirm: "Confirm",
    lbl_name: "Full Name *", lbl_phone: "Phone Number *", lbl_email: "Email Address",
    lbl_service: "Service Needed *", lbl_date: "Preferred Date *", lbl_time: "Preferred Time *",
    lbl_notes: "Additional Notes", select_service: "Select a service",
    svc_implants: "Digital Implants & Bone Grafting", svc_rootcanal: "Endodontics (Root Canal)",
    svc_makeover: "Smile Design & Cosmetic Treatments", svc_ortho: "Orthodontics",
    svc_prosthetics: "Fixed & Removable Prosthetics", svc_pediatric: "Pediatric Dentistry",
    btn_next: "Next Step", btn_back: "Back", btn_review: "Review",
    btn_confirm: "Confirm Appointment", btn_processing: "Processing...",
    summary_title: "Appointment Summary", summary_patient: "Patient", summary_phone: "Phone",
    summary_service: "Service", summary_date: "Date", summary_time: "Time",
    info_callout: "Our coordinator will call within 30 minutes to confirm your appointment.",
    success_title: "Appointment Booked!", success_thankyou: "Thank you,",
    success_message: "We've received your request. Our coordinator will call you shortly.",
    success_home: "Back to Home",
    err_name: "Please enter your full name", err_phone: "Please enter a valid phone number",
    err_service: "Please select a service", err_date: "Please select a date",
    err_time: "Please select a time slot", err_required: "Please fill in all required fields",
    toast_success: "Appointment booked successfully!",
    slot_available: "Available", slot_booked: "Booked",
    slot_count_before: "", slot_count_after: "time slots available",
    holiday_notice: "This day is a holiday", holiday_closed: "The clinic is closed on this day",
    dayoff_notice: "The clinic is closed on this day", no_slots: "No available time slots for this date"
  },
  footer: {
    logo_sub: "Dental Clinic",
    about: "Imaz Dental — A different experience of modern dentistry in Qom. Since 2019, providing precise, digital, and trusted dental services.",
    col_links: "Quick Links", link_about: "About Us", link_services: "Specialist Services",
    link_gallery: "Smile Gallery", link_booking: "Book Appointment",
    col_contact: "Contact Us", address: "Qom, Shahid Fatemi St., Resalat Sq., Fatemi 29 Alley, No. 40, 7th Floor, Unit 713", phone: "025-37401065",
    email: "info@imazdental.com",
    col_hours: "Working Hours", day_mon_thu: "Mon – Thu", day_fri: "Friday",
    day_sat: "Saturday", day_sun: "Sunday", hours_closed: "Closed",
    emergency: "24/7 Emergency Line",
    cta_heading: "Ready for Your Dream Smile?",
    cta_sub: "Book your free consultation now.", cta_btn: "Book Consultation",
    copyright: "© 2025 Imaz Dental Clinic. All rights reserved.",
    legal_privacy: "Privacy Policy", legal_terms: "Terms of Service", legal_hipaa: "Medical Privacy",
    admin_link: "Secretary Login"
  },
  faq: {
    label: "— FAQ —", heading: "Common Questions",
    q1: "How long does a dental implant take?",
    a1: "The full digital implant process varies depending on the patient's condition. Dr. Siahnouri will determine the exact treatment timeline after consultation and evaluation.",
    q2: "Is root canal treatment painful?",
    a2: "Advanced root canal treatment at our clinic is performed with precision equipment and local anesthesia. Most patients report minimal discomfort.",
    q3: "What's the difference between digital and conventional implants?",
    a3: "Digital implants are computer-guided, offering higher precision, shorter procedure time, and faster recovery.",
    q4: "Do you have experience with pediatric treatment?",
    a4: "Yes, our pediatric dental services use a patient, gentle approach so children have a stress-free experience.",
    q5: "Do you accept dental insurance?",
    a5: "Yes, we work with most major dental insurance providers. Contact us for specific coverage details.",
    q6: "Why should I choose Dr. Siahnouri?",
    a6: "Over 10 years of professional experience, special focus on implants and advanced root canal treatments, modern equipment, and customized treatment plans for each patient."
  },
  whyimaz: {
    label: "— WHY IMAZ DENTAL —", heading: "Why Dr. Iman Siahnouri?",
    stat_years: "Years Professional Experience", stat_patients: "Happy Patients",
    stat_services: "Specialist Services", stat_success: "Successful Treatments",
    feat1_title: "Over 10 Years Experience", feat1_desc: "Special focus on implants and advanced root canal treatments",
    feat2_title: "Modern Equipment", feat2_desc: "Utilizing the latest equipment and up-to-date scientific methods",
    feat3_title: "Customized Treatment Plans", feat3_desc: "Providing personalized treatment plans for each patient",
    feat4_title: "High Patient Satisfaction", feat4_desc: "Satisfaction from over a thousand patients with treatment quality"
  },
  mobileCta: { book: "Book Your Consultation" },
  floating: {
    whatsapp: "WhatsApp", call: "Call Us", open: "Open contact menu",
    close: "Close", tooltip: "Get in touch"
  },
  admin: {
    open_panel: "Secretary", title: "Imaz Dental Admin Panel",
    subtitle: "Clinic Appointment Management & Coordination",
    username: "Username", password: "Password",
    username_placeholder: "Enter username", password_placeholder: "Enter password",
    login_btn: "Login", login_error: "Invalid username or password",
    login_hint: "Username: admin · Password: 1234",
    login_welcome: "Welcome Back", login_subtitle: "Sign in to access the management panel",
    dashboard_title: "Appointment Manager", dashboard_subtitle: "Monitor and manage clinic appointments",
    logout: "Logout", back_to_site: "Back to Site", collapse_sidebar: "Collapse",
    stat_total: "Total", stat_pending: "Pending", stat_confirmed: "Confirmed", stat_rejected: "Rejected",
    status_pending: "Pending", status_confirmed: "Confirmed", status_rejected: "Rejected", status_rescheduled: "Rescheduled",
    filter_all: "All", search_placeholder: "Search name, phone, service...",
    no_bookings: "No bookings found", no_bookings_sub: "New bookings will appear here",
    notes: "Notes",
    btn_confirm: "Confirm", btn_reject: "Reject", btn_reschedule: "Reschedule", btn_restore: "Restore", btn_delete: "Delete",
    view_details: "View Details", detail_title: "Appointment Details",
    detail_service: "Service", detail_date: "Date", detail_time: "Time", detail_phone: "Phone",
    online_status: "System Online",
    feature_appointments: "Manage and track patient appointments",
    feature_notifications: "Instant notifications for new bookings",
    feature_analytics: "Clinic statistics and reports",
    nav_appointments: "Appointments", nav_calendar: "Calendar", nav_patients: "Patients",
    nav_analytics: "Analytics", nav_messages: "Messages", nav_settings: "Settings",
    loading_bookings: "Loading bookings...",
    load_error: "Failed to load data. Please check your internet connection.",
    load_error_title: "Loading Error", retry: "Retry", refresh: "Refresh",
    confirm_delete: "Are you sure you want to delete this booking?",
    status_updated: "Status updated successfully", booking_deleted: "Booking deleted successfully",
    action_error: "Action failed",
    created_at: "Created", updated_at: "Last Updated",
    btn_new_booking: "New Booking", btn_edit: "Edit", btn_save: "Save",
    btn_cancel: "Cancel", btn_close: "Close", btn_add_patient: "Add Patient",
    btn_send: "Send", btn_mark_read: "Mark Read", btn_mark_unread: "Mark Unread",
    detail_email: "Email", detail_notes: "Notes",
    calendar_title: "Appointment Calendar", calendar_today: "Today",
    calendar_no_appointments: "No appointments on this day", calendar_appointments_on: "Appointments on",
    patients_title: "Patient Management", patients_search: "Search patients...",
    patients_no_results: "No patients found",
    patients_no_results_sub: "New patients are added when bookings are created",
    patients_booking_history: "Booking History", patients_total_bookings: "Total Bookings",
    patients_last_visit: "Last Visit", patients_add_notes: "Add Notes",
    analytics_title: "Analytics & Reports", analytics_overview: "Overview",
    analytics_total_bookings: "Total Bookings", analytics_total_patients: "Total Patients",
    analytics_pending: "Pending", analytics_confirmed: "Confirmed", analytics_today: "Today's Bookings",
    analytics_by_service: "Service Distribution", analytics_by_status: "Booking Status",
    analytics_weekly: "Weekly Trend", analytics_monthly: "Monthly Trend",
    analytics_no_data: "No data available",
    messages_title: "Messages", messages_search: "Search messages...",
    messages_inbox: "Inbox", messages_unread: "Unread",
    messages_no_results: "No messages found",
    messages_no_results_sub: "New messages from the contact form will appear here",
    messages_from: "From", messages_date: "Date", messages_subject: "Subject",
    messages_delete_confirm: "Are you sure you want to delete this message?",
    settings_title: "Settings", settings_profile: "Profile",
    settings_working_hours: "Working Hours", settings_password: "Change Password",
    settings_current_password: "Current Password", settings_new_password: "New Password",
    settings_confirm_password: "Confirm Password",
    settings_password_changed: "Password changed successfully",
    settings_password_error: "Current password is incorrect",
    settings_clinic_name: "Clinic Name", settings_clinic_phone: "Clinic Phone",
    settings_clinic_address: "Clinic Address", settings_saved: "Settings saved",
    create_booking_title: "New Booking", edit_booking_title: "Edit Booking",
    reschedule_title: "Reschedule Booking", reschedule_new_date: "New Date", reschedule_new_time: "New Time",
    pagination_prev: "Previous", pagination_next: "Next",
    pagination_showing: "Showing", pagination_of: "of", pagination_results: "results",
    detail_name: "Full Name", btn_add: "Add",
    hours_open: "Open", hours_closed: "Closed", hours_open_time: "Open Time",
    hours_close_time: "Close Time", hours_slot_duration: "Slot Duration",
    holidays_tab: "Holidays", holiday_date: "Date", holiday_title: "Title",
    holiday_title_ph: "Holiday name", holidays_empty: "No holidays defined",
    reserved_tab: "Blocked Slots", reserved_date: "Date", reserved_time: "Time",
    reserved_reason: "Reason", reserved_reason_ph: "Reason for blocking",
    reserved_empty: "No blocked slots", reserved_manual: "Manual block"
  }
};

const arData: Record<string, Record<string, string>> = {
  meta: { locale: "ar", dir: "rtl" },
  header: {
    nav_about: "من نحن", nav_services: "الخدمات", nav_process: "العملية",
    nav_results: "النتائج", nav_contact: "اتصل بنا", logo_sub: "عيادة أسنان",
    book_now: "احجز الآن", book_consultation: "احجز استشارتك",
    menu_aria: "القائمة", switch_lang: "تغيير اللغة"
  },
  hero: {
    badge: "عيادة إيماز دنتال لطب الأسنان",
    heading_l1: "زراعة الأسنان", heading_l2: "وعلاج الجذور", heading_l3: "المتخصص", heading_l4: "إيماز دنتال",
    subtitle: "الدكتور إيمان سياه نوري، جراح أسنان بخبرة تزيد عن ١٠ عاماً. علاجات متخصصة في الزراعة وعلاج العصب والتجميل باستخدام معدات حديثة وطرق علمية محدثة.",
    cta_book: "احجز استشارتك", cta_explore: "استكشف الخدمات",
    stat_years: "سنوات خبرة", stat_patients: "مرضى سعداء",
    img_alt: "عيادة إيماز دنتال",
    badge_safe: "رخصة طبية ١٧٤٢٩١", badge_safe_sub: "جراح أسنان",
    badge_trusted: "أكثر من ٨٠٠٠ مريض", badge_trusted_sub: "علاجات ناجحة",
    scroll_down: "مرر لأسفل"
  },
  about: {
    label: "عن الدكتور إيمان سياه نوري",
    heading_l1: "جراح أسنان", heading_l2: "بنهج تشخيص دقيق",
    description: "الدكتور إيمان سياه نوري، جراح أسنان (رقم الرخصة الطبية ١٧٤٢٩١)، بخبرة مهنية تزيد عن ١٠ عاماً هو أحد الخيارات الموثوقة في مدينة قم. النهج العلاجي في هذه العيادة يقوم على التشخيص الدقيق واستخدام المعدات الحديثة وأحدث الطرق العلمية لطب الأسنان حتى يتمكن المرضى من الخضوع للعلاج براحة وثقة تامة.",
    feature_1_title: "تشخيص دقيق ومعدات حديثة", feature_1_desc: "استخدام أحدث المعدات والطرق العلمية للتشخيص والعلاج الدقيق.",
    feature_2_title: "خطط علاج مخصصة", feature_2_desc: "تقديم خطط علاج شخصية تناسب حالة كل مريض.",
    feature_3_title: "راحة وثقة تامة", feature_3_desc: "بيئة هادئة ومهنية لتجربة علاجية خالية من التوتر.",
    cta: "تعرف على د. سياه نوري", img_alt: "الدكتور إيمان سياه نوري",
    badge_name: "الدكتور إيمان سياه نوري، جراح أسنان", badge_sub: "رقم الرخصة الطبية ١٧٤٢٩١ · ١٠+ سنة خبرة"
  },
  services: {
    label: "الخدمات المتخصصة", heading: "خدمات طب الأسنان المتخصصة",
    subtitle: "زراعة رقمية وعلاج جذور وتجميل والمزيد — كلها في مركز موثوق واحد.",
    svc_1_title: "الزراعة الرقمية وترقيع العظم", svc_1_desc: "زراعة الأسنان بتقنيات حديثة مع ترقيع العظم عند الحاجة لنتائج طويلة الأمد.",
    svc_2_title: "علاج الجذور المتخصص (الاندودانتيكس)", svc_2_desc: "علاج متقدم للجذور بمعدات دقيقة للحفاظ على بنية السن الطبيعية.",
    svc_3_title: "تصميم الابتسامة والعلاجات التجميلية", svc_3_desc: "تصحيح الابتسامة وعلاجات تجميلية لابتسامة طبيعية متناسقة مع الوجه.",
    svc_4_title: "تقويم الأسنان", svc_4_desc: "تصحيح عدم انتظام الأسنان بطرق حديثة لابتسامة منتظمة.",
    svc_5_title: "أطراف صناعية ثابتة ومتحركة", svc_5_desc: "أطراف صناعية عالية الجودة لاستعادة الوظيفة وجمال الابتسامة.",
    svc_6_title: "طب أسنان الأطفال", svc_6_desc: "خدمات أسنان الأطفال بنهج صبور وهادئ لتجربة خالية من التوتر.",
    learn_more: "اعرف المزيد", play_video: "تشغيل الفيديو", watch_video: "مشاهدة الفيديو"
  },
  process: {
    label: "كيف تعمل", heading: "ثلاث خطوات بسيطة",
    subtitle: "حجز استشارتك لم يكن أسهل من ذلك.",
    step_1_title: "احجز أونلاين", step_1_desc: "املأ نموذجنا البسيط — يستغرق أقل من ٦٠ ثانية.",
    step_2_title: "استشارة متخصصة", step_2_desc: "الدكتور سياه نوري يحدد خطة العلاج المخصصة لك.",
    step_3_title: "ابتسم بثقة", step_3_desc: "علاج أصيل ودائم لابتسامة جميلة وثقة أكبر بالنفس."
  },
  gallery: {
    label: "معرض الابتسامات", heading: "شاهد التحول",
    subtitle: "اسحب الشريط لمقارنة النتائج قبل وبعد.",
    before: "قبل", after: "بعد",
    item_1_title: "زراعة رقمية", item_1_sub: "نتيجة طبيعية ودائمة",
    item_2_title: "علاج الجذور", item_2_sub: "إنقاذ السن الطبيعي",
    item_3_title: "تصميم الابتسامة", item_3_sub: "تحول كامل للابتسامة",
    drag_hint: "اسحب للمقارنة", cta: "ابدأ تحولك"
  },
  booking: {
    label: "احجز موعدك", heading_l1: "ابتسامتك المثالية", heading_l2: "تبدأ هنا",
    subtitle: "املأ النموذج أدناه وسنؤكد خلال ٣٠ دقيقة.",
    step_details: "التفاصيل", step_schedule: "الجدولة", step_confirm: "التأكيد",
    lbl_name: "الاسم الكامل *", lbl_phone: "رقم الهاتف *", lbl_email: "البريد الإلكتروني",
    lbl_service: "الخدمة المطلوبة *", lbl_date: "التاريخ المفضل *", lbl_time: "الوقت المفضل *",
    lbl_notes: "ملاحظات إضافية", select_service: "اختر خدمة",
    svc_implants: "الزراعة الرقمية وترقيع العظم", svc_rootcanal: "علاج الجذور المتخصص (الاندودانتيكس)",
    svc_makeover: "تصميم الابتسامة والعلاجات التجميلية", svc_ortho: "تقويم الأسنان",
    svc_prosthetics: "أطراف صناعية ثابتة ومتحركة", svc_pediatric: "طب أسنان الأطفال",
    btn_next: "الخطوة التالية", btn_back: "رجوع", btn_review: "مراجعة",
    btn_confirm: "تأكيد الموعد", btn_processing: "جارٍ المعالجة...",
    summary_title: "ملخص الموعد", summary_patient: "المريض", summary_phone: "الهاتف",
    summary_service: "الخدمة", summary_date: "التاريخ", summary_time: "الوقت",
    info_callout: "سيتصل منسقنا خلال ٣٠ دقيقة لتأكيد موعدك.",
    success_title: "تم حجز الموعد!", success_thankyou: "شكراً لك،",
    success_message: "تلقينا طلبك. سيتصل بك منسقنا قريباً.",
    success_home: "العودة للرئيسية",
    err_name: "يرجى إدخال اسمك الكامل", err_phone: "يرجى إدخال رقم هاتف صالح",
    err_service: "يرجى اختيار خدمة", err_date: "يرجى اختيار تاريخ",
    err_time: "يرجى اختيار وقت", err_required: "يرجى ملء جميع الحقول المطلوبة",
    toast_success: "تم حجز الموعد بنجاح!",
    slot_available: "متاح", slot_booked: "محجوز",
    slot_count_before: "", slot_count_after: "موعد متاح",
    holiday_notice: "هذا اليوم عطلة", holiday_closed: "العيادة مغلقة في هذا اليوم",
    dayoff_notice: "العيادة مغلقة في هذا اليوم", no_slots: "لا توجد مواعيد متاحة لهذا التاريخ"
  },
  footer: {
    logo_sub: "عيادة أسنان",
    about: "إيماز دنتال — تجربة مختلفة لطب الأسنان الحديث في قم. منذ ٢٠١٩، نقدم خدمات دقيقة ورقمية وموثوقة.",
    col_links: "روابط سريعة", link_about: "من نحن", link_services: "الخدمات المتخصصة",
    link_gallery: "معرض الابتسامات", link_booking: "حجز موعد",
    col_contact: "اتصل بنا", address: "قم، شارع شهيد فاطمي، ميدان رسالت، زقاق فاطمي ٢٩، رقم ٤٠، الطابق ٧، الوحدة ٧١٣", phone: "٠٢٥-٣٧٤٠١٠٦٥",
    email: "info@imazdental.com",
    col_hours: "ساعات العمل", day_mon_thu: "الاثنين – الخميس", day_fri: "الجمعة",
    day_sat: "السبت", day_sun: "الأحد", hours_closed: "مغلق",
    emergency: "خط الطوارئ ٢٤/٧",
    cta_heading: "هل أنت مستعد لابتسامة أحلامك؟",
    cta_sub: "احجز استشارتك المجانية الآن.", cta_btn: "احجز استشارة",
    copyright: "© ٢٠٢٥ عيادة إيماز دنتال لطب الأسنان. جميع الحقوق محفوظة.",
    legal_privacy: "سياسة الخصوصية", legal_terms: "شروط الاستخدام", legal_hipaa: "الخصوصية الطبية",
    admin_link: "دخول السكرتير"
  },
  faq: {
    label: "— الأسئلة الشائعة —", heading: "أسئلتكم الشائعة",
    q1: "كم يستغرق زرع الأسنان الرقمي؟",
    a1: "تختلف مدة عملية الزراعة الرقمية الكاملة حسب حالة المريض. سيحدد الدكتور سياه نوري الجدول الزمني الدقيق للعلاج بعد الاستشارة والتقييم.",
    q2: "هل علاج الجذور مؤلم؟",
    a2: "يتم علاج الجذور المتقدم في عيادتنا بمعدات دقيقة وتخدير موضعي. معظم المرضى يبلغون عن عدم راحة بسيطة.",
    q3: "ما الفرق بين الزراعة الرقمية والتقليدية؟",
    a3: "الزراعة الرقمية موجهة بالكمبيوتر مما يوفر دقة أعلى ووقت إجراء أقصر وتعافياً أسرع.",
    q4: "هل لديكم خبرة في علاج الأطفال؟",
    a4: "نعم، خدمات أسنان الأطفال تستخدم نهجاً صبوراً وهادئاً ليحظى الأطفال بتجربة خالية من التوتر.",
    q5: "هل تقبلون تأمين الأسنان؟",
    a5: "نعم، نتعامل مع معظم شركات التأمين الرئيسية. اتصل بنا للحصول على تفاصيل التغطية.",
    q6: "لماذا يجب أن أختار الدكتور سياه نوري؟",
    a6: "أكثر من ١٠ سنة خبرة مهنية، تركيز خاص على الزراعة وعلاج الجذور المتقدم، معدات حديثة، وخطط علاج مخصصة لكل مريض."
  },
  whyimaz: {
    label: "— لماذا إيماز دنتال —", heading: "لماذا الدكتور إيمان سياه نوري؟",
    stat_years: "سنوات خبرة مهنية", stat_patients: "مريض سعيد", stat_services: "خدمات متخصصة", stat_success: "علاجات ناجحة",
    feat1_title: "أكثر من ١٠ سنة خبرة", feat1_desc: "تركيز خاص على الزراعة وعلاجات الجذور المتقدمة",
    feat2_title: "معدات حديثة", feat2_desc: "استخدام أحدث المعدات والطرق العلمية المحدثة",
    feat3_title: "خطط علاج مخصصة", feat3_desc: "تقديم خطط علاج شخصية لكل مريض",
    feat4_title: "رضا علاجي عالي", feat4_desc: "رضا أكثر من ألف مراجع عن جودة العلاج"
  },
  mobileCta: { book: "احجز استشارتك" },
  floating: {
    whatsapp: "واتساب", call: "اتصل بنا", open: "فتح قائمة الاتصال",
    close: "إغلاق", tooltip: "تواصل معنا"
  },
  admin: {
    open_panel: "السكرتير", title: "لوحة إدارة إيماز دنتال",
    subtitle: "إدارة مواعيد وتنسيق عيادة الأسنان",
    username: "اسم المستخدم", password: "كلمة المرور",
    username_placeholder: "أدخل اسم المستخدم", password_placeholder: "أدخل كلمة المرور",
    login_btn: "تسجيل الدخول", login_error: "اسم المستخدم أو كلمة المرور غير صحيحة",
    login_hint: "اسم المستخدم: admin · كلمة المرور: 1234",
    login_welcome: "مرحباً بعودتك", login_subtitle: "سجّل الدخول للوصول إلى لوحة الإدارة",
    dashboard_title: "إدارة المواعيد", dashboard_subtitle: "مراقبة وإدارة مواعيد العيادة",
    logout: "خروج", back_to_site: "العودة للموقع", collapse_sidebar: "طي القائمة",
    stat_total: "المجموع", stat_pending: "قيد الانتظار", stat_confirmed: "مؤكد", stat_rejected: "مرفوض",
    status_pending: "قيد الانتظار", status_confirmed: "مؤكد", status_rejected: "مرفوض", status_rescheduled: "معاد جدولته",
    filter_all: "الكل", search_placeholder: "بحث بالاسم أو الهاتف أو الخدمة...",
    no_bookings: "لا توجد مواعيد", no_bookings_sub: "ستظهر المواعيد الجديدة هنا",
    notes: "ملاحظات",
    btn_confirm: "تأكيد", btn_reject: "رفض", btn_reschedule: "إعادة جدولة", btn_restore: "استعادة", btn_delete: "حذف",
    view_details: "عرض التفاصيل", detail_title: "تفاصيل الموعد",
    detail_service: "الخدمة", detail_date: "التاريخ", detail_time: "الوقت", detail_phone: "الهاتف",
    online_status: "النظام متصل",
    feature_appointments: "إدارة وتتبع مواعيد المرضى",
    feature_notifications: "إشعارات فورية للحجوزات الجديدة",
    feature_analytics: "إحصائيات وتقارير العيادة",
    nav_appointments: "المواعيد", nav_calendar: "التقويم", nav_patients: "المرضى",
    nav_analytics: "الإحصائيات", nav_messages: "الرسائل", nav_settings: "الإعدادات",
    loading_bookings: "جارٍ تحميل المواعيد...",
    load_error: "فشل تحميل البيانات. يرجى التحقق من اتصال الإنترنت.",
    load_error_title: "خطأ في التحميل", retry: "إعادة المحاولة", refresh: "تحديث",
    confirm_delete: "هل أنت متأكد من حذف هذا الموعد؟",
    status_updated: "تم تحديث الحالة بنجاح", booking_deleted: "تم حذف الموعد بنجاح",
    action_error: "فشل العملية",
    created_at: "تاريخ الإنشاء", updated_at: "آخر تحديث",
    btn_new_booking: "حجز موعد جديد", btn_edit: "تعديل", btn_save: "حفظ",
    btn_cancel: "إلغاء", btn_close: "إغلاق", btn_add_patient: "إضافة مريض",
    btn_send: "إرسال", btn_mark_read: "تمت القراءة", btn_mark_unread: "غير مقروء",
    detail_email: "البريد الإلكتروني", detail_notes: "ملاحظات",
    calendar_title: "تقويم المواعيد", calendar_today: "اليوم",
    calendar_no_appointments: "لا توجد مواعيد في هذا اليوم", calendar_appointments_on: "مواعيد يوم",
    patients_title: "إدارة المرضى", patients_search: "البحث عن مرضى...",
    patients_no_results: "لم يتم العثور على مرضى",
    patients_no_results_sub: "يتم إضافة المرضى الجدد عند إنشاء الحجوزات",
    patients_booking_history: "سجل الحجوزات", patients_total_bookings: "إجمالي الحجوزات",
    patients_last_visit: "آخر زيارة", patients_add_notes: "إضافة ملاحظات",
    analytics_title: "الإحصائيات والتقارير", analytics_overview: "نظرة عامة",
    analytics_total_bookings: "إجمالي الحجوزات", analytics_total_patients: "إجمالي المرضى",
    analytics_pending: "قيد الانتظار", analytics_confirmed: "مؤكد", analytics_today: "حجوزات اليوم",
    analytics_by_service: "توزيع الخدمات", analytics_by_status: "حالة الحجوزات",
    analytics_weekly: "الاتجاه الأسبوعي", analytics_monthly: "الاتجاه الشهري",
    analytics_no_data: "لا توجد بيانات متاحة",
    messages_title: "الرسائل", messages_search: "البحث في الرسائل...",
    messages_inbox: "صندوق الوارد", messages_unread: "غير مقروء",
    messages_no_results: "لم يتم العثور على رسائل",
    messages_no_results_sub: "ستظهر الرسائل الجديدة من نموذج الاتصال هنا",
    messages_from: "من", messages_date: "التاريخ", messages_subject: "الموضوع",
    messages_delete_confirm: "هل أنت متأكد من حذف هذه الرسالة؟",
    settings_title: "الإعدادات", settings_profile: "الملف الشخصي",
    settings_working_hours: "ساعات العمل", settings_password: "تغيير كلمة المرور",
    settings_current_password: "كلمة المرور الحالية", settings_new_password: "كلمة المرور الجديدة",
    settings_confirm_password: "تأكيد كلمة المرور",
    settings_password_changed: "تم تغيير كلمة المرور بنجاح",
    settings_password_error: "كلمة المرور الحالية غير صحيحة",
    settings_clinic_name: "اسم العيادة", settings_clinic_phone: "هاتف العيادة",
    settings_clinic_address: "عنوان العيادة", settings_saved: "تم حفظ الإعدادات",
    create_booking_title: "حجز موعد جديد", edit_booking_title: "تعديل الموعد",
    reschedule_title: "إعادة جدولة الموعد", reschedule_new_date: "التاريخ الجديد", reschedule_new_time: "الوقت الجديد",
    pagination_prev: "السابق", pagination_next: "التالي",
    pagination_showing: "عرض", pagination_of: "من", pagination_results: "نتائج",
    detail_name: "الاسم الكامل", btn_add: "إضافة",
    hours_open: "مفتوح", hours_closed: "مغلق", hours_open_time: "وقت الافتتاح",
    hours_close_time: "وقت الإغلاق", hours_slot_duration: "مدة كل موعد",
    holidays_tab: "العطلات", holiday_date: "التاريخ", holiday_title: "العنوان",
    holiday_title_ph: "اسم المناسبة", holidays_empty: "لم يتم تحديد عطلات",
    reserved_tab: "المواعيد المحجوزة", reserved_date: "التاريخ", reserved_time: "الوقت",
    reserved_reason: "السبب", reserved_reason_ph: "سبب الحجز",
    reserved_empty: "لا توجد مواعيد محجوزة", reserved_manual: "حجز يدوي"
  }
};

// ─── Helper: Flatten nested keys ─────────────────────────────────────────────

function flattenKeys(
  data: Record<string, Record<string, string>>
): Array<{ key: string; value: string; group: string }> {
  const result: Array<{ key: string; value: string; group: string }> = [];
  for (const [group, entries] of Object.entries(data)) {
    for (const [subKey, value] of Object.entries(entries)) {
      result.push({
        key: `${group}.${subKey}`,
        value,
        group,
      });
    }
  }
  return result;
}

// ─── Seed Functions ──────────────────────────────────────────────────────────

async function seedFaqs() {
  console.log("🌱 Seeding FAQs...");

  const faqs = [
    { sortOrder: 1, questionFa: faData.faq.q1, answerFa: faData.faq.a1, questionEn: enData.faq.q1, answerEn: enData.faq.a1, questionAr: arData.faq.q1, answerAr: arData.faq.a1 },
    { sortOrder: 2, questionFa: faData.faq.q2, answerFa: faData.faq.a2, questionEn: enData.faq.q2, answerEn: enData.faq.a2, questionAr: arData.faq.q2, answerAr: arData.faq.a2 },
    { sortOrder: 3, questionFa: faData.faq.q3, answerFa: faData.faq.a3, questionEn: enData.faq.q3, answerEn: enData.faq.a3, questionAr: arData.faq.q3, answerAr: arData.faq.a3 },
    { sortOrder: 4, questionFa: faData.faq.q4, answerFa: faData.faq.a4, questionEn: enData.faq.q4, answerEn: enData.faq.a4, questionAr: arData.faq.q4, answerAr: arData.faq.a4 },
    { sortOrder: 5, questionFa: faData.faq.q5, answerFa: faData.faq.a5, questionEn: enData.faq.q5, answerEn: enData.faq.a5, questionAr: arData.faq.q5, answerAr: arData.faq.a5 },
    { sortOrder: 6, questionFa: faData.faq.q6, answerFa: faData.faq.a6, questionEn: enData.faq.q6, answerEn: enData.faq.a6, questionAr: arData.faq.q6, answerAr: arData.faq.a6 },
  ];

  for (const faq of faqs) {
    // Use upsert by checking if a FAQ with the same sortOrder already exists
    const existing = await prisma.faq.findFirst({ where: { sortOrder: faq.sortOrder } });
    if (existing) {
      await prisma.faq.update({
        where: { id: existing.id },
        data: faq,
      });
      console.log(`  ↻ Updated FAQ #${faq.sortOrder}`);
    } else {
      await prisma.faq.create({ data: faq });
      console.log(`  ✓ Created FAQ #${faq.sortOrder}`);
    }
  }

  console.log(`  ✅ Seeded ${faqs.length} FAQs`);
}

async function seedGallery() {
  console.log("🌱 Seeding Gallery Items...");

  const galleryItems = [
    {
      sortOrder: 1,
      titleFa: faData.gallery.item_1_title,
      subtitleFa: faData.gallery.item_1_sub,
      titleEn: enData.gallery.item_1_title,
      subtitleEn: enData.gallery.item_1_sub,
      titleAr: arData.gallery.item_1_title,
      subtitleAr: arData.gallery.item_1_sub,
      beforeImage: "/images/before-1.png",
      afterImage: "/images/after-1.png",
    },
    {
      sortOrder: 2,
      titleFa: faData.gallery.item_2_title,
      subtitleFa: faData.gallery.item_2_sub,
      titleEn: enData.gallery.item_2_title,
      subtitleEn: enData.gallery.item_2_sub,
      titleAr: arData.gallery.item_2_title,
      subtitleAr: arData.gallery.item_2_sub,
      beforeImage: "/images/before-2.png",
      afterImage: "/images/after-2.png",
    },
    {
      sortOrder: 3,
      titleFa: faData.gallery.item_3_title,
      subtitleFa: faData.gallery.item_3_sub,
      titleEn: enData.gallery.item_3_title,
      subtitleEn: enData.gallery.item_3_sub,
      titleAr: arData.gallery.item_3_title,
      subtitleAr: arData.gallery.item_3_sub,
      beforeImage: "/images/before-3.png",
      afterImage: "/images/after-3.png",
    },
  ];

  for (const item of galleryItems) {
    const existing = await prisma.galleryItem.findFirst({ where: { sortOrder: item.sortOrder } });
    if (existing) {
      await prisma.galleryItem.update({
        where: { id: existing.id },
        data: item,
      });
      console.log(`  ↻ Updated Gallery Item #${item.sortOrder}`);
    } else {
      await prisma.galleryItem.create({ data: item });
      console.log(`  ✓ Created Gallery Item #${item.sortOrder}`);
    }
  }

  console.log(`  ✅ Seeded ${galleryItems.length} Gallery Items`);
}

async function seedSiteTexts() {
  console.log("🌱 Seeding Site Texts...");

  const faEntries = flattenKeys(faData);
  const enEntries = flattenKeys(enData);
  const arEntries = flattenKeys(arData);

  // Build a map from key to { valueFa, valueEn, valueAr, group }
  const siteTextMap = new Map<string, { valueFa: string; valueEn: string; valueAr: string; group: string }>();

  for (const entry of faEntries) {
    siteTextMap.set(entry.key, { valueFa: entry.value, valueEn: "", valueAr: "", group: entry.group });
  }
  for (const entry of enEntries) {
    const existing = siteTextMap.get(entry.key);
    if (existing) {
      existing.valueEn = entry.value;
    } else {
      siteTextMap.set(entry.key, { valueFa: "", valueEn: entry.value, valueAr: "", group: entry.group });
    }
  }
  for (const entry of arEntries) {
    const existing = siteTextMap.get(entry.key);
    if (existing) {
      existing.valueAr = entry.value;
    } else {
      siteTextMap.set(entry.key, { valueFa: "", valueEn: "", valueAr: entry.value, group: entry.group });
    }
  }

  let created = 0;
  let updated = 0;

  for (const [key, values] of siteTextMap) {
    await prisma.siteText.upsert({
      where: { key },
      update: {
        valueFa: values.valueFa,
        valueEn: values.valueEn,
        valueAr: values.valueAr,
        group: values.group,
      },
      create: {
        key,
        valueFa: values.valueFa,
        valueEn: values.valueEn,
        valueAr: values.valueAr,
        group: values.group,
      },
    });
    // Check if it was created or updated (upsert doesn't tell us directly, so we track by count)
    created++;
  }

  console.log(`  ✅ Seeded ${siteTextMap.size} SiteText entries (upsert)`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seedCollaborations() {
  console.log("🤝 Seeding collaborations...");

  const collaborations = [
    {
      nameFa: "بیمه دندانپزشکی ایران",
      nameEn: "Iran Dental Insurance",
      nameAr: "تأمين الأسنان الإيراني",
      image: "/uploads/collaborations/collab-insurance.png",
      sortOrder: 1,
      isActive: true,
    },
  ];

  // Clear existing collaborations
  await prisma.collaboration.deleteMany({});

  for (const collab of collaborations) {
    await prisma.collaboration.create({ data: collab });
    console.log(`  ✓ ${collab.nameFa}`);
  }

  console.log(`  → ${collaborations.length} collaborations seeded`);
}

async function seedWorkingHours() {
  console.log("🕐 Seeding working hours...");

  const workingHours = [
    { day: "saturday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "sunday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "monday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "21:00" },
    { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "15:00" },
    { day: "friday", isOpen: false, openTime: "00:00", closeTime: "00:00" },
  ];

  // Clear existing
  await prisma.workingHour.deleteMany({});

  for (const wh of workingHours) {
    await prisma.workingHour.create({ data: wh });
  }

  console.log(`  → ${workingHours.length} working hours seeded`);
}

async function seedSlotConfig() {
  console.log("⏱️ Seeding slot config...");

  const existing = await prisma.slotConfig.findFirst();
  if (!existing) {
    await prisma.slotConfig.create({
      data: {
        slotDuration: 30,
        bufferTime: 5,
      },
    });
    console.log("  ✓ Slot config created (30min slots, 5min buffer)");
  } else {
    console.log("  → Slot config already exists, skipping");
  }
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  await seedFaqs();
  console.log();
  await seedGallery();
  console.log();
  await seedCollaborations();
  console.log();
  await seedWorkingHours();
  console.log();
  await seedSlotConfig();
  console.log();
  await seedSiteTexts();

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
