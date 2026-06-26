"use client";

import {
  Loader2,
  XCircle,
  User,
  Lock,
  CalendarDays,
  Bell,
  BarChart3,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/i18n/context";

interface AdminLoginProps {
  authChecking: boolean;
  username: string;
  password: string;
  loginError: string;
  loginLoading: boolean;
  onUsernameChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminLogin({
  authChecking,
  username,
  password,
  loginError,
  loginLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginProps) {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";

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
          <form onSubmit={onSubmit} className="space-y-5">
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
                  onChange={(e) => onUsernameChange(e.target.value)}
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
                  onChange={(e) => onPasswordChange(e.target.value)}
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
