"use client";

import { Star } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-lumina";
import { useI18n } from "@/i18n/context";

function Stars() {
  return (
    <div className="flex gap-1 mb-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-teal-400 text-teal-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { t, dir } = useI18n();
  const isRTL = dir === "rtl";
  const sectionRef = useScrollReveal();

  const testimonials = [
    {
      name: t("testimonials.t1_name"),
      treatment: t("testimonials.t1_treatment"),
      quote: t("testimonials.t1_quote"),
      avatar: "/images/avatar-t1.png",
    },
    {
      name: t("testimonials.t2_name"),
      treatment: t("testimonials.t2_treatment"),
      quote: t("testimonials.t2_quote"),
      avatar: "/images/avatar-t2.png",
    },
    {
      name: t("testimonials.t3_name"),
      treatment: t("testimonials.t3_treatment"),
      quote: t("testimonials.t3_quote"),
      avatar: "/images/avatar-t3.png",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-24 lg:py-32 relative overflow-hidden"
      style={{
        background: "#F0F7F5",
      }}
    >
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle,#1B7A6E 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="reveal inline-flex items-center gap-2.5 text-teal-700 font-semibold text-[12px] mb-5">
            <span className={`w-8 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-teal-400/60 to-teal-500/60`} />
            {t("testimonials.label")}
            <span className={`w-8 h-[2px] rounded-full ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-teal-400/60 to-teal-500/60`} />
          </span>
          <h2 className="reveal d1 font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[#1A2332] leading-[1.15]">
            {t("testimonials.heading")}
          </h2>
          <div className="reveal d2 flex items-center justify-center gap-2 mt-4">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-[11px] font-semibold text-[#1A2332]/30">{t("testimonials.google_review")}</span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 stagger">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="testi-glass rounded-2xl p-7 bg-white/40"
            >
              <div className="text-4xl font-display text-teal-300/20 leading-none mb-2">"</div>
              <Stars />
              <p className="text-[#1A2332]/60 text-sm leading-[1.8] mb-6 italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-[#1B7A6E]/30"
                />
                <div>
                  <div className="font-semibold text-[#1A2332] text-sm">
                    {testimonial.name}
                  </div>
                  <div className="text-teal-600/40 text-xs">
                    {testimonial.treatment}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
