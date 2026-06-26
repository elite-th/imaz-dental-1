"use client";

import { useEffect, useRef } from "react";
import { CalendarCheck, ChevronDown, Shield, Users } from "lucide-react";
import { useStatCounter, scrollToElement } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";


function StatCounter({
  target,
  isDecimal = false,
}: {
  target: number;
  isDecimal?: boolean;
}) {
  const ref = useStatCounter(target, isDecimal);
  return (
    <span ref={ref} className="stat-num inline-block">
      0
    </span>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { t, dir, locale } = useI18n();
  const isRTL = dir === "rtl";

  // Locale-aware formatted patient count (8,000 in fa/en/ar numerals)
  const patientCount = new Intl.NumberFormat(
    locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US"
  ).format(8000);

  /* ── Parallax on hero image ── */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const parallaxEl = el.querySelector("[data-parallax]");
    if (!parallaxEl) return;

    const speed = parseFloat(
      (parallaxEl as HTMLElement).dataset.parallax || "0.03"
    );

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        (parallaxEl as HTMLElement).style.transform =
          "translateY(" + window.scrollY * speed + "px)";
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Apply entrance animations after mount (avoids hydration mismatch) ── */
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const animEls = el.querySelectorAll("[data-hero-anim]");
    animEls.forEach((animEl) => {
      const delay = (animEl as HTMLElement).dataset.heroAnim || "0s";
      (animEl as HTMLElement).style.animation =
        `charIn .8s ${delay} cubic-bezier(.22,1,.36,1) both`;
    });
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-[calc(100dvh-80px)] flex items-center pt-20 sm:pt-24 lg:pt-28 overflow-hidden"
    >
      {/* ════ AI Background Image — Full cover ════ */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/hero-bg-abstract.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* ════ Gradient Overlays — Ensure readability ════ */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-white/80 via-white/50 to-white/20" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/40 via-transparent to-white/70" />
      {/* Subtle teal tint overlay */}
      <div className="absolute inset-0 z-[1]" style={{ background: "linear-gradient(160deg, rgba(240,247,245,0.6) 0%, rgba(250,252,251,0.3) 40%, transparent 100%)" }} />

      {/* ════ Animated Floating Geometric Shapes ════ */}

      {/* Plus/Cross shapes — medical symbol */}
      <div className="hero-float-plus absolute top-[12%] start-[8%] z-[1]">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="hero-float-1">
          <rect x="16" y="4" width="8" height="32" rx="2" fill="#1B7A6E" opacity="0.12"/>
          <rect x="4" y="16" width="32" height="8" rx="2" fill="#1B7A6E" opacity="0.12"/>
        </svg>
      </div>

      <div className="hero-float-plus absolute top-[65%] end-[12%] z-[1]">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="hero-float-2">
          <rect x="12" y="2" width="8" height="28" rx="2" fill="#2DA89E" opacity="0.10"/>
          <rect x="2" y="12" width="28" height="8" rx="2" fill="#2DA89E" opacity="0.10"/>
        </svg>
      </div>

      <div className="hero-float-plus absolute top-[30%] end-[25%] z-[1] hidden lg:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="hero-float-3">
          <rect x="9" y="2" width="6" height="20" rx="1.5" fill="#6BCDB8" opacity="0.14"/>
          <rect x="2" y="9" width="20" height="6" rx="1.5" fill="#6BCDB8" opacity="0.14"/>
        </svg>
      </div>

      {/* Hexagonal shapes — molecular/science feel */}
      <div className="absolute top-[20%] end-[18%] z-[1] hero-float-4 hidden lg:block">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
          <path d="M30 5L52 17.5V42.5L30 55L8 42.5V17.5L30 5Z" stroke="#1B7A6E" strokeWidth="1.5" opacity="0.08" />
          <path d="M30 15L43 22.5V37.5L30 45L17 37.5V22.5L30 15Z" stroke="#2DA89E" strokeWidth="1" opacity="0.06" />
        </svg>
      </div>

      <div className="absolute bottom-[25%] start-[5%] z-[1] hero-float-5">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L42 14V34L24 44L6 34V14L24 4Z" stroke="#6BCDB8" strokeWidth="1.5" opacity="0.10" />
        </svg>
      </div>

      {/* Floating circles with glow */}
      <div className="absolute top-[18%] start-[35%] z-[1] hero-float-6 hidden md:block">
        <div className="w-16 h-16 rounded-full border border-teal-400/10 shadow-[0_0_20px_rgba(27,122,110,0.06)]" />
      </div>

      <div className="absolute bottom-[35%] end-[8%] z-[1] hero-float-7">
        <div className="w-10 h-10 rounded-full border border-teal-300/12 shadow-[0_0_16px_rgba(107,205,184,0.08)]" />
      </div>

      <div className="absolute top-[50%] start-[15%] z-[1] hero-float-8">
        <div className="w-6 h-6 rounded-full bg-teal-400/[0.06] shadow-[0_0_12px_rgba(45,168,158,0.10)]" />
      </div>

      {/* Molecular connection dots */}
      <svg className="absolute inset-0 w-full h-full z-[1] pointer-events-none hidden lg:block" style={{ opacity: 0.15 }}>
        <line x1="15%" y1="20%" x2="25%" y2="35%" stroke="#1B7A6E" strokeWidth="0.5" strokeDasharray="4 6" className="hero-mol-line-1" />
        <line x1="25%" y1="35%" x2="40%" y2="28%" stroke="#2DA89E" strokeWidth="0.5" strokeDasharray="4 6" className="hero-mol-line-2" />
        <line x1="75%" y1="15%" x2="85%" y2="30%" stroke="#1B7A6E" strokeWidth="0.5" strokeDasharray="4 6" className="hero-mol-line-3" />
        <line x1="85%" y1="30%" x2="80%" y2="50%" stroke="#6BCDB8" strokeWidth="0.5" strokeDasharray="4 6" className="hero-mol-line-4" />
        <circle cx="15%" cy="20%" r="3" fill="#1B7A6E" className="hero-mol-dot-1" />
        <circle cx="25%" cy="35%" r="2.5" fill="#2DA89E" className="hero-mol-dot-2" />
        <circle cx="40%" cy="28%" r="2" fill="#6BCDB8" className="hero-mol-dot-3" />
        <circle cx="75%" cy="15%" r="3" fill="#1B7A6E" className="hero-mol-dot-4" />
        <circle cx="85%" cy="30%" r="2.5" fill="#2DA89E" className="hero-mol-dot-5" />
        <circle cx="80%" cy="50%" r="2" fill="#6BCDB8" className="hero-mol-dot-6" />
      </svg>

      {/* Animated ring — large decorative */}
      <div className="absolute -top-20 -end-20 w-80 h-80 z-[1] hidden lg:block">
        <div className="w-full h-full rounded-full border border-teal-400/[0.06] hero-ring-spin" />
      </div>
      <div className="absolute -bottom-16 -start-16 w-64 h-64 z-[1] hidden lg:block">
        <div className="w-full h-full rounded-full border border-teal-300/[0.05] hero-ring-spin-reverse" />
      </div>

      {/* ════ 2. Smile Curve SVG — Animated draw ════ */}
      <div className="absolute bottom-[22%] start-[6%] z-[1] hero-smile-curve hidden md:block">
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none" className="hero-smile-svg">
          <path
            d="M10 10 Q60 65 110 10"
            stroke="url(#smileGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className="hero-smile-path"
          />
          <defs>
            <linearGradient id="smileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B7A6E" stopOpacity="0" />
              <stop offset="20%" stopColor="#1B7A6E" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#2DA89E" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#6BCDB8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6BCDB8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Second smile curve — larger, more subtle, different position */}
      <div className="absolute top-[14%] end-[10%] z-[1] hero-smile-curve-2 hidden lg:block">
        <svg width="180" height="90" viewBox="0 0 180 90" fill="none" className="hero-smile-svg-2">
          <path
            d="M15 15 Q90 90 165 15"
            stroke="url(#smileGrad2)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            className="hero-smile-path-2"
          />
          <defs>
            <linearGradient id="smileGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2DA89E" stopOpacity="0" />
              <stop offset="30%" stopColor="#2DA89E" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#6BCDB8" stopOpacity="0.2" />
              <stop offset="70%" stopColor="#2DA89E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1B7A6E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ════ 3. Dental Tool Icons — Floating ════ */}

      {/* Dental Mirror */}
      <div className="absolute top-[40%] start-[3%] z-[1] hero-dental-tool hero-dental-float-1 hidden lg:block">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          {/* Handle */}
          <rect x="22" y="24" width="4" height="18" rx="2" fill="#1B7A6E" opacity="0.15" />
          {/* Mirror head */}
          <circle cx="24" cy="16" r="10" stroke="#1B7A6E" strokeWidth="2" opacity="0.12" />
          <circle cx="24" cy="16" r="7" fill="#2DA89E" opacity="0.06" />
          {/* Shine */}
          <circle cx="21" cy="13" r="2" fill="white" opacity="0.2" />
        </svg>
      </div>

      {/* Dental Probe/Explorer */}
      <div className="absolute top-[25%] end-[6%] z-[1] hero-dental-tool hero-dental-float-2 hidden lg:block">
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          {/* Handle */}
          <rect x="20" y="18" width="4" height="22" rx="2" fill="#2DA89E" opacity="0.12" />
          {/* Probe tip — curved */}
          <path d="M22 18 Q22 8 28 6" stroke="#2DA89E" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.15" />
          {/* Small circle at tip */}
          <circle cx="28" cy="6" r="1.5" fill="#6BCDB8" opacity="0.2" />
        </svg>
      </div>

      {/* Dental Torch/Light */}
      <div className="absolute bottom-[30%] end-[4%] z-[1] hero-dental-tool hero-dental-float-3">
        <svg width="40" height="52" viewBox="0 0 40 52" fill="none">
          {/* Light body */}
          <rect x="14" y="20" width="12" height="28" rx="3" fill="#1B7A6E" opacity="0.10" />
          {/* Light head */}
          <path d="M10 20 L30 20 L26 10 L14 10 Z" fill="#2DA89E" opacity="0.08" />
          {/* Light beam */}
          <path d="M14 10 L4 0 L36 0 L26 10 Z" fill="#6BCDB8" opacity="0.06" className="hero-torch-beam" />
          {/* Shine dots */}
          <circle cx="20" cy="4" r="1.5" fill="white" opacity="0.3" className="hero-torch-sparkle" />
          <circle cx="12" cy="2" r="1" fill="white" opacity="0.2" className="hero-torch-sparkle" />
          <circle cx="28" cy="2" r="1" fill="white" opacity="0.2" className="hero-torch-sparkle" />
        </svg>
      </div>

      {/* Toothbrush — mobile visible */}
      <div className="absolute bottom-[18%] start-[4%] z-[1] hero-dental-tool hero-dental-float-4 md:hidden">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          {/* Handle */}
          <rect x="16" y="16" width="3" height="16" rx="1.5" fill="#1B7A6E" opacity="0.12" />
          {/* Head */}
          <rect x="14" y="6" width="7" height="10" rx="2" fill="#2DA89E" opacity="0.10" />
          {/* Bristles */}
          <line x1="15" y1="8" x2="15" y2="6" stroke="#6BCDB8" strokeWidth="0.8" opacity="0.15" />
          <line x1="17" y1="8" x2="17" y2="6" stroke="#6BCDB8" strokeWidth="0.8" opacity="0.15" />
          <line x1="19" y1="8" x2="19" y2="6" stroke="#6BCDB8" strokeWidth="0.8" opacity="0.15" />
          <line x1="16" y1="9" x2="16" y2="7" stroke="#6BCDB8" strokeWidth="0.8" opacity="0.12" />
          <line x1="18" y1="9" x2="18" y2="7" stroke="#6BCDB8" strokeWidth="0.8" opacity="0.12" />
        </svg>
      </div>

      {/* ════ 5. Sparkle Particles — Shimmering stars ════ */}
      <div className="absolute top-[10%] end-[20%] z-[1] hero-sparkle hero-sparkle-1">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 0L9.5 6.5L16 8L9.5 9.5L8 16L6.5 9.5L0 8L6.5 6.5L8 0Z" fill="#2DA89E" opacity="0.5" />
        </svg>
      </div>
      <div className="absolute top-[35%] start-[12%] z-[1] hero-sparkle hero-sparkle-2 hidden md:block">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8L6 0Z" fill="#6BCDB8" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute top-[55%] end-[22%] z-[1] hero-sparkle hero-sparkle-3">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" fill="#1B7A6E" opacity="0.35" />
        </svg>
      </div>
      <div className="absolute top-[20%] start-[28%] z-[1] hero-sparkle hero-sparkle-4 hidden lg:block">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 0L8.5 5.5L14 7L8.5 8.5L7 14L5.5 8.5L0 7L5.5 5.5L7 0Z" fill="#2DA89E" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute bottom-[40%] start-[22%] z-[1] hero-sparkle hero-sparkle-5 hidden md:block">
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M4 0L4.8 3.2L8 4L4.8 4.8L4 8L3.2 4.8L0 4L3.2 3.2L4 0Z" fill="#6BCDB8" opacity="0.45" />
        </svg>
      </div>
      <div className="absolute top-[45%] end-[15%] z-[1] hero-sparkle hero-sparkle-6 hidden lg:block">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 0L10.8 7.2L18 9L10.8 10.8L9 18L7.2 10.8L0 9L7.2 7.2L9 0Z" fill="#2DA89E" opacity="0.25" />
        </svg>
      </div>
      <div className="absolute bottom-[15%] end-[35%] z-[1] hero-sparkle hero-sparkle-7">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" fill="#1B7A6E" opacity="0.3" />
        </svg>
      </div>
      <div className="absolute top-[70%] start-[8%] z-[1] hero-sparkle hero-sparkle-8 hidden md:block">
        <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
          <path d="M3 0L3.6 2.4L6 3L3.6 3.6L3 6L2.4 3.6L0 3L2.4 2.4L3 0Z" fill="#6BCDB8" opacity="0.5" />
        </svg>
      </div>

      {/* Spotlight glow near CTA area */}
      <div className="absolute bottom-[30%] start-[20%] w-64 h-32 bg-[radial-gradient(ellipse,rgba(27,122,110,0.06)_0%,transparent_70%)] pointer-events-none z-[1]" />

      <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-4 lg:py-6 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-6 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-start">


            {/* Heading — Enhanced typography with weight mixing + gradient */}
            <h1
              className={`font-display text-[clamp(2rem,5vw,4.5rem)] leading-[1.05] tracking-tight mb-4 sm:mb-6 ${
                isRTL ? "heading-gradient-rtl" : "heading-gradient"
              }`}
              data-hero-anim=".3s"
            >
              {isRTL ? (
                <>
                  <span className="font-black">
                    {t("hero.heading_l1")}
                  </span>{" "}
                  <span className="font-medium">
                    {t("hero.heading_l2")}
                  </span>{" "}
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-l from-teal-400 via-teal-300 to-teal-500">
                    {t("hero.heading_l3")}
                  </span>{" "}
                  <span className="font-medium">
                    {t("hero.heading_l4")}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-black">
                    {t("hero.heading_l1")}
                  </span>
                  <br />
                  <span className="font-medium">
                    {t("hero.heading_l2")}
                  </span>{" "}
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-teal-500">
                    {t("hero.heading_l3")}
                  </span>{" "}
                  <span className="font-medium">
                    {t("hero.heading_l4")}
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg leading-[1.8] max-w-lg mx-auto lg:mx-0 mb-6 sm:mb-8"
              style={{ color: "rgba(26,35,50,0.55)" }}
              data-hero-anim=".8s"
            >
              {t("hero.subtitle")}
            </p>

            {/* CTAs — with spotlight glow beneath */}
            <div
              className="spotlight-glow flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-8 sm:mb-10"
              data-hero-anim="1s"
            >
                <button
                  onClick={() => scrollToElement("#booking")}
                  className="btn-cta relative inline-flex items-center gap-3 px-9 py-4 rounded-2xl font-bold text-[15px] text-white shadow-lg shadow-teal-500/20 transition-all w-full sm:w-auto justify-center"
                >
                  <CalendarCheck className="w-4 h-4" />
                  {t("hero.cta_book")}
                </button>
              <button
                onClick={() => scrollToElement("#services")}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl border-2 border-sky-500/30 text-sky-600/80 font-medium text-[15px] hover:bg-sky-500/5 hover:border-sky-500/50 hover:scale-[1.02] transition-all w-full sm:w-auto justify-center group"
              >
                {t("hero.cta_explore")}{" "}
                <ChevronDown className="w-3 h-3 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>

            {/* Stats — with layered shadow cards */}
            <div
              className="flex items-center gap-6 sm:gap-8 justify-center lg:justify-start"
              data-hero-anim="1.2s"
            >
              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-3xl font-bold text-[#1A2332]">
                  <StatCounter target={10} />+
                </div>
                <div className="text-[11px] text-sky-600/80 font-semibold mt-0.5">
                  {t("hero.stat_years")}
                </div>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-sky-500/30 to-transparent" />
              <div className="text-center lg:text-start">
                <div className="text-2xl sm:text-3xl font-bold text-[#1A2332]">
                  <StatCounter target={8000} />+
                </div>
                <div className="text-[11px] text-sky-600/80 font-semibold mt-0.5">
                  {t("hero.stat_patients")}
                </div>
              </div>
            </div>

            {/* Mobile-only decorative accent */}
            <div className="lg:hidden mt-6 flex justify-center">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
            </div>
          </div>

          {/* Right: Hero Image with Badges — Portrait aspect ratio */}
          <div className="relative hidden lg:flex justify-center" data-parallax="0.03">
            <div className="relative w-full max-w-[380px] mx-auto">
              {/* Hero image with custom frame + color grading — Portrait aspect ratio 2:3 */}
              <div className="hero-image-frame shadow-layered">
                <img
                  src="/images/hero-dental.png"
                  alt={t("hero.img_alt")}
                  className="w-full h-auto aspect-[2/3] object-cover object-top"
                />
              </div>

              {/* Floating Badge: 100% Safe — Glassmorphism + Floating animation */}
              <div
                className="glass-badge float-gentle absolute -top-5 -end-5 rounded-2xl p-4 z-10"
                data-hero-anim="1.4s"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg shadow-teal-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1A2332]">
                      {t("hero.badge_safe")}
                    </div>
                    <div className="text-[11px] text-[#1A2332]/40">
                      {t("hero.badge_safe_sub")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Trusted — Icon-based (8000+ happy patients) */}
              <div
                className="glass-badge float-gentle-alt absolute -bottom-5 -start-5 rounded-2xl p-3 z-10"
                data-hero-anim="1.6s"
              >
                <div className="flex items-center gap-2.5">
                  {/* Icon: Users (many patients) */}
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div>
                    {/* Patient count (locale-aware numerals) + "patients" word */}
                    <div className="text-sm font-bold text-[#1A2332] flex items-baseline gap-1 leading-tight">
                      <span className="tabular-nums">{patientCount}+</span>
                      <span className="text-[11px] font-semibold text-[#1A2332]/60">
                        {t("hero.badge_trusted_unit")}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#1A2332]/40 leading-tight">
                      {t("hero.badge_trusted")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Circle — teal border with glow */}
              <div className="absolute -z-10 -top-12 -end-12 w-48 h-48 rounded-full border border-teal-500/20 shadow-[0_0_40px_rgba(27,122,110,0.06)]" />
              {/* Additional decorative ring */}
              <div className="absolute -z-10 -bottom-8 -start-8 w-32 h-32 rounded-full border border-teal-500/10" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll-down indicator — bouncing chevron at bottom of hero */}
      <button
        onClick={() => scrollToElement("#about")}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-1.5 scroll-bounce cursor-pointer group"
        style={{ color: "rgba(27,122,110,0.5)" }}
        aria-label={t("hero.scroll_down")}
      >
        <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-1" />
        <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ letterSpacing: "0.12em" }}>
          {t("hero.scroll_down")}
        </span>
      </button>
    </section>
  );
}
