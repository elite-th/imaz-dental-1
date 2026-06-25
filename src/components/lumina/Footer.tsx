"use client";

import {
  MapPin,
  Phone,
  Smartphone,
  ArrowUp,
} from "lucide-react";
import { useI18n } from "@/i18n/context";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer id="contact" className="relative overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════════
          Main Footer — dark charcoal
          ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative"
        style={{
          background: "linear-gradient(170deg, var(--charcoal-700) 0%, var(--charcoal-800) 50%, var(--charcoal-900) 100%)",
        }}
      >
        {/* Glassmorphism glow blob — teal tinted background depth */}
        <div
          className="absolute top-0 end-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "rgba(27,122,110,0.05)",
            opacity: 0.05,
          }}
        />
        <div
          className="absolute bottom-0 start-0 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "rgba(27,122,110,0.04)",
            opacity: 0.04,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-10 lg:pt-12 pb-6">
          {/* ── Logo & About ── */}
          <div className="mb-8 lg:mb-10">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-3 group"
            >
              <img
                src="/images/imaz-logo-new.svg"
                alt="ایماز"
                className="h-16 w-auto brightness-0 invert"
              />
            </a>
            <p className="text-sm leading-[2] mt-4 max-w-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              {t("footer.about")}
            </p>
          </div>

          {/* ── Contact Info ── */}
          <div className="mb-10 lg:mb-12">

            <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(27,122,110,0.08)" }}>
                  <MapPin className="w-3.5 h-3.5 text-teal-500/60" />
                </div>
                <div className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                  قم، خیابان شهید فاطمی، میدان رسالت
                  <br />
                  کوچه فاطمی ۲۹، پلاک ۴۰، طبقه ۷، واحد ۷۱۳
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(27,122,110,0.08)" }}>
                  <Phone className="w-3.5 h-3.5 text-teal-500/60" />
                </div>
                <a
                  href="tel:+982537401065"
                  className="text-sm transition-colors duration-300 hover:text-teal-400"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  dir="ltr"
                >
                  ۰۲۵۳۷۴۰۱۰۶۵
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(27,122,110,0.08)" }}>
                  <Smartphone className="w-3.5 h-3.5 text-teal-500/60" />
                </div>
                <a
                  href="tel:+989191190995"
                  className="text-sm transition-colors duration-300 hover:text-teal-400"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  dir="ltr"
                >
                  ۰۹۱۹۱۱۹۰۹۹۵
                </a>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ── */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.15)" }}>
                {t("footer.copyright")}
              </p>
              <span style={{ color: "rgba(255,255,255,0.06)" }}>·</span>
              <a
                href="https://hoseinitaha.ir"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] transition-colors duration-300 hover:text-teal-500/70"
                style={{ color: "rgba(255,255,255,0.1)" }}
              >
                Handcrafted by Taha
              </a>
            </div>



            {/* Back to top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 hover:text-teal-400 hover:scale-110"
              style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.15)" }}
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
