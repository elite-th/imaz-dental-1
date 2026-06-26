"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import {
  User,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ClipboardCheck,
  Info,
  Loader2,
  ChevronDown,
  Clock,
  Lock,
  XCircle,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/use-lumina";

import { useI18n } from "@/i18n/context";
import { bookingsApi, slotsApi, ApiError, TimeSlot, SlotsResponse } from "@/lib/api";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian_calendar from "react-date-object/calendars/persian";
import persian_fa_locale from "react-date-object/locales/persian_fa";
import arabic_calendar from "react-date-object/calendars/arabic";
import arabic_ar_locale from "react-date-object/locales/arabic_ar";
import gregorian_calendar from "react-date-object/calendars/gregorian";
import gregorian_en_locale from "react-date-object/locales/gregorian_en";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Toast {
  id: number;
  message: string;
  type: "error" | "success";
  exiting?: boolean;
}

const SERVICE_KEYS = [
  "booking.svc_implants",
  "booking.svc_rootcanal",
  "booking.svc_makeover",
  "booking.svc_ortho",
  "booking.svc_prosthetics",
  "booking.svc_pediatric",
] as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function formatPhone(raw: string, locale: string): string {
  const digits = raw.replace(/\D/g, "");
  if (locale === "fa" || locale === "ar") {
    const d = digits.slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 4) return d;
    return `${d.slice(0, 4)} ${d.slice(4)}`;
  }
  const d = digits.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

function phoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Convert a DateObject to Gregorian YYYY-MM-DD for the slots API */
function toGregorianStr(dateObj: DateObject): string | null {
  try {
    const gregorian = dateObj.convert(gregorian_calendar, gregorian_en_locale);
    return gregorian.format("YYYY-MM-DD");
  } catch {
    return null;
  }
}

/** Format time display like "09:00" → "۹:۰۰" for fa locale */
function formatTimeDisplay(time: string, locale: string): string {
  if (locale !== "fa" && locale !== "ar") return time;
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return time.replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

let toastId = 0;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Booking() {
  const sectionRef = useScrollReveal();
  const cardRef = useRef<HTMLDivElement>(null);
  const { t, locale, dir } = useI18n();
  const isRTL = dir === "rtl";

  /* ---- translated services ---- */
  const bookingServices = SERVICE_KEYS.map((key) => ({
    key,
    label: t(key),
  }));

  /* ---- DatePicker config based on locale ---- */
  const datePickerConfig = useMemo(() => {
    if (locale === "fa") {
      return {
        calendar: persian_calendar,
        locale: persian_fa_locale,
        weekDays: [
          ["شنبه", "ش"],
          ["یکشنبه", "ی"],
          ["دوشنبه", "د"],
          ["سه‌شنبه", "س"],
          ["چهارشنبه", "چ"],
          ["پنجشنبه", "پ"],
          ["جمعه", "ج"],
        ],
      };
    }
    if (locale === "ar") {
      return {
        calendar: arabic_calendar,
        locale: arabic_ar_locale,
        weekDays: [
          ["السّبت", "سبت"],
          ["الأحد", "أحد"],
          ["الإثنين", "إثن"],
          ["الثلاثاء", "ثلا"],
          ["الأربعاء", "أرب"],
          ["الخميس", "خمي"],
          ["الجمعة", "جمع"],
        ],
      };
    }
    return {
      calendar: gregorian_calendar,
      locale: gregorian_en_locale,
      weekDays: undefined,
    };
  }, [locale]);

  /* ---- localized date formatter for summary ---- */
  const formatDateNice = (dateObj: DateObject | null): string => {
    if (!dateObj) return "";
    return dateObj.format("dddd DD MMMM YYYY");
  };

  /* ---- state ---- */
  const [currentStep, setCurrentStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [serviceError, setServiceError] = useState("");
  const [dateError, setDateError] = useState("");
  const [timeError, setTimeError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  /* ---- slots state ---- */
  const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  /* ---- Fetch slots when date changes ---- */
  useEffect(() => {
    if (!selectedDate) {
      queueMicrotask(() => {
        setSlotsData(null);
        setSelectedTime("");
      });
      return;
    }

    const gregorianStr = toGregorianStr(selectedDate);
    if (!gregorianStr) {
      queueMicrotask(() => {
        setSlotsData(null);
        setSelectedTime("");
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedTime("");
    });

    slotsApi
      .get(gregorianStr)
      .then((data) => {
        if (!cancelled) {
          setSlotsData(data);
          setSlotsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSlotsError(err?.message || "Error loading slots");
          setSlotsData(null);
          setSlotsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  /* ---- available slots count ---- */
  const availableCount = useMemo(() => {
    if (!slotsData?.slots) return 0;
    return slotsData.slots.filter((s) => s.status === "available").length;
  }, [slotsData]);

  /* ---- toast helpers ---- */
  const addToast = useCallback(
    (message: string, type: "error" | "success") => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, 4000);
    },
    []
  );

  /* ---- validation ---- */
  const validateStep1 = (): boolean => {
    let valid = true;
    if (fullName.trim().length < 2) {
      setNameError(t("booking.err_name"));
      valid = false;
    } else {
      setNameError("");
    }
    const minPhoneLen = locale === "fa" || locale === "ar" ? 11 : 7;
    if (phoneDigits(phone).length < minPhoneLen) {
      setPhoneError(t("booking.err_phone"));
      valid = false;
    } else {
      setPhoneError("");
    }
    if (!service) {
      setServiceError(t("booking.err_service"));
      valid = false;
    } else {
      setServiceError("");
    }
    return valid;
  };

  const validateStep2 = (): boolean => {
    let valid = true;
    if (!selectedDate) {
      setDateError(t("booking.err_date"));
      valid = false;
    } else {
      setDateError("");
    }
    if (!selectedTime) {
      setTimeError(t("booking.err_time"));
      valid = false;
    } else {
      setTimeError("");
    }
    return valid;
  };

  /* ---- Prevent auto-scroll on step change ---- */
  const preventScrollOnStepChange = useCallback(() => {
    const savedScrollY = window.scrollY;
    const raf = requestAnimationFrame(() => {
      window.scrollTo(0, savedScrollY);
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollY);
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ---- navigation ---- */
  const goNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      addToast(t("booking.err_required"), "error");
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      addToast(t("booking.err_required"), "error");
      return;
    }
    preventScrollOnStepChange();
    setCurrentStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    preventScrollOnStepChange();
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  /* ---- submit ---- */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const dateStr = selectedDate
        ? selectedDate.format(
            locale === "fa"
              ? "YYYY/MM/DD"
              : locale === "ar"
              ? "YYYY/MM/DD"
              : "YYYY-MM-DD"
          )
        : "";

      try {
        await bookingsApi.create({
          fullName: fullName.trim(),
          phone,
          email: email.trim() || undefined,
          service,
          date: dateStr,
          time: selectedTime,
          notes: notes.trim() || undefined,
        });
        setIsSubmitted(true);
        addToast(t("booking.toast_success"), "success");
      } catch (err) {
        const apiErr = err as ApiError;
        const msg = apiErr?.status === 409
          ? t("booking.slot_taken")
          : apiErr?.status === 410
          ? t("booking.slot_closed")
          : (apiErr?.message || t("booking.err_required"));
        addToast(msg, "error");
        setIsSubmitting(false);
        return;
      }
    } catch {
      addToast(t("booking.err_required"), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---- phone change ---- */
  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const maxLen = (locale === "fa" || locale === "ar") ? 11 : 10;
    setPhone(formatPhone(digits.slice(0, maxLen), locale));
  };

  /* ---- derived ---- */
  const firstName = fullName.trim().split(" ")[0] || "there";

  /* ---- progress bar step colors ---- */
  const dotClass = (step: number) => {
    if (step <= currentStep)
      return "w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-sky-500/30 transition-all duration-500";
    return "w-9 h-9 rounded-full bg-sky-100 text-sky-400 flex items-center justify-center text-xs font-bold transition-all duration-500";
  };
  const labelClass = (step: number) =>
    step <= currentStep
      ? "text-[11px] font-semibold text-sky-600 hidden sm:block"
      : "text-[11px] font-medium text-sky-400 hidden sm:block";
  const lineClass = (step: number) =>
    step < currentStep
      ? "w-16 sm:w-24 h-[2px] bg-sky-500 mx-2 transition-colors duration-500"
      : "w-16 sm:w-24 h-[2px] bg-sky-200 mx-2 transition-colors duration-500";

  /* ---- slot status icon ---- */
  const SlotStatusIcon = ({ status }: { status: TimeSlot["status"] }) => {
    if (status === "booked")
      return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    if (status === "closed")
      return <Lock className="w-3.5 h-3.5 text-gray-400" />;
    return <Clock className="w-3.5 h-3.5 text-teal-500" />;
  };

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */
  return (
    <section
      id="booking"
      ref={sectionRef}
      className="py-8 sm:py-12 lg:py-16 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(150deg, rgba(9,40,36,0.94) 0%, rgba(17,78,71,0.92) 35%, rgba(13,58,53,0.96) 65%, rgba(26,35,50,0.90) 100%), url('/images/booking-bg.png') center/cover no-repeat",
      }}
    >
      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          opacity: 0.035,
          backgroundImage:
            "radial-gradient(circle, #6BCDB8 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Background blur blobs — warm teal glow */}
      <div className="absolute top-1/4 -start-20 w-80 h-80 rounded-full opacity-10 blur-3xl" style={{ background: "#1B7A6E" }} />
      <div className="absolute bottom-1/4 -end-20 w-96 h-96 rounded-full opacity-8 blur-3xl" style={{ background: "#2DA89E" }} />
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5 blur-3xl" style={{ background: "#6BCDB8" }} />

      {/* ---- Toast container ---- */}
      <div className="fixed top-24 end-4 z-[60] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium max-w-sm ${
              toast.exiting ? "toast-exit" : "toast"
            } ${
              toast.type === "error"
                ? "toast-error"
                : "toast-success"
            }`}
          >
            {toast.type === "error" ? (
              <Info className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* ---- Heading ---- */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <span className="reveal inline-flex items-center gap-2.5 text-teal-300 font-semibold text-[12px] mb-3 tracking-[0.15em] uppercase">
            <span className={`w-10 sm:w-14 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-transparent to-teal-400`} />
            {t("booking.label")}
            <span className={`w-10 sm:w-14 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-transparent to-teal-400`} />
          </span>
          <h2
            className="reveal d1 font-display text-2xl sm:text-3xl lg:text-[2.25rem] font-bold leading-[1.15] mb-3 text-white"
          >
            {t("booking.heading_l1")}
            <br />
            <span className="text-teal-300">{t("booking.heading_l2")}</span>
          </h2>
          <p className="reveal d2 text-teal-200/50 text-sm sm:text-base leading-[1.8]">
            {t("booking.subtitle")}
          </p>
        </div>

        {/* ---- Booking Card ---- */}
        <div className="booking-card-wrap mx-auto max-w-2xl">
          <div className="reveal-scale booking-card">
            <div ref={cardRef} className="booking-form-card bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 lg:p-8">
              {/* ============ Progress Bar ============ */}
              {!isSubmitted && (
                <div
                  className="flex items-center justify-center mb-6 sm:mb-8"
                  id="progressBar"
                >
                  {([1, 2, 3] as const).map((step, idx) => {
                    const stepLabels = [
                      t("booking.step_details"),
                      t("booking.step_schedule"),
                      t("booking.step_confirm"),
                    ];
                    return (
                      <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className={dotClass(step)}>
                            {step < currentStep ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              step
                            )}
                          </div>
                          <span className={labelClass(step)}>
                            {stepLabels[idx]}
                          </span>
                        </div>
                        {idx < 2 && <div className={lineClass(step)} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ============ STEP 1: Details ============ */}
              {currentStep === 1 && !isSubmitted && (
                <div className="step-panel space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <div className="float-group">
                        <User className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300 z-10 pointer-events-none" />
                        <input
                          type="text"
                          className="form-input w-full ps-11 pe-4 py-4 rounded-xl text-gray-900 text-sm"
                          placeholder=" "
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (nameError) setNameError("");
                          }}
                        />
                        <label>{t("booking.lbl_name")}</label>
                      </div>
                      {nameError && (
                        <p className="text-[11px] text-teal-600 mt-1 ps-1">
                          {nameError}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <div className="float-group">
                        <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300 z-10 pointer-events-none" />
                        <input
                          type="tel"
                          className="form-input w-full ps-11 pe-4 py-4 rounded-xl text-gray-900 text-sm"
                          placeholder=" "
                          value={phone}
                          onChange={(e) => {
                            handlePhoneChange(e.target.value);
                            if (phoneError) setPhoneError("");
                          }}
                        />
                        <label>{t("booking.lbl_phone")}</label>
                      </div>
                      {phoneError && (
                        <p className="text-[11px] text-teal-600 mt-1 ps-1">
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="float-group">
                    <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300 z-10 pointer-events-none" />
                    <input
                      type="email"
                      className="form-input w-full ps-11 pe-4 py-4 rounded-xl text-gray-900 text-sm"
                      placeholder=" "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <label>{t("booking.lbl_email")}</label>
                  </div>

                  {/* Service */}
                  <div>
                    <div className="float-group relative">
                      <ClipboardCheck className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300 z-10 pointer-events-none" />
                      <select
                        className="form-input w-full ps-11 pe-10 py-4 rounded-xl text-gray-900 text-sm appearance-none cursor-pointer"
                        value={service}
                        onChange={(e) => {
                          setService(e.target.value);
                          if (serviceError) setServiceError("");
                        }}
                      >
                        <option value="" disabled>
                          {t("booking.select_service")}
                        </option>
                        {bookingServices.map((svc) => (
                          <option key={svc.key} value={svc.key}>
                            {svc.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute end-4 top-1/2 -translate-y-1/2 w-3 h-3 text-teal-300 pointer-events-none" />
                      <label>{t("booking.lbl_service")}</label>
                    </div>
                    {serviceError && (
                      <p className="text-[11px] text-teal-600 mt-1 ps-1">
                        {serviceError}
                      </p>
                    )}
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-end pt-3">
                      <button
                        onClick={goNext}
                        className="btn-cta inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-bold text-[13px] shadow-lg shadow-teal-500/20"
                      >
                        {t("booking.btn_next")}{" "}
                        <ArrowRight className="w-3 h-3 rtl:-scale-x-100" />
                      </button>
                  </div>
                </div>
              )}

              {/* ============ STEP 2: Schedule ============ */}
              {currentStep === 2 && !isSubmitted && (
                <div className="step-panel space-y-5">
                  {/* Date Picker — Jalali/Persian for fa, Hijri/Arabic for ar, Gregorian for en */}
                  <div>
                    <label className="block text-[12px] font-bold text-teal-800 mb-2">
                      {t("booking.lbl_date")}
                    </label>
                    <div className="relative datepicker-wrapper">
                      <Calendar className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-300 z-10 pointer-events-none" />
                      <DatePicker
                        value={selectedDate}
                        onChange={(value: DateObject | null) => {
                          setSelectedDate(value);
                          setSelectedTime("");
                          if (dateError) setDateError("");
                        }}
                        calendar={datePickerConfig.calendar}
                        locale={datePickerConfig.locale}
                        weekDays={datePickerConfig.weekDays}
                        calendarPosition={isRTL ? "bottom-right" : "bottom-left"}
                        className="booking-datepicker"
                        minDate={new DateObject()}
                        maxDate={new DateObject().add(1, "months")}
                        arrow={false}
                        format={
                          locale === "fa"
                            ? "YYYY/MM/DD"
                            : locale === "ar"
                            ? "YYYY/MM/DD"
                            : "YYYY-MM-DD"
                        }
                        placeholder={
                          locale === "fa"
                            ? "۱۴۰۴/۰۱/۰۱"
                            : locale === "ar"
                            ? "٢٠٢٥/٠١/٠١"
                            : "2025-01-01"
                        }
                        inputClass="booking-date-input"
                        containerStyle={{ width: "100%" }}
                      />
                    </div>
                    {dateError && (
                      <p className="text-[11px] text-teal-600 mt-1 ps-1">
                        {dateError}
                      </p>
                    )}
                  </div>

                  {/* Time Slot Selection */}
                  <div>
                    <label className="block text-[12px] font-bold text-teal-800 mb-2">
                      {t("booking.lbl_time")}
                    </label>

                    {/* No date selected yet */}
                    {!selectedDate && (
                      <div className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{t("booking.select_date_first")}</span>
                      </div>
                    )}

                    {/* Loading slots */}
                    {selectedDate && slotsLoading && (
                      <div className="flex items-center justify-center gap-2 px-4 py-8 rounded-xl bg-gray-50 border border-gray-200">
                        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                        <span className="text-sm text-gray-500">{t("booking.slots_loading")}</span>
                      </div>
                    )}

                    {/* Error loading slots */}
                    {selectedDate && slotsError && !slotsLoading && (
                      <div className="px-4 py-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        {slotsError}
                      </div>
                    )}

                    {/* Non-working day */}
                    {slotsData && !slotsData.is_working_day && !slotsLoading && (
                      <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-amber-50 border border-amber-200">
                        <XCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">
                            {t("booking.holiday_notice")}
                          </p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            {t("booking.holiday_closed")}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Full day closed */}
                    {slotsData && slotsData.is_working_day && slotsData.is_full_day_closed && !slotsLoading && (
                      <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-gray-50 border border-gray-200">
                        <Lock className="w-5 h-5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            {t("booking.dayoff_notice")}
                          </p>
                          {slotsData.full_day_close_reason && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {slotsData.full_day_close_reason}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Slots grid */}
                    {slotsData && slotsData.is_working_day && !slotsData.is_full_day_closed && !slotsLoading && (
                      <div className="space-y-3">
                        {/* Working hours info + available count */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-teal-600">
                            <Clock className="w-3.5 h-3.5" />
                            {slotsData.working_hours && (
                              <span>
                                {formatTimeDisplay(slotsData.working_hours.open, locale)} — {formatTimeDisplay(slotsData.working_hours.close, locale)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
                            {availableCount} {t("booking.slot_count_after")}
                          </span>
                        </div>

                        {/* Slot boxes grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                          {slotsData.slots.map((slot) => {
                            const isAvailable = slot.status === "available";
                            const isBooked = slot.status === "booked";
                            const isClosed = slot.status === "closed";
                            const isSelected = selectedTime === slot.time;

                            return (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => {
                                  if (isAvailable) {
                                    setSelectedTime(slot.time);
                                    if (timeError) setTimeError("");
                                  }
                                }}
                                className={`
                                  relative flex flex-col items-center justify-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium
                                  transition-all duration-200 border
                                  ${isAvailable
                                    ? isSelected
                                      ? "bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/25 scale-[1.02]"
                                      : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 hover:border-teal-300 hover:shadow-sm cursor-pointer"
                                    : isBooked
                                      ? "bg-red-50 text-red-400 border-red-100 cursor-not-allowed opacity-70"
                                      : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60"
                                  }
                                `}
                                title={
                                  isBooked
                                    ? t("booking.slot_booked")
                                    : isClosed
                                    ? t("booking.slot_closed")
                                    : t("booking.slot_available")
                                }
                              >
                                <span className="font-semibold tracking-wide" dir="ltr">
                                  {formatTimeDisplay(slot.time, locale)}
                                </span>
                                <span className="flex items-center gap-0.5 text-[9px]">
                                  <SlotStatusIcon status={slot.status} />
                                  {isAvailable && (
                                    <span className={isSelected ? "text-white/80" : "text-teal-500"}>
                                      {t("booking.slot_available")}
                                    </span>
                                  )}
                                  {isBooked && (
                                    <span className="text-red-400">
                                      {t("booking.slot_booked")}
                                    </span>
                                  )}
                                  {isClosed && (
                                    <span className="text-gray-400">
                                      {t("booking.slot_closed")}
                                    </span>
                                  )}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* No available slots */}
                        {availableCount === 0 && (
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                            <Info className="w-3.5 h-3.5 shrink-0" />
                            {t("booking.no_slots")}
                          </div>
                        )}

                        {/* Selected time display */}
                        {selectedTime && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
                            <CheckCircle className="w-3.5 h-3.5 text-teal-500" />
                            <span>{t("booking.selected_time")}:</span>
                            <span className="font-bold" dir="ltr">{formatTimeDisplay(selectedTime, locale)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {timeError && (
                      <p className="text-[11px] text-teal-600 mt-1 ps-1">
                        {timeError}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="float-group">
                    <textarea
                      className="form-input w-full px-4 py-4 rounded-xl text-gray-900 text-sm resize-none"
                      rows={3}
                      placeholder=" "
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                    <label>{t("booking.lbl_notes")}</label>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-3">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-teal-400 font-semibold text-[13px] hover:text-teal-600 hover:bg-teal-50 transition-all"
                    >
                      <ArrowLeft className="w-3 h-3 rtl:scale-x-100" />{" "}
                      {t("booking.btn_back")}
                    </button>
                      <button
                        onClick={goNext}
                        className="btn-cta inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-white font-bold text-[13px] shadow-lg shadow-teal-500/20"
                      >
                        {t("booking.btn_review")}{" "}
                        <ArrowRight className="w-3 h-3 rtl:-scale-x-100" />
                      </button>
                  </div>
                </div>
              )}

              {/* ============ STEP 3: Confirm ============ */}
              {currentStep === 3 && !isSubmitted && (
                <div className="step-panel space-y-5">
                  {/* Summary Card */}
                  <div className="bg-gradient-to-br from-teal-50/80 via-white to-teal-50/50 rounded-2xl p-6 sm:p-8 border border-teal-100/60 mb-6">
                    <h3 className="font-bold text-teal-900 text-base mb-5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <ClipboardCheck className="w-4 h-4 text-teal-500" />
                      </div>
                      {t("booking.summary_title")}
                    </h3>
                    <div className="space-y-0 divide-y divide-teal-100/50">
                      <div className="flex justify-between py-3">
                        <span className="text-[13px] text-teal-400">
                          {t("booking.summary_patient")}
                        </span>
                        <span className="text-[13px] font-semibold text-teal-900">
                          {fullName}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[13px] text-teal-400">
                          {t("booking.summary_phone")}
                        </span>
                        <span className="text-[13px] font-semibold text-teal-900">
                          {phone}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[13px] text-teal-400">
                          {t("booking.summary_service")}
                        </span>
                        <span className="text-[13px] font-semibold text-teal-900">
                          {service ? t(service) : ""}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[13px] text-teal-400">
                          {t("booking.summary_date")}
                        </span>
                        <span className="text-[13px] font-semibold text-teal-900">
                          {formatDateNice(selectedDate)}
                        </span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-[13px] text-teal-400">
                          {t("booking.summary_time")}
                        </span>
                        <span className="text-[13px] font-semibold text-teal-900" dir="ltr">
                          {selectedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Callout */}
                  <div className="flex items-start gap-3 bg-teal-50/80 border border-teal-200 rounded-xl p-4 mb-6">
                    <Info className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                    <p className="text-[13px] text-teal-800 leading-[1.8]">
                      {t("booking.info_callout")}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-between pt-2">
                    <button
                      onClick={goBack}
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-teal-400 font-semibold text-[13px] hover:text-teal-600 hover:bg-teal-50 transition-all"
                    >
                      <ArrowLeft className="w-3 h-3 rtl:scale-x-100" />{" "}
                      {t("booking.btn_back")}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-cta inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-white font-bold text-[15px] shadow-xl shadow-teal-500/25 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          {t("booking.btn_processing")}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />{" "}
                          {t("booking.btn_confirm")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ============ SUCCESS STATE ============ */}
              {isSubmitted && (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/30"
                    style={{
                      animation:
                        "charIn .5s cubic-bezier(.22,1,.36,1) both",
                    }}
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-teal-900 mb-3">
                    {t("booking.success_title")}
                  </h3>
                  <p className="text-teal-500 text-lg mb-2">
                    {t("booking.success_thankyou")}{" "}
                    <span className="font-semibold text-teal-900">
                      {firstName}
                    </span>
                    !
                  </p>
                  <p className="text-teal-600/50 text-sm mb-8 max-w-md mx-auto leading-[1.8]">
                    {t("booking.success_message")}
                  </p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="inline-flex items-center gap-2 text-teal-500 font-semibold text-sm hover:text-teal-700 transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3 rtl:scale-x-100" />{" "}
                    {t("booking.success_home")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
