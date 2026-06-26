import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ------------------------------------------------------------------ */
/*  POST /api/seed — One-time database seeder for production MySQL     */
/*                                                                      */
/*  Seeds: SiteText, GalleryItem, Faq, SlotConfig, ClinicSetting       */
/*  Requires admin auth via SEED_SECRET query param or Authorization    */
/*  Uses upsert to be idempotent — safe to run multiple times           */
/* ------------------------------------------------------------------ */

/* ── Auth check: require SEED_SECRET ── */
function verifySeedAuth(request: NextRequest): boolean {
  const seedSecret = process.env.SEED_SECRET;
  if (!seedSecret) return false; // If no secret configured, deny access

  // Check query param: /api/seed?secret=xxx
  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret === seedSecret) return true;

  // Check Authorization header: Bearer xxx
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${seedSecret}`) return true;

  return false;
}

// ─── i18n data (abbreviated — same as prisma/seed.ts) ────────────

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
    learn_more: "بیشتر بدانید"
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
    q1: "ایمپلنت دندان چقدر طول می‌کشد؟", a1: "کل فرآیند ایمپلنت دیجیتال بسته به شرایط بیمار متفاوت است. دکتر سیاه‌نوری پس از مشاوره و بررسی، زمان دقیق درمان را مشخص می‌کند.",
    q2: "آیا درمان ریشه دردناک است؟", a2: "درمان ریشه پیشرفته در این مرکز با تجهیزات دقیق و بی‌حسی موضعی انجام می‌شود و بیشتر بیماران درد کمی گزارش می‌دهند.",
    q3: "تفاوت ایمپلنت دیجیتال با معمولی چیست؟", a3: "ایمپلنت دیجیتال با راهنمایی کامپیوتری انجام می‌شود که دقت بالاتر، زمان کوتاه‌تر و بهبودی سریع‌تری دارد.",
    q4: "آیا برای درمان اطفال تجربه کافی دارید؟", a4: "بله، خدمات دندانپزشکی اطفال با رویکردی صبورانه و آرام انجام می‌شود تا کودکان تجربه‌ای بدون استرس داشته باشند.",
    q5: "آیا بیمه دندانپزشکی را قبول می‌کنید؟", a5: "بله، با اکثر شرکت‌های بیمه دندانپزشکی اصلی همکاری داریم. برای جزئیات پوشش با ما تماس بگیرید.",
    q6: "چرا باید دکتر سیاه‌نوری را انتخاب کنم؟", a6: "بیش از ۱۰ سال تجربه حرفه‌ای، تمرکز ویژه بر ایمپلنت و درمان ریشه، تجهیزات مدرن، و طرح درمان اختصاصی برای هر بیمار."
  },
  whyimaz: {
    label: "— چرا ایماز دنتال —", heading: "چرا دکتر ایمان سیاه‌نوری؟",
    stat_years: "سال تجربه حرفه‌ای", stat_patients: "بیمار راضی", stat_services: "خدمت تخصصی",
    feat1_title: "بیش از ۱۰ سال تجربه", feat1_desc: "تمرکز ویژه بر ایمپلنت و درمان‌های پیشرفته ریشه",
    feat2_title: "تجهیزات مدرن", feat2_desc: "استفاده از جدیدترین تجهیزات و روش‌های علمی به‌روز",
    feat3_title: "طرح درمان اختصاصی", feat3_desc: "ارائه طرح درمان شخصی‌سازی‌شده برای هر بیمار",
    feat4_title: "رضایت درمانی بالا", feat4_desc: "رضایت بیش از هزار مراجعه‌کننده از کیفیت درمان"
  },
  mobileCta: { book: "رزرو مشاوره" },
  floating: { whatsapp: "واتساپ", call: "تماس تلفنی", open: "باز کردن منوی تماس", close: "بستن", tooltip: "با ما در تماس باشید" },
};

const enData: Record<string, Record<string, string>> = {
  meta: { locale: "en", dir: "ltr" },
  header: { nav_about: "About", nav_services: "Services", nav_process: "Process", nav_results: "Results", nav_contact: "Contact", logo_sub: "Dental Clinic", book_now: "Book Now", book_consultation: "Book Your Consultation", menu_aria: "Menu", switch_lang: "Switch language" },
  hero: { badge: "Imaz Dental Clinic", heading_l1: "Dental Implants &", heading_l2: "Root Canal", heading_l3: "Specialist", heading_l4: "Care", subtitle: "Dr. Iman Siahnouri, dental surgeon with over 10 years of professional experience. Specializing in implants, root canals, and cosmetic treatments using modern equipment and evidence-based methods.", cta_book: "Book Your Consultation", cta_explore: "Explore Services", stat_years: "Years Exp.", stat_patients: "Happy Patients", img_alt: "Imaz Dental Clinic", badge_safe: "Medical License 174291", badge_safe_sub: "Dental Surgeon", badge_trusted: "Over 8,000 Patients", badge_trusted_sub: "Successful Treatments", scroll_down: "Scroll Down" },
  about: { label: "About Dr. Iman Siahnouri", heading_l1: "Dental Surgeon with", heading_l2: "Precision Diagnosis Approach", description: "Dr. Iman Siahnouri, dental surgeon (Medical License No. 174291), with over 10 years of professional experience, is one of the most trusted dental practitioners in Qom. The treatment approach at this clinic is based on precise diagnosis, modern equipment, and the latest evidence-based dental methods, ensuring patients can undergo treatment with complete peace of mind.", feature_1_title: "Precise Diagnosis & Modern Equipment", feature_1_desc: "Utilizing the latest equipment and scientific methods for accurate diagnosis and treatment.", feature_2_title: "Customized Treatment Plans", feature_2_desc: "Providing personalized treatment plans tailored to each patient's condition.", feature_3_title: "Complete Peace of Mind", feature_3_desc: "A calm, professional environment for a stress-free treatment experience.", cta: "Meet Dr. Siahnouri", img_alt: "Dr. Iman Siahnouri", badge_name: "Dr. Iman Siahnouri, Dental Surgeon", badge_sub: "Medical License No. 174291 · 10+ Years Experience" },
  services: { label: "Specialist Services", heading: "Specialist Dental Services", subtitle: "Digital implants, root canal treatment, cosmetics and more — all in one trusted center.", svc_1_title: "Digital Implants & Bone Grafting", svc_1_desc: "Implant placement using modern techniques, with bone grafting if needed, for long-lasting results.", svc_2_title: "Endodontics (Root Canal)", svc_2_desc: "Advanced root canal therapy with precision equipment to preserve natural tooth structure.", svc_3_title: "Smile Design & Cosmetic Treatments", svc_3_desc: "Smile correction and cosmetic treatments for a natural, face-proportioned smile.", svc_4_title: "Orthodontics", svc_4_desc: "Correcting dental misalignment with modern methods for a well-aligned smile.", svc_5_title: "Fixed & Removable Prosthetics", svc_5_desc: "High-quality fixed and removable prosthetics for restoring function and smile aesthetics.", svc_6_title: "Pediatric Dentistry", svc_6_desc: "Children's dental services with a patient, gentle approach for a stress-free experience.", learn_more: "Learn more" },
  process: { label: "How It Works", heading: "Three Simple Steps", subtitle: "Booking your consultation has never been easier.", step_1_title: "Book Online", step_1_desc: "Fill out our simple form — it takes less than 60 seconds.", step_2_title: "Specialist Consultation", step_2_desc: "Dr. Siahnouri will determine your customized treatment plan.", step_3_title: "Smile Confidently", step_3_desc: "Principled, lasting treatment for a beautiful smile and more confidence." },
  gallery: { label: "Smile Gallery", heading: "See the Transformation", subtitle: "Drag the slider to compare before and after results.", before: "Before", after: "After", item_1_title: "Digital Implant", item_1_sub: "Natural, lasting result", item_2_title: "Root Canal Treatment", item_2_sub: "Natural tooth saved", item_3_title: "Smile Design", item_3_sub: "Complete smile transformation", drag_hint: "Drag to compare", cta: "Start Your Transformation" },
  booking: { label: "Book Your Appointment", heading_l1: "Your Perfect Smile", heading_l2: "Starts Here", subtitle: "Fill out the form below and we'll confirm within 30 minutes.", step_details: "Details", step_schedule: "Schedule", step_confirm: "Confirm", lbl_name: "Full Name *", lbl_phone: "Phone Number *", lbl_email: "Email Address", lbl_service: "Service Needed *", lbl_date: "Preferred Date *", lbl_time: "Preferred Time *", lbl_notes: "Additional Notes", select_service: "Select a service", svc_implants: "Digital Implants & Bone Grafting", svc_rootcanal: "Endodontics (Root Canal)", svc_makeover: "Smile Design & Cosmetic Treatments", svc_ortho: "Orthodontics", svc_prosthetics: "Fixed & Removable Prosthetics", svc_pediatric: "Pediatric Dentistry", btn_next: "Next Step", btn_back: "Back", btn_review: "Review", btn_confirm: "Confirm Appointment", btn_processing: "Processing...", summary_title: "Appointment Summary", summary_patient: "Patient", summary_phone: "Phone", summary_service: "Service", summary_date: "Date", summary_time: "Time", info_callout: "Our coordinator will call within 30 minutes to confirm your appointment.", success_title: "Appointment Booked!", success_thankyou: "Thank you,", success_message: "We've received your request. Our coordinator will call you shortly.", success_home: "Back to Home", err_name: "Please enter your full name", err_phone: "Please enter a valid phone number", err_service: "Please select a service", err_date: "Please select a date", err_time: "Please select a time slot", err_required: "Please fill in all required fields", toast_success: "Appointment booked successfully!", slot_available: "Available", slot_booked: "Booked", slot_count_before: "", slot_count_after: "time slots available", holiday_notice: "This day is a holiday", holiday_closed: "The clinic is closed on this day", dayoff_notice: "The clinic is closed on this day", no_slots: "No available time slots for this date" },
  footer: { logo_sub: "Dental Clinic", about: "Imaz Dental — A different experience of modern dentistry in Qom. Since 2019, providing precise, digital, and trusted dental services.", col_links: "Quick Links", link_about: "About Us", link_services: "Specialist Services", link_gallery: "Smile Gallery", link_booking: "Book Appointment", col_contact: "Contact Us", address: "Qom, Shahid Fatemi St., Resalat Sq., Fatemi 29 Alley, No. 40, 7th Floor, Unit 713", phone: "025-37401065", email: "info@imazdental.com", col_hours: "Working Hours", day_mon_thu: "Mon – Thu", day_fri: "Friday", day_sat: "Saturday", day_sun: "Sunday", hours_closed: "Closed", emergency: "24/7 Emergency Line", cta_heading: "Ready for Your Dream Smile?", cta_sub: "Book your free consultation now.", cta_btn: "Book Consultation", copyright: "© 2025 Imaz Dental Clinic. All rights reserved.", legal_privacy: "Privacy Policy", legal_terms: "Terms of Service", legal_hipaa: "Medical Privacy", admin_link: "Secretary Login" },
  faq: { label: "— FAQ —", heading: "Common Questions", q1: "How long does a dental implant take?", a1: "The full digital implant process varies depending on the patient's condition. Dr. Siahnouri will determine the exact treatment timeline after consultation and evaluation.", q2: "Is root canal treatment painful?", a2: "Advanced root canal treatment at our clinic is performed with precision equipment and local anesthesia. Most patients report minimal discomfort.", q3: "What's the difference between digital and conventional implants?", a3: "Digital implants are computer-guided, offering higher precision, shorter procedure time, and faster recovery.", q4: "Do you have experience with pediatric treatment?", a4: "Yes, our pediatric dental services use a patient, gentle approach so children have a stress-free experience.", q5: "Do you accept dental insurance?", a5: "Yes, we work with most major dental insurance providers. Contact us for specific coverage details.", q6: "Why should I choose Dr. Siahnouri?", a6: "Over 10 years of professional experience, special focus on implants and advanced root canal treatments, modern equipment, and customized treatment plans for each patient." },
  whyimaz: { label: "— WHY IMAZ DENTAL —", heading: "Why Dr. Iman Siahnouri?", stat_years: "Years Professional Experience", stat_patients: "Happy Patients", stat_services: "Specialist Services", feat1_title: "Over 10 Years Experience", feat1_desc: "Special focus on implants and advanced root canal treatments", feat2_title: "Modern Equipment", feat2_desc: "Utilizing the latest equipment and up-to-date scientific methods", feat3_title: "Customized Treatment Plans", feat3_desc: "Providing personalized treatment plans for each patient", feat4_title: "High Patient Satisfaction", feat4_desc: "Satisfaction from over a thousand patients with treatment quality" },
  mobileCta: { book: "Book Your Consultation" },
  floating: { whatsapp: "WhatsApp", call: "Call Us", open: "Open contact menu", close: "Close", tooltip: "Get in touch" },
};

const arData: Record<string, Record<string, string>> = {
  meta: { locale: "ar", dir: "rtl" },
  header: { nav_about: "من نحن", nav_services: "الخدمات", nav_process: "العملية", nav_results: "النتائج", nav_contact: "اتصل بنا", logo_sub: "عيادة أسنان", book_now: "احجز الآن", book_consultation: "احجز استشارتك", menu_aria: "القائمة", switch_lang: "تغيير اللغة" },
  hero: { badge: "عيادة إيماز دنتال لطب الأسنان", heading_l1: "زراعة الأسنان", heading_l2: "وعلاج الجذور", heading_l3: "المتخصص", heading_l4: "إيماز دنتال", subtitle: "الدكتور إيمان سياه نوري، جراح أسنان بخبرة تزيد عن ١٠ عاماً. علاجات متخصصة في الزراعة وعلاج العصب والتجميل باستخدام معدات حديثة وطرق علمية محدثة.", cta_book: "احجز استشارتك", cta_explore: "استكشف الخدمات", stat_years: "سنوات خبرة", stat_patients: "مرضى سعداء", img_alt: "عيادة إيماز دنتال", badge_safe: "رخصة طبية ١٧٤٢٩١", badge_safe_sub: "جراح أسنان", badge_trusted: "أكثر من ٨٠٠٠ مريض", badge_trusted_sub: "علاجات ناجحة", scroll_down: "مرر لأسفل" },
  about: { label: "عن الدكتور إيمان سياه نوري", heading_l1: "جراح أسنان", heading_l2: "بنهج تشخيص دقيق", description: "الدكتور إيمان سياه نوري، جراح أسنان (رقم الرخصة الطبية ١٧٤٢٩١)، بخبرة مهنية تزيد عن ١٠ عاماً هو أحد الخيارات الموثوقة في مدينة قم. النهج العلاجي في هذه العيادة يقوم على التشخيص الدقيق واستخدام المعدات الحديثة وأحدث الطرق العلمية لطب الأسنان حتى يتمكن المرضى من الخضوع للعلاج براحة وثقة تامة.", feature_1_title: "تشخيص دقيق ومعدات حديثة", feature_1_desc: "استخدام أحدث المعدات والطرق العلمية للتشخيص والعلاج الدقيق.", feature_2_title: "خطط علاج مخصصة", feature_2_desc: "تقديم خطط علاج شخصية تناسب حالة كل مريض.", feature_3_title: "راحة وثقة تامة", feature_3_desc: "بيئة هادئة ومهنية لتجربة علاجية خالية من التوتر.", cta: "تعرف على د. سياه نوري", img_alt: "الدكتور إيمان سياه نوري", badge_name: "الدكتور إيمان سياه نوري، جراح أسنان", badge_sub: "رقم الرخصة الطبية ١٧٤٢٩١ · ١٠+ سنة خبرة" },
  services: { label: "الخدمات المتخصصة", heading: "خدمات طب الأسنان المتخصصة", subtitle: "زراعة رقمية وعلاج جذور وتجميل والمزيد — كلها في مركز موثوق واحد.", svc_1_title: "الزراعة الرقمية وترقيع العظم", svc_1_desc: "زراعة الأسنان بتقنيات حديثة مع ترقيع العظم عند الحاجة لنتائج طويلة الأمد.", svc_2_title: "علاج الجذور المتخصص (الاندودانتيكس)", svc_2_desc: "علاج متقدم للجذور بمعدات دقيقة للحفاظ على بنية السن الطبيعية.", svc_3_title: "تصميم الابتسامة والعلاجات التجميلية", svc_3_desc: "تصحيح الابتسامة وعلاجات تجميلية لابتسامة طبيعية متناسقة مع الوجه.", svc_4_title: "تقويم الأسنان", svc_4_desc: "تصحيح عدم انتظام الأسنان بطرق حديثة لابتسامة منتظمة.", svc_5_title: "أطراف صناعية ثابتة ومتحركة", svc_5_desc: "أطراف صناعية عالية الجودة لاستعادة الوظيفة وجمال الابتسامة.", svc_6_title: "طب أسنان الأطفال", svc_6_desc: "خدمات أسنان الأطفال بنهج صبور وهادئ لتجربة خالية من التوتر.", learn_more: "اعرف المزيد" },
  process: { label: "كيف تعمل", heading: "ثلاث خطوات بسيطة", subtitle: "حجز استشارتك لم يكن أسهل من ذلك.", step_1_title: "احجز أونلاين", step_1_desc: "املأ نموذجنا البسيط — يستغرق أقل من ٦٠ ثانية.", step_2_title: "استشارة متخصصة", step_2_desc: "الدكتور سياه نوري يحدد خطة العلاج المخصصة لك.", step_3_title: "ابتسم بثقة", step_3_desc: "علاج أصيل ودائم لابتسامة جميلة وثقة أكبر بالنفس." },
  gallery: { label: "معرض الابتسامات", heading: "شاهد التحول", subtitle: "اسحب الشريط لمقارنة النتائج قبل وبعد.", before: "قبل", after: "بعد", item_1_title: "زراعة رقمية", item_1_sub: "نتيجة طبيعية ودائمة", item_2_title: "علاج الجذور", item_2_sub: "إنقاذ السن الطبيعي", item_3_title: "تصميم الابتسامة", item_3_sub: "تحول كامل للابتسامة", drag_hint: "اسحب للمقارنة", cta: "ابدأ تحولك" },
  booking: { label: "احجز موعدك", heading_l1: "ابتسامتك المثالية", heading_l2: "تبدأ هنا", subtitle: "املأ النموذج أدناه وسنؤكد خلال ٣٠ دقيقة.", step_details: "التفاصيل", step_schedule: "الجدولة", step_confirm: "التأكيد", lbl_name: "الاسم الكامل *", lbl_phone: "رقم الهاتف *", lbl_email: "البريد الإلكتروني", lbl_service: "الخدمة المطلوبة *", lbl_date: "التاريخ المفضل *", lbl_time: "الوقت المفضل *", lbl_notes: "ملاحظات إضافية", select_service: "اختر خدمة", svc_implants: "الزراعة الرقمية وترقيع العظم", svc_rootcanal: "علاج الجذور المتخصص (الاندودانتيكس)", svc_makeover: "تصميم الابتسامة والعلاجات التجميلية", svc_ortho: "تقويم الأسنان", svc_prosthetics: "أطراف صناعية ثابتة ومتحركة", svc_pediatric: "طب أسنان الأطفال", btn_next: "الخطوة التالية", btn_back: "رجوع", btn_review: "مراجعة", btn_confirm: "تأكيد الموعد", btn_processing: "جارٍ المعالجة...", summary_title: "ملخص الموعد", summary_patient: "المريض", summary_phone: "الهاتف", summary_service: "الخدمة", summary_date: "التاريخ", summary_time: "الوقت", info_callout: "سيتصل منسقنا خلال ٣٠ دقيقة لتأكيد موعدك.", success_title: "تم حجز الموعد!", success_thankyou: "شكراً لك،", success_message: "تلقينا طلبك. سيتصل بك منسقنا قريباً.", success_home: "العودة للرئيسية", err_name: "يرجى إدخال اسمك الكامل", err_phone: "يرجى إدخال رقم هاتف صالح", err_service: "يرجى اختيار خدمة", err_date: "يرجى اختيار تاريخ", err_time: "يرجى اختيار وقت", err_required: "يرجى ملء جميع الحقول المطلوبة", toast_success: "تم حجز الموعد بنجاح!", slot_available: "متاح", slot_booked: "محجوز", slot_count_before: "", slot_count_after: "موعد متاح", holiday_notice: "هذا اليوم عطلة", holiday_closed: "العيادة مغلقة في هذا اليوم", dayoff_notice: "العيادة مغلقة في هذا اليوم", no_slots: "لا توجد مواعيد متاحة لهذا التاريخ" },
  footer: { logo_sub: "عيادة أسنان", about: "إيماز دنتال — تجربة مختلفة لطب الأسنان الحديث في قم. منذ ٢٠١٩، نقدم خدمات دقيقة ورقمية وموثوقة.", col_links: "روابط سريعة", link_about: "من نحن", link_services: "الخدمات المتخصصة", link_gallery: "معرض الابتسامات", link_booking: "حجز موعد", col_contact: "اتصل بنا", address: "قم، شارع شهيد فاطمي، ميدان رسالت، زقاق فاطمي ٢٩، رقم ٤٠، الطابق ٧، الوحدة ٧١٣", phone: "٠٢٥-٣٧٤٠١٠٦٥", email: "info@imazdental.com", col_hours: "ساعات العمل", day_mon_thu: "الاثنين – الخميس", day_fri: "الجمعة", day_sat: "السبت", day_sun: "الأحد", hours_closed: "مغلق", emergency: "خط الطوارئ ٢٤/٧", cta_heading: "هل أنت مستعد لابتسامة أحلامك؟", cta_sub: "احجز استشارتك المجانية الآن.", cta_btn: "احجز استشارة", copyright: "© ٢٠٢٥ عيادة إيماز دنتال لطب الأسنان. جميع الحقوق محفوظة.", legal_privacy: "سياسة الخصوصية", legal_terms: "شروط الاستخدام", legal_hipaa: "الخصوصية الطبية", admin_link: "دخول السكرتير" },
  faq: { label: "— الأسئلة الشائعة —", heading: "أسئلتكم الشائعة", q1: "كم يستغرق زرع الأسنان الرقمي؟", a1: "تختلف مدة عملية الزراعة الرقمية الكاملة حسب حالة المريض. سيحدد الدكتور سياه نوري الجدول الزمني الدقيق للعلاج بعد الاستشارة والتقييم.", q2: "هل علاج الجذور مؤلم؟", a2: "يتم علاج الجذور المتقدم في عيادتنا بمعدات دقيقة وتخدير موضعي. معظم المرضى لا يشعرون بألم يذكر.", q3: "ما الفرق بين الزراعة الرقمية والتقليدية؟", a3: "الزراعة الرقمية تتم بتوجيه كمبيوتري مما يوفر دقة أعلى ووقت إجراء أقصر وتعافي أسرع.", q4: "هل لديكم خبرة كافية في علاج الأطفال؟", a4: "نعم، خدمات أسنان الأطفال تتم بنهج صبور وهادئ لتجربة خالية من التوتر.", q5: "هل تقبلون تأمين الأسنان؟", a5: "نعم، نتعامل مع معظم شركات التأمين الرئيسية. تواصلوا معنا لتفاصيل التغطية.", q6: "لماذا يجب أن أختار الدكتور سياه نوري؟", a6: "أكثر من ١٠ سنة خبرة مهنية، تركيز خاص على الزراعة وعلاج الجذور المتقدم، معدات حديثة، وخطط علاج مخصصة لكل مريض." },
  whyimaz: { label: "— لماذا إيماز دنتال —", heading: "لماذا الدكتور إيمان سياه نوري؟", stat_years: "سنوات خبرة مهنية", stat_patients: "مرضى سعداء", stat_services: "خدمات متخصصة", feat1_title: "أكثر من ١٠ سنة خبرة", feat1_desc: "تركيز خاص على الزراعة وعلاجات الجذور المتقدمة", feat2_title: "معدات حديثة", feat2_desc: "استخدام أحدث المعدات والطرق العلمية المحدثة", feat3_title: "خطط علاج مخصصة", feat3_desc: "تقديم خطط علاج شخصية لكل مريض", feat4_title: "رضى عالٍ عن العلاج", feat4_desc: "رضى أكثر من ألف مريض عن جودة العلاج" },
  mobileCta: { book: "احجز استشارتك" },
  floating: { whatsapp: "واتساب", call: "اتصل بنا", open: "فتح قائمة الاتصال", close: "إغلاق", tooltip: "تواصل معنا" },
};

// ─── Seed data builders ────────────────────────────────────────────

function buildSiteTexts(): { key: string; valueFa: string; valueEn: string; valueAr: string; group: string }[] {
  const map = new Map<string, { valueFa: string; valueEn: string; valueAr: string; group: string }>();

  for (const [group, entries] of Object.entries(faData)) {
    for (const [key, value] of Object.entries(entries)) {
      map.set(`${group}.${key}`, { valueFa: value, valueEn: "", valueAr: "", group });
    }
  }
  for (const [group, entries] of Object.entries(enData)) {
    for (const [key, value] of Object.entries(entries)) {
      const k = `${group}.${key}`;
      const existing = map.get(k);
      if (existing) { existing.valueEn = value; } else { map.set(k, { valueFa: "", valueEn: value, valueAr: "", group }); }
    }
  }
  for (const [group, entries] of Object.entries(arData)) {
    for (const [key, value] of Object.entries(entries)) {
      const k = `${group}.${key}`;
      const existing = map.get(k);
      if (existing) { existing.valueAr = value; } else { map.set(k, { valueFa: "", valueEn: "", valueAr: value, group }); }
    }
  }

  return Array.from(map.entries()).map(([key, values]) => ({ key, ...values }));
}

const galleryItems = [
  { titleFa: "ایمپلنت دیجیتال", subtitleFa: "نتیجه طبیعی و ماندگار", titleEn: "Digital Implant", subtitleEn: "Natural, lasting result", titleAr: "زراعة رقمية", subtitleAr: "نتيجة طبيعية ودائمة", beforeImage: "/uploads/gallery/1778271506592-3f97665e.png", afterImage: "/uploads/gallery/1778271544132-0d734285.jpg", sortOrder: 1, isActive: true },
  { titleFa: "درمان ریشه", subtitleFa: "نجات دندان طبیعی", titleEn: "Root Canal Treatment", subtitleEn: "Natural tooth saved", titleAr: "علاج الجذور", subtitleAr: "إنقاذ السن الطبيعي", beforeImage: "/uploads/gallery/1778271506592-3f97665e.png", afterImage: "/uploads/gallery/1778271544132-0d734285.jpg", sortOrder: 2, isActive: true },
  { titleFa: "طراحی لبخند", subtitleFa: "تحول کامل لبخند", titleEn: "Smile Design", subtitleEn: "Complete smile transformation", titleAr: "تصميم الابتسامة", subtitleAr: "تحول كامل للابتسامة", beforeImage: "/uploads/gallery/1778271506592-3f97665e.png", afterImage: "/uploads/gallery/1778271544132-0d734285.jpg", sortOrder: 3, isActive: true },
];

const faqItems = [
  { questionFa: "ایمپلنت دندان چقدر طول می‌کشد؟", answerFa: "کل فرآیند ایمپلنت دیجیتال بسته به شرایط بیمار متفاوت است. دکتر سیاه‌نوری پس از مشاوره و بررسی، زمان دقیق درمان را مشخص می‌کند.", questionEn: "How long does a dental implant take?", answerEn: "The full digital implant process varies depending on the patient's condition. Dr. Siahnouri will determine the exact treatment timeline after consultation and evaluation.", questionAr: "كم يستغرق زرع الأسنان الرقمي؟", answerAr: "تختلف مدة عملية الزراعة الرقمية الكاملة حسب حالة المريض. سيحدد الدكتور سياه نوري الجدول الزمني الدقيق للعلاج بعد الاستشارة والتقييم.", sortOrder: 1 },
  { questionFa: "آیا درمان ریشه دردناک است؟", answerFa: "درمان ریشه پیشرفته در این مرکز با تجهیزات دقیق و بی‌حسی موضعی انجام می‌شود و بیشتر بیماران درد کمی گزارش می‌دهند.", questionEn: "Is root canal treatment painful?", answerEn: "Advanced root canal treatment at our clinic is performed with precision equipment and local anesthesia. Most patients report minimal discomfort.", questionAr: "هل علاج الجذور مؤلم؟", answerAr: "يتم علاج الجذور المتقدم في عيادتنا بمعدات دقيقة وتخدير موضعي. معظم المرضى لا يشعرون بألم يذكر.", sortOrder: 2 },
  { questionFa: "تفاوت ایمپلنت دیجیتال با معمولی چیست؟", answerFa: "ایمپلنت دیجیتال با راهنمایی کامپیوتری انجام می‌شود که دقت بالاتر، زمان کوتاه‌تر و بهبودی سریع‌تری دارد.", questionEn: "What's the difference between digital and conventional implants?", answerEn: "Digital implants are computer-guided, offering higher precision, shorter procedure time, and faster recovery.", questionAr: "ما الفرق بين الزراعة الرقمية والتقليدية؟", answerAr: "الزراعة الرقمية تتم بتوجيه كمبيوتري مما يوفر دقة أعلى ووقت إجراء أقصر وتعافي أسرع.", sortOrder: 3 },
  { questionFa: "آیا برای درمان اطفال تجربه کافی دارید؟", answerFa: "بله، خدمات دندانپزشکی اطفال با رویکردی صبورانه و آرام انجام می‌شود تا کودکان تجربه‌ای بدون استرس داشته باشند.", questionEn: "Do you have experience with pediatric treatment?", answerEn: "Yes, our pediatric dental services use a patient, gentle approach so children have a stress-free experience.", questionAr: "هل لديكم خبرة كافية في علاج الأطفال؟", answerAr: "نعم، خدمات أسنان الأطفال تتم بنهج صبور وهادئ لتجربة خالية من التوتر.", sortOrder: 4 },
  { questionFa: "آیا بیمه دندانپزشکی را قبول می‌کنید؟", answerFa: "بله، با اکثر شرکت‌های بیمه دندانپزشکی اصلی همکاری داریم. برای جزئیات پوشش با ما تماس بگیرید.", questionEn: "Do you accept dental insurance?", answerEn: "Yes, we work with most major dental insurance providers. Contact us for specific coverage details.", questionAr: "هل تقبلون تأمين الأسنان؟", answerAr: "نعم، نتعامل مع معظم شركات التأمين الرئيسية. تواصلوا معنا لتفاصيل التغطية.", sortOrder: 5 },
  { questionFa: "چرا باید دکتر سیاه‌نوری را انتخاب کنم؟", answerFa: "بیش از ۱۰ سال تجربه حرفه‌ای، تمرکز ویژه بر ایمپلنت و درمان ریشه، تجهیزات مدرن، و طرح درمان اختصاصی برای هر بیمار.", questionEn: "Why should I choose Dr. Siahnouri?", answerEn: "Over 10 years of professional experience, special focus on implants and advanced root canal treatments, modern equipment, and customized treatment plans for each patient.", questionAr: "لماذا يجب أن أختار الدكتور سياه نوري؟", answerAr: "أكثر من ١٠ سنة خبرة مهنية، تركيز خاص على الزراعة وعلاج الجذور المتقدم، معدات حديثة، وخطط علاج مخصصة لكل مريض.", sortOrder: 6 },
];

export async function POST(request: NextRequest) {
  // Auth check
  if (!verifySeedAuth(request)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز — SEED_SECRET لازم است" }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // 1. Seed SiteTexts
    const siteTexts = buildSiteTexts();
    let textCount = 0;
    for (const item of siteTexts) {
      await db.siteText.upsert({
        where: { key: item.key },
        update: { valueFa: item.valueFa, valueEn: item.valueEn, valueAr: item.valueAr, group: item.group },
        create: { key: item.key, valueFa: item.valueFa, valueEn: item.valueEn, valueAr: item.valueAr, group: item.group },
      });
      textCount++;
    }
    results.push(`SiteText: ${textCount} entries`);

    // 2. Seed Gallery Items
    let galleryCount = 0;
    for (const item of galleryItems) {
      const existing = await db.galleryItem.findFirst({ where: { sortOrder: item.sortOrder } });
      if (existing) {
        await db.galleryItem.update({ where: { id: existing.id }, data: { titleFa: item.titleFa, subtitleFa: item.subtitleFa, titleEn: item.titleEn, subtitleEn: item.subtitleEn, titleAr: item.titleAr, subtitleAr: item.subtitleAr, beforeImage: item.beforeImage, afterImage: item.afterImage } });
      } else {
        await db.galleryItem.create({ data: item });
      }
      galleryCount++;
    }
    results.push(`GalleryItem: ${galleryCount} items`);

    // 3. Seed FAQ Items
    let faqCount = 0;
    for (const item of faqItems) {
      const existing = await db.faq.findFirst({ where: { sortOrder: item.sortOrder } });
      if (existing) {
        await db.faq.update({ where: { id: existing.id }, data: { questionFa: item.questionFa, answerFa: item.answerFa, questionEn: item.questionEn, answerEn: item.answerEn, questionAr: item.questionAr, answerAr: item.answerAr } });
      } else {
        await db.faq.create({ data: item });
      }
      faqCount++;
    }
    results.push(`FAQ: ${faqCount} items`);

    // 4. Seed SlotConfig
    const existingConfig = await db.slotConfig.findFirst();
    if (!existingConfig) {
      await db.slotConfig.create({ data: { slotDuration: 20, bufferTime: 0 } });
      results.push("SlotConfig: created (20 min)");
    } else {
      results.push("SlotConfig: already exists");
    }

    // 5. Seed Clinic Settings
    const settings = [
      { key: "clinic_name", value: "ایماز دنتال" },
      { key: "clinic_phone", value: "025-37401065" },
      { key: "clinic_address", value: "قم، خیابان شهید فاطمی، میدان رسالت، کوچه فاطمی ۲۹، پلاک ۴۰، طبقه ۷، واحد ۷۱۳" },
      { key: "working_hours", value: JSON.stringify([
        { day: "شنبه", open: "09:00", close: "21:00", isOpen: true },
        { day: "یکشنبه", open: "09:00", close: "21:00", isOpen: true },
        { day: "دوشنبه", open: "09:00", close: "21:00", isOpen: true },
        { day: "سه‌شنبه", open: "09:00", close: "21:00", isOpen: true },
        { day: "چهارشنبه", open: "09:00", close: "21:00", isOpen: true },
        { day: "پنجشنبه", open: "09:00", close: "21:00", isOpen: true },
        { day: "جمعه", open: "", close: "", isOpen: false },
      ]) },
    ];
    let settingsCount = 0;
    for (const s of settings) {
      await db.clinicSetting.upsert({ where: { key: s.key }, update: { value: s.value }, create: { key: s.key, value: s.value } });
      settingsCount++;
    }
    results.push(`ClinicSetting: ${settingsCount} settings`);

    return NextResponse.json({ success: true, message: "داده‌های پیش‌فرض با موفقیت درج شدند", results });
  } catch (error) {
    console.error("[POST /api/seed] Error:", error);
    return NextResponse.json({ error: "خطا در درج داده‌های پیش‌فرض", details: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Auth check
  if (!verifySeedAuth(request)) {
    return NextResponse.json({ error: "دسترسی غیرمجاز — SEED_SECRET لازم است" }, { status: 401 });
  }

  try {
    const [siteTextCount, galleryCount, faqCount, bookingCount, slotConfigCount, settingsCount] = await Promise.all([
      db.siteText.count(), db.galleryItem.count(), db.faq.count(), db.booking.count(), db.slotConfig.count(), db.clinicSetting.count(),
    ]);
    return NextResponse.json({ status: "ok", counts: { siteTexts: siteTextCount, galleryItems: galleryCount, faqs: faqCount, bookings: bookingCount, slotConfig: slotConfigCount, settings: settingsCount } });
  } catch (error) {
    console.error("[GET /api/seed] Error:", error);
    return NextResponse.json({ error: "خطا در بررسی وضعیت دیتابیس", details: String(error) }, { status: 500 });
  }
}
