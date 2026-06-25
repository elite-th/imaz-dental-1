"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trash2,
  Search,
  CalendarDays,
  Phone,
  Mail,
  Stethoscope,
  LogOut,
  LayoutDashboard,
  Bell,
  BellRing,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
  BarChart3,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Activity,
  TrendingUp,
  Users,
  Sparkles,
  Eye,
  MoreHorizontal,
  Loader2,
  AlertTriangle,
  Plus,
  Edit3,
  Save,
  ChevronDown,
  Info,
  FileText,
  MapPin,
  Building2,

  HelpCircle,
  Image as ImageIcon,
  Type,
  Globe,
  Lock,
  Upload,
  Handshake,
  Send,
  MessageCircle,
  Youtube,
  Instagram,
  UserPlus,
} from "lucide-react";
import { BaleIcon } from "@/components/icons/BaleIcon";
import { useI18n } from "@/i18n/context";
import {
  bookingsApi,
  analyticsApi,
  faqApi,
  galleryApi,
  siteTextApi,
  settingsApi,
  slotConfigApi,
  slotsApi,
  closedSlotsApi,
  authApi,
  setAuthToken,
  clearAuthToken,
  isAuthenticated,
  getAuthToken,
  Booking,
  BookingStats,
  AdminUser,
  ApiError,
  AnalyticsData,
  FaqItem,
  GalleryItemAdmin,
  SiteTextItem,
  SlotConfigData,
  TimeSlot,
  SlotsResponse,
  ClosedSlotItem,
  collaborationApi,
  CollaborationItem,
} from "@/lib/api";
import { useBrowserNotifications } from "@/hooks/use-browser-notifications";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

/* ══════════════════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════════════════ */
type BookingStatus = Booking["status"];

/* ══════════════════════════════════════════════════════════════════════════
   CHART COLORS
   ══════════════════════════════════════════════════════════════════════════ */
const CHART_COLORS = ["#14b8a6", "#f59e0b", "#10b981", "#f43f5e", "#0ea5e9", "#8b5cf6"];
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#10b981",
  rejected: "#f43f5e",
  rescheduled: "#0ea5e9",
};

/* ══════════════════════════════════════════════════════════════════════════
   SERVICE OPTIONS
   ══════════════════════════════════════════════════════════════════════════ */
const SERVICE_OPTIONS = [
  { value: "booking.svc_implants", label: "ایمپلنت دیجیتال و پیوند استخوان" },
  { value: "booking.svc_rootcanal", label: "درمان تخصصی ریشه" },
  { value: "booking.svc_makeover", label: "طراحی لبخند و زیبایی" },
  { value: "booking.svc_ortho", label: "ارتودنسی" },
  { value: "booking.svc_prosthetics", label: "پروتزهای ثابت و متحرک" },
  { value: "booking.svc_pediatric", label: "دندانپزشکی اطفال" },
];

/* ══════════════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ══════════════════════════════════════════════════════════════════════════ */
function toPersianNum(n: number | string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(n).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════════ */
export default function AdminPage() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

  /* ---- Auth state ---- */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  /* ---- Data state ---- */
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apiStats, setApiStats] = useState<BookingStats | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  /* ---- UI state ---- */
  const [filterStatus, setFilterStatus] = useState<"all" | BookingStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("appointments");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showNotifyDropdown, setShowNotifyDropdown] = useState(false);

  /* ---- Notification state ---- */
  const {
    permission: notifyPermission,
    notificationData,
    totalBadge: notifyBadge,
    requestPermission: requestNotifyPermission,
    showNotification: showBrowserNotification,
    pollNotifications,
    updateLastChecked,
    clearBadge,
    subscribeToPush,
    isSupported: notifySupported,
  } = useBrowserNotifications();

  /* ---- Analytics state ---- */
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /* ---- Create booking modal ---- */
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [newBookingData, setNewBookingData] = useState({
    fullName: "",
    phone: "",
    email: "",
    service: "",
    date: "",
    time: "",
    notes: "",
  });
  const [creatingBooking, setCreatingBooking] = useState(false);

  /* ---- Edit booking state ---- */
  const [editingBooking, setEditingBooking] = useState(false);
  const [editBookingData, setEditBookingData] = useState({ date: "", time: "", notes: "" });

  /* ---- Settings state ---- */
  const [settingsData, setSettingsData] = useState({
    clinicName: "",
    clinicPhone: "",
    clinicAddress: "",
    socialTelegram: "",
    socialWhatsapp: "",
    socialBale: "",
    socialYoutube: "",
    socialInstagram: "",
  });

  /* ---- Pagination state ---- */
  const ITEMS_PER_PAGE = 10;
  const [bookingsPage, setBookingsPage] = useState(1);
  const [workingHours, setWorkingHours] = useState([
    { day: "شنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "یکشنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "دوشنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "سه‌شنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "چهارشنبه", open: "09:00", close: "18:00", enabled: true },
    { day: "پنجشنبه", open: "09:00", close: "14:00", enabled: true },
    { day: "جمعه", open: "", close: "", enabled: false },
  ]);

  /* ---- FAQ state ---- */
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(false);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqFormLang, setFaqFormLang] = useState<"fa" | "en" | "ar">("fa");
  const [faqFormData, setFaqFormData] = useState({
    question_fa: "", answer_fa: "", question_en: "", answer_en: "", question_ar: "", answer_ar: "", sort_order: 0, is_active: true,
  });

  /* ---- Gallery state ---- */
  const [galleryItems, setGalleryItems] = useState<GalleryItemAdmin[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryFormLang, setGalleryFormLang] = useState<"fa" | "en" | "ar">("fa");
  const [galleryFormData, setGalleryFormData] = useState({
    title_fa: "", subtitle_fa: "", title_en: "", subtitle_en: "", title_ar: "", subtitle_ar: "", before_image: "", after_image: "", sort_order: 0, is_active: true,
  });
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  /* ---- Collaborations state ---- */
  const [collabs, setCollabs] = useState<CollaborationItem[]>([]);
  const [collabsLoading, setCollabsLoading] = useState(false);
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [editingCollabId, setEditingCollabId] = useState<string | null>(null);
  const [collabFormData, setCollabFormData] = useState({
    name_fa: "", name_en: "", name_ar: "", image: "", sort_order: 0, is_active: true,
  });
  const [uploadingCollabImage, setUploadingCollabImage] = useState(false);

  /* ---- Schedule state ---- */
  const [slotConfig, setSlotConfig] = useState({ slot_duration: 20, buffer_time: 0 });
  const [scheduleDate, setScheduleDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  });
  const [scheduleSlots, setScheduleSlots] = useState<TimeSlot[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [closedSlotsList, setClosedSlotsList] = useState<ClosedSlotItem[]>([]);
  const [closeSlotReason, setCloseSlotReason] = useState("");
  const [showCloseDayModal, setShowCloseDayModal] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  /* ---- Site Text state ---- */
  const [siteTexts, setSiteTexts] = useState<SiteTextItem[]>([]);
  const [siteTextsLoading, setSiteTextsLoading] = useState(false);
  const [siteTextGroup, setSiteTextGroup] = useState("all");
  const [siteTextSearch, setSiteTextSearch] = useState("");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextData, setEditingTextData] = useState({ value_fa: "", value_en: "", value_ar: "" });

  /* ---- Auto-refresh timer ---- */
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- Responsive check ---- */
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  /* ---- Hardcoded admin credentials (frontend-only auth) ---- */
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "Imaz@2026";

  /* ---- Check auth on mount ---- */
  useEffect(() => {
    // Simple frontend-only auth check
    const loggedIn = localStorage.getItem("imaz-admin-logged-in");
    queueMicrotask(() => {
      if (loggedIn === "true") {
        setIsLoggedIn(true);
        setAdminUser({ id: "local", username: ADMIN_USERNAME, displayName: "منشی کلینیک" });
      }
      setAuthChecking(false);
    });
  }, []);

  /* ---- Fetch bookings ---- */
  const fetchBookings = useCallback(async (showLoading = true) => {
    if (showLoading) setBookingsLoading(true);
    setBookingsError(null);
    try {
      const result = await bookingsApi.list();
      setBookings(result.bookings);
      setApiStats(result.stats);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.load_error");
      setBookingsError(message);
    } finally {
      if (showLoading) setBookingsLoading(false);
    }
  }, [t]);

  /* ---- Fetch analytics ---- */
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const result = await analyticsApi.get();
      setAnalytics(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.load_error");
      toast.error(message);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [t]);

  /* ---- Fetch FAQs ---- */
  const fetchFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const result = await faqApi.listAdmin();
      setFaqs(result.faqs);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری سوالات متداول";
      toast.error(message);
    } finally {
      setFaqsLoading(false);
    }
  }, []);

  /* ---- Fetch gallery items ---- */
  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true);
    try {
      const result = await galleryApi.listAdmin();
      setGalleryItems(result.items);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری گالری";
      toast.error(message);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  /* ---- Fetch collaborations ---- */
  const fetchCollabs = useCallback(async () => {
    setCollabsLoading(true);
    try {
      const result = await collaborationApi.listAdmin();
      setCollabs(result.items);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری دندانپزشکان";
      toast.error(message);
    } finally {
      setCollabsLoading(false);
    }
  }, []);

  /* ---- Fetch site texts ---- */
  const fetchSiteTexts = useCallback(async () => {
    setSiteTextsLoading(true);
    try {
      // Always fetch ALL site texts — filter on client side
      const result = await siteTextApi.list();
      setSiteTexts(result.texts || []);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در بارگذاری متن‌ها";
      toast.error(message);
    } finally {
      setSiteTextsLoading(false);
    }
  }, []);

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

  /* ---- Fetch available slots for booking ---- */
  const fetchAvailableSlots = async (date: string) => {
    if (!date) { setAvailableSlots([]); return; }
    setLoadingSlots(true);
    try {
      const result = await slotsApi.get(date);
      setAvailableSlots(result.slots.filter(s => s.status === "available"));
    } catch {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  /* ---- FAQ actions ---- */
  const handleSaveFaq = async () => {
    if (!faqFormData.question_fa || !faqFormData.answer_fa) {
      toast.error("سوال و پاسخ فارسی الزامی است");
      return;
    }
    try {
      if (editingFaqId) {
        await faqApi.update(editingFaqId, {
          questionFa: faqFormData.question_fa, answerFa: faqFormData.answer_fa,
          questionEn: faqFormData.question_en, answerEn: faqFormData.answer_en,
          questionAr: faqFormData.question_ar, answerAr: faqFormData.answer_ar,
          sortOrder: faqFormData.sort_order, isActive: faqFormData.is_active,
        });
        toast.success("سوال متداول با موفقیت بروزرسانی شد");
      } else {
        await faqApi.create({
          questionFa: faqFormData.question_fa, answerFa: faqFormData.answer_fa,
          questionEn: faqFormData.question_en, answerEn: faqFormData.answer_en,
          questionAr: faqFormData.question_ar, answerAr: faqFormData.answer_ar,
          sortOrder: faqFormData.sort_order, isActive: faqFormData.is_active,
        });
        toast.success("سوال متداول با موفقیت ایجاد شد");
      }
      setShowFaqForm(false);
      setEditingFaqId(null);
      setFaqFormData({ question_fa: "", answer_fa: "", question_en: "", answer_en: "", question_ar: "", answer_ar: "", sort_order: 0, is_active: true });
      await fetchFaqs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره سوال متداول";
      toast.error(message);
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!window.confirm("آیا از حذف این سوال متداول اطمینان دارید؟")) return;
    try {
      await faqApi.delete(id);
      toast.success("سوال متداول حذف شد");
      await fetchFaqs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در حذف سوال متداول";
      toast.error(message);
    }
  };

  const handleToggleFaqActive = async (faq: FaqItem) => {
    try {
      await faqApi.update(faq.id, { isActive: !faq.is_active });
      toast.success(faq.is_active ? "سوال غیرفعال شد" : "سوال فعال شد");
      await fetchFaqs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در تغییر وضعیت";
      toast.error(message);
    }
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setFaqFormData({
      question_fa: faq.question_fa, answer_fa: faq.answer_fa,
      question_en: faq.question_en, answer_en: faq.answer_en,
      question_ar: faq.question_ar, answer_ar: faq.answer_ar,
      sort_order: faq.sort_order, is_active: faq.is_active,
    });
    setFaqFormLang("fa");
    setShowFaqForm(true);
  };

  /* ---- Gallery upload helper ---- */
  const handleImageUpload = async (file: File, field: "before_image" | "after_image") => {
    if (field === "before_image") setUploadingBefore(true);
    else setUploadingAfter(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "gallery");

      // Attach auth token — upload uses raw fetch (not api.request) because FormData
      // must not have Content-Type set manually (browser sets multipart boundary)
      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", { method: "POST", body: formData, headers });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "خطا در آپلود تصویر");
        return;
      }

      setGalleryFormData((prev) => ({ ...prev, [field]: data.url }));
      toast.success("تصویر با موفقیت آپلود شد");
    } catch {
      toast.error("خطا در آپلود تصویر");
    } finally {
      if (field === "before_image") setUploadingBefore(false);
      else setUploadingAfter(false);
    }
  };

  /* ---- Gallery actions ---- */
  const handleSaveGallery = async () => {
    if (!galleryFormData.title_fa || !galleryFormData.before_image || !galleryFormData.after_image) {
      toast.error("عنوان فارسی و مسیر تصاویر الزامی است");
      return;
    }
    try {
      if (editingGalleryId) {
        await galleryApi.update(editingGalleryId, {
          titleFa: galleryFormData.title_fa, subtitleFa: galleryFormData.subtitle_fa,
          titleEn: galleryFormData.title_en, subtitleEn: galleryFormData.subtitle_en,
          titleAr: galleryFormData.title_ar, subtitleAr: galleryFormData.subtitle_ar,
          beforeImage: galleryFormData.before_image, afterImage: galleryFormData.after_image,
          sortOrder: galleryFormData.sort_order, isActive: galleryFormData.is_active,
        });
        toast.success("آیتم گالری با موفقیت بروزرسانی شد");
      } else {
        await galleryApi.create({
          titleFa: galleryFormData.title_fa, subtitleFa: galleryFormData.subtitle_fa,
          titleEn: galleryFormData.title_en, subtitleEn: galleryFormData.subtitle_en,
          titleAr: galleryFormData.title_ar, subtitleAr: galleryFormData.subtitle_ar,
          beforeImage: galleryFormData.before_image, afterImage: galleryFormData.after_image,
          sortOrder: galleryFormData.sort_order, isActive: galleryFormData.is_active,
        });
        toast.success("آیتم گالری با موفقیت ایجاد شد");
      }
      setShowGalleryForm(false);
      setEditingGalleryId(null);
      setGalleryFormData({ title_fa: "", subtitle_fa: "", title_en: "", subtitle_en: "", title_ar: "", subtitle_ar: "", before_image: "", after_image: "", sort_order: 0, is_active: true });
      await fetchGallery();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره آیتم گالری";
      toast.error(message);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("آیا از حذف این آیتم گالری اطمینان دارید؟")) return;
    try {
      await galleryApi.delete(id);
      toast.success("آیتم گالری حذف شد");
      await fetchGallery();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در حذف آیتم گالری";
      toast.error(message);
    }
  };

  const handleToggleGalleryActive = async (item: GalleryItemAdmin) => {
    try {
      await galleryApi.update(item.id, { isActive: !item.is_active });
      toast.success(item.is_active ? "آیتم غیرفعال شد" : "آیتم فعال شد");
      await fetchGallery();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در تغییر وضعیت";
      toast.error(message);
    }
  };

  const handleEditGallery = (item: GalleryItemAdmin) => {
    setEditingGalleryId(item.id);
    setGalleryFormData({
      title_fa: item.title_fa, subtitle_fa: item.subtitle_fa,
      title_en: item.title_en, subtitle_en: item.subtitle_en,
      title_ar: item.title_ar, subtitle_ar: item.subtitle_ar,
      before_image: item.before_image, after_image: item.after_image,
      sort_order: item.sort_order, is_active: item.is_active,
    });
    setGalleryFormLang("fa");
    setShowGalleryForm(true);
  };

  /* ---- Collaboration image upload helper ---- */
  const handleCollabImageUpload = async (file: File) => {
    setUploadingCollabImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "collaborations");

      const token = getAuthToken();
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/upload", { method: "POST", body: formData, headers });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "خطا در آپلود تصویر");
        return;
      }

      setCollabFormData((prev) => ({ ...prev, image: data.url }));
      toast.success("تصویر با موفقیت آپلود شد");
    } catch {
      toast.error("خطا در آپلود تصویر");
    } finally {
      setUploadingCollabImage(false);
    }
  };

  /* ---- Collaboration actions ---- */
  const handleSaveCollab = async () => {
    if (!collabFormData.name_fa || !collabFormData.name_en || !collabFormData.name_ar) {
      toast.error("نام سازمان به سه زبان الزامی است");
      return;
    }
    try {
      if (editingCollabId) {
        await collaborationApi.update(editingCollabId, {
          nameFa: collabFormData.name_fa, nameEn: collabFormData.name_en, nameAr: collabFormData.name_ar,
          image: collabFormData.image, sortOrder: collabFormData.sort_order, isActive: collabFormData.is_active,
        });
        toast.success("دندانپزشک با موفقیت بروزرسانی شد");
      } else {
        await collaborationApi.create({
          nameFa: collabFormData.name_fa, nameEn: collabFormData.name_en, nameAr: collabFormData.name_ar,
          image: collabFormData.image, sortOrder: collabFormData.sort_order, isActive: collabFormData.is_active,
        });
        toast.success("دندانپزشک با موفقیت ایجاد شد");
      }
      setShowCollabForm(false);
      setEditingCollabId(null);
      setCollabFormData({ name_fa: "", name_en: "", name_ar: "", image: "", sort_order: 0, is_active: true });
      await fetchCollabs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره دندانپزشک";
      toast.error(message);
    }
  };

  const handleDeleteCollab = async (id: string) => {
    if (!window.confirm("آیا از حذف این دندانپزشک اطمینان دارید؟")) return;
    try {
      await collaborationApi.delete(id);
      toast.success("دندانپزشک حذف شد");
      await fetchCollabs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در حذف دندانپزشک";
      toast.error(message);
    }
  };

  const handleToggleCollabActive = async (item: CollaborationItem) => {
    try {
      await collaborationApi.update(item.id, { isActive: !item.is_active });
      toast.success(item.is_active ? "دندانپزشک غیرفعال شد" : "دندانپزشک فعال شد");
      await fetchCollabs();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در تغییر وضعیت";
      toast.error(message);
    }
  };

  const handleEditCollab = (item: CollaborationItem) => {
    setEditingCollabId(item.id);
    setCollabFormData({
      name_fa: item.name_fa, name_en: item.name_en, name_ar: item.name_ar,
      image: item.image, sort_order: item.sort_order, is_active: item.is_active,
    });
    setShowCollabForm(true);
  };

  /* ---- Site Text actions ---- */
  const handleSaveSiteText = async (id: string) => {
    try {
      await siteTextApi.update(id, {
        valueFa: editingTextData.value_fa,
        valueEn: editingTextData.value_en,
        valueAr: editingTextData.value_ar,
      });
      toast.success("متن با موفقیت ذخیره شد");
      setEditingTextId(null);
      await fetchSiteTexts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره متن";
      toast.error(message);
    }
  };

  const handleBulkSaveSiteTexts = async () => {
    try {
      const items = filteredSiteTexts.map((st) => ({
        id: st.id,
        valueFa: st.value_fa,
        valueEn: st.value_en,
        valueAr: st.value_ar,
      }));
      await siteTextApi.bulkUpdate(items);
      toast.success("تمام متن‌ها با موفقیت ذخیره شد");
      await fetchSiteTexts();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "خطا در ذخیره متن‌ها";
      toast.error(message);
    }
  };

  /* ---- Fetch bookings on login ---- */
  useEffect(() => {
    if (isLoggedIn) {
      queueMicrotask(() => fetchBookings(true));
      // Subscribe to push notifications on login (if permission already granted)
      if (notifyPermission === "granted") {
        subscribeToPush();
      }
    }
  }, [isLoggedIn, fetchBookings, notifyPermission, subscribeToPush]);

  /* ---- Fetch data on tab change ---- */
  useEffect(() => {
    if (!isLoggedIn) return;
    queueMicrotask(() => {
      if (activeTab === "analytics") fetchAnalytics();
      if (activeTab === "faq") fetchFaqs();
      if (activeTab === "gallery") fetchGallery();
      if (activeTab === "collaborations") fetchCollabs();
      if (activeTab === "site_text") fetchSiteTexts();
      if (activeTab === "schedule") { fetchSlotConfig(); fetchScheduleSlots(); fetchClosedSlots(); }
    });
  }, [activeTab, isLoggedIn, fetchAnalytics, fetchFaqs, fetchGallery, fetchCollabs, fetchSiteTexts, fetchSlotConfig, fetchScheduleSlots, fetchClosedSlots]);

  /* ---- Auto-refresh every 30s ---- */
  useEffect(() => {
    if (!isLoggedIn) return;
    refreshIntervalRef.current = setInterval(() => {
      fetchBookings(false);
    }, 30000);
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [isLoggedIn, fetchBookings]);

  /* ---- Browser/system notifications for the full admin page ---- */
  useEffect(() => {
    if (!isLoggedIn) return;

    pollNotifications().then((data) => {
      if (data) updateLastChecked(data.lastChecked);
    });

    const interval = setInterval(async () => {
      const data = await pollNotifications();
      if (!data) return;

      if (data.newBookings > 0) {
        showBrowserNotification(t("admin.notify_new_booking"), {
          body: `${data.newBookings} ${t("admin.notify_new_bookings_count")}`,
          tag: "admin-new-bookings",
        });
        fetchBookings(false);
      }

      if (data.newPatients > 0) {
        showBrowserNotification(t("admin.notify_new_patient"), {
          body: `${data.newPatients} ${t("admin.notify_new_patients_count")}`,
          tag: "admin-new-patients",
        });
      }

      if (data.unreadMessages > 0) {
        showBrowserNotification(t("admin.notify_new_message"), {
          body: `${data.unreadMessages} ${t("admin.notify_new_messages_count")}`,
          tag: "admin-new-messages",
        });
      }

      updateLastChecked(data.lastChecked);
    }, 30000);

    return () => clearInterval(interval);
  }, [
    isLoggedIn,
    pollNotifications,
    showBrowserNotification,
    updateLastChecked,
    fetchBookings,
    t,
  ]);

  /* ---- Login (frontend-only auth with hardcoded credentials) ---- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    // Frontend credential check — no backend auth needed
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setAdminUser({ id: "local", username: ADMIN_USERNAME, displayName: "منشی کلینیک" });
      localStorage.setItem("imaz-admin-logged-in", "true");
      setLoginLoading(false);
      return;
    }

    setLoginError("نام کاربری یا رمز عبور اشتباه است");
    setLoginLoading(false);
  };

  /* ---- Logout ---- */
  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem("imaz-admin-logged-in");
    setIsLoggedIn(false);
    setAdminUser(null);
    setUsername("");
    setPassword("");
    setBookings([]);
    setApiStats(null);
    setSelectedBooking(null);
    setShowDetailPanel(false);
    setAnalytics(null);
  };

  /* ---- Status update ---- */
  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    setActionLoading(id);
    try {
      await bookingsApi.updateStatus(id, newStatus);
      toast.success(t("admin.status_updated"));
      await fetchBookings(false);
      setSelectedBooking((prev) => {
        if (prev && prev.id === id) {
          return { ...prev, status: newStatus };
        }
        return prev;
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Delete booking ---- */
  const deleteBooking = async (id: string) => {
    if (!window.confirm(t("admin.confirm_delete"))) return;
    setActionLoading(id);
    try {
      await bookingsApi.delete(id);
      toast.success(t("admin.booking_deleted"));
      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
        setShowDetailPanel(false);
      }
      await fetchBookings(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Create booking ---- */
  const handleCreateBooking = async () => {
    if (!newBookingData.fullName || !newBookingData.phone || !newBookingData.service || !newBookingData.date || !newBookingData.time) {
      toast.error(t("admin.action_error"));
      return;
    }
    setCreatingBooking(true);
    try {
      await bookingsApi.create({
        fullName: newBookingData.fullName,
        phone: newBookingData.phone,
        email: newBookingData.email || undefined,
        service: newBookingData.service,
        date: newBookingData.date,
        time: newBookingData.time,
        notes: newBookingData.notes || undefined,
      });
      toast.success(t("admin.status_updated"));
      setShowCreateBooking(false);
      setNewBookingData({ fullName: "", phone: "", email: "", service: "", date: "", time: "", notes: "" });
      await fetchBookings(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setCreatingBooking(false);
    }
  };

  /* ---- Save booking edits ---- */
  const handleSaveEdit = async () => {
    if (!selectedBooking) return;
    setActionLoading(selectedBooking.id);
    try {
      await bookingsApi.update(selectedBooking.id, {
        date: editBookingData.date,
        time: editBookingData.time,
        notes: editBookingData.notes || undefined,
      });
      toast.success(t("admin.status_updated"));
      setEditingBooking(false);
      setSelectedBooking({ ...selectedBooking, date: editBookingData.date, time: editBookingData.time, notes: editBookingData.notes || null });
      await fetchBookings(false);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t("admin.action_error");
      toast.error(message);
    } finally {
      setActionLoading(null);
    }
  };

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

  /* ---- Stats from API ---- */
  const stats = useMemo<BookingStats>(() => {
    if (apiStats) return apiStats;
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      rejected: bookings.filter((b) => b.status === "rejected").length,
      rescheduled: bookings.filter((b) => b.status === "rescheduled").length,
    };
  }, [apiStats, bookings]);

  /* ---- Filtered bookings ---- */
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchStatus = filterStatus === "all" || b.status === filterStatus;
      const matchSearch =
        !searchQuery ||
        b.full_name.includes(searchQuery) ||
        b.phone.includes(searchQuery) ||
        t(b.service).includes(searchQuery);
      return matchStatus && matchSearch;
    });
  }, [bookings, filterStatus, searchQuery, t]);

  /* ---- Paginated lists ---- */
  const paginatedBookings = useMemo(() => {
    const start = (bookingsPage - 1) * ITEMS_PER_PAGE;
    return filteredBookings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBookings, bookingsPage]);

  const totalPagesBookings = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);

  /* ---- Filtered site texts ---- */
  const filteredSiteTexts = (() => {
    let texts = siteTexts || [];
    // Filter by group
    if (siteTextGroup !== "all") {
      texts = texts.filter((st) => st.group === siteTextGroup);
    }
    // Filter by search
    if (siteTextSearch) {
      const q = siteTextSearch.toLowerCase();
      texts = texts.filter((st) =>
        st.key.toLowerCase().includes(q) ||
        st.value_fa.toLowerCase().includes(q) ||
        st.value_en.toLowerCase().includes(q) ||
        st.group.toLowerCase().includes(q)
      );
    }
    return texts;
  })();

  /* ---- Site text groups ---- */
  const GROUP_LABELS_FA: Record<string, string> = {
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

  /* ---- Site text key translations to Persian ---- */
  const KEY_LABELS_FA: Record<string, string> = {
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
  const siteTextGroups = useMemo(() => {
    const groups = new Set((siteTexts || []).map((st) => st.group));
    return Array.from(groups).sort();
  }, [siteTexts]);

  /* ---- Pagination component ---- */
  const renderPagination = (currentPage: number, totalPages: number, setPage: (p: number) => void) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          {t("admin.pagination_showing")} {toPersianNum((currentPage - 1) * ITEMS_PER_PAGE + 1)}–{toPersianNum(Math.min(currentPage * ITEMS_PER_PAGE, totalPages * ITEMS_PER_PAGE > filteredBookings.length ? filteredBookings.length : currentPage * ITEMS_PER_PAGE))} {t("admin.pagination_of")} {toPersianNum(totalPages * ITEMS_PER_PAGE > 100 ? filteredBookings.length : totalPages * ITEMS_PER_PAGE)} {t("admin.pagination_results")}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-100 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.pagination_prev")}
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? "bg-gray-900 text-white"
                    : "bg-white border border-gray-100 text-gray-500 hover:border-gray-200"
                }`}
              >
                {toPersianNum(pageNum)}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-100 hover:border-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            {t("admin.pagination_next")}
          </button>
        </div>
      </div>
    );
  };

  /* ---- Status config ---- */
  const statusConfig: Record<
    BookingStatus,
    { label: string; bg: string; text: string; border: string; dot: string; icon: typeof Clock }
  > = {
    pending: {
      label: t("admin.status_pending"),
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200/60",
      dot: "bg-amber-400",
      icon: Clock,
    },
    confirmed: {
      label: t("admin.status_confirmed"),
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200/60",
      dot: "bg-emerald-500",
      icon: CheckCircle2,
    },
    rejected: {
      label: t("admin.status_rejected"),
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-200/60",
      dot: "bg-rose-500",
      icon: XCircle,
    },
    rescheduled: {
      label: t("admin.status_rescheduled"),
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200/60",
      dot: "bg-sky-500",
      icon: RefreshCw,
    },
  };

  /* ---- Admin display helpers ---- */
  const adminInitial = adminUser?.displayName?.charAt(0) || adminUser?.username?.charAt(0) || "م";
  const adminDisplayName = adminUser?.displayName || "منشی کلینیک";
  const adminEmail = adminUser?.username ? `${adminUser.username}@imaz.ir` : "admin@imaz.ir";

  /* ════════════════════════════════════════════════════════════════════════
     AUTH CHECKING LOADING SCREEN
     ════════════════════════════════════════════════════════════════════════ */
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FB]" dir={dir}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #0D3A35, #1B7A6E)" }}
          >
            <img src="/images/imaz-logo-new.svg" alt="ایماز" className="h-9 w-auto brightness-0 invert" />
          </div>
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     LOGIN PAGE
     ════════════════════════════════════════════════════════════════════════ */
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex" dir={dir}>
        {/* ── Branding Panel ── */}
        <div
          className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center p-12"
          style={{
            background: "linear-gradient(145deg, #071E1B 0%, #0D3A35 30%, #145C52 60%, #1B7A6E 90%, #2DA89E 100%)",
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-[-120px] end-[-80px] w-[400px] h-[400px] rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #fff, transparent)" }} />
          <div className="absolute bottom-[-100px] start-[-60px] w-[300px] h-[300px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #fff, transparent)" }} />
          <div className="absolute top-[30%] start-[10%] w-[200px] h-[200px] rounded-full opacity-[0.04]" style={{ background: "radial-gradient(circle, #2DA89E, transparent)" }} />

          {/* Floating decorative dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: `${6 + (i % 3) * 4}px`,
                height: `${6 + (i % 3) * 4}px`,
                background: "#6BCDB8",
                top: `${10 + (i * 7) % 80}%`,
                left: `${5 + (i * 11) % 90}%`,
                animation: `adminFloatDot ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite alternate`,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 text-center max-w-md">
            <div className="mb-8 flex justify-center">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px)" }}
              >
                <img src="/images/imaz-logo-new.svg" alt="ایماز" className="h-12 w-auto brightness-0 invert" />
              </div>
            </div>
            <h1 className="text-white text-3xl font-extrabold mb-3 leading-tight" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              {t("admin.title")}
            </h1>
            <p className="text-teal-200/60 text-sm leading-relaxed mb-10" style={{ fontFamily: "var(--font-vazirmatn)" }}>
              {t("admin.subtitle")}
            </p>
            <div className="space-y-4 text-start">
              {[
                { icon: CalendarDays, text: t("admin.feature_appointments") },
                { icon: Bell, text: t("admin.feature_notifications") },
                { icon: BarChart3, text: t("admin.feature_analytics") },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(107,205,184,0.15)" }}>
                    <feat.icon className="w-5 h-5 text-teal-300" />
                  </div>
                  <span className="text-white/80 text-sm font-medium" style={{ fontFamily: "var(--font-vazirmatn)" }}>{feat.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Login Form Panel ── */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F7F9FB]">
          <div className="w-full max-w-sm">
            <div className="lg:hidden flex justify-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(135deg, #0D3A35, #1B7A6E)" }}
              >
                <img src="/images/imaz-logo-new.svg" alt="ایماز" className="h-9 w-auto brightness-0 invert" />
              </div>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                {t("admin.login_welcome")}
              </h2>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                {t("admin.login_subtitle")}
              </p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="flex items-center gap-2.5 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-sm font-medium" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <XCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wide" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  {t("admin.username")}
                </label>
                <div className="relative">
                  <User className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loginLoading}
                    className="w-full ps-11 pe-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-vazirmatn)" }}
                    placeholder={t("admin.username_placeholder")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 tracking-wide" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  {t("admin.password")}
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loginLoading}
                    className="w-full ps-11 pe-4 py-3.5 rounded-2xl border-2 border-gray-100 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ fontFamily: "var(--font-vazirmatn)" }}
                    placeholder={t("admin.password_placeholder")}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all hover:shadow-xl hover:shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
                style={{
                  background: "linear-gradient(135deg, #1B7A6E, #2DA89E)",
                  fontFamily: "var(--font-vazirmatn)",
                }}
              >
                {loginLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {t("admin.login_btn")}
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-gray-300 pt-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                {t("admin.login_hint")}
              </p>
            </form>
            <div className="mt-8 text-center">
              <a
                href="/"
                className="text-xs text-gray-400 hover:text-teal-600 transition-colors font-medium inline-flex items-center gap-1"
                style={{ fontFamily: "var(--font-vazirmatn)" }}
              >
                {isRTL ? <ArrowRight className="w-3 h-3" /> : <ArrowLeft className="w-3 h-3" />}
                {t("admin.back_to_site")}
              </a>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes adminFloatDot {
            from { transform: translateY(0) scale(1); opacity: 0.15; }
            to { transform: translateY(-20px) scale(1.3); opacity: 0.35; }
          }
        `}</style>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     DASHBOARD
     ════════════════════════════════════════════════════════════════════════ */
  const sidebarWidth = sidebarCollapsed ? 80 : 260;

  const sidebarItems = [
    { key: "appointments", icon: CalendarDays, label: t("admin.nav_appointments") },
    { key: "schedule", icon: Clock, label: "زمان‌بندی" },
    { key: "analytics", icon: BarChart3, label: t("admin.nav_analytics") },
    { key: "faq", icon: HelpCircle, label: "سوالات متداول" },
    { key: "gallery", icon: ImageIcon, label: "گالری" },
    { key: "collaborations", icon: Stethoscope, label: "دندانپزشکان" },
    { key: "site_text", icon: Type, label: "متن سایت" },
    { key: "settings", icon: Settings, label: t("admin.nav_settings") },
  ];

  /* ════════════════════════════════════════════════════════════════════════
     TAB CONTENT RENDERERS
     ════════════════════════════════════════════════════════════════════════ */

  /* ---- APPOINTMENTS TAB ---- */
  const renderAppointmentsTab = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: t("admin.stat_total"), value: stats.total, icon: BarChart3, gradient: "from-gray-700 to-gray-900", lightBg: "bg-gray-50", lightIcon: "text-gray-400" },
          { label: t("admin.stat_pending"), value: stats.pending, icon: Clock, gradient: "from-amber-500 to-amber-600", lightBg: "bg-amber-50", lightIcon: "text-amber-500" },
          { label: t("admin.stat_confirmed"), value: stats.confirmed, icon: CheckCircle2, gradient: "from-emerald-500 to-emerald-600", lightBg: "bg-emerald-50", lightIcon: "text-emerald-500" },
          { label: t("admin.stat_rejected"), value: stats.rejected, icon: XCircle, gradient: "from-rose-400 to-rose-500", lightBg: "bg-rose-50", lightIcon: "text-rose-400" },
        ].map((card) => (
          <div key={card.label} className="relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{card.label}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{card.value}</p>
              </div>
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${card.lightBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${card.lightIcon}`} />
              </div>
            </div>
            <div className={`absolute bottom-0 start-0 end-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>
        ))}
      </div>

      {/* New Booking Button + Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <button
          onClick={() => { setShowCreateBooking(true); if (newBookingData.date) fetchAvailableSlots(newBookingData.date); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />
          {t("admin.btn_new_booking")}
        </button>
        <div className="flex-1" />
        {(["all", "pending", "confirmed", "rejected", "rescheduled"] as const).map((s) => {
          const isActive = filterStatus === s;
          const count = s === "all" ? stats.total : stats[s];
          return (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setBookingsPage(1); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20"
                  : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200 hover:text-gray-600"
              }`}
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {s === "all" ? t("admin.filter_all") : t(`admin.status_${s}`)}
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
              <CalendarDays className="w-8 h-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.no_bookings")}</p>
            <p className="text-gray-300 text-xs mt-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.no_bookings_sub")}</p>
          </div>
        ) : (
          paginatedBookings.map((b, idx) => {
            const sc = statusConfig[b.status];
            const initials = b.full_name.charAt(0);
            const avatarColors = ["from-teal-400 to-teal-600","from-amber-400 to-amber-600","from-sky-400 to-sky-600","from-rose-400 to-rose-600","from-violet-400 to-violet-600","from-emerald-400 to-emerald-600"];
            const color = avatarColors[idx % avatarColors.length];
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100/80 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 overflow-hidden group">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-sm truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{b.full_name}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${sc.bg} ${sc.text} border ${sc.border} shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t(b.service)}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-gray-300" />
                      <span className="text-xs font-bold text-gray-500" dir="ltr">{b.time}</span>
                    </div>
                    <button
                      onClick={() => { setSelectedBooking(b); setShowDetailPanel(true); }}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Info row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{b.date}</span>
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{b.phone}</span>
                    {b.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{b.email}</span>}
                  </div>
                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-50">
                    {b.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(b.id, "confirmed")} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <CheckCircle2 className="w-3.5 h-3.5" />{t("admin.btn_confirm")}
                        </button>
                        <button onClick={() => updateStatus(b.id, "rejected")} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          <XCircle className="w-3.5 h-3.5" />{t("admin.btn_reject")}
                        </button>
                      </>
                    )}
                    {(b.status === "rejected" || b.status === "rescheduled") && (
                      <button onClick={() => updateStatus(b.id, "pending")} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        <RefreshCw className="w-3.5 h-3.5" />{t("admin.btn_restore")}
                      </button>
                    )}
                    <button onClick={() => deleteBooking(b.id)} disabled={actionLoading === b.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-gray-50 text-gray-400 border border-gray-100 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 transition-all disabled:opacity-50 ms-auto" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <Trash2 className="w-3.5 h-3.5" />{t("admin.btn_delete")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      {renderPagination(bookingsPage, totalPagesBookings, setBookingsPage)}
    </>
  );

  /* ---- ANALYTICS TAB ---- */
  const renderAnalyticsTab = () => {
    if (analyticsLoading && !analytics) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.loading_bookings")}</p>
        </div>
      );
    }

    if (!analytics) {
      return (
        <div className="text-center py-20">
          <BarChart3 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-5" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          {t("admin.analytics_title")}
        </h3>

        {/* Overview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { label: t("admin.analytics_total_bookings"), value: analytics.overview.totalBookings, icon: BarChart3, color: "text-teal-500", bg: "bg-teal-50" },
            { label: t("admin.analytics_total_patients"), value: analytics.overview.totalPatients, icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
            { label: t("admin.analytics_pending"), value: analytics.overview.pendingBookings, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
            { label: t("admin.analytics_confirmed"), value: analytics.overview.confirmedBookings, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: t("admin.analytics_today"), value: analytics.overview.todayBookings, icon: CalendarDays, color: "text-sky-500", bg: "bg-sky-50" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl bg-white border border-gray-100/80 p-4 hover:shadow-lg hover:shadow-gray-100/50 transition-all group">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{toPersianNum(card.value)}</p>
              <p className="text-[10px] text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Service Distribution PieChart */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_by_service")}</h4>
            {analytics.bookingsByService.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={analytics.bookingsByService.map((s) => ({ name: t(s.service), value: s.count }))}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value"
                  >
                    {analytics.bookingsByService.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {analytics.bookingsByService.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {t(s.service)}
                </span>
              ))}
            </div>
          </div>

          {/* Booking Status BarChart */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_by_status")}</h4>
            {analytics.bookingsByStatus.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.bookingsByStatus.map((s) => ({ name: t(`admin.status_${s.status}`), count: s.count, fill: STATUS_COLORS[s.status] || "#6b7280" }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {analytics.bookingsByStatus.map((s, i) => (
                      <Cell key={i} fill={STATUS_COLORS[s.status] || "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Weekly Trend LineChart */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_weekly")}</h4>
            {analytics.weeklyTrend.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={analytics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="bookings" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.1} strokeWidth={2} />
                  <Area type="monotone" dataKey="confirmed" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly Trend BarChart */}
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-4" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_monthly")}</h4>
            {analytics.monthlyTrend.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-8" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.analytics_no_data")}</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.monthlyTrend.map((m) => ({ name: m.month, bookings: m.bookings }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    );
  };

  /* ---- SETTINGS TAB ---- */
  const renderSettingsTab = () => (
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
              <input value={settingsData.clinicName} onChange={(e) => setSettingsData({ ...settingsData, clinicName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }} placeholder="ایماز دنتال" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.settings_clinic_phone")}</label>
                <input value={settingsData.clinicPhone} onChange={(e) => setSettingsData({ ...settingsData, clinicPhone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="025-37401065" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.settings_clinic_address")}</label>
                <input value={settingsData.clinicAddress} onChange={(e) => setSettingsData({ ...settingsData, clinicAddress: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }} placeholder="قم، خیابان شهید فاطمی، میدان رسالت" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSaveProfile} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
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
                <input value={settingsData.socialTelegram} onChange={(e) => setSettingsData({ ...settingsData, socialTelegram: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://t.me/imazdental" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <MessageCircle className="w-3 h-3 inline-block ml-1" style={{ color: "#25D366" }} />واتساپ
                </label>
                <input value={settingsData.socialWhatsapp} onChange={(e) => setSettingsData({ ...settingsData, socialWhatsapp: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://wa.me/989191190995" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <BaleIcon className="w-3 h-3 inline-block ml-1" style={{ color: "#00BFA5" }} />بله
                </label>
                <input value={settingsData.socialBale} onChange={(e) => setSettingsData({ ...settingsData, socialBale: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://ble.ir/imazdental" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <Youtube className="w-3 h-3 inline-block ml-1" style={{ color: "#FF0000" }} />یوتیوب
                </label>
                <input value={settingsData.socialYoutube} onChange={(e) => setSettingsData({ ...settingsData, socialYoutube: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://youtube.com/@imazdental" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <Instagram className="w-3 h-3 inline-block ml-1" style={{ color: "#E4405F" }} />اینستاگرام
                </label>
                <input value={settingsData.socialInstagram} onChange={(e) => setSettingsData({ ...settingsData, socialInstagram: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all" dir="ltr" placeholder="https://instagram.com/imazdental" />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={handleSaveProfile} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
              <Save className="w-3.5 h-3.5" />{t("admin.btn_save")}
            </button>
          </div>
        </div>


      </div>
    </div>
  );

  /* ---- FAQ TAB ---- */
  const renderFaqTab = () => (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          مدیریت سوالات متداول
        </h3>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditingFaqId(null);
            setFaqFormData({ question_fa: "", answer_fa: "", question_en: "", answer_en: "", question_ar: "", answer_ar: "", sort_order: faqs.length, is_active: true });
            setFaqFormLang("fa");
            setShowFaqForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />سوال جدید
        </button>
      </div>

      {/* Loading */}
      {faqsLoading && faqs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* FAQ list */}
      {!faqsLoading && faqs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هنوز سوال متداولی ثبت نشده</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl border border-gray-100/80 p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {toPersianNum(faq.sort_order + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{faq.question_fa}</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${faq.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${faq.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                      {faq.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{faq.answer_fa.substring(0, 100)}{faq.answer_fa.length > 100 ? "..." : ""}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleToggleFaqActive(faq)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all" title={faq.is_active ? "غیرفعال کردن" : "فعال کردن"}>
                    {faq.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEditFaq(faq)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-all" title="ویرایش">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteFaq(faq.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Form Modal */}
      {showFaqForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowFaqForm(false); setEditingFaqId(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{editingFaqId ? "ویرایش سوال متداول" : "سوال متداول جدید"}</h3>
              <button onClick={() => { setShowFaqForm(false); setEditingFaqId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Language tabs */}
            <div className="flex gap-2 mb-4">
              {(["fa", "en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setFaqFormLang(lang)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${faqFormLang === lang ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "fa" ? "فارسی" : lang === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Persian fields */}
              {faqFormLang === "fa" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>سوال (فارسی) *</label>
                    <input value={faqFormData.question_fa} onChange={(e) => setFaqFormData({ ...faqFormData, question_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>پاسخ (فارسی) *</label>
                    <textarea value={faqFormData.answer_fa} onChange={(e) => setFaqFormData({ ...faqFormData, answer_fa: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                </>
              )}
              {/* English fields */}
              {faqFormLang === "en" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Question (English)</label>
                    <input value={faqFormData.question_en} onChange={(e) => setFaqFormData({ ...faqFormData, question_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Answer (English)</label>
                    <textarea value={faqFormData.answer_en} onChange={(e) => setFaqFormData({ ...faqFormData, answer_en: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="ltr" />
                  </div>
                </>
              )}
              {/* Arabic fields */}
              {faqFormLang === "ar" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>السؤال (العربية)</label>
                    <input value={faqFormData.question_ar} onChange={(e) => setFaqFormData({ ...faqFormData, question_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>الجواب (العربية)</label>
                    <textarea value={faqFormData.answer_ar} onChange={(e) => setFaqFormData({ ...faqFormData, answer_ar: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="rtl" />
                  </div>
                </>
              )}
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>ترتیب نمایش</label>
                  <input type="number" value={faqFormData.sort_order} onChange={(e) => setFaqFormData({ ...faqFormData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={faqFormData.is_active} onChange={(e) => setFaqFormData({ ...faqFormData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>فعال</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveFaq} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_save")}</button>
              <button onClick={() => { setShowFaqForm(false); setEditingFaqId(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ---- GALLERY TAB ---- */
  const renderGalleryTab = () => (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          مدیریت گالری
        </h3>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditingGalleryId(null);
            setGalleryFormData({ title_fa: "", subtitle_fa: "", title_en: "", subtitle_en: "", title_ar: "", subtitle_ar: "", before_image: "", after_image: "", sort_order: galleryItems.length, is_active: true });
            setGalleryFormLang("fa");
            setShowGalleryForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />آیتم جدید
        </button>
      </div>

      {/* Loading */}
      {galleryLoading && galleryItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* Gallery grid */}
      {!galleryLoading && galleryItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هنوز آیتم گالری ثبت نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
                {item.after_image ? (
                  <img src={item.after_image} alt={item.title_fa} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <ImageIcon className="w-10 h-10 text-gray-200" />
                )}
                <span className={`absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${item.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {item.is_active ? "فعال" : "غیرفعال"}
                </span>
                <span className="absolute top-3 end-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/80 text-gray-600 border border-gray-100">
                  ترتیب: {toPersianNum(item.sort_order)}
                </span>
              </div>
              {/* Content */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.title_fa}</h4>
                <p className="text-xs text-gray-400 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.subtitle_fa}</p>
                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleToggleGalleryActive(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all" title={item.is_active ? "غیرفعال کردن" : "فعال کردن"}>
                    {item.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEditGallery(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-all" title="ویرایش">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteGallery(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Form Modal */}
      {showGalleryForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{editingGalleryId ? "ویرایش آیتم گالری" : "آیتم گالری جدید"}</h3>
              <button onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Language tabs */}
            <div className="flex gap-2 mb-4">
              {(["fa", "en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setGalleryFormLang(lang)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${galleryFormLang === lang ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {lang === "fa" ? "فارسی" : lang === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {/* Persian fields */}
              {galleryFormLang === "fa" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>عنوان (فارسی) *</label>
                    <input value={galleryFormData.title_fa} onChange={(e) => setGalleryFormData({ ...galleryFormData, title_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>زیرعنوان (فارسی)</label>
                    <input value={galleryFormData.subtitle_fa} onChange={(e) => setGalleryFormData({ ...galleryFormData, subtitle_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                </>
              )}
              {/* English fields */}
              {galleryFormLang === "en" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Title (English)</label>
                    <input value={galleryFormData.title_en} onChange={(e) => setGalleryFormData({ ...galleryFormData, title_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Subtitle (English)</label>
                    <input value={galleryFormData.subtitle_en} onChange={(e) => setGalleryFormData({ ...galleryFormData, subtitle_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                  </div>
                </>
              )}
              {/* Arabic fields */}
              {galleryFormLang === "ar" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>العنوان (العربية)</label>
                    <input value={galleryFormData.title_ar} onChange={(e) => setGalleryFormData({ ...galleryFormData, title_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>العنوان الفرعي (العربية)</label>
                    <input value={galleryFormData.subtitle_ar} onChange={(e) => setGalleryFormData({ ...galleryFormData, subtitle_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
                  </div>
                </>
              )}
              {/* Image upload - always visible */}
              <div className="pt-3 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>تصویر قبل *</label>
                  <div className="flex items-center gap-2">
                    <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploadingBefore ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`} style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingBefore ? "در حال آپلود..." : "انتخاب فایل"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        disabled={uploadingBefore}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "before_image");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {galleryFormData.before_image && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={galleryFormData.before_image} alt="قبل" className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400 truncate" dir="ltr">{galleryFormData.before_image}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>تصویر بعد *</label>
                  <div className="flex items-center gap-2">
                    <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploadingAfter ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`} style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingAfter ? "در حال آپلود..." : "انتخاب فایل"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        disabled={uploadingAfter}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file, "after_image");
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {galleryFormData.after_image && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <img src={galleryFormData.after_image} alt="بعد" className="w-10 h-10 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                        <span className="text-[11px] text-gray-400 truncate" dir="ltr">{galleryFormData.after_image}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>ترتیب نمایش</label>
                  <input type="number" value={galleryFormData.sort_order} onChange={(e) => setGalleryFormData({ ...galleryFormData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={galleryFormData.is_active} onChange={(e) => setGalleryFormData({ ...galleryFormData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>فعال</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveGallery} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_save")}</button>
              <button onClick={() => { setShowGalleryForm(false); setEditingGalleryId(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ---- COLLABORATIONS TAB ---- */
  const renderCollaborationsTab = () => (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          مدیریت دندانپزشکان
        </h3>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditingCollabId(null);
            setCollabFormData({ name_fa: "", name_en: "", name_ar: "", image: "", sort_order: collabs.length, is_active: true });
            setShowCollabForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Plus className="w-4 h-4" />دندانپزشک جدید
        </button>
      </div>

      {/* Loading */}
      {collabsLoading && collabs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* Collaborations grid */}
      {!collabsLoading && collabs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Stethoscope className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>هنوز دندانپزشکی ثبت نشده</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {collabs.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                {item.image && item.image.trim() !== "" ? (
                  <img
                    src={item.image}
                    alt={item.name_fa}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.style.display = "none";
                      const parent = el.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className = "flex items-center justify-center w-full h-full";
                        fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v-2a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <Stethoscope className="w-10 h-10 text-gray-200" />
                )}
                <span className={`absolute top-3 start-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${item.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" : "bg-gray-50 text-gray-400 border border-gray-100"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                  {item.is_active ? "فعال" : "غیرفعال"}
                </span>
                <span className="absolute top-3 end-3 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/80 text-gray-600 border border-gray-100">
                  ترتیب: {toPersianNum(item.sort_order)}
                </span>
              </div>
              {/* Content */}
              <div className="p-4">
                <h4 className="font-bold text-gray-900 text-sm mb-0.5 truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.name_fa}</h4>
                <p className="text-[11px] text-gray-400 truncate" dir="ltr">{item.name_en}</p>
                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                  <button onClick={() => handleToggleCollabActive(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all" title={item.is_active ? "غیرفعال کردن" : "فعال کردن"}>
                    {item.is_active ? <Eye className="w-4 h-4 text-emerald-500" /> : <Eye className="w-4 h-4 text-gray-300" />}
                  </button>
                  <button onClick={() => handleEditCollab(item)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-all" title="ویرایش">
                    <Edit3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => handleDeleteCollab(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all" title="حذف">
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collaboration Form Modal */}
      {showCollabForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowCollabForm(false); setEditingCollabId(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{editingCollabId ? "ویرایش دندانپزشک" : "دندانپزشک جدید"}</h3>
              <button onClick={() => { setShowCollabForm(false); setEditingCollabId(null); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="space-y-3">
              {/* Persian name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>نام سازمان (فارسی) *</label>
                <input value={collabFormData.name_fa} onChange={(e) => setCollabFormData({ ...collabFormData, name_fa: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
              </div>
              {/* English name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Organization Name (English) *</label>
                <input value={collabFormData.name_en} onChange={(e) => setCollabFormData({ ...collabFormData, name_en: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
              </div>
              {/* Arabic name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>اسم المنظمة (العربية) *</label>
                <input value={collabFormData.name_ar} onChange={(e) => setCollabFormData({ ...collabFormData, name_ar: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="rtl" />
              </div>
              {/* Image upload */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-500 mb-1.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>لوگو سازمان</label>
                <div className="flex items-center gap-2">
                  <label className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${uploadingCollabImage ? "bg-gray-100 text-gray-400 pointer-events-none" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`} style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingCollabImage ? "در حال آپلود..." : "انتخاب فایل"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                      className="hidden"
                      disabled={uploadingCollabImage}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCollabImageUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {collabFormData.image && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <img src={collabFormData.image} alt="لوگو" className="w-10 h-10 rounded-lg object-contain border border-gray-100 flex-shrink-0 bg-gray-50 p-1" />
                      <span className="text-[11px] text-gray-400 truncate" dir="ltr">{collabFormData.image}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>ترتیب نمایش</label>
                  <input type="number" value={collabFormData.sort_order} onChange={(e) => setCollabFormData({ ...collabFormData, sort_order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={collabFormData.is_active} onChange={(e) => setCollabFormData({ ...collabFormData, is_active: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-xs font-bold text-gray-600" style={{ fontFamily: "var(--font-vazirmatn)" }}>فعال</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveCollab} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_save")}</button>
              <button onClick={() => { setShowCollabForm(false); setEditingCollabId(null); }} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  /* ---- SITE TEXT TAB ---- */
  const renderSiteTextTab = () => (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h3 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
          ویرایش متن سایت
        </h3>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={siteTextSearch}
            onChange={(e) => setSiteTextSearch(e.target.value)}
            placeholder="جستجو در متن‌ها..."
            className="w-56 ps-10 pe-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all"
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          />
        </div>
        <button
          onClick={handleBulkSaveSiteTexts}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}
        >
          <Save className="w-4 h-4" />ذخیره همه
        </button>
      </div>

      {/* Group selector — sticky so it never disappears when scrolling */}
      <div className="sticky top-0 z-10 -mx-5 px-5 pb-3 pt-1 bg-[#F7F9FB] border-b border-gray-100/60 mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSiteTextGroup("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${siteTextGroup === "all" ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
            style={{ fontFamily: "var(--font-vazirmatn)" }}
          >
            همه
          </button>
          {siteTextGroups.map((g) => (
            <button
              key={g}
              onClick={() => setSiteTextGroup(g)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${siteTextGroup === g ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20" : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200"}`}
              style={{ fontFamily: "var(--font-vazirmatn)" }}
            >
              {GROUP_LABELS_FA[g] || g}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {siteTextsLoading && (siteTexts || []).length === 0 && (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
          <p className="text-gray-400 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>در حال بارگذاری...</p>
        </div>
      )}

      {/* Site text list */}
      {!siteTextsLoading && (filteredSiteTexts || []).length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <Type className="w-8 h-8 text-gray-200" />
          </div>
          <p className="text-gray-400 font-semibold text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>متنی یافت نشد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSiteTexts.map((st) => (
            <div key={st.id} className="bg-white rounded-2xl border border-gray-100/80 p-4 sm:p-5 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">{GROUP_LABELS_FA[st.group] || st.group}</span>
                <span className="text-xs font-bold text-gray-700" style={{ fontFamily: "var(--font-vazirmatn)" }}>{KEY_LABELS_FA[st.key] || st.key}</span>
                <code className="text-[10px] font-mono text-gray-400 hidden sm:inline">({st.key})</code>
              </div>
              {editingTextId === st.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">فارسی</label>
                    <textarea value={editingTextData.value_fa} onChange={(e) => setEditingTextData({ ...editingTextData, value_fa: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">English</label>
                    <textarea value={editingTextData.value_en} onChange={(e) => setEditingTextData({ ...editingTextData, value_en: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-1">العربية</label>
                    <textarea value={editingTextData.value_ar} onChange={(e) => setEditingTextData({ ...editingTextData, value_ar: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" dir="rtl" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveSiteText(st.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
                      <Save className="w-3.5 h-3.5" />ذخیره
                    </button>
                    <button onClick={() => setEditingTextId(null)} className="px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold hover:bg-gray-100" style={{ fontFamily: "var(--font-vazirmatn)" }}>انصراف</button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer group"
                  onClick={() => { setEditingTextId(st.id); setEditingTextData({ value_fa: st.value_fa, value_en: st.value_en, value_ar: st.value_ar }); }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">فارسی</p>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-teal-700 transition-colors" style={{ fontFamily: "var(--font-vazirmatn)" }}>{st.value_fa || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">English</p>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-teal-700 transition-colors" dir="ltr">{st.value_en || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 mb-1">العربية</p>
                      <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-teal-700 transition-colors" dir="rtl">{st.value_ar || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="w-3 h-3" />
                    <span style={{ fontFamily: "var(--font-vazirmatn)" }}>برای ویرایش کلیک کنید</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  /* ---- SCHEDULE TAB ---- */
  const renderScheduleTab = () => (
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

  /* ════════════════════════════════════════════════════════════════════════
     DASHBOARD JSX
     ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F7F9FB] flex" dir={dir}>
      {/* ══════════ Sidebar ══════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside
        className={`fixed top-0 ${isRTL ? "right-0" : "left-0"} z-50 h-screen transition-all duration-300 ease-in-out flex flex-col ${
          mobileMenuOpen ? "translate-x-0" : isRTL ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          width: sidebarWidth,
          background: "linear-gradient(180deg, #071E1B 0%, #0D3A35 40%, #0D3A35 100%)",
        }}
      >
        {/* Logo area */}
        <div className="h-[72px] flex items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.1)" }}>
              <img src="/images/imaz-logo-new.svg" alt="ایماز" className="h-6 w-auto brightness-0 invert" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h3 className="text-white text-sm font-bold truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>ایماز دنتال</h3>
                <p className="text-teal-400/50 text-[10px]" style={{ fontFamily: "var(--font-vazirmatn)" }}>پنل مدیریت</p>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveTab(item.key); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-white/[0.12] text-white shadow-lg shadow-black/10"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-teal-300" : ""}`} />
                {!sidebarCollapsed && (
                  <span className="text-[13px] font-medium truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="hidden lg:block px-3 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
          >
            {sidebarCollapsed ? (
              isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            )}
            {!sidebarCollapsed && <span className="text-[11px]" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.collapse_sidebar")}</span>}
          </button>
        </div>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", color: "white" }}>
              {adminInitial}
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-white text-xs font-bold truncate" style={{ fontFamily: "var(--font-vazirmatn)" }}>{adminDisplayName}</p>
                <p className="text-teal-400/40 text-[10px]" style={{ fontFamily: "var(--font-vazirmatn)" }}>{adminEmail}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button onClick={handleLogout} className="text-white/20 hover:text-rose-400 transition-colors" title={t("admin.logout")}>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ══════════ Main Area ══════════ */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginInlineStart: isDesktop ? sidebarWidth : 0 }}>
        {/* ── Top Header ── */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
          <div className="flex items-center justify-between h-[72px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  {activeTab === "appointments" && t("admin.nav_appointments")}
                  {activeTab === "analytics" && t("admin.nav_analytics")}
                  {activeTab === "faq" && "سوالات متداول"}
                  {activeTab === "gallery" && "گالری"}
                  {activeTab === "collaborations" && "دندانپزشکان"}
                  {activeTab === "site_text" && "متن سایت"}
                  {activeTab === "settings" && t("admin.nav_settings")}
                  {activeTab === "schedule" && "زمان‌بندی"}
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.dashboard_subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeTab === "appointments" && (
                <div className="hidden md:flex items-center relative">
                  <Search className="absolute start-3 w-4 h-4 text-gray-300" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("admin.search_placeholder")}
                    className="w-64 ps-10 pe-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all"
                    style={{ fontFamily: "var(--font-vazirmatn)" }}
                  />
                </div>
              )}
              <button
                onClick={() => {
                  fetchBookings(true);
                  if (activeTab === "analytics") fetchAnalytics();
                  if (activeTab === "faq") fetchFaqs();
                  if (activeTab === "gallery") fetchGallery();
                  if (activeTab === "collaborations") fetchCollabs();
                  if (activeTab === "site_text") fetchSiteTexts();
                  if (activeTab === "schedule") { fetchSlotConfig(); fetchScheduleSlots(); fetchClosedSlots(); }
                }}
                disabled={bookingsLoading}
                className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                title={t("admin.refresh")}
              >
                <RefreshCw className={`w-5 h-5 text-gray-400 ${bookingsLoading ? "animate-spin" : ""}`} />
              </button>
              <div className="relative">
                <button
                  onClick={async () => {
                    setShowNotifyDropdown((prev) => !prev);
                    if (notifySupported && notifyPermission !== "granted") {
                      await requestNotifyPermission();
                    }
                    clearBadge();
                  }}
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label={t("admin.notify_bell_title")}
                >
                  {notifyBadge > 0 ? (
                    <BellRing className="w-5 h-5 text-teal-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-gray-400" />
                  )}
                  {(notifyBadge > 0 || stats.pending > 0) && (
                    <span className="absolute top-1.5 end-1.5 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {notifyBadge > 0 ? (notifyBadge > 9 ? "9+" : notifyBadge) : stats.pending}
                    </span>
                  )}
                </button>

                {showNotifyDropdown && (
                  <div className="absolute end-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 min-w-[230px]">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-[11px] font-bold text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        {t("admin.notify_bell_title")}
                      </p>
                    </div>

                    {notifySupported && notifyPermission !== "granted" && (
                      <button
                        onClick={requestNotifyPermission}
                        className="w-full text-start px-3 py-2.5 text-xs text-teal-700 hover:bg-teal-50 transition-all flex items-center gap-2"
                        style={{ fontFamily: "var(--font-vazirmatn)" }}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        {t("admin.notify_enable")}
                      </button>
                    )}

                    {notifySupported && notifyPermission === "granted" && (
                      <div className="px-3 py-2 text-[11px] text-emerald-600 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        <BellRing className="w-3.5 h-3.5" />
                        {t("admin.notify_enabled")}
                      </div>
                    )}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      {notifyBadge === 0 ? (
                        <div className="px-3 py-3 text-[11px] text-gray-400 text-center" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                          {t("admin.notify_no_new")}
                        </div>
                      ) : (
                        <>
                          {notificationData.newBookings > 0 && (
                            <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                              <CalendarDays className="w-3.5 h-3.5 text-teal-500" />
                              <span>{notificationData.newBookings} {t("admin.notify_new_bookings_count")}</span>
                            </div>
                          )}
                          {notificationData.newPatients > 0 && (
                            <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                              <UserPlus className="w-3.5 h-3.5 text-teal-500" />
                              <span>{notificationData.newPatients} {t("admin.notify_new_patients_count")}</span>
                            </div>
                          )}
                          {notificationData.unreadMessages > 0 && (
                            <div className="px-3 py-2 text-[11px] text-gray-700 flex items-center gap-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                              <Mail className="w-3.5 h-3.5 text-teal-500" />
                              <span>{notificationData.unreadMessages} {t("admin.notify_new_messages_count")}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <a href="/" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                {t("admin.back_to_site")}
              </a>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {/* Mobile search for appointments */}
          {activeTab === "appointments" && (
            <div className="md:hidden mb-4">
              <div className="relative">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("admin.search_placeholder")}
                  className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none transition-all"
                  style={{ fontFamily: "var(--font-vazirmatn)" }}
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {activeTab === "appointments" && bookingsLoading && bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-400 font-medium text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.loading_bookings")}</p>
            </div>
          )}

          {/* Error State */}
          {activeTab === "appointments" && bookingsError && !bookingsLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <p className="text-gray-600 font-semibold text-sm mb-2" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.load_error_title")}</p>
              <p className="text-gray-400 text-xs mb-4 text-center max-w-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{bookingsError}</p>
              <button onClick={() => fetchBookings(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg active:scale-95" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
                <RefreshCw className="w-4 h-4" />{t("admin.retry")}
              </button>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "appointments" && !bookingsLoading && !bookingsError && renderAppointmentsTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}

          {activeTab === "faq" && renderFaqTab()}
          {activeTab === "gallery" && renderGalleryTab()}
          {activeTab === "collaborations" && renderCollaborationsTab()}
          {activeTab === "site_text" && renderSiteTextTab()}
          {activeTab === "settings" && renderSettingsTab()}
          {activeTab === "schedule" && renderScheduleTab()}
        </main>
      </div>

      {/* ══════════ Booking Detail Panel ══════════ */}
      {showDetailPanel && selectedBooking && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-end" onClick={() => { setShowDetailPanel(false); setEditingBooking(false); }}>
          <div className="bg-white h-full w-full max-w-lg overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_title")}</h3>
              <button onClick={() => { setShowDetailPanel(false); setEditingBooking(false); }} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status & Edit */}
              <div className="flex items-center gap-2">
                {(() => {
                  const sc = statusConfig[selectedBooking.status];
                  const StatusIcon = sc.icon;
                  return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${sc.bg} ${sc.text} border ${sc.border}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {sc.label}
                    </span>
                  );
                })()}
                <div className="flex-1" />
                {!editingBooking && (
                  <button
                    onClick={() => { setEditingBooking(true); setEditBookingData({ date: selectedBooking.date, time: selectedBooking.time, notes: selectedBooking.notes || "" }); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all"
                    style={{ fontFamily: "var(--font-vazirmatn)" }}
                  >
                    <Edit3 className="w-3.5 h-3.5" />{t("admin.btn_edit")}
                  </button>
                )}
              </div>

              {/* Patient info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shrink-0">
                  {selectedBooking.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm" style={{ fontFamily: "var(--font-vazirmatn)" }}>{selectedBooking.full_name}</p>
                  <p className="text-xs text-gray-400" dir="ltr">{selectedBooking.phone}</p>
                </div>
              </div>

              {/* Detail fields */}
              {editingBooking ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_date")}</label>
                    <input type="date" value={editBookingData.date} onChange={(e) => setEditBookingData({ ...editBookingData, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_time")}</label>
                    <input type="time" value={editBookingData.time} onChange={(e) => setEditBookingData({ ...editBookingData, time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_notes")}</label>
                    <textarea value={editBookingData.notes} onChange={(e) => setEditBookingData({ ...editBookingData, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveEdit} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
                      <Save className="w-3.5 h-3.5" />{t("admin.btn_save")}
                    </button>
                    <button onClick={() => setEditingBooking(false)} className="px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold hover:bg-gray-100" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Stethoscope className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_service")}:</span>
                    <span className="font-bold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t(selectedBooking.service)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_date")}:</span>
                    <span className="font-bold text-gray-900">{toPersianNum(selectedBooking.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_time")}:</span>
                    <span className="font-bold text-gray-900" dir="ltr">{selectedBooking.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-300 shrink-0" />
                    <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_phone")}:</span>
                    <span className="font-bold text-gray-900" dir="ltr">{selectedBooking.phone}</span>
                  </div>
                  {selectedBooking.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-300 shrink-0" />
                      <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_email")}:</span>
                      <span className="font-bold text-gray-900" dir="ltr">{selectedBooking.email}</span>
                    </div>
                  )}
                  {selectedBooking.notes && (
                    <div className="flex items-start gap-3 text-sm">
                      <FileText className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                      <span className="text-gray-500" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.detail_notes")}:</span>
                      <span className="font-bold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{selectedBooking.notes}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-50">
                    <span style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.created_at")}: {toPersianNum(new Date(selectedBooking.created_at).toLocaleDateString("fa-IR"))}</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!editingBooking && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  {selectedBooking.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(selectedBooking.id, "confirmed")} disabled={actionLoading === selectedBooking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 hover:bg-emerald-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        <CheckCircle2 className="w-3.5 h-3.5" />{t("admin.btn_confirm")}
                      </button>
                      <button onClick={() => updateStatus(selectedBooking.id, "rejected")} disabled={actionLoading === selectedBooking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                        <XCircle className="w-3.5 h-3.5" />{t("admin.btn_reject")}
                      </button>
                    </>
                  )}
                  {(selectedBooking.status === "rejected" || selectedBooking.status === "rescheduled") && (
                    <button onClick={() => updateStatus(selectedBooking.id, "pending")} disabled={actionLoading === selectedBooking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 hover:bg-amber-100 transition-all disabled:opacity-50" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                      <RefreshCw className="w-3.5 h-3.5" />{t("admin.btn_restore")}
                    </button>
                  )}
                  <button onClick={() => deleteBooking(selectedBooking.id)} disabled={actionLoading === selectedBooking.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-500 border border-rose-200/60 hover:bg-rose-100 transition-all disabled:opacity-50 ms-auto" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                    <Trash2 className="w-3.5 h-3.5" />{t("admin.btn_delete")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Create Booking Modal ══════════ */}
      {showCreateBooking && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateBooking(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-extrabold text-gray-900" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.create_booking_title")}</h3>
              <button onClick={() => setShowCreateBooking(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_name")} *</label>
                <input value={newBookingData.fullName} onChange={(e) => setNewBookingData({ ...newBookingData, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_phone")} *</label>
                <input value={newBookingData.phone} onChange={(e) => setNewBookingData({ ...newBookingData, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_email")}</label>
                <input value={newBookingData.email} onChange={(e) => setNewBookingData({ ...newBookingData, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" dir="ltr" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_service")} *</label>
                <select value={newBookingData.service} onChange={(e) => setNewBookingData({ ...newBookingData, service: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" style={{ fontFamily: "var(--font-vazirmatn)" }}>
                  <option value="">{t("booking.select_service")}</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_date")} *</label>
                  <input type="date" value={newBookingData.date} onChange={(e) => { setNewBookingData({ ...newBookingData, date: e.target.value, time: "" }); fetchAvailableSlots(e.target.value); }} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
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
                            onClick={() => setNewBookingData({ ...newBookingData, time: slot.time })}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                              newBookingData.time === slot.time
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
                        <input type="time" value={newBookingData.time} onChange={(e) => setNewBookingData({ ...newBookingData, time: e.target.value })} className="px-3 py-1.5 rounded-lg border border-gray-100 text-xs outline-none focus:border-teal-200" />
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
                        <input type="time" value={newBookingData.time} onChange={(e) => setNewBookingData({ ...newBookingData, time: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("booking.lbl_notes")}</label>
                <textarea value={newBookingData.notes} onChange={(e) => setNewBookingData({ ...newBookingData, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-white focus:border-teal-200 focus:ring-2 focus:ring-teal-500/5 text-sm outline-none resize-none" style={{ fontFamily: "var(--font-vazirmatn)" }} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleCreateBooking} disabled={creatingBooking} className="flex-1 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #1B7A6E, #2DA89E)", fontFamily: "var(--font-vazirmatn)" }}>
                {creatingBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {t("admin.btn_new_booking")}
              </button>
              <button onClick={() => setShowCreateBooking(false)} className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-500 font-bold text-xs hover:bg-gray-100 transition-all" style={{ fontFamily: "var(--font-vazirmatn)" }}>{t("admin.btn_cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
